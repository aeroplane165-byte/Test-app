
'use client';

import Image from 'next/image';
import {
  Bell,
  Siren,
  Shield,
  Users,
  ChevronRight,
  Plus,
  Zap,
  User,
  Loader,
  Trophy,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import * as React from 'react';
import { cn, formatCurrency, timeAgo } from '@/lib/utils';
import { getTaskSuggestions, TaskSuggestionInput } from '@/ai/flows/suggestion-flow';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where, limit, orderBy, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';

const getImage = (id: string) =>
  PlaceHolderImages.find((img) => img.id === id);

const TaskCardImage = ({ imageUrl, title, tag }: { imageUrl: string, title: string, tag: string }) => (
    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-black/5">
        <Image src={imageUrl} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className={`absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm`}>
            {tag}
        </div>
    </div>
);

const TaskCardHeader = ({ title, price, tag, hasImage }: { title: string, price: number, tag: string, hasImage: boolean }) => (
    <div className="flex justify-between items-start">
        <div className="flex flex-col">
            <h2 className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-main-accent">{title}</h2>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(price)}</p>
        </div>
        {!hasImage && (
            <div className="bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                {tag}
            </div>
        )}
    </div>
);

const TaskCardButton = ({ task, user, onAccept }: { task: any, user: User | null, onAccept: (taskId: string, posterId: string) => void }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    const isAcceptedByMe = task.status === 'assigned' && task.buddyId === user?.uid;
    const isMyTask = task.posterId === user?.uid;
    const isUnavailable = task.status !== 'Open';
    const isAiGenerated = task.posterId === 'ai_generated';

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault(); 
        if (!user || isAiGenerated || !task.id) return;
        setIsLoading(true);
        await onAccept(task.id, task.posterId);
        router.push(`/chat?taskId=${task.id}`);
    };

    if (isAiGenerated) {
        return <Button disabled className="w-full h-12 text-base font-bold" variant="outline">AI Suggestion</Button>;
    }
    
    if (isMyTask) {
         return <Button disabled className="w-full h-12 text-base font-bold" variant="outline">Your Task</Button>;
    }
    
    if (isAcceptedByMe) {
        return <Button disabled className="w-full h-12 text-base font-bold bg-green-600 text-white">Task Accepted</Button>;
    }

    return (
        <Button 
            className="w-full h-12 text-base font-bold transition-all duration-300 ease-in-out transform hover:scale-105 bg-black text-white hover:bg-black/80"
            onClick={handleClick}
            disabled={isLoading || isUnavailable || !user}
        >
            {isLoading && <Loader className="w-5 h-5 animate-spin mr-2" />}
            {isUnavailable ? 'Task Unavailable' : "Accept Task"}
            {!isUnavailable && <Zap className="ml-2 w-5 h-5"/>}
        </Button>
    );
};

const TaskCard = ({ task, user, onAccept }: { task: any, user: User | null, onAccept: (taskId: string, posterId: string) => void }) => {
  const { title, budget, category, reasoning } = task;
  const imageUrl = getImage(`task_${category?.toLowerCase()}`)?.imageUrl;
  
  const content = (
     <div className="glass-card p-4 flex flex-col gap-4 group transition-all duration-300 hover:shadow-2xl hover:shadow-gray-300 hover:-translate-y-1">
      {imageUrl && <TaskCardImage imageUrl={imageUrl} title={title} tag={category} />}
      <TaskCardHeader title={title} price={budget} tag={category} hasImage={!!imageUrl} />
      {reasoning && <p className="text-sm text-gray-600 border-l-2 border-gray-300 pl-3">{reasoning}</p>}
      <TaskCardButton task={task} user={user} onAccept={onAccept} />
    </div>
  )

  if (task.posterId === 'ai_generated' || !task.id) {
    return content;
  }
  
  return <Link href={`/tasks/${task.id}`}>{content}</Link>;
};

