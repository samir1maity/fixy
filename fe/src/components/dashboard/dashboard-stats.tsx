import { UserChatStats } from '@/services/analytics-api';
import { motion } from 'framer-motion';
import { Globe, Check, MessageSquare, BarChart } from 'lucide-react';
import NumberTicker from '@/components/ui/number-ticker';

interface DashboardStatsProps {
  stats: UserChatStats;
}

const DashboardStats = ({ stats }: DashboardStatsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <StatCard
      icon={<Globe className="h-4 w-4" />}
      title="Total Websites"
      value={stats.totalWebsites}
      color="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
      delay={0}
    />
    <StatCard
      icon={<Check className="h-4 w-4" />}
      title="Active Websites"
      value={stats.activeWebsites}
      color="bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400"
      delay={0.05}
    />
    <StatCard
      icon={<MessageSquare className="h-4 w-4" />}
      title="Requests Today"
      value={stats.todayChats}
      color="bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400"
      delay={0.1}
    />
    <StatCard
      icon={<BarChart className="h-4 w-4" />}
      title="Total Requests"
      value={stats.totalChats}
      color="bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
      delay={0.15}
    />
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  delay: number;
}

const StatCard = ({ icon, title, value, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    className="bg-card border rounded-lg p-3 sm:p-4"
  >
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className={`p-2 rounded-full shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs text-muted-foreground truncate mb-0.5">{title}</p>
        <NumberTicker
          value={value}
          delay={delay + 0.1}
          className="text-base sm:text-xl"
        />
      </div>
    </div>
  </motion.div>
);

export default DashboardStats;
