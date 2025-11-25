
'use client';
import { ArrowLeft, Loader, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import * as React from 'react';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { generateDescription } from '@/ai/flows/description-flow';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

const taskSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  budget: z.coerce.number().min(1, { message: 'Budget must be at least ₹1.' }),
  location: z.string().min(3, { message: 'Location is required.' }),
  paymentMode: z.enum(['online', 'cash'], { required_error: 'Please select a payment mode.' }),
  duration: z.string().min(3, { message: 'Please enter an estimated duration.' }),
  tip: z.number().optional(),
});

export default function CreateTaskPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [tipValue, setTipValue] = React.useState([0]);

    const form = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            budget: 0,
            location: '',
            duration: '',
            tip: 0,
        },
    });

    const handleGenerateDescription = async () => {
        const title = form.getValues('title');
        if (!title || title.length < 5) {
            toast({
                variant: 'destructive',
                title: 'Title is too short',
                description: 'Please enter a descriptive title first (at least 5 characters).',
            });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateDescription({ title });
            form.setValue('description', result.description, { shouldValidate: true });
            toast({
                title: 'Description Generated!',
                description: 'The AI has crafted a description for you.',
            });
        } catch (error) {
            console.error("Failed to generate description", error);
            toast({
                variant: "destructive",
                title: "AI Error",
                description: "Could not generate description. Please try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };


    const onSubmit = async (values: z.infer<typeof taskSchema>) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'You must be logged in to create a task.' });
            return;
        }
        setIsLoading(true);
        try {
            const tasksCol = collection(firestore, 'tasks');
            await addDocumentNonBlocking(tasksCol, {
                ...values,
                tip: tipValue[0],
                posterId: user.uid,
                status: 'Open',
                createdAt: new Date().toISOString(),
            });
            
            toast({
                title: 'Task Created!',
                description: 'Your task has been posted successfully.',
            });
            router.push('/');

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to Create Task',
                description: error.message || 'An unknown error occurred.',
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 text-foreground">
            <header className="flex items-center gap-4 p-4">
                <Link href="/">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-main-accent transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-main-accent">Create a New Task</h1>
            </header>

            <main className="flex flex-col gap-4 px-4">
                <div className="glass-card p-6">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Title</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Fix a leaking pipe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Description</FormLabel>
                                    <FormControl>
                                    <div className="relative">
                                        <Textarea placeholder="Describe the task in detail, or click the magic wand to generate one!" {...field} />
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            className="absolute bottom-3 right-3 p-2 rounded-full bg-main-accent/20 hover:bg-main-accent/30 transition-colors"
                                            disabled={isGenerating}
                                            title="Generate with AI"
                                        >
                                            <Wand2 className={`w-5 h-5 text-main-accent ${isGenerating ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Household">Household</SelectItem>
                                        <SelectItem value="Tech">Tech</SelectItem>
                                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                                        <SelectItem value="Delivery">Delivery</SelectItem>
                                        <SelectItem value="Tutoring">Tutoring</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="budget"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Budget (₹)</FormLabel>
                                        <FormControl>
                                        <Input type="number" placeholder="e.g., 500" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., Mumbai" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>

                             <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time Duration</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., 2 hours" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMode"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Payment Mode</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-4"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="online" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Online
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="cash" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Cash
                                            </FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="tip"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Extra Tip (₹{tipValue[0]})</FormLabel>
                                        <FormControl>
                                            <Slider
                                                defaultValue={[0]}
                                                max={100}
                                                step={10}
                                                onValueChange={setTipValue}
                                                className="py-2"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />


                            <Button type="submit" className="w-full h-14 text-lg font-bold cyan-glow-button" disabled={isLoading}>
                                {isLoading && <Loader className="mr-2 h-5 w-5 animate-spin" />}
                                Post Task
                            </Button>
                        </form>
                    </Form>
                </div>
            </main>
        </div>
    );
}

    