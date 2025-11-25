'use server';

import { ai } from '@/ai/genkit';
import { GenerateDescriptionInputSchema, GenerateDescriptionOutputSchema, type GenerateDescriptionInput, type GenerateDescriptionOutput } from '@/ai/schemas/description-schema';

const descriptionPrompt = ai.definePrompt({
    name: 'generateDescriptionPrompt',
    input: { schema: GenerateDescriptionInputSchema },
    output: { schema: GenerateDescriptionOutputSchema },
    prompt: `Generate a concise, clear, and compelling task description of up to 50 words based on the following task title:

Task Title: "{{title}}"

The description should briefly explain what the task involves and what is expected. It should be written in a way that is easy to understand for a general audience.
`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await descriptionPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a description.');
    }
    return output;
  }
);

export async function generateDescription(input: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}
