export const LEAD_INTENT_KEYWORDS: Record<string, string[]> = {
  pricing: ['pricing', 'price', 'cost', 'how much', 'fee', 'charge', 'rate', 'subscription', 'plan', 'tier', 'affordable', 'budget'],
  demo: ['demo', 'trial', 'free trial', 'walkthrough', 'show me', 'see it in action', 'live demo'],
  contact: ['contact', 'reach out', 'talk to', 'speak with', 'get in touch', 'call', 'meeting', 'schedule'],
  service: ['service', 'offer', 'provide', 'do you do', 'can you help', 'solution', 'package', 'feature'],
  quote: ['quote', 'proposal', 'estimate', 'custom plan', 'enterprise', 'team plan', 'business plan'],
  buy: ['buy', 'purchase', 'sign up', 'get started', 'onboard', 'upgrade', 'subscribe'],
};

export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CLOSED: 'closed',
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];

export const LEAD_COLLECTION_STEPS = {
  NAME: 'ask_name',
  EMAIL: 'ask_email',
  MESSAGE: 'ask_message',
  DONE: 'done',
} as const;

export type LeadCollectionStep = (typeof LEAD_COLLECTION_STEPS)[keyof typeof LEAD_COLLECTION_STEPS];

export const LEAD_BOT_PROMPTS: Record<LeadCollectionStep, string> = {
  ask_name: "I'd love to connect you with our team! What's your name?",
  ask_email: "Thanks! What's the best email address to reach you?",
  ask_message: "Got it! Briefly tell me what you're looking for or any specific requirements?",
  done: "Perfect! I've passed your details to the team and they'll be in touch soon. Is there anything else I can help you with?",
};
