
'use client';
import Image from 'next/image';
import { Check, Star, Award, Pen, Settings, LogOut, Edit, Camera, Wallet, Briefcase, Shield, Loader } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Progress, CircleProgress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

const StatCard = ({ value, label, icon, isLoading }: { value: string, label: string, icon: React.ReactNode, isLoading?: boolean }) => (
  <div className="flex flex-col items-center glass-card p-4 rounded-lg flex-1 group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-300">
    <div className="text-main-accent mb-2 transition-transform duration-300 group-hover:scale-125">{icon}</div>
    {isLoading ? <Loader className="w-6 h-6 animate-spin text-gray-400" /> : <p className="text-2xl font-bold text-foreground">{value}</p>}
    <p className="text-sm text-gray-500 group-hover:text-foreground">{label}</p>
  </div>
);

const Badge = ({ icon, color, label, achieved, description }: { icon: React.ReactNode, color: string, label: string, achieved: boolean, description: string }) => (
  <div className={cn("flex flex-col items-center gap-2 transition-opacity group relative", achieved ? 'opacity-100' : 'opacity-50')}>
    <div className={cn(`w-20 h-20 rounded-full flex items-center justify-center glass-card border-2 transition-all duration-300 group-hover:scale-105`, achieved ? color : 'border-gray-300')} style={achieved ? {boxShadow: `0 0 15px var(--${color.replace('border-','')})`} : {}}>
      {icon}
    </div>
    <p className="text-xs text-center font-medium">{label}</p>
    {achieved && 
        <div className="absolute bottom-full mb-2 w-48 p-2 text-xs text-center bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {description}
        </div>
    }
  </div>
);

const SkillPill = ({ name, level, xp, maxXp }: { name: string, level: number, xp: number, maxXp: number }) => (
    <div className="glass-pill px-4 py-2 group bg-gray-50">
        <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">{name}</span>
            <span className="text-xs text-main-accent">Level {level}</span>
        </div>
        <Progress value={(xp/maxXp) * 100} className="h-1 mt-2 bg-gray-200 [&>div]:bg-main-accent transition-all duration-300 group-hover:[&>div]:shadow-[0_0_8px_var(--main-accent)]"/>
        <p className="text-xs text-gray-500 text-right mt-1">{xp}/{maxXp} XP</p>
    </div>
);

