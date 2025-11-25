
'use client';
import { ArrowLeft, Bell, Lock, HelpCircle, FileText, User } from 'lucide-react';
import Link from 'next/link';

const SettingsItem = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
    <Link href={href} className="w-full">
        <div className="flex items-center p-4 glass-card rounded-lg w-full hover:bg-gray-100 transition-colors cursor-pointer group">
            <div className="p-3 bg-gray-100 rounded-lg mr-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-main-accent/20">
                {icon}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-foreground text-lg">{title}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    </Link>
);


export default function SettingsPage() {
    const settingsOptions = [
        { icon: <User className="w-6 h-6 text-main-accent"/>, title: "Account", description: "Manage your profile information", href: "/profile/settings/account" },
        { icon: <Bell className="w-6 h-6 text-yellow-500"/>, title: "Notifications", description: "Choose what you get notified about", href: "/profile/settings/notifications" },
        { icon: <Lock className="w-6 h-6 text-green-500"/>, title: "Privacy & Security", description: "Control your data and security", href: "/profile/settings/privacy" },
        { icon: <HelpCircle className="w-6 h-6 text-blue-500"/>, title: "Help & Support", description: "Get help or contact us", href: "/profile/settings/support" },
        { icon: <FileText className="w-6 h-6 text-purple-500"/>, title: "Terms & Conditions", description: "Read our terms of service", href: "/profile/settings/terms" },
    ];

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/profile">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Settings</h1>
            </header>

            <main className="flex flex-col gap-4 px-4">
                {settingsOptions.map((option) => (
                    <SettingsItem key={option.title} {...option} />
                ))}
            </main>
        </div>
    );
}
