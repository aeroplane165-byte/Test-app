
'use client';
import { ArrowLeft, Gift, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useToast } from '@/hooks/use-toast';

export default function ReferPage() {
    const referralCode = 'BUDDY-R8K4P';
    const [copiedText, copy] = useCopyToClipboard();
    const { toast } = useToast();

    const handleCopy = () => {
        copy(referralCode).then((success) => {
            if (success) {
                toast({
                    title: 'Copied to Clipboard!',
                    description: 'Your referral code has been copied.',
                });
            }
        });
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Refer a Buddy</h1>
            </header>

            <main className="flex flex-col gap-8 px-4">
                <div className="glass-card p-8 text-center flex flex-col items-center">
                    <Gift className="w-16 h-16 text-yellow-500 mb-4" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }} />
                    <h2 className="text-2xl font-bold">Refer & Earn ₹100</h2>
                    <p className="text-gray-500 mt-2">
                        Share your referral code with friends. When they complete their first task, you both get ₹100 in your wallet!
                    </p>
                </div>
                
                <div className="glass-card p-6">
                    <p className="text-sm text-center text-gray-500 mb-2">Your unique referral code</p>
                    <div className="relative flex items-center">
                        <input 
                            type="text"
                            value={referralCode}
                            readOnly
                            className="glass-card w-full h-14 pl-6 pr-16 text-center text-2xl font-mono tracking-widest border-none"
                        />
                        <Button 
                            size="icon" 
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-main-accent/80 hover:bg-main-accent"
                            onClick={handleCopy}
                        >
                            {copiedText === referralCode ? <Check className="w-6 h-6"/> : <Copy className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>

                <Button className="w-full h-14 text-lg font-bold cyan-glow-button">
                    Share with Friends
                </Button>
            </main>
        </div>
    );
}
