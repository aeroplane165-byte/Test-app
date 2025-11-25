import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// If you have a GEMINI_API_KEY in your environment, you can omit the apiKey parameter.
// The .env file is a good place to put your API key.
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  model: googleAI.model('gemini-2.5-flash'),
});
