import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import {
  Code2, MessageSquareHeart, BarChart2, Bell, Globe2,
  Webhook, Users, RefreshCw, Sparkles, ShieldCheck,
} from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  highlights: string[];
  accent: string;
  iconBg: string;
}

const services: Service[] = [
  {
    icon: <Code2 className="w-6 h-6" />,
    tag: 'Core',
    title: 'Embeddable Chat Widget',
    description:
      'Drop one `<script>` tag into any website and your AI chatbot goes live instantly — no framework, no rebuild required.',
    highlights: ['One-line installation', 'Fully responsive', 'Custom branding & colors'],
    accent: 'from-violet-500 to-indigo-500',
    iconBg: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
  },
  {
    icon: <MessageSquareHeart className="w-6 h-6" />,
    tag: 'Engagement',
    title: 'Lead Capture',
    description:
      "When the bot can't answer, it collects the visitor's name and email and notifies you — turning failed chats into warm leads.",
    highlights: ['Auto-triggered on dead ends', 'Email notifications', 'Export to CSV / CRM'],
    accent: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-500/10 text-rose-500 dark:text-rose-400',
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    tag: 'Insights',
    title: 'Advanced Analytics',
    description:
      'Go beyond request counts. See unanswered questions, conversation drop-off, top-asked topics, and CSAT scores.',
    highlights: ['Unanswered question tracker', 'CSAT thumbs up/down', 'Exportable reports'],
    accent: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
  },
  {
    icon: <Globe2 className="w-6 h-6" />,
    tag: 'Reach',
    title: 'Multi-language Support',
    description:
      'Automatically detect visitor language and reply in kind — open your product to every market without extra effort.',
    highlights: ['Auto language detection', '50+ languages', 'No config needed'],
    accent: 'from-cyan-500 to-teal-500',
    iconBg: 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400',
  },
  {
    icon: <Webhook className="w-6 h-6" />,
    tag: 'Integrations',
    title: 'Webhooks & Zapier',
    description:
      'Every chat event fires a webhook. Connect Fixy to Slack, HubSpot, Notion, Google Sheets — 5,000+ tools via Zapier.',
    highlights: ['Real-time webhooks', 'Zapier native app', 'Slack & HubSpot ready'],
    accent: 'from-emerald-500 to-green-500',
    iconBg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    tag: 'Freshness',
    title: 'Auto Re-crawl & Sync',
    description:
      'Schedule daily or weekly re-crawls so your chatbot always reflects the latest content — no manual updates.',
    highlights: ['Scheduled sync', 'Change detection', 'Instant re-embed'],
    accent: 'from-blue-500 to-sky-500',
    iconBg: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  },
  {
    icon: <Users className="w-6 h-6" />,
    tag: 'Teams',
    title: 'Team Seats & Roles',
    description:
      'Invite teammates as Admins, Editors, or Viewers. Agencies can manage all client bots from one dashboard.',
    highlights: ['Role-based access', 'Per-seat billing', 'Agency workspace'],
    accent: 'from-fuchsia-500 to-purple-500',
    iconBg: 'bg-fuchsia-500/10 text-fuchsia-500 dark:text-fuchsia-400',
  },
  {
    icon: <Bell className="w-6 h-6" />,
    tag: 'Retention',
    title: 'Weekly Email Digest',
    description:
      'Every Monday your inbox gets a summary: requests, top questions, leads captured, and bot health score.',
    highlights: ['Auto-sent every Monday', 'Bot health score', 'Actionable insights'],
    accent: 'from-yellow-500 to-amber-500',
    iconBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    tag: 'Enterprise',
    title: 'White-label & Compliance',
    description:
      'Remove all Fixy branding, use your own domain, and meet enterprise requirements with GDPR & HIPAA compliance.',
    highlights: ['Remove Fixy branding', 'Custom domain', 'GDPR & HIPAA ready'],
    accent: 'from-slate-500 to-gray-600',
    iconBg: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
  },
];

// ── Featured (top-of-section) cards — first 3 services ──────────────────────

const FeaturedCard = ({ service, index }: { service: Service; index: number }) => (
  <motion.div
    variants={fadeIn('up', 'tween', 0.3, 0.1 * index)}
    whileHover={{ y: -6, transition: { duration: 0.25 } }}
    className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-7 shadow-sm hover:shadow-xl transition-shadow overflow-hidden group"
  >
    {/* Gradient accent bar */}
    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.accent} rounded-t-2xl`} />

    <div className={`inline-flex p-2.5 rounded-xl mb-4 ${service.iconBg}`}>
      {service.icon}
    </div>

    <span className={`text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${service.accent} bg-clip-text text-transparent`}>
      {service.tag}
    </span>

    <h3 className="text-xl font-bold mt-1 mb-2">{service.title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">{service.description}</p>

    <ul className="space-y-2">
      {service.highlights.map((h) => (
        <li key={h} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-fixy-accent" />
          {h}
        </li>
      ))}
    </ul>
  </motion.div>
);

// ── Compact grid card — remaining services ───────────────────────────────────

const CompactCard = ({ service, index }: { service: Service; index: number }) => (
  <motion.div
    variants={fadeIn('up', 'tween', 0.3, 0.07 * index)}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="flex gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className={`inline-flex p-2.5 rounded-xl h-fit shrink-0 ${service.iconBg}`}>
      {service.icon}
    </div>
    <div>
      <span className={`text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${service.accent} bg-clip-text text-transparent`}>
        {service.tag}
      </span>
      <h3 className="font-semibold mt-0.5 mb-1">{service.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{service.description}</p>
    </div>
  </motion.div>
);

// ── Section ──────────────────────────────────────────────────────────────────

const ServicesSection = () => {
  const featured = services.slice(0, 3);
  const compact = services.slice(3);

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background blobs */}
      <div className="blur-dot w-[350px] h-[350px] bg-fixy-pastel-purple -left-20 top-20" />
      <div className="blur-dot w-[300px] h-[300px] bg-fixy-pastel-blue -right-10 bottom-20" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 0)}
            className="bg-gradient-to-r from-fixy-accent/10 to-primary/10 text-fixy-accent font-medium py-1 px-4 rounded-full inline-block mb-4"
          >
            What We Offer
          </motion.div>

          <motion.h2
            variants={fadeIn('up', 'tween', 0.3, 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Everything Your Business Needs to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
              Convert Visitors
            </span>
          </motion.h2>

          <motion.p
            variants={fadeIn('up', 'tween', 0.3, 0.2)}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            From a one-script embed to enterprise white-labelling — Fixy ships the full stack so you don't have to build it.
          </motion.p>
        </motion.div>

        {/* Featured 3-column grid */}
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          {featured.map((s, i) => (
            <FeaturedCard key={s.title} service={s} index={i} />
          ))}
        </motion.div>

        {/* Compact 2-column grid */}
        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {compact.map((s, i) => (
            <CompactCard key={s.title} service={s} index={i} />
          ))}
        </motion.div>

        {/* Bottom stat strip */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.3, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-8"
        >
          {[
            { value: '< 2 min', label: 'Setup time' },
            { value: '50+', label: 'Languages' },
            { value: '5,000+', label: 'Zapier integrations' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
                {value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
