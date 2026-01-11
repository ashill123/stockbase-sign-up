import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

const SYSTEM_INSTRUCTIONS = {
  detailed: `You are the specialized AI Solution Engineer for Stockbase.
Stockbase is the "Operating System for Trades" - a next-generation platform for trade contractors (Plumbing, HVAC, Electrical).

CORE KNOWLEDGE BASE:
- **Mission:** Eliminate the "guessing game" in inventory and logistics.
- **Function:** specialized inventory tracking, procurement automation, and warehouse/van logistics.
- **Integrations:** We integrate deeply with Simpro, ServiceTitan, and AroFlo.
- **Features:** Real-time stock levels, project allocation, supplier integration, waste tracking (e.g., copper pipe scraps).
- **Status:** Currently in highly exclusive Closed Beta.

BEHAVIORAL RULES:
1. Keep answers "industrial/professional" in tone. Avoid fluff, but be comprehensive if needed.
2. Do not use emojis. Use precise language.
3. If asked about pricing, say "Pricing is customized based on volume during the beta period."
4. If asked "Does it work offline?", answer "Yes, the mobile app creates a local ledger that syncs when connection is restored."
5. If the user asks for a "simulation", briefly describe a scenario: "Simulation: Technician takes 15mm copper elbow. Barcode scan > Stockbase deducts from Van 4 > Syncs to Simpro Job #2938 > Procurement alert sent for restock."`,
  concise: `You are the specialized AI Solution Engineer for Stockbase.
Stockbase is the "Operating System for Trades" - a next-generation platform for trade contractors (Plumbing, HVAC, Electrical).

CORE KNOWLEDGE BASE:
- **Mission:** Eliminate the "guessing game" in inventory and logistics.
- **Function:** specialized inventory tracking, procurement automation, and warehouse/van logistics.
- **Integrations:** We integrate deeply with Simpro, ServiceTitan, and AroFlo.
- **Features:** Real-time stock levels, project allocation, supplier integration, waste tracking (e.g., copper pipe scraps).
- **Status:** Currently in highly exclusive Closed Beta.

BEHAVIORAL RULES:
1. Keep answers concise (under 40 words) and "industrial/professional" in tone.
2. Do not use emojis. Use precise language.
3. If asked about pricing, say "Pricing is customized based on volume during the beta period."
4. If asked "Does it work offline?", answer "Yes, the mobile app creates a local ledger that syncs when connection is restored."
5. If the user asks about specific trade problems (e.g. "copper waste"), confirm we solve that specifically.`,
};

const MAX_HISTORY_ITEMS = 20;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing Gemini API key',
        message: 'Set GEMINI_API_KEY in environment variables.',
      });
    }

    const { message, history = [], profile = 'detailed' } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const normalizedHistory = Array.isArray(history)
      ? (history as ChatMessage[])
          .filter((item) => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
          .slice(-MAX_HISTORY_ITEMS)
      : [];

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction =
      profile === 'concise' ? SYSTEM_INSTRUCTIONS.concise : SYSTEM_INSTRUCTIONS.detailed;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        maxOutputTokens: profile === 'concise' ? 150 : 1000,
      },
      history: normalizedHistory.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    });

    const result = await chat.sendMessage({ message });
    const text = result.text || 'No response available.';

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate response',
    });
  }
}
