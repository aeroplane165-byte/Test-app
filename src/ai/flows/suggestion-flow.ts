
'use server';

import { ai } from '@/ai/genkit';
import { TaskSuggestionInputSchema, TaskSuggestionOutputSchema, type TaskSuggestionInput, type TaskSuggestionOutput } from '@/ai/schemas/suggestion-schema';


const suggestionPrompt = ai.definePrompt({
    name: 'taskSuggestionPrompt',
    input: { schema: TaskSuggestionInputSchema },
    output: { schema: TaskSuggestionOutputSchema },
    prompt: `You are a helpful assistant in a cyberpunk-themed task-runner app. Your goal is to suggest relevant and interesting tasks to users.

    Based on the user's profile, suggest 3-5 tasks.

    User Profile:
    - Skills: {{#each userSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    {{#if currentLocation}}- Location: {{{currentLocation}}}{{/if}}

    {{#if taskHistory}}
    Task History:
    {{#each taskHistory}}
    - "{{{title}}}" (Category: {{{category}}})
    {{/each}}
    {{/if}}

    For each suggestion, provide a catchy title, a relevant category from this list (Household, Tech, Cleaning, Delivery, Tutoring, Other), a brief reasoning for the suggestion, and an estimated earning. The reasoning should be encouraging and align with the cyberpunk theme. Ensure the output is a valid JSON object matching the provided schema.
    `,
});


const getTaskSuggestionsFlow = ai.defineFlow(
  {
    name: 'getTaskSuggestionsFlow',
    inputSchema: TaskSuggestionInputSchema,
    outputSchema: TaskSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await suggestionPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate task suggestions.');
    }
    return output;
  }
);


export async function getTaskSuggestions(input: TaskSuggestionInput): Promise<TaskSuggestionOutput> {
  return getTaskSuggestionsFlow(input);
}