const AdvancedListItem = ({ icon, title, subtitle, tag, tagColor, href }: { icon: React.ReactNode, title: string, subtitle: string, tag: string, tagColor: string, href?: string }) => {
    const content = (
        <div className="flex items-center gap-4 p-3 glass-pill mb-3 transition-all duration-300 hover:bg-gray-100/80 rounded-lg cursor-pointer group">
            <div className="p-3 bg-gray-100 rounded-full transition-all duration-300 group-hover:bg-black/10 group-hover:scale-110">
                {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 transition-colors duration-300 group-hover:text-black' })}
            </div>
            <div className="flex-grow">
                <p className="font-bold text-foreground">{title}</p>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
               <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tagColor}`}>{tag}</span>
               <ChevronRight className="w-5 h-5 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-black" />
            </div>
        </div>
    );
    
    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
};

const HeaderWalletBalance = ({ balance, isLoading }: { balance: number, isLoading: boolean }) => {
    return (
        <div className="glass-card rounded-full px-4 py-2 hover:border-gray-300/80 border border-transparent transition-all">
          <p className="text-sm font-medium text-gray-700">
            Wallet: {isLoading ? <Loader className="w-4 h-4 inline-block animate-spin"/> : <span className="font-bold text-black transition-all duration-500">{formatCurrency(balance)}</span>}
          </p>
        </div>
    );
};

const NotificationItem = ({ notification }: { notification: any }) => (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-100 rounded-md">
        <div className="p-2 bg-main-accent/10 rounded-full mt-1">
            <Briefcase className="w-5 h-5 text-main-accent" />
        </div>
        <div>
            <p className="font-semibold text-sm text-foreground">{notification.title}</p>
            <p className="text-xs text-gray-500">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.timestamp.toDate())}</p>
        </div>
    </div>
);

const HeaderNotificationBell = ({ userId }: { userId: string }) => {
    const firestore = useFirestore();
    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return query(collection(firestore, `users/${userId}/notifications`), orderBy('timestamp', 'desc'), limit(10));
    }, [firestore, userId]);

    const { data: notifications } = useCollection(notificationsQuery);
    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative glass-card p-3 rounded-full cursor-pointer hover:border-red-400/50 border border-transparent transition-all group">
                    <Bell className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
                    {unreadCount > 0 && (
                         <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse group-hover:animate-none shadow-[0_0_8px_var(--destructive-accent)]"></span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="flex flex-col">
                    {notifications && notifications.length > 0 ? (
                        notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                    ) : (
                        <p className="text-sm text-gray-500 text-center p-6">No new notifications.</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};


const HeaderAvatar = ({ userAvatar }: { userAvatar?: { imageUrl: string, description: string }}) => {
    const defaultAvatar = getImage('user5');
    const avatar = userAvatar?.imageUrl ? userAvatar : defaultAvatar;
    return (
    <>
    {avatar && (
        <div className="glass-card p-1 rounded-full hover:border-black/20 border-2 border-transparent transition-all">
            <Image
                src={avatar.imageUrl}
                alt={avatar.description}
                width={48}
                height={48}
                className="rounded-full border-2 border-gray-200"
            />
        </div>
    )}
    </>
);
};

const MainHeader = ({ user, userData, isUserLoading }: { user: User | null, userData: any, isUserLoading: boolean }) => {
    return (
        <header className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
                <HeaderAvatar userAvatar={userData?.photoUrl ? { imageUrl: userData.photoUrl, description: 'User avatar' } : undefined} />
                {user && <HeaderNotificationBell userId={user.uid} />}
            </div>
            <HeaderWalletBalance balance={userData?.walletBalance || 0} isLoading={isUserLoading} />
        </header>
    );
};

const QuickActionCard = ({ icon, title, bgColor, href }: { icon: React.ReactNode, title: string, bgColor: string, href: string }) => {
    return (
        <Link href={href} key={title}>
            <div className="flex-shrink-0 w-32 h-32 flex flex-col items-center justify-center gap-2 glass-card cursor-pointer group hover:-translate-y-1 transition-transform duration-300">
                <div className={cn("p-3 rounded-full transition-all duration-300 group-hover:scale-110", bgColor)}>
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-white' })}
                </div>
                <p className="font-bold text-sm text-center text-foreground">{title}</p>
            </div>
        </Link>
    );
};

const QuickActionsSection = () => {
    const actions = [
        { title: 'Create Task', icon: <Plus />, bgColor: 'bg-main-accent', href: '/tasks/create' },
        { title: 'Leaderboard', icon: <Trophy />, bgColor: 'bg-yellow-500', href: '/leaderboard' },
        { title: 'Verify ID', icon: <Shield />, bgColor: 'bg-green-500', href: '/profile/verify' },
        { title: 'SOS Alerts', icon: <Siren />, bgColor: 'bg-destructive-accent', href: '/sos' },
        { title: 'Refer a Buddy', icon: <Users />, bgColor: 'bg-blue-500', href: '/refer' },
    ];
    return (
        <section className="w-full">
            <h2 className="text-xl font-bold mb-4 px-2">Quick Actions</h2>
            <div className="flex items-center gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                {actions.map((action) => (
                    <QuickActionCard key={action.title} {...action} />
                ))}
            </div>
        </section>
    );
};

const TaskFilters = ({ activeFilter, setActiveFilter }: { activeFilter: string, setActiveFilter: (filter: string) => void }) => {
    const filters = ['All', 'Household', 'Tech', 'Cleaning', 'Delivery', 'Tutoring', 'Other'];
    return (
        <section className="w-full">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 -ml-4 pl-4">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap transform hover:-translate-y-0.5',
                            activeFilter === filter
                                ? 'bg-black text-white shadow-md'
                                : 'glass-card text-gray-500 hover:bg-gray-200/60 hover:text-foreground'
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </section>
    );
};


export default function HomePage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [activeFilter, setActiveFilter] = React.useState('All');


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userData, isLoading: isUserLoading } = useDoc(userDocRef);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    const queryConstraints = [where('status', 'in', ['Open', 'assigned'])];

    if (activeFilter !== 'All') {
        queryConstraints.push(where('category', '==', activeFilter));
    }
    
    return query(collection(firestore, 'tasks'), ...queryConstraints);

  }, [firestore, activeFilter, user]);

  const { data: firestoreTasks, isLoading: areTasksLoading } = useCollection(tasksQuery);
  
  const completedTasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tasks'), where('buddyId', '==', user.uid), where('status', '==', 'paid'), limit(5));
  }, [firestore, user]);

  const { data: completedTasks } = useCollection(completedTasksQuery);


  React.useEffect(() => {
    if (firestoreTasks && user) {
        const myAcceptedTasks = firestoreTasks.filter(t => t.buddyId === user.uid);
        const openTasks = firestoreTasks.filter(t => t.status === 'Open' && t.buddyId !== user.uid);
        
        setTasks(prevTasks => {
            const aiTasks = prevTasks.filter(t => t.posterId === 'ai_generated');
            const combined = [...myAcceptedTasks, ...openTasks, ...aiTasks];
            const uniqueTasks = Array.from(new Map(combined.map(item => [item.id || `ai_${Math.random()}`, item])).values());
            return uniqueTasks;
        });
    } else if (firestoreTasks) {
         setTasks(firestoreTasks.filter(t => t.status === 'Open'));
    }
  }, [firestoreTasks, user]);

  const advancedListItems = [
      {
          icon: <Shield className="w-6 h-6 text-green-500" />,
          title: "Verify Your ID",
          subtitle: "Enhanced account security",
          tag: "Recommended",
          tagColor: "bg-green-100 text-green-800",
          href: "/profile/verify"
      },
      {
          icon: <Users className="w-6 h-6 text-blue-500" />,
          title: "Refer a Buddy",
          subtitle: "Earn rewards for inviting friends",
          tag: "New",
          tagColor: "bg-blue-100 text-blue-800",
          href: "/refer"
      }
  ];

    const handleAcceptTask = async (taskId: string, posterId: string) => {
        if (!user || !firestore) return;

        const taskRef = doc(firestore, 'tasks', taskId);
        const taskDoc = tasks.find(t => t.id === taskId);
        
        updateDocumentNonBlocking(taskRef, {
            status: 'assigned',
            buddyId: user.uid,
        });

        const notificationRef = collection(firestore, `users/${posterId}/notifications`);
        addDocumentNonBlocking(notificationRef, {
            userId: posterId,
            title: "Task Accepted!",
            message: `${userData?.name || 'A buddy'} has accepted your task: "${taskDoc?.title}"`,
            type: "TASK_ACCEPTED",
            taskId: taskId,
            isRead: false,
            timestamp: serverTimestamp(),
        });

        toast({
            title: "Task Accepted!",
            description: "You can find this task in your chat to coordinate."
        });
    };

  const handleGenerateSuggestions = async () => {
    if (!user || !userData) {
        toast({ variant: 'destructive', title: 'Please complete your profile first.' });
        return;
    }
    setIsGenerating(true);
    try {
        const input: TaskSuggestionInput = {
            userSkills: userData.skills || ["General Help", "Driving"],
            currentLocation: userData.location || "Not specified",
            taskHistory: completedTasks?.map(task => ({
                title: task.title,
                category: task.category,
                completed: true,
            })) || []
        };
        const result = await getTaskSuggestions(input);
        const newTasks = result.suggestions.map(s => ({
            ...s, 
            id: `ai_${Date.now()}_${Math.random()}`, 
            budget: s.estimatedEarning,
            reasoning: s.reasoning,
            status: 'Open',
            posterId: 'ai_generated'
        }));
        setTasks(prev => [...newTasks, ...prev.filter(t => t.posterId !== 'ai_generated')]);
        toast({
            title: "New Tasks Suggested!",
            description: "We've found some new tasks for you based on your profile.",
        });
    } catch (error) {
        console.error("Failed to get task suggestions", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not fetch AI suggestions. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <>
      <MainHeader user={user} userData={userData} isUserLoading={isAuthLoading || isUserLoading} />
      <QuickActionsSection />
      <TaskFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      <section className="w-full">
        <Button onClick={handleGenerateSuggestions} disabled={isGenerating} className="w-full h-14 mb-6 text-lg font-bold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
            {isGenerating ? (
                <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Generating Suggestions...
                </>
            ) : (
                "Get AI Suggestions"
            )}
        </Button>
      </section>

      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {areTasksLoading ? (
            <div className="col-span-full flex justify-center items-center h-40">
                <Loader className="w-12 h-12 animate-spin text-main-accent" />
            </div>
        ) : tasks && tasks.length > 0 ? (
            tasks.map((task, index) => (
                <TaskCard key={task.id || index} task={task} user={user} onAccept={handleAcceptTask} />
            ))
        ) : (
            <div className="col-span-full text-center text-gray-500 py-10 glass-card">
                <p>No open tasks for this category. Try another filter!</p>
            </div>
        )}
      </section>

      <section className="glass-card p-4 w-full">
          <h3 className="font-bold text-lg mb-3 px-2">Priority Hub</h3>
          {advancedListItems.map(item => <AdvancedListItem key={item.title} {...item} />)}
      </section>
    </>
  );
}
