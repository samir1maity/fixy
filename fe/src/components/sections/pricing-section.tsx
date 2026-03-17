import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Minus, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  period: string;
  features: PlanFeature[];
  highlight: boolean;
  badge?: string;
  cta: string;
  ctaLink: string;
  accent: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    tagline: 'Try it out — no credit card needed.',
    monthlyPrice: 0,
    annualPrice: 0,
    period: 'forever',
    highlight: false,
    cta: 'Get Started Free',
    ctaLink: '/signup',
    accent: 'from-gray-400 to-gray-500',
    features: [
      { text: '1 website', included: true },
      { text: '500 messages / month', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Embeddable widget', included: true },
      { text: 'Community support', included: true },
      { text: 'Remove Fixy branding', included: false },
      { text: 'Lead capture', included: false },
      { text: 'Auto re-crawl', included: false },
      { text: 'Team seats', included: false },
      { text: 'Webhook / Zapier', included: false },
    ],
  },
  {
    name: 'Starter',
    tagline: 'For growing businesses that need more.',
    monthlyPrice: 19,
    annualPrice: 15,
    period: 'per month',
    highlight: false,
    cta: 'Start Free Trial',
    ctaLink: '/signup',
    accent: 'from-cyan-500 to-blue-500',
    features: [
      { text: '3 websites', included: true },
      { text: '5,000 messages / month', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Embeddable widget', included: true },
      { text: 'Priority support', included: true },
      { text: 'Remove Fixy branding', included: false },
      { text: 'Lead capture', included: true },
      { text: 'Auto re-crawl (weekly)', included: true },
      { text: 'Team seats', included: false },
      { text: 'Webhook / Zapier', included: false },
    ],
  },
  {
    name: 'Pro',
    tagline: 'Everything you need to run a serious product.',
    monthlyPrice: 49,
    annualPrice: 39,
    period: 'per month',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Free Trial',
    ctaLink: '/signup',
    accent: 'from-fixy-accent to-primary',
    features: [
      { text: '10 websites', included: true },
      { text: '50,000 messages / month', included: true },
      { text: 'Full analytics + exports', included: true },
      { text: 'Embeddable widget', included: true },
      { text: 'Priority support', included: true },
      { text: 'Remove Fixy branding', included: true },
      { text: 'Lead capture', included: true },
      { text: 'Auto re-crawl (daily)', included: true },
      { text: '5 team seats', included: true },
      { text: 'Webhook / Zapier', included: true },
    ],
  },
  {
    name: 'Agency',
    tagline: 'White-label solution for teams and agencies.',
    monthlyPrice: 149,
    annualPrice: 119,
    period: 'per month',
    highlight: false,
    cta: 'Contact Sales',
    ctaLink: '/signup',
    accent: 'from-fuchsia-500 to-purple-600',
    features: [
      { text: 'Unlimited websites', included: true },
      { text: 'Unlimited messages', included: true },
      { text: 'Full analytics + exports', included: true },
      { text: 'Embeddable widget', included: true },
      { text: 'Dedicated support + SLA', included: true },
      { text: 'Full white-label', included: true },
      { text: 'Lead capture', included: true },
      { text: 'Auto re-crawl (real-time)', included: true },
      { text: 'Unlimited team seats', included: true },
      { text: 'Webhook / Zapier + custom integrations', included: true },
    ],
  },
];

// ── Pricing card ─────────────────────────────────────────────────────────────

const PricingCard = ({
  plan,
  isAnnual,
  index,
  locked,
}: {
  plan: Plan;
  isAnnual: boolean;
  index: number;
  locked: boolean;
}) => {
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <motion.div
      variants={fadeIn('up', 'tween', 0.3, 0.1 * index)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={locked ? {} : { y: -6, transition: { duration: 0.25 } }}
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-shadow ${
        plan.highlight
          ? 'border-2 border-fixy-accent shadow-2xl shadow-fixy-accent/20 bg-white dark:bg-gray-900'
          : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg'
      }`}
    >
      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 flex flex-col items-center gap-2 shadow-lg">
            <Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Coming Soon</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">This plan will be available soon</p>
          </div>
        </div>
      )}
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${plan.accent}`} />

      {/* Badge */}
      {plan.badge && (
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${plan.accent} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1`}>
          <Zap className="w-2.5 h-2.5" /> {plan.badge}
        </div>
      )}

      <div className="p-7 pb-4">
        <p className={`text-[11px] font-bold uppercase tracking-widest bg-gradient-to-r ${plan.accent} bg-clip-text text-transparent mb-1`}>
          {plan.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 min-h-[2.5rem]">{plan.tagline}</p>

        {/* Price */}
        <div className="flex items-end gap-1.5 mb-1">
          {price === null ? (
            <span className="text-4xl font-bold">Custom</span>
          ) : (
            <>
              <span className="text-4xl font-bold">${price}</span>
              <span className="text-gray-400 dark:text-gray-500 text-sm pb-1">/ {plan.period}</span>
            </>
          )}
        </div>

        {/* Annual savings indicator */}
        <AnimatePresence>
          {isAnnual && price !== null && price > 0 && (
            <motion.p
              key="save"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-4"
            >
              Save ${((plan.monthlyPrice! - plan.annualPrice!) * 12).toLocaleString()} / year
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="px-7 pb-7 flex flex-col flex-1 gap-6">
        {/* CTA */}
        <Link to={plan.ctaLink}>
          <Button
            className={`w-full font-semibold ${
              plan.highlight
                ? `bg-gradient-to-r ${plan.accent} hover:opacity-90 text-white`
                : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white'
            }`}
          >
            {plan.cta}
          </Button>
        </Link>

        {/* Feature list */}
        <ul className="space-y-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f.text} className="flex items-start gap-2.5">
              {f.included ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Minus className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${f.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// ── Section ──────────────────────────────────────────────────────────────────

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const plansUnlocked = false; // toggle to true in code to unlock paid plans

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="blur-dot w-[350px] h-[350px] bg-fixy-pastel-purple -right-20 top-20" />
      <div className="blur-dot w-[250px] h-[250px] bg-fixy-pastel-peach -left-10 bottom-10" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 0)}
            className="bg-gradient-to-r from-fixy-accent/10 to-primary/10 text-fixy-accent font-medium py-1 px-4 rounded-full inline-block mb-4"
          >
            Simple Pricing
          </motion.div>

          <motion.h2
            variants={fadeIn('up', 'tween', 0.3, 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Transparent Plans.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
              No Surprises.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeIn('up', 'tween', 0.3, 0.2)}
            className="text-gray-600 dark:text-gray-300 text-lg mb-8"
          >
            Start free and scale as you grow. All paid plans include a 14-day free trial.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            variants={fadeIn('up', 'tween', 0.3, 0.25)}
            className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? 'bg-white dark:bg-gray-700 shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-white dark:bg-gray-700 shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                −20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} isAnnual={isAnnual} index={i} locked={plan.name !== 'Free' && !plansUnlocked} />
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={fadeIn('up', 'tween', 0.3, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10"
        >
          All plans include a 14-day money-back guarantee. No credit card required for the free plan.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
