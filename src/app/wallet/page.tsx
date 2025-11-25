
'use client';
import { Wallet, Lock, ArrowDown, ArrowUp, AlertTriangle, ShieldCheck, CreditCard, Banknote, History, ChevronRight, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import * as React from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, getDocs } from 'firebase/firestore';

const TransactionItem = ({ icon, title, date, amount, color, type }: { icon: React.ReactNode, title: string, date: string, amount: string, color: string, type: string }) => (
  <div className={cn("flex items-center justify-between glass-pill p-3 my-2 hover:bg-gray-100 transition-all border border-transparent rounded-lg group cursor-pointer")}>
    <div className="flex items-center gap-4">
      <div className={cn(`p-3 rounded-full glass-pill transition-all duration-300 group-hover:scale-110`, color ? `bg-${color.replace('text-','')}/10` : '')}>{icon}</div>
      <div>
        <p className="font-semibold text-foreground group-hover:text-main-accent transition-colors">{title}</p>
        <p className="text-xs text-gray-500">{date} - {type}</p>
      </div>
    </div>
    <p className={cn(`font-bold text-lg`, color)}>{amount}</p>
  </div>
);

const BalanceCard = ({ title, balance, icon, color, progress, isLoading }: { title: string, balance: number, icon: React.ReactNode, color: string, progress: number, isLoading: boolean }) => {
    const accentColor = color.split('-')[0];
    
    return (
    <div className="glass-card p-6 relative overflow-hidden group">
        <div className={cn(`absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150`, `bg-${accentColor}-500/30`)}></div>
        <div className="relative z-10">
            <div className="flex items-start justify-between">
                <div>
                  {isLoading ? <Loader className="w-8 h-8 animate-spin text-gray-400" /> : <p className="text-4xl font-bold text-foreground">{formatCurrency(balance)}</p>}
                  <p className="text-gray-500 mt-1">{title}</p>
                </div>
                {React.cloneElement(icon as React.ReactElement, { className: `w-8 h-8 text-${accentColor}-500 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6`, style: { filter: `drop-shadow(0 0 10px var(--${accentColor}))` } })}
            </div>
            <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Spending Limit</span>
                    <span>₹{progress * 100} / ₹10000</span>
                </div>
                <Progress value={progress} className={cn(`h-2 bg-gray-200 [&>div]:bg-${accentColor}-500`)} />
            </div>
        </div>
    </div>
)};

