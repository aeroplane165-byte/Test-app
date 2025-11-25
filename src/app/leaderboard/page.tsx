
'use client';

import Image from 'next/image';
import { Crown, Trophy, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import * as React from 'react';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

type LeaderboardUser = {
  rank: number;
  name: string;
  photoUrl: string;
  score: number;
  change: number; // Placeholder for now
};

const RankIndicator = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" style={{ filter: 'drop-shadow(0 0 5px #f59e0b)' }} />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Trophy className="w-5 h-5 text-yellow-700" />;
  return <span className="font-bold text-lg">{rank}</span>;
};

const ChangeIndicator = ({ change }: { change: number }) => {
  if (change > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
  if (change < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
  return <span className="text-gray-500">-</span>;
};

const LeaderboardRow = ({ user }: { user: LeaderboardUser }) => {
  const isTopThree = user.rank <= 3;

  return (
    <div className={cn(
      "flex items-center gap-4 p-3 glass-pill mb-3 transition-all duration-300 hover:bg-gray-100 hover:border-gray-300 border border-transparent rounded-lg cursor-pointer group",
      isTopThree && 'border-yellow-500/30'
    )}>
      <div className="w-10 text-center flex items-center justify-center">
        <RankIndicator rank={user.rank} />
      </div>
      <Image src={user.photoUrl} alt={user.name} width={48} height={48} className="rounded-full border-2 border-gray-300 group-hover:border-main-accent transition-colors" />
      <div className="flex-grow">
        <p className="font-bold text-foreground text-lg">{user.name}</p>
        <p className="text-sm text-green-600">{user.score.toLocaleString()} XP</p>
      </div>
      <div className="w-12 text-center flex justify-center items-center gap-1">
        <ChangeIndicator change={user.change} />
        {user.change !== 0 && <span className={cn("text-sm", user.change > 0 ? 'text-green-500' : 'text-red-500')}>{Math.abs(user.change)}</span>}
      </div>
    </div>
  );
};


const LeaderboardContent = ({ period }: { period: 'daily' | 'weekly' | 'all-time' }) => {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;

        const baseQuery = query(collection(firestore, 'users'), orderBy('xp', 'desc'), limit(10));
        // Note: For daily/weekly, you would typically query a separate aggregated collection
        // or add a `where` clause on a timestamp. For this implementation, we will use the same
        // all-time data as a placeholder for daily and weekly tabs to ensure they are functional.
        return baseQuery;
    }, [firestore, period]);

    const { data: users, isLoading } = useCollection(usersQuery);

    const leaderboardData: LeaderboardUser[] = (users || []).map((user, index) => ({
        rank: index + 1,
        name: user.name,
        photoUrl: user.photoUrl,
        score: user.xp,
        change: 0 // This is a placeholder as we don't track rank change
    }));

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader className="w-12 h-12 animate-spin text-main-accent" />
            </div>
        );
    }
    
    if (leaderboardData.length > 0) {
        return (
            <div className="flex flex-col gap-2">
                {leaderboardData.map(user => (
                    <LeaderboardRow key={user.rank} user={user} />
                ))}
            </div>
        );
    }

    return (
        <div className="text-center text-gray-500 py-10 glass-card">
            <p>The leaderboard is empty. Complete some tasks to get started!</p>
        </div>
    );
};


export default function LeaderboardPage() {
  return (
    <>
      <header className="glass-card p-6 text-center">
        <div className="flex justify-center items-center gap-4">
            <Trophy className="w-10 h-10 text-yellow-500" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}/>
            <h1 className="text-4xl font-bold">Leaderboard</h1>
            <Trophy className="w-10 h-10 text-yellow-500" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}/>
        </div>
        <p className="text-gray-500 text-sm mt-2">See who's dominating the task world.</p>
      </header>
      
      <Tabs defaultValue="all-time" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card p-1 h-auto">
          <TabsTrigger value="daily" className="data-[state=active]:pill-active data-[state=inactive]:glass-card">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:pill-active data-[state=inactive]:glass-card">Weekly</TabsTrigger>
          <TabsTrigger value="all-time" className="data-[state=active]:pill-active data-[state=inactive]:glass-card">All-Time</TabsTrigger>
        </TabsList>
        <TabsContent value="all-time" className="mt-6">
            <LeaderboardContent period="all-time" />
        </TabsContent>
        <TabsContent value="daily" className="mt-6">
             <LeaderboardContent period="daily" />
        </TabsContent>
        <TabsContent value="weekly" className="mt-6">
             <LeaderboardContent period="weekly" />
        </TabsContent>
      </Tabs>
    </>
  );
}
