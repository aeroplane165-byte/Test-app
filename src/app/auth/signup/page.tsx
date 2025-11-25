'use client';
import Link from "next/link";
import AuthForm from "../AuthForm";

export default function SignupPage() {
    return (
        <>
            <header className="text-center">
                <h1 className="text-4xl font-bold text-main-accent">Create Your Identity</h1>
                <p className="text-gray-500 mt-2">Join the ranks of elite task runners.</p>
            </header>
            <AuthForm mode="signup" />
            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-main-accent hover:underline">
                    Log in
                </Link>
            </p>
        </>
    );
}
