import { motion } from 'framer-motion';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import config from '@/config';
import { Button } from '@/components/ui/button';
import {
  API_DOCS_SECTIONS,
  AUTH_METHODS,
  CHAT_API_ENDPOINTS,
  ERROR_RESPONSES,
  SECTION_DESCRIPTIONS,
  type EndpointData,
} from '@/constants/api-docs.constants';

const ApiDocs = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const baseUrl = config.apiUrl
  const sections = API_DOCS_SECTIONS;

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      const element = sectionRefs.current[section.id];
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = sectionRefs.current[section.id];
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 100; // Account for navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  // Map request body keys to example values
  const getExampleBodyValue = (key: string, method: string): any => {
    const valueMap: Record<string, any> = {
      email: 'user@example.com',
      password: 'secure-password',
      name: method === 'PUT' ? 'Updated Name' : 'John Doe',
      url: 'https://example.com',
      query: 'What services do you offer?',
      websiteId: 1,
      sessionId: 'optional-session-id',
      token: 'reset-token',
    };
    return valueMap[key];
  };

  // Generate authentication headers based on auth type
  const getAuthHeaders = (auth?: string): string[] => {
    const headers: string[] = [];
    if (auth?.includes('JWT')) {
      headers.push('Authorization: Bearer your-jwt-token');
    } else if (auth?.includes('API Secret')) {
      headers.push('X-API-Secret: your-api-secret');
    }
    return headers;
  };

  // Generate request body from endpoint definition
  const generateRequestBody = (requestBody?: Record<string, string>, method?: string): Record<string, any> => {
    if (!requestBody) return {};

    const body: Record<string, any> = {};
    Object.keys(requestBody).forEach((key) => {
      const value = getExampleBodyValue(key, method || '');
      if (value !== undefined) {
        body[key] = value;
      }
    });
    return body;
  };

  // Generate curl command for GET requests
  const generateGetRequest = (path: string, auth?: string): string => {
    const normalizedPath = path.replace(':id', '1');
    const authHeaders = getAuthHeaders(auth);
    
    if (authHeaders.length === 0) {
      return `curl -X GET ${baseUrl}${normalizedPath}`;
    }
    
    const headerStr = authHeaders.map((h) => `  -H "${h}"`).join(' \\\n');
    return `curl -X GET ${baseUrl}${normalizedPath} \\
${headerStr}`;
  };

  // Generate curl command for POST/PUT/PATCH requests
  const generatePostRequest = (method: string, path: string, auth?: string, requestBody?: Record<string, string>): string => {
    const headers = ['Content-Type: application/json', ...getAuthHeaders(auth)];
    const body = generateRequestBody(requestBody, method);
    
    const headerStr = headers.map((h) => `  -H "${h}"`).join(' \\\n');
    const bodyStr = JSON.stringify(body, null, 2);
    
    return `curl -X ${method} ${baseUrl}${path} \\
${headerStr} \\
  -d '${bodyStr}'`;
  };

  // Generate example request and response
  const generateExample = (endpoint: EndpointData): { request?: string; response?: string } => {
    const example: { request?: string; response?: string } = {};

    // Generate request
    if (endpoint.method === 'GET') {
      example.request = generateGetRequest(endpoint.path, endpoint.auth);
    } else {
      example.request = generatePostRequest(
        endpoint.method,
        endpoint.path,
        endpoint.auth,
        endpoint.requestBody
      );
    }

    // Generate response
    if (endpoint.response) {
      example.response = JSON.stringify(endpoint.response, null, 2);
    }

    return example;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'json', id, label }: { code: string; language?: string; id: string; label?: string }) => (
    <div className="relative group">
      <div className="flex items-center justify-between mb-2">
        {label && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        )}
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all"
          aria-label="Copy code"
        >
          {copiedCode === id ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 rounded-xl border border-gray-800 dark:border-gray-700 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800/50 dark:bg-gray-900/50 border-b border-gray-700 dark:border-gray-800 flex items-center gap-2 px-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2 font-mono">{language || 'code'}</span>
        </div>
        <pre className="p-5 pt-12 overflow-x-auto text-sm leading-relaxed">
          <code className={`language-${language} text-gray-100 dark:text-gray-100 font-mono`}>{code}</code>
        </pre>
      </div>
    </div>
  );

  const EndpointCard = ({
    method,
    path,
    description,
    auth,
    requestBody,
    response,
    example,
  }: {
    method: string;
    path: string;
    description: string;
    auth?: string;
    requestBody?: any;
    response?: any;
    example?: { request?: string; response?: string };
  }) => {
    const methodColors: Record<string, string> = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-yellow-500',
      PATCH: 'bg-orange-500',
      DELETE: 'bg-red-500',
    };

    return (
      <Card className="mb-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${methodColors[method] || 'bg-gray-500'} text-white font-semibold px-3 py-1`}>
              {method}
            </Badge>
            <code className="text-lg font-mono break-all text-gray-900 dark:text-gray-100 font-semibold">
              {path}
            </code>
          </div>
          <CardDescription className="mt-3 text-base">{description}</CardDescription>
          {auth && (
            <Badge variant="outline" className="mt-3 w-fit border-gray-300 dark:border-gray-700">
              {auth}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {requestBody && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Request Body</h4>
              </div>
              <CodeBlock 
                code={JSON.stringify(requestBody, null, 2)} 
                id={`req-${method}-${path}`}
                language="json"
                label="Schema"
              />
            </div>
          )}
          {response && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Response</h4>
              </div>
              <CodeBlock 
                code={JSON.stringify(response, null, 2)} 
                id={`res-${method}-${path}`}
                language="json"
                label="Schema"
              />
            </div>
          )}
          {example && (
            <div className="space-y-6 pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Example</h4>
              </div>
              {example.request && (
                <div className="space-y-3">
                  <CodeBlock 
                    code={example.request} 
                    language="bash" 
                    id={`ex-req-${method}-${path}`}
                    label="cURL Request"
                  />
                </div>
              )}
              {example.response && (
                <div className="space-y-3">
                  <CodeBlock 
                    code={example.response} 
                    id={`ex-res-${method}-${path}`}
                    language="json"
                    label="Response"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <Navbar />
      
      <div className="flex pt-20">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-24 left-4 z-40">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-white dark:bg-gray-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed top-0 left-0
            h-screen lg:h-[calc(100vh-5rem)]
            w-64 pt-20
            z-30
            transition-transform duration-300
            ${mobileMenuOpen ? 'translate-x-0 bg-white dark:bg-gray-900' : '-translate-x-full lg:translate-x-0'}
            overflow-hidden
          `}
        >
          <nav className="p-6 h-full overflow-y-auto lg:overflow-hidden">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-md text-sm font-medium
                      transition-colors duration-200
                      ${
                        activeSection === section.id
                          ? 'bg-fixy-accent/10 text-fixy-accent dark:bg-fixy-accent/20 dark:text-fixy-accent'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
          {/* Getting Started Section */}
          <section
            id="getting-started"
            ref={(el) => (sectionRefs.current['getting-started'] = el)}
            className="mb-16 scroll-mt-20"
          >
            <Card className="mb-8 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Base URL</CardTitle>
                <CardDescription className="text-base mt-1">All API requests should be made to this base URL</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <code className="flex-1 text-base font-mono text-gray-900 dark:text-gray-100 break-all">
                      {baseUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(baseUrl, 'base-url')}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-all shadow-sm"
                      aria-label="Copy base URL"
                    >
                      {copiedCode === 'base-url' ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Authentication Section */}
          <section
            id="authentication"
            ref={(el) => (sectionRefs.current['authentication'] = el)}
            className="mb-16 scroll-mt-20"
          >
            <h2 className="text-3xl font-bold mb-4">Authentication</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {SECTION_DESCRIPTIONS.authentication}
            </p>
            
            {AUTH_METHODS.map((auth, index) => (
              <Card key={auth.title} className={`${index < AUTH_METHODS.length - 1 ? 'mb-6' : ''} border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{auth.title}</CardTitle>
                  <CardDescription className="text-base mt-1">{auth.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-700 dark:text-gray-300">{auth.instruction}</p>
                  <CodeBlock
                    code={auth.code}
                    language="bash"
                    id={`auth-${index}`}
                    label="Header"
                  />
                  {auth.note && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {auth.note}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Chat API Section */}
          <section
            id="chat-api"
            ref={(el) => (sectionRefs.current['chat-api'] = el)}
            className="mb-16 scroll-mt-20"
          >
            <h2 className="text-3xl font-bold mb-4">Chat API</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {SECTION_DESCRIPTIONS['chat-api']}
            </p>

            {CHAT_API_ENDPOINTS.map((endpoint) => {
              const example = generateExample(endpoint);
              // Special handling for chat API response
              if (endpoint.path === '/api/v1/chat') {
                example.response = JSON.stringify({
                  response: 'We offer a variety of services including...',
                  sessionId: 'abc123-session-id',
                  sources: ['https://example.com/services'],
                }, null, 2);
              }
              return (
                <EndpointCard
                  key={endpoint.path}
                  method={endpoint.method}
                  path={endpoint.path}
                  description={endpoint.description}
                  auth={endpoint.auth}
                  requestBody={endpoint.requestBody}
                  response={endpoint.response}
                  example={example}
                />
              );
            })}
          </section>

          {/* Error Responses Section */}
          <section
            id="errors"
            ref={(el) => (sectionRefs.current['errors'] = el)}
            className="mb-16 scroll-mt-20"
          >
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Code className="w-5 h-5" />
                  Error Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-gray-700 dark:text-gray-300">All endpoints may return the following error responses:</p>
                <div className="space-y-3 mb-6">
                  {ERROR_RESPONSES.map((error) => (
                    <div key={error.code} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                      <Badge variant="destructive" className="font-semibold min-w-[3rem] justify-center">
                        {error.code}
                      </Badge>
                      <span className="text-gray-700 dark:text-gray-300">{error.message}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <CodeBlock
                    code={JSON.stringify({
                      error: 'Error message description',
                    }, null, 2)}
                    id="error-response"
                    language="json"
                    label="Error Format"
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </motion.div>
  );
};

export default ApiDocs;
