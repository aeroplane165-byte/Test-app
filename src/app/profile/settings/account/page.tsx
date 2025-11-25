
'use client';
import { ArrowLeft, User, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const SettingsItem = ({ icon, title, value, action }: { icon: React.ReactNode, title: string, value: string, action?: React.ReactNode }) => (
    <div className="flex items-center justify-between glass-pill p-4">
        <div className="flex items-center gap-4">
            {icon}
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="font-semibold text-foreground">{value}</p>
            </div>
        </div>
        {action}
    </div>
);

export default function AccountSettingsPage() {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/profile/settings">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Account Settings</h1>
            </header>

            <main className="flex flex-col gap-6 px-4">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingsItem icon={<User className="w-5 h-5 text-gray-500"/>} title="Name" value="Rakesh Sharma" action={<Button variant="ghost" size="sm">Edit</Button>} />
                        <SettingsItem icon={<Mail className="w-5 h-5 text-gray-500"/>} title="Email" value="rakesh@example.com" />
                    </CardContent>
                </Card>
                
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingsItem icon={<Shield className="w-5 h-5 text-gray-500"/>} title="Password" value="••••••••" action={<Button variant="ghost" size="sm">Change</Button>} />
                         <div className="text-center pt-4">
                            <Button variant="destructive">Delete Account</Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
