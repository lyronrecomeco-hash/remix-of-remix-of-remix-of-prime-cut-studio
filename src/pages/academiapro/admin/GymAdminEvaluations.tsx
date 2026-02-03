import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  User,
  Ruler,
  Activity
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
}

interface Evaluation {
  id: string;
  user_id: string;
  evaluation_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  notes: string | null;
  created_at: string;
}

export default function GymAdminEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const [formData, setFormData] = useState({
    user_id: '',
    weight_kg: '',
    height_cm: '',
    body_fat_percentage: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    left_arm_cm: '',
    right_arm_cm: '',
    left_thigh_cm: '',
    right_thigh_cm: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [evalRes, profilesRes] = await Promise.all([
      supabase.from('gym_physical_evaluations').select('*').order('evaluation_date', { ascending: false }),
      supabase.from('gym_profiles').select('id, user_id, full_name').order('full_name'),
    ]);
    
    if (evalRes.data) setEvaluations(evalRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    setIsLoading(false);
  };

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return null;
    const heightM = height / 100;
    return Number((weight / (heightM * heightM)).toFixed(2));
  };

  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return { label: '-', color: 'secondary' };
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'warning' };
    if (bmi < 25) return { label: 'Normal', color: 'success' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'warning' };
    return { label: 'Obesidade', color: 'destructive' };
  };

  const handleSave = async () => {
    if (!formData.user_id) {
      toast.error('Selecione um aluno');
      return;
    }

    const weight = formData.weight_kg ? parseFloat(formData.weight_kg) : null;
    const height = formData.height_cm ? parseFloat(formData.height_cm) : null;
    const bmi = weight && height ? calculateBMI(weight, height) : null;

    const payload = {
      user_id: formData.user_id,
      evaluation_date: new Date().toISOString().split('T')[0],
      weight_kg: weight,
      height_cm: height,
      bmi,
      body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
      chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
      waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
      hips_cm: formData.hips_cm ? parseFloat(formData.hips_cm) : null,
      left_arm_cm: formData.left_arm_cm ? parseFloat(formData.left_arm_cm) : null,
      right_arm_cm: formData.right_arm_cm ? parseFloat(formData.right_arm_cm) : null,
      left_thigh_cm: formData.left_thigh_cm ? parseFloat(formData.left_thigh_cm) : null,
      right_thigh_cm: formData.right_thigh_cm ? parseFloat(formData.right_thigh_cm) : null,
      notes: formData.notes || null,
    };

    const { error } = await supabase.from('gym_physical_evaluations').insert(payload);
    
    if (error) {
      toast.error('Erro ao salvar avaliação');
      return;
    }

    toast.success('Avaliação registrada!');
    setIsDialogOpen(false);
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      weight_kg: '',
      height_cm: '',
      body_fat_percentage: '',
      chest_cm: '',
      waist_cm: '',
      hips_cm: '',
      left_arm_cm: '',
      right_arm_cm: '',
      left_thigh_cm: '',
      right_thigh_cm: '',
      notes: '',
    });
  };

  const getProfileName = (userId: string) => {
    return profiles.find(p => p.user_id === userId)?.full_name || 'Desconhecido';
  };

  const filteredEvaluations = selectedUserId 
    ? evaluations.filter(e => e.user_id === selectedUserId)
    : evaluations;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Avaliação Física</h1>
          <p className="text-muted-foreground mt-1">Registre e acompanhe medidas dos alunos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Avaliação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Avaliação Física</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Aluno *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(v) => setFormData(f => ({ ...f, user_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData(f => ({ ...f, weight_kg: e.target.value }))}
                    placeholder="70.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => setFormData(f => ({ ...f, height_cm: e.target.value }))}
                    placeholder="175"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>% Gordura Corporal</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.body_fat_percentage}
                  onChange={(e) => setFormData(f => ({ ...f, body_fat_percentage: e.target.value }))}
                  placeholder="15.5"
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium mb-3 text-foreground">Circunferências (cm)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Peitoral</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.chest_cm}
                      onChange={(e) => setFormData(f => ({ ...f, chest_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cintura</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.waist_cm}
                      onChange={(e) => setFormData(f => ({ ...f, waist_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Quadril</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.hips_cm}
                      onChange={(e) => setFormData(f => ({ ...f, hips_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Braço Esq.</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.left_arm_cm}
                      onChange={(e) => setFormData(f => ({ ...f, left_arm_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Braço Dir.</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.right_arm_cm}
                      onChange={(e) => setFormData(f => ({ ...f, right_arm_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Coxa Esq.</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.left_thigh_cm}
                      onChange={(e) => setFormData(f => ({ ...f, left_thigh_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Coxa Dir.</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.right_thigh_cm}
                      onChange={(e) => setFormData(f => ({ ...f, right_thigh_cm: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observações sobre a avaliação..."
                  rows={2}
                />
              </div>
              
              <Button onClick={handleSave} className="w-full">
                Salvar Avaliação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Filtrar por aluno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os alunos</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.user_id} value={p.user_id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{evaluations.length}</p>
              <p className="text-sm text-muted-foreground">Avaliações</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {evaluations.filter(e => {
                  const evalDate = new Date(e.evaluation_date);
                  const now = new Date();
                  return evalDate.getMonth() === now.getMonth() && evalDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Este mês</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Evaluations List */}
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
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))
        ) : filteredEvaluations.length > 0 ? (
          filteredEvaluations.map((evaluation) => {
            const bmiCategory = getBMICategory(evaluation.bmi);
            return (
              <div
                key={evaluation.id}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{getProfileName(evaluation.user_id)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(evaluation.evaluation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {evaluation.bmi && (
                    <Badge variant={bmiCategory.color as any}>
                      IMC: {evaluation.bmi} - {bmiCategory.label}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {evaluation.weight_kg && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Peso</p>
                      <p className="font-semibold text-foreground">{evaluation.weight_kg} kg</p>
                    </div>
                  )}
                  {evaluation.height_cm && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Altura</p>
                      <p className="font-semibold text-foreground">{evaluation.height_cm} cm</p>
                    </div>
                  )}
                  {evaluation.body_fat_percentage && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">% Gordura</p>
                      <p className="font-semibold text-foreground">{evaluation.body_fat_percentage}%</p>
                    </div>
                  )}
                  {evaluation.chest_cm && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Peitoral</p>
                      <p className="font-semibold text-foreground">{evaluation.chest_cm} cm</p>
                    </div>
                  )}
                  {evaluation.waist_cm && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Cintura</p>
                      <p className="font-semibold text-foreground">{evaluation.waist_cm} cm</p>
                    </div>
                  )}
                  {evaluation.hips_cm && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Quadril</p>
                      <p className="font-semibold text-foreground">{evaluation.hips_cm} cm</p>
                    </div>
                  )}
                </div>

                {evaluation.notes && (
                  <p className="mt-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {evaluation.notes}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-foreground">Nenhuma avaliação encontrada</h3>
            <p className="text-muted-foreground text-sm">
              Registre avaliações físicas dos alunos
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
