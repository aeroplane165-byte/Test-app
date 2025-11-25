
'use client';
import { ArrowLeft, UploadCloud, FileCheck2, Loader, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';


export default function VerifyIdPage() {
    const [file, setFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isVerified, setIsVerified] = React.useState(false);
    const [isPending, setIsPending] = React.useState(false);
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleVerify = () => {
        if (!file) {
            toast({
                variant: 'destructive',
                title: 'No File Selected',
                description: 'Please select a file to upload.',
            });
            return;
        }

        setIsUploading(true);
        // In a real app, you'd upload the file to Firebase Storage here.
        // For this simulation, we'll just update the user's status to 'pending'.
        setTimeout(() => {
            if (user && firestore) {
                 const userRef = doc(firestore, 'users', user.uid);
                 // The 'aadharVerified' is now controlled by an admin panel.
                 // We just mark the status as 'pending' for review.
                 updateDocumentNonBlocking(userRef, { verificationStatus: 'pending' });
            }
            setIsUploading(false);
            setIsPending(true); // Show pending message
            toast({
                title: 'ID Submitted for Verification!',
                description: 'Your ID has been submitted and is pending review. This may take 24-48 hours.',
            });
        }, 2000);
    };

    if (isPending) {
        return (
            <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground items-center justify-center h-[calc(100vh-10rem)]">
                <Loader className="w-24 h-24 text-yellow-500 animate-spin" />
                <h1 className="text-3xl font-bold text-center">Verification Pending</h1>
                <p className="text-gray-500 text-center">Your document has been submitted for review. We will notify you once the process is complete.</p>
                <Link href="/profile" className="w-full">
                    <Button className="w-full h-12 text-lg cyan-glow-button">Back to Profile</Button>
                </Link>
            </div>
        )
    }

    if (isVerified) {
        return (
            <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground items-center justify-center h-[calc(100vh-10rem)]">
                <ShieldCheck className="w-24 h-24 text-green-500" style={{filter: 'drop-shadow(0 0 15px #22c55e)'}}/>
                <h1 className="text-3xl font-bold text-center">You are Verified!</h1>
                <p className="text-gray-500 text-center">Congratulations! You've unlocked new features and higher transaction limits.</p>
                <Link href="/profile" className="w-full">
                    <Button className="w-full h-12 text-lg cyan-glow-button">Go to Profile</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Verify Your ID</h1>
            </header>

            <main className="flex flex-col gap-4 px-4">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Upload Your Aadhar/ID Card</CardTitle>
                        <CardDescription>
                            Please upload a clear image of your government-issued ID to complete verification.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-main-accent transition-colors">
                            <input 
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                            />
                            <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                {file ? (
                                    <>
                                        <FileCheck2 className="w-12 h-12 text-green-500"/>
                                        <p className="font-semibold text-foreground">{file.name}</p>
                                        <p className="text-xs">Ready to be uploaded</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-12 h-12" />
                                        <p>Click to browse or drag & drop</p>
                                        <p className="text-xs">PNG, JPG up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <Button 
                            className="w-full h-14 text-lg font-bold cyan-glow-button"
                            onClick={handleVerify}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader className="w-6 h-6 animate-spin mr-2"/>
                                    Submitting...
                                </>
                            ) : "Submit for Verification"}
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
