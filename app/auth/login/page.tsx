'use client';
import Link from "next/link";
import AuthForm from "../AuthForm";
import MobileAuthForm from "../MobileAuthForm";
import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');

    return (
        <>
            <header className="text-center">
                <h1 className="text-4xl font-bold text-main-accent">Welcome Back</h1>
                <p className="text-gray-500 mt-2">Log in to continue your journey in the cyber-verse.</p>
            </header>
            
            {authMethod === 'email' ? <AuthForm mode="login" /> : <MobileAuthForm />}

            <div className="text-center mt-4">
                <Button variant="link" onClick={() => setAuthMethod(authMethod === 'email' ? 'mobile' : 'email')}>
                    {authMethod === 'email' ? 'Continue with Mobile' : 'Continue with Email'}
                </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="font-semibold text-main-accent hover:underline">
                    Sign up
                </Link>
            </p>
        </>
    );
}
