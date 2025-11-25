import { z } from 'zod';

export const TaskSuggestionInputSchema = z.object({
  userSkills: z.array(z.string()).describe("A list of the user's skills."),
  currentLocation: z.string().optional().describe("The user's current general location (e.g., city or neighborhood)."),
  taskHistory: z.array(z.object({
    title: z.string(),
    category: z.string(),
    completed: z.boolean(),
  })).optional().describe('A list of tasks the user has previously interacted with.'),
});

export type TaskSuggestionInput = z.infer<typeof TaskSuggestionInputSchema>;

export const TaskSuggestionOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().describe('The suggested task title.'),
    category: z.string().describe('The category of the task.'),
    reasoning: z.string().describe('A brief explanation for why this task is a good suggestion for the user.'),
    estimatedEarning: z.number().describe('An estimated earning potential for this task in the local currency.'),
  })),
});

export type TaskSuggestionOutput = z.infer<typeof TaskSuggestionOutputSchema>;
