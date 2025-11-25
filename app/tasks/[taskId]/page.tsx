
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, DocumentReference, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Loader, User, MapPin, Calendar, Tag, IndianRupee, Shield, MessageSquare, Zap, Clock, Wallet } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="text-main-accent mt-1">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-foreground">{value}</p>
        </div>
    </div>
);


export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params.taskId as string;
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isAccepting, setIsAccepting] = React.useState(false);

    const taskDocRef = useMemoFirebase(() => {
        if (!firestore || !taskId) return null;
        return doc(firestore, 'tasks', taskId);
    }, [firestore, taskId]);

    const { data: taskData, isLoading: isTaskLoading } = useDoc(taskDocRef);

    const posterDocRef = useMemoFirebase(() => {
        if (!firestore || !taskData?.posterId) return null;
        return doc(firestore, 'users', taskData.posterId);
    }, [firestore, taskData?.posterId]);
    
    const { data: posterData, isLoading: isPosterLoading } = useDoc(posterDocRef);

    const handleAcceptTask = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: "You must be logged in to accept tasks." });
            return;
        }
        setIsAccepting(true);

        const taskRef = doc(firestore, 'tasks', taskId);

        try {
            // Optimistically update UI while non-blocking update happens in background
            updateDocumentNonBlocking(taskRef, {
                status: 'assigned',
                buddyId: user.uid,
            });

            toast({
                title: "Task Accepted!",
                description: "The task poster has been notified. You can start a chat now.",
            });
            router.push(`/chat?taskId=${taskId}`);
        } catch (error: any) {
            console.error("Failed to accept task:", error);
            toast({
                variant: 'destructive',
                title: 'Error Accepting Task',
                description: error.message,
            });
            setIsAccepting(false);
        }
    };

    if (isTaskLoading || isPosterLoading) {
        return (
            <div className="w-full h-[calc(100vh-150px)] flex items-center justify-center">
                <Loader className="w-12 h-12 animate-spin text-main-accent" />
            </div>
        );
    }

    if (!taskData) {
        return (
            <div className="w-full h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-destructive-accent">Task Not Found</h2>
                <p className="text-gray-500 mt-2">The task you are looking for might have been deleted or does not exist.</p>
                <Link href="/" className="mt-6">
                    <Button variant="outline">Go Back Home</Button>
                </Link>
            </div>
        );
    }
    
    const taskImage = getImage(`task_${taskData.category?.toLowerCase()}`) || getImage('task_other');
    const posterImage = posterData?.photoUrl || getImage('user5')?.imageUrl;

    const isMyTask = taskData.posterId === user?.uid;
    const isAssigned = taskData.status === 'assigned';
    const isAssignedToMe = isAssigned && taskData.buddyId === user?.uid;
    
    const totalEarning = (taskData.budget || 0) + (taskData.tip || 0);

    return (
        <div className="w-full flex flex-col gap-6 text-foreground">
            <header className="relative">
                 <Link href="/" className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full text-white">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                {taskImage && (
                    <div className="relative w-full h-64 rounded-b-3xl overflow-hidden">
                        <Image src={taskImage.imageUrl} alt={taskData.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    </div>
                )}
                 <div className="absolute bottom-6 left-6 text-white">
                    <h1 className="text-4xl font-bold" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{taskData.title}</h1>
                 </div>
            </header>

            <main className="flex flex-col gap-6 -mt-8">
                <div className="glass-card p-6 z-10">
                    <p className="text-gray-600">{taskData.description}</p>
                </div>

                <div className="glass-card p-6 grid grid-cols-2 gap-x-4 gap-y-6">
                    <DetailItem 
                        icon={<IndianRupee />} 
                        label="Total Earning" 
                        value={
                            <span>
                                {formatCurrency(totalEarning)}
                                {taskData.tip > 0 && <span className="text-xs text-green-500 ml-1">(incl. ₹{taskData.tip} tip)</span>}
                            </span>
                        } 
                    />
                    <DetailItem icon={<Tag />} label="Category" value={taskData.category} />
                    <DetailItem icon={<MapPin />} label="Location" value={taskData.location} />
                    <DetailItem icon={<Calendar />} label="Posted" value={taskData.createdAt ? timeAgo(new Date(taskData.createdAt)) : 'Recently'} />
                    <DetailItem icon={<Clock />} label="Est. Duration" value={taskData.duration} />
                    <DetailItem icon={<Wallet />} label="Payment Mode" value={taskData.paymentMode} />
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4">Posted By</h3>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            {posterImage && <Image src={posterImage} alt={posterData?.name || 'Poster'} width={48} height={48} className="rounded-full border-2 border-secondary-accent" />}
                            <div>
                                <p className="font-bold text-lg">{posterData?.name || 'Loading...'}</p>
                                {posterData?.aadharVerified && (
                                    <div className="flex items-center gap-2 text-sm text-green-500">
                                        <Shield size={14} />
                                        <span>Identity Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link href={`/chat?taskId=${taskId}`}>
                            <Button variant="ghost" size="icon">
                                <MessageSquare className="w-6 h-6 text-main-accent" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-4">
                    {isMyTask ? (
                         <Button disabled className="w-full h-14 text-lg font-bold" variant="outline">This is Your Task</Button>
                    ) : isAssignedToMe ? (
                         <Link href={`/chat?taskId=${taskId}`} className='w-full'>
                            <Button className="w-full h-14 text-lg font-bold bg-green-500 text-white">Open Chat</Button>
                         </Link>
                    ) : isAssigned ? (
                         <Button disabled className="w-full h-14 text-lg font-bold" variant="destructive">Task Already Taken</Button>
                    ) : (
                        <Button onClick={handleAcceptTask} disabled={isAccepting} className="w-full h-14 text-lg font-bold cyan-glow-button">
                           {isAccepting ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" /> }
                           {isAccepting ? "Accepting..." : "Accept Task"}
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}

    