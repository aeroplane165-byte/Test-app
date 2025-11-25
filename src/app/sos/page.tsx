
'use client';
import { ArrowLeft, Siren, Shield, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EmergencyContact = ({ name, relation, avatar }: { name: string, relation: string, avatar: string}) => (
    <div className="flex items-center justify-between glass-pill p-3">
        <div className="flex items-center gap-3">
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-xs text-gray-500">{relation}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Phone className="w-5 h-5 text-main-accent"/></Button>
        </div>
    </div>
);

export default function SosPage() {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-destructive-accent">SOS Alerts</h1>
            </header>

            <main className="flex flex-col gap-8 px-4">
                <div className="flex flex-col items-center justify-center">
                    <button className="relative w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center group transition-all duration-300 hover:bg-red-100">
                        <div className="absolute inset-0 rounded-full bg-destructive-accent animate-ping-slow opacity-70 group-hover:animate-ping"></div>
                        <div className="relative w-40 h-40 rounded-full bg-destructive-accent/80 flex items-center justify-center shadow-lg group-hover:bg-destructive-accent">
                            <Siren className="w-20 h-20 text-white" />
                        </div>
                    </button>
                    <p className="mt-6 text-lg text-center font-semibold text-gray-600">Press and hold for 3 seconds to send an alert</p>
                </div>
                
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500"/>
                            Emergency Contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <EmergencyContact name="Rahul Kumar" relation="Friend" avatar="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                        <EmergencyContact name="Priya Singh" relation="Sister" avatar="https://i.pravatar.cc/150?u=a042581f4e29026705e" />
                        <Button variant="outline" className="w-full mt-4">Add Contact</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
