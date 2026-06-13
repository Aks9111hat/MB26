import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
}

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export async function streamChat(messages: ChatMessage[]) {
    const stream = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: true,
    });

    return stream;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
    });

    return response.choices[0]?.message?.content ?? '';
}