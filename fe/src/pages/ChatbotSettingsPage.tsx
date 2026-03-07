import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Check, Palette, Code2, Bot, AlignLeft, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppShell from '@/components/layout/AppShell';
import { toast as sonnerToast } from 'sonner';
import websiteApiService from '@/services/website-api';
import config from '@/config';
import PageProjectSwitcher from '@/components/common/PageProjectSwitcher';

interface WidgetSettings {
  widgetBotName: string;
  widgetPrimaryColor: string;
  widgetAvatarUrl: string;
  widgetWelcomeMsg: string;
  widgetPosition: 'bottom-right' | 'bottom-left';
}

const DEFAULT_SETTINGS: WidgetSettings = {
  widgetBotName: 'Support Bot',
  widgetPrimaryColor: '#6366f1',
  widgetAvatarUrl: '',
  widgetWelcomeMsg: 'Hi! How can I help you today?',
  widgetPosition: 'bottom-right',
};

const ChatbotSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [apiSecret, setApiSecret] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl = config.apiBaseUrl ? config.apiBaseUrl : '';

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const info = await websiteApiService.getWebsiteInfo(Number(id));
        const loaded: WidgetSettings = {
          widgetBotName: info.widgetBotName || DEFAULT_SETTINGS.widgetBotName,
          widgetPrimaryColor: info.widgetPrimaryColor || DEFAULT_SETTINGS.widgetPrimaryColor,
          widgetAvatarUrl: info.widgetAvatarUrl || '',
          widgetWelcomeMsg: info.widgetWelcomeMsg || DEFAULT_SETTINGS.widgetWelcomeMsg,
          widgetPosition: (info.widgetPosition as 'bottom-right' | 'bottom-left') || DEFAULT_SETTINGS.widgetPosition,
        };
        setSettings(loaded);
        setSavedSettings(loaded);
        setApiSecret(info.api_secret || '');
      } catch {
        sonnerToast.error('Failed to load website info');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await websiteApiService.updateWidgetConfig(Number(id), {
        widgetBotName: settings.widgetBotName,
        widgetPrimaryColor: settings.widgetPrimaryColor,
        widgetAvatarUrl: settings.widgetAvatarUrl || undefined,
        widgetWelcomeMsg: settings.widgetWelcomeMsg,
        widgetPosition: settings.widgetPosition,
      });
      setSavedSettings({ ...settings });
      sonnerToast.success('Widget settings saved', { position: 'top-right', duration: 3000 });
    } catch {
      sonnerToast.error('Failed to save settings', { position: 'top-right', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const embedScript = `<script\n  src="${apiBaseUrl}/widget.js"\n  data-website-id="${id}"\n  data-api-url="${apiBaseUrl}"\n  data-api-secret="${apiSecret}"\n  async\n></script>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">Widget Settings</h1>
          <PageProjectSwitcher currentId={id!} section="settings" />
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-2">
              <Code2 className="h-4 w-4" />
              Embed Code
            </TabsTrigger>
          </TabsList>

          {/* ── Appearance Tab ─────────────────────────────────────────────── */}
          <TabsContent value="appearance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Settings form */}
              <div className="space-y-5">
                {/* Bot Name */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      Bot Name
                    </CardTitle>
                    <CardDescription>The name displayed in the chat header</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={settings.widgetBotName}
                      onChange={(e) => setSettings((s) => ({ ...s, widgetBotName: e.target.value }))}
                      placeholder="Support Bot"
                      maxLength={40}
                    />
                  </CardContent>
                </Card>

                {/* Primary Color */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      Primary Color
                    </CardTitle>
                    <CardDescription>Used for the chat button, header, and accents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={settings.widgetPrimaryColor}
                          onChange={(e) => setSettings((s) => ({ ...s, widgetPrimaryColor: e.target.value }))}
                          className="w-11 h-11 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent"
                        />
                      </div>
                      <Input
                        value={settings.widgetPrimaryColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setSettings((s) => ({ ...s, widgetPrimaryColor: val }));
                          }
                        }}
                        placeholder="#6366f1"
                        className="font-mono"
                        maxLength={7}
                      />
                    </div>
                    {/* Quick palette */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#0ea5e9', '#14b8a6', '#ef4444'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setSettings((s) => ({ ...s, widgetPrimaryColor: c }))}
                          className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
                          style={{ backgroundColor: c, borderColor: settings.widgetPrimaryColor === c ? '#111' : 'transparent' }}
                          title={c}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar URL */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      Avatar URL
                    </CardTitle>
                    <CardDescription>Optional image URL for the bot avatar (leave blank for default)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 items-center">
                      {settings.widgetAvatarUrl && (
                        <img
                          src={settings.widgetAvatarUrl}
                          alt="Avatar preview"
                          className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <Input
                        value={settings.widgetAvatarUrl}
                        onChange={(e) => setSettings((s) => ({ ...s, widgetAvatarUrl: e.target.value }))}
                        placeholder="https://example.com/avatar.png"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Welcome Message */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-primary" />
                      Welcome Message
                    </CardTitle>
                    <CardDescription>First message shown when the chat opens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={settings.widgetWelcomeMsg}
                      onChange={(e) => setSettings((s) => ({ ...s, widgetWelcomeMsg: e.target.value }))}
                      placeholder="Hi! How can I help you today?"
                      rows={3}
                      maxLength={200}
                    />
                  </CardContent>
                </Card>

                {/* Position */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layout className="h-4 w-4 text-primary" />
                      Widget Position
                    </CardTitle>
                    <CardDescription>Where the chat button appears on the page</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {(['bottom-left', 'bottom-right'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setSettings((s) => ({ ...s, widgetPosition: pos }))}
                          className={`relative border-2 rounded-xl p-4 text-sm font-medium transition-all ${
                            settings.widgetPosition === pos
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-muted-foreground'
                          }`}
                        >
                          {/* Mini preview */}
                          <div className="w-full h-10 bg-muted rounded-md mb-2 relative overflow-hidden">
                            <div
                              className="absolute bottom-1 w-4 h-4 rounded-full"
                              style={{
                                [pos === 'bottom-left' ? 'left' : 'right']: '4px',
                                backgroundColor: settings.widgetPrimaryColor,
                              }}
                            />
                          </div>
                          {pos === 'bottom-left' ? 'Bottom Left' : 'Bottom Right'}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                >
                  {isSaving ? 'Saving…' : hasChanges ? 'Save Changes' : 'Saved'}
                </Button>
              </div>

              {/* Live preview */}
              <div className="hidden lg:block">
                <Card className="sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Live Preview</CardTitle>
                    <CardDescription>How your widget will look on a website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden"
                      style={{ height: '420px' }}
                    >
                      {/* Fake website content */}
                      <div className="p-4 space-y-2 opacity-30">
                        <div className="h-3 bg-gray-400 rounded w-3/4" />
                        <div className="h-3 bg-gray-400 rounded w-1/2" />
                        <div className="h-3 bg-gray-400 rounded w-5/6" />
                        <div className="h-3 bg-gray-400 rounded w-2/3" />
                      </div>

                      {/* Widget preview */}
                      <div
                        className="absolute bottom-3"
                        style={{ [settings.widgetPosition === 'bottom-left' ? 'left' : 'right']: '12px' }}
                      >
                        {/* Chat panel preview */}
                        <div
                          className="mb-2 rounded-xl shadow-xl overflow-hidden"
                          style={{ width: '240px', background: '#fff' }}
                        >
                          {/* Header */}
                          <div
                            className="flex items-center gap-2 px-3 py-2"
                            style={{ backgroundColor: settings.widgetPrimaryColor }}
                          >
                            <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {settings.widgetAvatarUrl ? (
                                <img src={settings.widgetAvatarUrl} alt="" className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                              )}
                            </div>
                            <div>
                              <div className="text-white text-xs font-semibold leading-tight">{settings.widgetBotName || 'Support Bot'}</div>
                              <div className="text-white/70 text-[10px]">● Online</div>
                            </div>
                          </div>
                          {/* Messages */}
                          <div className="p-2 space-y-2" style={{ minHeight: '80px' }}>
                            <div className="flex">
                              <div className="text-xs bg-gray-100 text-gray-800 rounded-xl rounded-bl-sm px-2.5 py-1.5 max-w-[80%]">
                                {settings.widgetWelcomeMsg || 'Hi! How can I help you today?'}
                              </div>
                            </div>
                          </div>
                          {/* Input */}
                          <div className="px-2 pb-2">
                            <div className="flex gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5 items-center">
                              <span className="text-[10px] text-gray-400 flex-1">Type a message…</span>
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: settings.widgetPrimaryColor }}>
                                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Floating button */}
                        <div className="flex justify-end">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: settings.widgetPrimaryColor }}
                          >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Embed Code Tab ─────────────────────────────────────────────── */}
          <TabsContent value="embed">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Embed Script</CardTitle>
                  <CardDescription>
                    Paste this single line into your website's <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> or
                    just before the closing <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-gray-950 text-gray-100 text-sm rounded-xl p-4 overflow-x-auto leading-relaxed font-mono">
                      <code>{embedScript}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCopyEmbed}
                      className="absolute top-3 right-3 gap-1.5 h-8"
                    >
                      {isCopied ? (
                        <><Check className="h-3.5 w-3.5 text-green-500" />Copied</>
                      ) : (
                        <><Copy className="h-3.5 w-3.5" />Copy</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How it works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <p>The script is loaded asynchronously — it won't slow down your page.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <p>It fetches your widget configuration (color, name, welcome message) from our servers automatically.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <p>A floating chat button appears on your site. Visitors can open it and ask questions — answers come from your website's content.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <p>Change colors, messages, or position here anytime — the widget updates automatically without touching your site's code again.</p>
                  </div>
                </CardContent>
              </Card>

              {/* API details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">API Details</CardTitle>
                  <CardDescription>For manual integration via the REST API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Website ID</Label>
                    <div className="mt-1 font-mono bg-muted rounded px-3 py-2 text-sm">{id}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">API Endpoint</Label>
                    <div className="mt-1 font-mono bg-muted rounded px-3 py-2 text-sm break-all">{apiBaseUrl}/api/v1/chat</div>
                  </div>
                  <div className="pt-1">
                    <Link to="/docs">
                      <Button variant="outline" size="sm">View full API docs</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppShell>
  );
};

export default ChatbotSettingsPage;
