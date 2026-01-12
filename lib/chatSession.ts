const SESSION_KEY = 'stockbase_chat_session_id';

const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getChatSessionId = () => {
  if (typeof window === 'undefined') return null;

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const created = generateSessionId();
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
};
