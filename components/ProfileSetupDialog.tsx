
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, Languages, ArrowRight } from 'lucide-react';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  birthYear: z.string().nonempty({ message: 'Please select a year.' }),
  appLanguage: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const StepVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 200 : -200,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 200 : -200,
    transition: { duration: 0.3 },
  }),
};

type ProfileSetupDialogProps = {
  onOpenChange: (isOpen: boolean) => void;
};

export function ProfileSetupDialog({ onOpenChange }: ProfileSetupDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', birthYear: '', appLanguage: 'english' },
  });

  const {
    handleSubmit,
    trigger,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;
  const appLanguage = watch('appLanguage');

  const years = Array.from(
    { length: new Date().getFullYear() - 1899 },
    (_, i) => (new Date().getFullYear() - i).toString()
  );

  const nextStep = async () => {
    let isValid = false;
    if (step === 0) isValid = await trigger('name');
    if (step === 1) isValid = await trigger('birthYear');
    if (isValid) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const onSubmit = (data: ProfileFormData) => {
    if (!user || !firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(userRef, {
        name: data.name,
        birthYear: parseInt(data.birthYear, 10),
        appLanguage: data.appLanguage,
        profileCompleted: true,
      },
      { merge: true }
    );
    setIsOpen(false);
  };
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    onOpenChange(isOpen);
  }, [isOpen, onOpenChange]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md m-4 p-6 sm:p-8 rounded-2xl overflow-hidden"
            >
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <AnimatePresence initial={false} custom={direction}>
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        custom={direction}
                        variants={StepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col items-center text-center"
                      >
                        <div className="bg-main-accent/20 p-4 rounded-full mb-4 border border-main-accent/50">
                          <User className="w-8 h-8 text-main-accent" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">What should we call you?</h2>
                        <p className="text-gray-500 mb-6">Let's get your identity set up.</p>
                        <FormField
                          control={control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input {...field} placeholder="Enter your name" className="h-12 text-center glass-card" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={nextStep} className="cyan-glow-button mt-6 w-full h-12 text-lg">
                          Next
                        </Button>
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div
                        key="step1"
                        custom={direction}
                        variants={StepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col items-center text-center"
                      >
                        <div className="bg-main-accent/20 p-4 rounded-full mb-4 border border-main-accent/50">
                          <User className="w-8 h-8 text-main-accent" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">When were you born?</h2>
                        <p className="text-gray-500 mb-6">This helps us personalize your experience.</p>
                        <FormField
                          control={control}
                          name="birthYear"
                          render={({ field }) => (
                            <FormItem className="w-full">
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 text-center glass-card">
                                    <SelectValue placeholder="Select your birth year" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="glass-card">
                                    {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4 w-full mt-6">
                          <Button type="button" onClick={prevStep} className="glass-card w-full h-12 text-lg" variant="outline">Back</Button>
                          <Button type="button" onClick={nextStep} className="cyan-glow-button w-full h-12 text-lg">Next</Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        custom={direction}
                        variants={StepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col items-center text-center"
                      >
                        <div className="bg-main-accent/20 p-4 rounded-full mb-4 border border-main-accent/50">
                          <Languages className="w-8 h-8 text-main-accent" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Choose your language</h2>
                        <p className="text-gray-500 mb-6">Select the language for your app interface.</p>
                        <div className="w-full space-y-3">
                           <div 
                            onClick={() => setValue('appLanguage', 'english')} 
                            className={cn('glass-card p-4 rounded-lg cursor-pointer border-2 transition-all', appLanguage === 'english' ? 'border-main-accent' : 'border-transparent')}
                          >
                            <p className="text-lg font-bold">English</p>
                          </div>
                          <div 
                            onClick={() => setValue('appLanguage', 'hindi')}
                            className={cn('glass-card p-4 rounded-lg cursor-pointer border-2 transition-all', appLanguage === 'hindi' ? 'border-main-accent' : 'border-transparent')}
                          >
                             <p className="text-lg font-bold">हिंदी (Hindi)</p>
                          </div>
                        </div>
                         <div className="flex gap-4 w-full mt-6">
                          <Button type="button" onClick={prevStep} className="glass-card w-full h-12 text-lg" variant="outline">Back</Button>
                          <Button type="submit" className="cyan-glow-button w-full h-12 text-lg flex items-center justify-center gap-2">
                            Finish <ArrowRight className="w-5 h-5"/>
                          </Button>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
