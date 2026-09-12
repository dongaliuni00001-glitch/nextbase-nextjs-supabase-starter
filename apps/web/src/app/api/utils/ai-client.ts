import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIClient {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string, modelName = 'gemini-1.5-flash'): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateJSON<T>(prompt: string, modelName = 'gemini-1.5-flash'): Promise<T> {
    const model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as T;
  }
}