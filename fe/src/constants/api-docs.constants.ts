export interface Section {
  id: string;
  title: string;
}

export interface EndpointExample {
  request?: string;
  response?: string;
}

export interface EndpointData {
  method: string;
  path: string;
  description: string;
  auth?: string;
  requestBody?: Record<string, string>;
  response?: any;
  example?: EndpointExample;
}

export interface AuthMethod {
  title: string;
  description: string;
  instruction: string;
  code: string;
  note?: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
}

export const API_DOCS_SECTIONS: Section[] = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'authentication', title: 'Authentication' },
  { id: 'chat-api', title: 'Chat API' },
  { id: 'errors', title: 'Error Responses' },
];

export const AUTH_METHODS: AuthMethod[] = [
  {
    title: 'API Secret Authentication',
    description: 'For chat API endpoints',
    instruction: 'Include your API secret in the X-API-Secret header:',
    code: 'X-API-Secret: <your-api-secret>',
    note: 'You can get your API secret from the website settings in your dashboard.',
  },
];

export const CHAT_API_ENDPOINTS: EndpointData[] = [
  {
    method: 'POST',
    path: '/api/v1/chat',
    description: 'Send a chat message and receive an AI-generated response',
    auth: 'API Secret (X-API-Secret header)',
    requestBody: {
      query: "string (required) - The user's question",
      sessionId: 'string (optional) - Session ID for conversation context',
      websiteId: 'number (required) - Your website ID',
    },
    response: {
      response: 'string - AI-generated response',
      sessionId: 'string - Session ID for maintaining conversation context',
      sources: ['array of source URLs (optional)'],
    },
  },
];

export const ERROR_RESPONSES: ErrorResponse[] = [
  { code: 400, message: 'Bad Request - Invalid request parameters' },
  { code: 401, message: 'Unauthorized - Missing or invalid authentication' },
  { code: 403, message: 'Forbidden - Insufficient permissions' },
  { code: 404, message: 'Not Found - Resource not found' },
  { code: 500, message: 'Internal Server Error - Server error' },
];

export const SECTION_DESCRIPTIONS: Record<string, string> = {
  authentication: 'The Fixy API uses API Secret authentication for chat endpoints.',
  'chat-api': 'Send user queries to get AI-powered responses based on your website content.',
};
