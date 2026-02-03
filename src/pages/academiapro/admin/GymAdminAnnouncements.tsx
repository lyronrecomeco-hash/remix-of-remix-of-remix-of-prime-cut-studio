import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  Bell,
  Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  is_active: boolean;
  priority: number;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  info: { icon: Info, color: 'text-blue-500 bg-blue-500/20', label: 'Informativo' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-500/20', label: 'Aviso' },
  update: { icon: Bell, color: 'text-green-500 bg-green-500/20', label: 'Atualização' },
  promotion: { icon: Gift, color: 'text-purple-500 bg-purple-500/20', label: 'Promoção' },
  urgent: { icon: AlertTriangle, color: 'text-red-500 bg-red-500/20', label: 'Urgente' },
};

export default function GymAdminAnnouncements() {
  const { user } = useGymAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target_audience: 'all',
    is_active: true,
    priority: 0,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('gym_announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setAnnouncements(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      target_audience: formData.target_audience,
      is_active: formData.is_active,
      priority: formData.priority,
      created_by: user?.id,
    };

    if (editingAnnouncement) {
      const { error } = await supabase
        .from('gym_announcements')
        .update(payload)
        .eq('id', editingAnnouncement.id);
      
      if (error) {
        toast.error('Erro ao atualizar aviso');
        return;
      }
      toast.success('Aviso atualizado!');
    } else {
      const { error } = await supabase
        .from('gym_announcements')
        .insert(payload);
      
      if (error) {
        toast.error('Erro ao criar aviso');
        return;
      }
      toast.success('Aviso criado!');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchAnnouncements();
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      is_active: announcement.is_active,
      priority: announcement.priority,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    const { error } = await supabase
      .from('gym_announcements')
      .delete()
      .eq('id', deleteId);
    
    if (error) {
      toast.error('Erro ao excluir aviso');
      return;
    }
    
    toast.success('Aviso excluído!');
    setDeleteId(null);
    fetchAnnouncements();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('gym_announcements')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      toast.success(currentStatus ? 'Aviso desativado' : 'Aviso ativado');
      fetchAnnouncements();
    }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target_audience: 'all',
      is_active: true,
      priority: 0,
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Comunicação</h1>
          <p className="text-muted-foreground mt-1">Avisos e mensagens para os alunos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título do aviso"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Conteúdo *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                  placeholder="Mensagem do aviso..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData(f => ({ ...f, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informativo</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="update">Atualização</SelectItem>
                      <SelectItem value="promotion">Promoção</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Público</Label>
                  <Select
                    value={formData.target_audience}
                    onValueChange={(v) => setFormData(f => ({ ...f, target_audience: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Apenas Ativos</SelectItem>
                      <SelectItem value="overdue">Em Atraso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label>Ativo</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(f => ({ ...f, is_active: checked }))}
                />
              </div>
              
              <Button onClick={handleSave} className="w-full">
                {editingAnnouncement ? 'Salvar Alterações' : 'Publicar Aviso'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{announcements.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {announcements.filter(a => a.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))
        ) : announcements.length > 0 ? (
          announcements.map((announcement) => {
            const config = typeConfig[announcement.type] || typeConfig.info;
            const IconComponent = config.icon;
            
            return (
              <div
                key={announcement.id}
                className={`bg-card border rounded-xl p-5 ${
                  announcement.is_active ? 'border-border' : 'border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                        <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                          {announcement.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">{config.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(announcement.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {announcement.target_audience === 'all' ? 'Todos' : 
                           announcement.target_audience === 'active' ? 'Ativos' : 'Em atraso'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(announcement.id, announcement.is_active)}
                    >
                      <Bell className={`w-4 h-4 ${announcement.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-foreground">Nenhum aviso encontrado</h3>
            <p className="text-muted-foreground text-sm">
              Crie avisos para comunicar com seus alunos
            </p>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Aviso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
