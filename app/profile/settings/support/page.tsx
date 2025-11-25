
'use client';
import { ArrowLeft, LifeBuoy, BookOpen, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupportOption = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
    <Link href={href}>
        <div className="glass-pill p-4 flex items-center gap-4 hover:bg-gray-100/80 rounded-lg cursor-pointer group">
            {icon}
            <div>
                <p className="font-semibold text-foreground group-hover:text-main-accent">{title}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    </Link>
);


export default function SupportPage() {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/profile/settings">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Help & Support</h1>
            </header>

            <main className="flex flex-col gap-4 px-4">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>How can we help?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SupportOption 
                            icon={<BookOpen className="w-6 h-6 text-main-accent"/>}
                            title="FAQ"
                            description="Find answers to common questions"
                            href="#"
                        />
                        <SupportOption 
                            icon={<MessageSquare className="w-6 h-6 text-secondary-accent"/>}
                            title="Live Chat"
                            description="Chat with a support agent"
                            href="#"
                        />
                        <SupportOption 
                            icon={<LifeBuoy className="w-6 h-6 text-destructive-accent"/>}
                            title="Contact Us"
                            description="Send us an email for any issue"
                            href="#"
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
