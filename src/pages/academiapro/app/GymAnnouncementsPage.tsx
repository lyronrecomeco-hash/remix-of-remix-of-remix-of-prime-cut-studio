import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  Gift,
  Check,
  Calendar
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  is_read?: boolean;
}

const typeConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  update: { icon: Bell, color: 'text-green-500', bgColor: 'bg-green-500/20' },
  promotion: { icon: Gift, color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
  urgent: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/20' },
};

export default function GymAnnouncementsPage() {
  const { user, profile } = useGymAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    // Fetch announcements that are active and not expired
    const { data: announcementsData } = await supabase
      .from('gym_announcements')
      .select('*')
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    // Fetch which ones user has read
    const { data: readsData } = await supabase
      .from('gym_announcement_reads')
      .select('announcement_id')
      .eq('user_id', user?.id);

    const readIdsList = readsData?.map(r => r.announcement_id) || [];
    setReadIds(readIdsList);

    if (announcementsData) {
      // Filter by target audience - status field may not exist in types yet
      const profileStatus = (profile as any)?.status || 'active';
      const filtered = announcementsData.filter(a => {
        if (a.target_audience === 'all') return true;
        if (a.target_audience === 'active' && profileStatus === 'active') return true;
        if (a.target_audience === 'overdue' && profileStatus === 'overdue') return true;
        return false;
      });
      
      setAnnouncements(filtered.map(a => ({
        ...a,
        is_read: readIdsList.includes(a.id)
      })));
    }
    
    setIsLoading(false);
  };

  const markAsRead = async (announcementId: string) => {
    if (readIds.includes(announcementId)) return;

    await supabase
      .from('gym_announcement_reads')
      .insert({
        announcement_id: announcementId,
        user_id: user?.id,
      });

    setReadIds([...readIds, announcementId]);
    setAnnouncements(announcements.map(a => 
      a.id === announcementId ? { ...a, is_read: true } : a
    ));
  };

  const unreadCount = announcements.filter(a => !a.is_read).length;

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Avisos</h1>
            <p className="text-muted-foreground text-sm">Comunicados da academia</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {unreadCount} {unreadCount === 1 ? 'novo' : 'novos'}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Announcements List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))
        ) : announcements.length > 0 ? (
          announcements.map((announcement, index) => {
            const config = typeConfig[announcement.type] || typeConfig.info;
            const IconComponent = config.icon;
            
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => markAsRead(announcement.id)}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${
                  announcement.is_read 
                    ? 'border-border opacity-70' 
                    : 'border-primary/50 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                    <IconComponent className={`w-5 h-5 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{announcement.title}</h3>
                      {!announcement.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(announcement.created_at), "dd 'de' MMM", { locale: ptBR })}
                      {announcement.is_read && (
                        <span className="flex items-center gap-1 text-green-500 ml-2">
                          <Check className="w-3 h-3" />
                          Lido
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum aviso</h3>
            <p className="text-muted-foreground text-sm">
              Você não tem avisos no momento
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