const ActionMenuItem = ({icon, title, subtitle}: {icon: React.ReactNode, title: string, subtitle: string}) => (
    <div className="flex items-center p-3 glass-pill w-full hover:bg-gray-100 transition-colors cursor-pointer rounded-lg group">
        <div className="p-2 bg-gray-100 rounded-lg mr-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-main-accent/20">
            {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 transition-colors duration-300 group-hover:text-main-accent'})}
        </div>
        <div className="flex-grow">
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-xs text-gray-500 group-hover:text-gray-600">{subtitle}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-main-accent" />
    </div>
);

export default function WalletPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [filter, setFilter] = React.useState('All');
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = React.useState(true);
  const filters = ['All', 'Income', 'Outcome', 'Escrow'];

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userData, isLoading: isUserLoading } = useDoc(userDocRef);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      if (!firestore || !user) {
        setIsTransactionsLoading(false);
        return;
      }
      setIsTransactionsLoading(true);
      try {
        const transactionsRef = collection(firestore, 'transactions');
        // Query only by userId to avoid needing a composite index.
        // We will sort by timestamp on the client-side.
        const q = query(transactionsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort transactions by timestamp descending on the client side
        userTransactions.sort((a, b) => {
          const dateA = a.timestamp?.toDate() || 0;
          const dateB = b.timestamp?.toDate() || 0;
          return dateB - dateA;
        });

        setTransactions(userTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [firestore, user]);


  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];
    if (filter === 'All') return transactions;
    
    const incomeTypes = ['release', 'add'];
    const outcomeTypes = ['withdraw'];
    const escrowTypes = ['lock'];
    
    switch(filter) {
        case 'Income':
            return transactions.filter(t => incomeTypes.includes(t.type));
        case 'Outcome':
            return transactions.filter(t => outcomeTypes.includes(t.type));
        case 'Escrow':
            return transactions.filter(t => escrowTypes.includes(t.type));
        default:
             return transactions;
    }
  }, [transactions, filter]);


  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'release':
      case 'add':
        return <Wallet className="w-5 h-5 text-green-500" />;
      case 'withdraw':
        return <ArrowDown className="w-5 h-5 text-main-accent" />;
      case 'lock':
        return <Lock className="w-5 h-5 text-yellow-500" />;
      default:
        return <ArrowUp className="w-5 h-5 text-red-500" />;
    }
  };
  
  const getTransactionColor = (type: string) => {
      switch (type) {
          case 'release':
          case 'add':
              return "text-green-500";
          case 'withdraw':
              return "text-main-accent";
          case 'lock':
              return "text-yellow-500";
          default:
              return "text-red-500";
      }
  };

  const getTransactionAmount = (transaction: any) => {
      switch (transaction.type) {
          case 'release':
          case 'add':
              return `+ ${formatCurrency(transaction.amount)}`;
          case 'withdraw':
          case 'lock':
               return `- ${formatCurrency(transaction.amount)}`;
          default:
              return formatCurrency(transaction.amount);
      }
  };
  
  const VerificationBanner = () => (
    <div className="flex items-center justify-center gap-2 text-yellow-600 text-sm glass-card p-2 px-4 cursor-pointer hover:bg-yellow-500/10 transition-all transform hover:scale-105">
        <AlertTriangle className="w-4 h-4" />
        <span>ID Verification Needed for Higher Limits</span>
    </div>
  );

  const availableBalance = userData?.walletBalance ?? 0;
  
  const lockedBalance = transactions
    ?.filter(t => t.type === 'lock' && t.status === 'success')
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  return (
    <>
       <header className="glass-card p-4 text-center">
        <h1 className="text-3xl font-bold">Wallet & Finance</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your funds and transactions securely</p>
       </header>

      <section className="flex flex-col gap-6">
        <BalanceCard 
            title="Available Balance"
            balance={availableBalance}
            icon={<Wallet />}
            color="green-500"
            progress={isUserLoading ? 0 : (availableBalance / 10000) * 100}
            isLoading={isUserLoading}
        />
        <BalanceCard 
            title="Locked in Escrow"
            balance={lockedBalance}
            icon={<Lock />}
            color="yellow-500"
            progress={isTransactionsLoading ? 0 : (lockedBalance / 10000) * 100}
            isLoading={isTransactionsLoading}
        />
      </section>

      <section className="flex flex-col items-center gap-3">
        <Button className="w-full text-white font-bold py-4 rounded-full text-lg h-14 cyan-glow-button transform hover:scale-105 transition-transform">
          Withdraw Money
        </Button>
        <VerificationBanner />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold px-2">Quick Actions</h2>
        <div className="flex flex-col gap-3 glass-card p-4">
            <ActionMenuItem icon={<CreditCard />} title="Manage Payment Methods" subtitle="Add or remove cards & UPI" />
            <ActionMenuItem icon={<Banknote />} title="Setup Auto-Withdrawal" subtitle="Weekly to your primary bank" />
            <ActionMenuItem icon={<History />} title="Download Statement" subtitle="Get PDF statement for any period" />
            <ActionMenuItem icon={<ShieldCheck />} title="Security Center" subtitle="Manage your account security" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold">Transaction History</h2>
            <div className="flex items-center gap-2 text-main-accent">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-xs font-semibold">Secured</span>
            </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -ml-4 pl-4">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap transform hover:-translate-y-0.5',
                filter === f
                  ? 'pill-active'
                  : 'glass-card text-gray-500 hover:bg-gray-100'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col gap-3 glass-card p-4 min-h-[200px]">
          {isTransactionsLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (filteredTransactions && filteredTransactions.length > 0) ? filteredTransactions.map((item: any) => (
            <TransactionItem
              key={item.id}
              icon={getTransactionIcon(item.type)}
              title={item.taskId ? `Task: ${item.taskId.slice(0,6)}...` : 'Wallet Action'}
              date={new Date(item.timestamp?.toDate()).toLocaleDateString()}
              amount={getTransactionAmount(item)}
              color={getTransactionColor(item.type)}
              type={item.type}
            />
          )) : (
            <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                <Wallet className="w-12 h-12 text-gray-300 mb-4" />
                <p>No transactions found for this filter.</p>
                <p className="text-xs mt-1">Try selecting another category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