const ProfileHeader = ({ userData, user, isLoading }: { userData: any, user: any, isLoading: boolean }) => {
    const userAvatar = getImage('user2');
    const [isEditing, setIsEditing] = React.useState(false);
    const [name, setName] = React.useState(userData?.name || 'Loading...');
    const firestore = useFirestore();

    React.useEffect(() => {
        if (userData?.name) {
            setName(userData.name);
        }
    }, [userData]);
    
    const handleNameChange = () => {
        if (user && firestore && name !== userData.name) {
            const userRef = doc(firestore, 'users', user.uid);
            updateDocumentNonBlocking(userRef, { name: name });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <header className="flex flex-col items-center gap-4 glass-card p-6 w-full">
                <Loader className="w-12 h-12 animate-spin text-main-accent" />
            </header>
        )
    }

    return (
      <header className="flex flex-col items-center gap-4 glass-card p-6 w-full">
        <div className="relative group">
          <Image
              src={userData?.photoUrl || userAvatar?.imageUrl || ''}
              alt={userData?.name || "User Avatar"}
              width={120}
              height={120}
              className="rounded-full border-4 border-main-accent"
              style={{boxShadow: '0 0 20px rgba(0,0,0,0.2)'}}
            />
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
          </div>
          {userData?.aadharVerified && (
            <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameChange} onKeyPress={e => e.key === 'Enter' && handleNameChange()} className="bg-transparent border-b-2 border-main-accent text-3xl font-bold text-center w-64 focus:outline-none" autoFocus />
            ) : (
                <h1 className="text-3xl font-bold">{name}</h1>
            )}
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Check className="w-5 h-5 text-green-500"/> : <Edit className="w-5 h-5 text-gray-400 cursor-pointer hover:text-main-accent"/>}
            </button>
          </div>
          <p className="text-lg text-gray-500">Level {userData?.level || 'N/A'}</p>
        </div>
        
        <div className="w-full px-4">
           <div className="relative w-full h-4 glass-pill rounded-full overflow-hidden">
                <div 
                    className="h-full rounded-full bg-main-accent" 
                    style={{
                        width: `${((userData?.xp || 0)/500)*100}%`,
                        boxShadow: '0 0 10px var(--main-accent)'
                    }}
                />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>XP: {userData?.xp || 0} / 500</span>
                <span className="flex items-center gap-1">To Lvl up <Star className="w-4 h-4 text-yellow-400" /></span>
            </div>
        </div>
      </header>
    );
};

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserLoading } = useDoc(userDocRef);

  const completedTasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tasks'), where('buddyId', '==', user.uid), where('status', 'in', ['completed', 'paid']));
  }, [firestore, user]);

  const { data: completedTasks, isLoading: isTasksLoading } = useCollection(completedTasksQuery);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const tasksDone = completedTasks?.length || 0;
  const avgRating = "4.8";

  const allBadges = [
    { icon: <Shield className="w-10 h-10 text-green-500" />, color: "border-green-500", label: "Verified", achieved: userData?.aadharVerified || false, description: "Your identity has been successfully verified." },
    { icon: <Pen className="w-10 h-10 text-main-accent" />, color: "border-main-accent", label: "Fast Worker", achieved: tasksDone >= 10, description: "Completed 10+ tasks." },
    { icon: <Award className="w-10 h-10 text-yellow-500" />, color: "border-yellow-500", label: "5-Star Hero", achieved: false, description: "Maintained a 5-star rating over 20 tasks." },
    { icon: <Star className="w-10 h-10 text-gray-400" />, color: "border-gray-400", label: "Top Earner", achieved: (userData?.walletBalance || 0) > 10000, description: "Become one of the top earners on the platform." },
  ];
  
  const skills = userData?.skills?.map((skill: string) => ({
      name: skill,
      level: 1,
      xp: 50,
      maxXp: 100
  })) || [];

  const overallProgress = (userData?.xp / 500) * 100 || 0;

  return (
    <>
      <ProfileHeader userData={userData} user={user} isLoading={isUserLoading} />

      <section className="glass-card w-full p-4">
        <div className="flex justify-around gap-4">
          <StatCard value={`₹${(userData?.walletBalance || 0).toLocaleString()}`} label="Earnings" icon={<Wallet className="w-6 h-6"/>} isLoading={isUserLoading} />
          <StatCard value={String(tasksDone)} label="Tasks Done" icon={<Briefcase className="w-6 h-6"/>} isLoading={isTasksLoading}/>
          <StatCard value={tasksDone > 0 ? avgRating : 'N/A'} label="Avg. Rating" icon={<Star className="w-6 h-6"/>} isLoading={isTasksLoading}/>
        </div>
      </section>

      <section className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 w-full">
        <div className="flex-shrink-0">
            {isUserLoading ? <Loader className="w-10 h-10 animate-spin" /> : <CircleProgress value={overallProgress} size={150} strokeWidth={12} color="var(--main-accent)" />}
        </div>
        <div className="text-center md:text-left">
            <h2 className="text-xl font-bold">Overall Progress</h2>
            <p className="text-gray-500 mt-1">You're doing great! Keep completing tasks to unlock new badges and higher-paying opportunities. Your consistency is your greatest asset.</p>
        </div>
      </section>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card p-1 h-auto">
          <TabsTrigger value="badges" className="data-[state=active]:pill-active data-[state=inactive]:glass-card">Badges</TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:pill-active data-[state=inactive]:glass-card">Skills</TabsTrigger>
        </TabsList>
        <TabsContent value="badges" className="mt-6">
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold px-2">Badge Showcase</h2>
                <div className="glass-card p-6">
                <div className="grid grid-cols-4 gap-4">
                    {allBadges.map(badge => <Badge key={badge.label} {...badge} />)}
                </div>
                </div>
            </section>
        </TabsContent>
        <TabsContent value="skills" className="mt-6">
             <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold px-2">Skill Set</h2>
                <div className="glass-card p-4 flex flex-col gap-3">
                    {skills.length > 0 ? skills.map((skill: any) => <SkillPill key={skill.name} {...skill} />) : (
                      <p className="text-center text-gray-500 py-4">You haven't added any skills yet. Go to settings to add them.</p>
                    )}
                </div>
            </section>
        </TabsContent>
      </Tabs>

      <footer className="mt-4 grid grid-cols-2 gap-4 w-full">
        <Link href="/profile/settings">
            <Button variant="outline" className="w-full h-12 text-md glass-card border-gray-200 hover:bg-gray-100 hover:text-foreground transition-all transform hover:scale-105">
                <Settings className="mr-2 h-5 w-5" />
                Settings
            </Button>
        </Link>
         <Button onClick={handleLogout} variant="outline" className="w-full h-12 text-md glass-card border-destructive-accent/50 text-destructive-accent hover:bg-destructive-accent/10 hover:text-destructive-accent transition-all transform hover:scale-105">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
        </Button>
      </footer>
    </>
  );
}
