
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

const Footer = () => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="border-t py-16 mt-20"
    >
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <motion.div 
            variants={fadeUp(0.3, 0)}
            className="col-span-2"
          >
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-fixy-accent to-primary rounded-lg w-8 h-8 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
                Fixy
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Build intelligent AI chatbots that understand your website content in minutes. Enhance user engagement without coding.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Fixy. All rights reserved.
            </p>
          </motion.div>
          
          {footerLinks.map((group, index) => (
            <motion.div 
              key={group.title}
              variants={fadeUp(0.3, 0.1 * (index + 1))}
            >
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
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
    </motion.footer>
  );
};

export default Footer;
