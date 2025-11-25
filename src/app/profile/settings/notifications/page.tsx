
'use client';
import { ArrowLeft, Bell, MessageSquare, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationToggle = ({ id, icon, title, description }: { id: string, icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-center justify-between glass-pill p-4">
        <div className="flex items-center gap-4">
            {icon}
            <div>
                <Label htmlFor={id} className="font-semibold text-foreground cursor-pointer">{title}</Label>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
        <Switch id={id} defaultChecked />
    </div>
);


export default function NotificationSettingsPage() {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/profile/settings">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Notification Settings</h1>
            </header>

            <main className="flex flex-col gap-4 px-4">
                 <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Manage Your Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <NotificationToggle 
                            id="push-notifications"
                            icon={<Bell className="w-5 h-5 text-main-accent" />}
                            title="Push Notifications"
                            description="For all important updates"
                        />
                        <NotificationToggle 
                            id="chat-notifications"
                            icon={<MessageSquare className="w-5 h-5 text-secondary-accent" />}
                            title="Chat Messages"
                            description="When you receive a new message"
                        />
                        <NotificationToggle 
                            id="task-updates"
                            icon={<Briefcase className="w-5 h-5 text-green-500" />}
                            title="Task Updates"
                            description="Status changes on your tasks"
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
