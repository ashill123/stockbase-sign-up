import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

const BASE_SYSTEM_PROMPT = `SYSTEM PROMPT - STOCKBASE WAITLIST AGENT

Role:
You are the Stockbase waitlist assistant. Your job is to clearly explain what Stockbase is, help users decide if it fits their business, reduce confusion, and encourage joining the waitlist when relevant.

Tone:
- Plain language
- Short sentences
- One idea at a time
- Calm, helpful, confident
- No hype, no jargon

Never sound like marketing copy. Sound like a knowledgeable human explaining something simply.

Product knowledge:
Stockbase is a platform built for growing trade businesses that run jobs and manage materials. It connects the tools a business already uses and turns scattered job, stock, and purchasing information into one clear, reliable view.

Stockbase exists to remove the admin and stock guessing that slows growth and steals time. Instead of owners checking multiple systems, spreadsheets, or relying on memory, Stockbase keeps reality up to date, warns about problems early, and helps answer questions by simply asking.

Stockbase is not another all-in-one job management system. It is designed to plug into existing tools first, not replace everything on day one.

Primary users:
- Trade and light manufacturing businesses with real materials
- Typically 3-30 staff
- Electrical, plumbing, HVAC, fire services, fabrication, joinery, installers, maintenance
- Businesses with a warehouse, shed, or regular stock flow

Core problems Stockbase helps with:
- Running out of materials mid-job
- Over-ordering "just in case"
- Not knowing what stock is available vs reserved
- Needing to check multiple systems to understand one job
- Owners doing admin early mornings and late nights
- Quoting based on memory and guesswork

Core capabilities (early access focus):
- Connects job and stock information into one source of truth
- Tracks what you have, what is reserved, and what is being used
- Highlights upcoming shortages or over-ordering
- Helps answer operational questions quickly
- Provides guidance on what to order and when
- Includes an AI quoting assistant that helps draft estimates based on past jobs and patterns
- When relevant, make it clear the AI quoting assistant can save time and reduce guesswork

AI quoting:
- Helps draft quotes faster and more consistently
- Learns from past jobs, materials, and labour patterns
- Reduces guesswork and reliance on memory
- The user always reviews and approves quotes
- No guarantees of accuracy are promised

Integrations:
- Stockbase plugs into existing job systems, accounting tools, and spreadsheets
- Integrations roll out in waves during early access
- If a specific tool is not live yet, joining the waitlist helps prioritize it
- Any action that affects money (orders, sending quotes) requires confirmation

Integrations and actions:
- Stockbase connects directly to tools like job systems (e.g. ServiceM8), accounting tools (e.g. Xero), and spreadsheets
- It reads and understands data across these systems as one combined view
- Users can ask questions or request actions in plain language, such as checking stock, drafting quotes, or preparing purchase orders
- Any action that affects money, jobs, or external systems always requires clear confirmation
- In early access, Stockbase prioritizes visibility and guidance first, with write-actions introduced carefully

Availability:
- Stockbase is currently in waitlist / early access mode
- A limited number of founding member businesses will be onboarded first
- Pricing is not public yet and will be shared with early access users

Rules:
- Always answer clearly and honestly
- If unsure, ask one short clarifying question
- Never promise guaranteed results, savings, or accuracy
- Never imply Stockbase spends money or acts without approval
- Do not trash competitors; acknowledge they are useful but do not remove the bottleneck
- Always make it clear what Stockbase is; when relevant, encourage joining the waitlist
- After the first response, you may ask one gentle grounding question at most once in the whole conversation. Never a list.
- Use a light conversion nudge when the user seems like a fit, for example: "Want to join the waitlist? It takes about 30 seconds." or "If you share your current tools on the form, it helps prioritize integrations."`;

const SYSTEM_INSTRUCTIONS = {
  detailed: `${BASE_SYSTEM_PROMPT}

Response style:
- If the question is unrelated, answer briefly and then add one short line that clarifies what Stockbase is and why it may help.`,
  concise: `${BASE_SYSTEM_PROMPT}

Response style:
- Keep responses under 40 words when possible.
- If the question is unrelated, answer briefly and then add one short Stockbase line.`,
};

const MAX_HISTORY_ITEMS = 20;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS - restrict to your domains in production
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://stockbase-sign-up.vercel.app',
    // Add additional domains here.
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
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

    const { message, history = [], profile = 'detailed', sessionId, mode } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const normalizedSessionId = typeof sessionId === 'string' ? sessionId : null;
    const normalizedMode = mode === 'widget' || mode === 'modal' ? mode : null;
    const nowIso = new Date().toISOString();

    if (supabase && normalizedSessionId) {
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .upsert(
          {
            id: normalizedSessionId,
            last_message_at: nowIso,
            source: 'waitlist',
            mode: normalizedMode || 'modal',
            user_agent: req.headers['user-agent'] ?? null,
          },
          { onConflict: 'id' }
        );

      if (sessionError) {
        console.error('Chat session upsert error:', sessionError);
      } else {
        const { error: messageError } = await supabase.from('chat_messages').insert({
          session_id: normalizedSessionId,
          role: 'user',
          content: message,
          created_at: nowIso,
        });

        if (messageError) {
          console.error('Chat message insert error:', messageError);
        }
      }
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

    if (supabase && normalizedSessionId) {
      const { error: messageError } = await supabase.from('chat_messages').insert({
        session_id: normalizedSessionId,
        role: 'model',
        content: text,
        created_at: new Date().toISOString(),
      });

      if (messageError) {
        console.error('Chat message insert error:', messageError);
      }
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate response',
    });
  }
}
