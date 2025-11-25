
'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsPage() {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/profile/settings">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Terms & Conditions</h1>
            </header>

            <main className="flex flex-col gap-4 px-4">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Last Updated: July 2024</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72 w-full">
                            <div className="space-y-4 text-sm text-gray-600">
                                <p>Welcome to Local Buddy Pro! These terms and conditions outline the rules and regulations for the use of Local Buddy Pro's Website, located at localbuddy.pro.</p>
                                
                                <h3 className="font-bold text-foreground">1. General Terms</h3>
                                <p>By accessing this app we assume you accept these terms and conditions. Do not continue to use Local Buddy Pro if you do not agree to take all of the terms and conditions stated on this page.</p>
                                
                                <h3 className="font-bold text-foreground">2. License</h3>
                                <p>Unless otherwise stated, Local Buddy Pro and/or its licensors own the intellectual property rights for all material on Local Buddy Pro. All intellectual property rights are reserved. You may access this from Local Buddy Pro for your own personal use subjected to restrictions set in these terms and conditions.</p>

                                <h3 className="font-bold text-foreground">3. User Responsibilities</h3>
                                <p>You must not: Republish material from Local Buddy Pro, sell, rent or sub-license material from Local Buddy Pro, or reproduce, duplicate or copy material from Local Buddy Pro.</p>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
