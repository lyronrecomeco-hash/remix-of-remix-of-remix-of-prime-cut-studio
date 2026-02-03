import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  Award,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Instructor {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  specialties: string[] | null;
  cref: string | null;
  bio: string | null;
  is_active: boolean;
  hire_date: string | null;
  created_at: string;
}

export default function GymAdminInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialties: '',
    cref: '',
    bio: '',
    is_active: true,
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const { data, error } = await supabase
      .from('gym_instructors')
      .select('*')
      .order('full_name');
    
    if (data) setInstructors(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const payload = {
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : null,
      cref: formData.cref || null,
      bio: formData.bio || null,
      is_active: formData.is_active,
    };

    if (editingInstructor) {
      const { error } = await supabase
        .from('gym_instructors')
        .update(payload)
        .eq('id', editingInstructor.id);
      
      if (error) {
        toast.error('Erro ao atualizar instrutor');
        return;
      }
      toast.success('Instrutor atualizado!');
    } else {
      const { error } = await supabase
        .from('gym_instructors')
        .insert(payload);
      
      if (error) {
        toast.error('Erro ao cadastrar instrutor');
        return;
      }
      toast.success('Instrutor cadastrado!');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchInstructors();
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      full_name: instructor.full_name,
      email: instructor.email || '',
      phone: instructor.phone || '',
      specialties: instructor.specialties?.join(', ') || '',
      cref: instructor.cref || '',
      bio: instructor.bio || '',
      is_active: instructor.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    const { error } = await supabase
      .from('gym_instructors')
      .delete()
      .eq('id', deleteId);
    
    if (error) {
      toast.error('Erro ao excluir instrutor');
      return;
    }
    
    toast.success('Instrutor excluído!');
    setDeleteId(null);
    fetchInstructors();
  };

  const resetForm = () => {
    setEditingInstructor(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      specialties: '',
      cref: '',
      bio: '',
      is_active: true,
    });
  };

  const filteredInstructors = instructors.filter(i =>
    i.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Instrutores</h1>
          <p className="text-muted-foreground mt-1">Gerencie a equipe de instrutores</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Instrutor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingInstructor ? 'Editar Instrutor' : 'Novo Instrutor'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nome do instrutor"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>CREF</Label>
                <Input
                  value={formData.cref}
                  onChange={(e) => setFormData(f => ({ ...f, cref: e.target.value }))}
                  placeholder="000000-G/SP"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Especialidades (separadas por vírgula)</Label>
                <Input
                  value={formData.specialties}
                  onChange={(e) => setFormData(f => ({ ...f, specialties: e.target.value }))}
                  placeholder="Musculação, Funcional, Pilates"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Breve descrição do instrutor..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label>Ativo</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(f => ({ ...f, is_active: checked }))}
                />
              </div>
              
              <Button onClick={handleSave} className="w-full">
                {editingInstructor ? 'Salvar Alterações' : 'Cadastrar Instrutor'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar instrutor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{instructors.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {instructors.filter(i => i.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-6 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))
        ) : filteredInstructors.length > 0 ? (
          filteredInstructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {instructor.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{instructor.full_name}</h3>
                    {instructor.cref && (
                      <p className="text-xs text-muted-foreground">CREF: {instructor.cref}</p>
                    )}
                  </div>
                </div>
                <Badge variant={instructor.is_active ? 'default' : 'secondary'}>
                  {instructor.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {instructor.specialties && instructor.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {instructor.specialties.slice(0, 3).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                {instructor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{instructor.email}</span>
                  </div>
                )}
                {instructor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{instructor.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(instructor)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(instructor.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-foreground">Nenhum instrutor encontrado</h3>
            <p className="text-muted-foreground text-sm">
              Cadastre instrutores para gerenciar sua equipe
            </p>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Instrutor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O instrutor será removido permanentemente.
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
