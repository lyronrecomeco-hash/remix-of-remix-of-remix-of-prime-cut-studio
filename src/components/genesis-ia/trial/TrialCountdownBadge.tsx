import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrialCountdownBadgeProps {
  expiresAt: string;
  onClick: () => void;
}

function getTimeRemaining(expiresAt: string) {
  const now = new Date();
  // Use Brazil timezone
  const brNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - brNow.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, expired: false };
}

export function TrialCountdownBadge({ expiresAt, onClick }: TrialCountdownBadgeProps) {
  const [time, setTime] = useState(getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(expiresAt));
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (time.expired) return null;

  const label = time.days > 0
    ? `${time.days}d ${time.hours}h ${time.minutes}m`
    : `${time.hours}h ${time.minutes}m`;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
    >
      <Clock className="w-3.5 h-3.5 text-amber-400" />
      <span className="text-xs font-semibold text-amber-400">
        Acesso expira: {label}
      </span>
    </motion.button>
  );
}
