export class AIClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  }

  async generateText(prompt: string, modelName = 'gemini-1.5-flash'): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API Error: ${errorData}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async generateJSON<T>(prompt: string, modelName = 'gemini-1.5-flash'): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object. Do not include any markdown formatting like \`\`\`json or extra explanations.`;
    const textResponse = await this.generateText(jsonPrompt, modelName);
    
    // 마크다운 코드블록 백틱이 포함된 경우 정제
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText) as T;
  }
}