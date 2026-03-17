import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import {
  Code2, MessageSquareHeart, BarChart2, Bell, Globe2,
  Webhook, Users, RefreshCw, ShieldCheck,
} from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  accent: string;
  glow: string;
  iconBg: string;
}

const services: Service[] = [
  {
    icon: <Code2 className="w-5 h-5" />,
    tag: 'Core',
    title: 'Embeddable Chat Widget',
    description: 'Drop one <script> tag. Your AI chatbot goes live instantly — no framework, no rebuild.',
    accent: 'from-violet-500 to-indigo-500',
    glow: 'rgba(139,92,246,0.12)',
    iconBg: 'bg-violet-500/10 text-violet-400',
  },
  {
    icon: <MessageSquareHeart className="w-5 h-5" />,
    tag: 'Engagement',
    title: 'Lead Capture',
    description: 'When the bot hits a dead end it collects name & email — turning failed chats into warm leads.',
    accent: 'from-rose-500 to-pink-500',
    glow: 'rgba(244,63,94,0.12)',
    iconBg: 'bg-rose-500/10 text-rose-400',
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    tag: 'Insights',
    title: 'Advanced Analytics',
    description: 'Unanswered questions, drop-off points, top topics, and CSAT scores — all in one view.',
    accent: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.12)',
    iconBg: 'bg-amber-500/10 text-amber-400',
  },
  {
    icon: <Globe2 className="w-5 h-5" />,
    tag: 'Reach',
    title: 'Multi-language Support',
    description: 'Auto-detects visitor language and replies in kind. 50+ languages, zero config.',
    accent: 'from-cyan-500 to-teal-500',
    glow: 'rgba(6,182,212,0.12)',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
  },
  {
    icon: <Webhook className="w-5 h-5" />,
    tag: 'Integrations',
    title: 'Webhooks & Zapier',
    description: 'Every chat event fires a webhook. Connect to Slack, HubSpot, Notion — 5,000+ tools via Zapier.',
    accent: 'from-emerald-500 to-green-500',
    glow: 'rgba(16,185,129,0.12)',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    tag: 'Freshness',
    title: 'Auto Re-crawl & Sync',
    description: 'Daily or weekly re-crawls keep your chatbot in sync with your latest content automatically.',
    accent: 'from-blue-500 to-sky-500',
    glow: 'rgba(59,130,246,0.12)',
    iconBg: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: <Users className="w-5 h-5" />,
    tag: 'Teams',
    title: 'Team Seats & Roles',
    description: 'Admins, Editors, Viewers. Agencies can manage all client bots from a single workspace.',
    accent: 'from-fuchsia-500 to-purple-500',
    glow: 'rgba(168,85,247,0.12)',
    iconBg: 'bg-fuchsia-500/10 text-fuchsia-400',
  },
  {
    icon: <Bell className="w-5 h-5" />,
    tag: 'Retention',
    title: 'Weekly Email Digest',
    description: 'Every Monday: top questions, leads captured, and bot health score — straight to your inbox.',
    accent: 'from-yellow-500 to-amber-500',
    glow: 'rgba(234,179,8,0.12)',
    iconBg: 'bg-yellow-500/10 text-yellow-400',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    tag: 'Enterprise',
    title: 'White-label & Compliance',
    description: 'Remove all Fixy branding, use your own domain. GDPR & HIPAA compliant out of the box.',
    accent: 'from-slate-400 to-gray-500',
    glow: 'rgba(148,163,184,0.12)',
    iconBg: 'bg-slate-500/10 text-slate-400',
  },
];

const stats = [
  { value: '< 2 min', label: 'Setup time' },
  { value: '50+', label: 'Languages' },
  { value: '5,000+', label: 'Integrations' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const ServiceCard = ({ service, index }: { service: Service; index: number }) => (
  <motion.div
    variants={fadeIn('up', 'tween', 0.2, 0.05 * index)}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.15 }}
    whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
    className="group relative flex flex-col gap-3 rounded-2xl p-5 overflow-hidden cursor-default
      border border-gray-200/60 dark:border-white/[0.07]
      bg-white dark:bg-[#0f1117]
      hover:border-gray-300 dark:hover:border-white/[0.13]
      shadow-sm hover:shadow-md dark:shadow-none
      transition-all duration-300"
  >
    {/* Per-card glow on hover */}
    <div
      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
      style={{ background: `radial-gradient(260px circle at 30% 0%, ${service.glow}, transparent 70%)` }}
    />

    {/* Thin top line */}
    <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${service.accent} opacity-50 group-hover:opacity-90 transition-opacity duration-300`} />

    {/* Icon + tag row */}
    <div className="flex items-center gap-3">
      <div className={`w-fit p-2 rounded-lg ${service.iconBg}`}>
        {service.icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-[0.18em] bg-gradient-to-r ${service.accent} bg-clip-text text-transparent`}>
        {service.tag}
      </span>
    </div>

    {/* Text */}
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug">
        {service.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {service.description}
      </p>
    </div>
  </motion.div>
);

// ── Section ──────────────────────────────────────────────────────────────────

const ServicesSection = () => (
  <section id="services" className="py-28 relative overflow-hidden">
    {/* Ambient blobs */}
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-fixy-accent/[0.06] rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-500/[0.05] rounded-full blur-[90px]" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-rose-500/[0.05] rounded-full blur-[90px]" />
    </div>

    <div className="container mx-auto px-4">

      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-xl mx-auto text-center mb-16"
      >
        <motion.p
          variants={fadeIn('up', 'tween', 0.2, 0)}
          className="text-[11px] font-bold uppercase tracking-[0.22em] text-fixy-accent mb-4"
        >
          What We Offer
        </motion.p>

        <motion.h2
          variants={fadeIn('up', 'tween', 0.2, 0.07)}
          className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-4"
        >
          The full stack to{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
            convert every visitor
          </span>
        </motion.h2>

        <motion.p
          variants={fadeIn('up', 'tween', 0.2, 0.13)}
          className="text-gray-500 dark:text-gray-400 text-base leading-relaxed"
        >
          From a one-script embed to enterprise white-labelling — everything ships together.
        </motion.p>
      </motion.div>

      {/* 3-col uniform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s, i) => (
          <ServiceCard key={s.title} service={s} index={i} />
        ))}
      </div>

      {/* Stats strip */}
      <motion.div
        variants={fadeIn('up', 'tween', 0.2, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="mt-14 grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden border border-gray-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0f1117]"
      >
        {stats.map(({ value, label }, i) => (
          <div
            key={label}
            className={`flex flex-col items-center justify-center py-8 px-6 gap-1
              ${i !== 0 ? 'border-l border-gray-200/60 dark:border-white/[0.07]' : ''}
              ${i >= 2 ? 'border-t border-gray-200/60 dark:border-white/[0.07] md:border-t-0' : ''}
            `}
          >
            <span className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary tabular-nums">
              {value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              {label}
            </span>
          </div>
        ))}
      </motion.div>

    </div>
  </section>
);

export default ServicesSection;
