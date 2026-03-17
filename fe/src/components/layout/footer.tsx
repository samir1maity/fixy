import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import { Link } from 'react-router-dom';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Integrations', href: '#' },
      { name: 'Documentation', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Status', href: '#' },
    ],
  },
];

const Footer = () => (
  <motion.footer
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.15 }}
    className="border-t border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#0a0c10]"
  >
    <div className="container mx-auto px-4">

      {/* Main row */}
      <div className="py-14 flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-0">

        {/* Brand block */}
        <motion.div variants={fadeUp(0.4, 0)} className="lg:w-[320px] shrink-0">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-fixy-accent to-primary rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
              Fixy
            </span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[260px]">
            Build intelligent AI chatbots that understand your website content in minutes — no coding required.
          </p>
        </motion.div>

        {/* Link groups */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {footerLinks.map((group, index) => (
            <motion.div key={group.title} variants={fadeUp(0.4, 0.08 * (index + 1))}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div
        variants={fadeUp(0.4, 0.3)}
        className="border-t border-gray-200 dark:border-white/[0.07] py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Fixy. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Made with ♥ for the web
        </p>
      </motion.div>

    </div>
  </motion.footer>
);

export default Footer;
