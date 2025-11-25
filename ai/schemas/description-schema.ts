import { z } from 'zod';

export const GenerateDescriptionInputSchema = z.object({
  title: z.string().describe("The title of the task for which to generate a description."),
});

export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

export const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated task description.'),
});

export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;
