
import { UserChatStats } from '@/services/analytics-api';
import { motion } from 'framer-motion';
import { Globe, Check, MessageSquare, BarChart } from 'lucide-react';

interface DashboardStatsProps {
  stats: UserChatStats
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<Globe className="h-5 w-5" />}
        title="Total Websites"
        value={stats.totalWebsites}
        color="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
      />
      <StatCard
        icon={<Check className="h-5 w-5" />}
        title="Active Websites"
        value={stats.activeWebsites}
        color="bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400"
      />
      <StatCard
        icon={<MessageSquare className="h-5 w-5" />}
        title="Requests Today"
        value={stats.todayChats}
        color="bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400"
      />
      <StatCard
        icon={<BarChart className="h-5 w-5" />}
        title="Total Requests"
        value={stats.totalChats}
        color="bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}

const StatCard = ({ icon, title, value, color }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border rounded-xl p-6"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardStats;
