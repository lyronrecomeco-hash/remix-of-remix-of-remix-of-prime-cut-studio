import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, UserPlus, ChevronRight, ChevronLeft, Check, 
  User, Ruler, Dumbbell, CalendarDays, CreditCard, FileCheck,
  Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateStudentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 'dados', label: 'Dados', icon: User },
  { id: 'fisico', label: 'Físico', icon: Ruler },
  { id: 'treino', label: 'Treino', icon: Dumbbell },
  { id: 'aulas', label: 'Aulas', icon: CalendarDays },
  { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
  { id: 'revisao', label: 'Revisão', icon: FileCheck },
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const GOALS = [
  'Perda de peso',
  'Ganho de massa muscular',
  'Condicionamento físico',
  'Flexibilidade',
  'Reabilitação',
  'Resistência',
  'Força',
  'Definição muscular',
];

interface FormData {
  // Dados pessoais
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: 'aluno' | 'instrutor' | 'admin';
  // Dados físicos
  height_cm: string;
  weight_kg: string;
  birth_date: string;
  goals: string[];
  observations: string;
  // Treino (dias da semana)
  training_days: number[];
  preferred_time: string;
  // Aulas
  selected_classes: string[];
  // Financeiro
  plan_id: string;
}

export function CreateStudentWizard({ isOpen, onClose, onSuccess }: CreateStudentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'aluno',
    height_cm: '',
    weight_kg: '',
    birth_date: '',
    goals: [],
    observations: '',
    training_days: [],
    preferred_time: '06:00',
    selected_classes: [],
    plan_id: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchPlansAndClasses();
    }
  }, [isOpen]);

  const fetchPlansAndClasses = async () => {
    const [plansRes, classesRes] = await Promise.all([
      supabase.from('gym_plans').select('*').eq('is_active', true).order('price_cents'),
      supabase.from('gym_classes').select('*').eq('is_active', true).order('name'),
    ]);
    
    if (plansRes.data) setPlans(plansRes.data);
    if (classesRes.data) setClasses(classesRes.data);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      training_days: prev.training_days.includes(day)
        ? prev.training_days.filter(d => d !== day)
        : [...prev.training_days, day].sort()
    }));
  };

  const toggleClass = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_classes: prev.selected_classes.includes(classId)
        ? prev.selected_classes.filter(c => c !== classId)
        : [...prev.selected_classes, classId]
    }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateField('password', password);
  };

  const canAdvance = () => {
    switch (currentStep) {
      case 0: // Dados
        return formData.full_name && formData.email && formData.password.length >= 6;
      case 1: // Físico
        return true; // Optional
      case 2: // Treino
        return true; // Optional
      case 3: // Aulas
        return true; // Optional
      case 4: // Financeiro
        return true; // Optional
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // 1. Criar usuário via edge function
      const response = await supabase.functions.invoke('gym-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone || null,
          role: formData.role,
        }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data.error) throw new Error(response.data.error);

      const newUserId = response.data.user_id;

      // 2. Atualizar perfil com dados físicos
      if (formData.height_cm || formData.weight_kg || formData.birth_date) {
        await supabase
          .from('gym_profiles')
          .update({
            height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
            weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
            birth_date: formData.birth_date || null,
          })
          .eq('user_id', newUserId);
      }

      // 3. Obter ID do instrutor logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 4. Criar plano do aluno
      const { data: studentPlan, error: planError } = await supabase
        .from('gym_student_plans')
        .insert({
          student_id: newUserId,
          instructor_id: user.id,
          plan_id: formData.plan_id || null,
          goals: formData.goals,
          observations: formData.observations || null,
        })
        .select()
        .single();

      if (planError) throw new Error('Erro ao criar plano: ' + planError.message);

      // 5. Criar treino personalizado se há dias selecionados
      if (formData.training_days.length > 0) {
        // Criar um workout para o aluno
        const { data: workout, error: workoutError } = await supabase
          .from('gym_user_workouts')
          .insert({
            user_id: newUserId,
            name: `Treino de ${formData.full_name.split(' ')[0]}`,
            description: `Plano personalizado - ${formData.goals.join(', ') || 'Geral'}`,
            day_of_week: formData.training_days,
            is_active: true,
          })
          .select()
          .single();

        if (!workoutError && workout) {
          // Agendar nos dias selecionados
          const scheduleInserts = formData.training_days.map(day => ({
            student_plan_id: studentPlan.id,
            workout_id: workout.id,
            day_of_week: day,
            preferred_time: formData.preferred_time || '06:00',
          }));

          await supabase
            .from('gym_student_workout_schedule')
            .insert(scheduleInserts);
        }
      }

      // 6. Matricular nas aulas selecionadas
      if (formData.selected_classes.length > 0) {
        const enrollments = formData.selected_classes.map(classId => ({
          student_plan_id: studentPlan.id,
          class_id: classId,
        }));

        await supabase
          .from('gym_student_class_enrollments')
          .insert(enrollments);
      }

      // 7. Criar assinatura se plano selecionado
      if (formData.plan_id) {
        const selectedPlan = plans.find(p => p.id === formData.plan_id);
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + (selectedPlan?.duration_months || 1));

        await supabase
          .from('gym_subscriptions')
          .insert({
            user_id: newUserId,
            plan_id: formData.plan_id,
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          });
      }

      toast.success('Aluno cadastrado com sucesso!', {
        description: `${formData.full_name} pode fazer login com o email e senha cadastrados.`
      });

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'aluno',
        height_cm: '',
        weight_kg: '',
        birth_date: '',
        goals: [],
        observations: '',
        training_days: [],
        preferred_time: '06:00',
        selected_classes: [],
        plan_id: '',
      });
      setCurrentStep(0);
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Error creating student:', error);
      toast.error('Erro ao criar aluno', {
        description: error.message || 'Tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepDados formData={formData} updateField={updateField} showPassword={showPassword} setShowPassword={setShowPassword} generatePassword={generatePassword} />;
      case 1:
        return <StepFisico formData={formData} updateField={updateField} toggleGoal={toggleGoal} />;
      case 2:
        return <StepTreino formData={formData} toggleDay={toggleDay} updateField={updateField} />;
      case 3:
        return <StepAulas formData={formData} toggleClass={toggleClass} classes={classes} />;
      case 4:
        return <StepFinanceiro formData={formData} updateField={updateField} plans={plans} />;
      case 5:
        return <StepRevisao formData={formData} plans={plans} classes={classes} />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Aluno" size="3xl">
      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                      : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`ml-2 text-sm hidden sm:block ${isActive ? 'text-white font-medium' : 'text-zinc-500'}`}>
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-zinc-700 mx-2 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <ModalBody className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => currentStep === 0 ? onClose() : setCurrentStep(prev => prev - 1)}
          className="border-zinc-700"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Cancelar' : 'Voltar'}
        </Button>
        
        {currentStep < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canAdvance()}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Aluno
              </>
            )}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

// ============ STEP COMPONENTS ============

function StepDados({ formData, updateField, showPassword, setShowPassword, generatePassword }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome Completo *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            className="bg-zinc-800 border-zinc-700"
            placeholder="João Silva"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="bg-zinc-800 border-zinc-700"
            placeholder="joao@email.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="bg-zinc-800 border-zinc-700"
            placeholder="(11) 99999-9999"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Tipo de Acesso *</Label>
          <Select
            value={formData.role}
            onValueChange={(value: 'aluno' | 'instrutor' | 'admin') => updateField('role', value)}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="aluno">Aluno</SelectItem>
              <SelectItem value="instrutor">Instrutor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha *</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="bg-zinc-800 border-zinc-700 pr-10"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={generatePassword}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Gerar
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepFisico({ formData, updateField, toggleGoal }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height_cm}
            onChange={(e) => updateField('height_cm', e.target.value)}
            className="bg-zinc-800 border-zinc-700"
            placeholder="175"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight_kg}
            onChange={(e) => updateField('weight_kg', e.target.value)}
            className="bg-zinc-800 border-zinc-700"
            placeholder="70.5"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => updateField('birth_date', e.target.value)}
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Objetivos</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`p-3 rounded-lg text-sm text-left transition-all border ${
                formData.goals.includes(goal)
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => updateField('observations', e.target.value)}
          className="bg-zinc-800 border-zinc-700 min-h-[100px]"
          placeholder="Lesões, restrições médicas, preferências..."
        />
      </div>
    </div>
  );
}

function StepTreino({ formData, toggleDay, updateField }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Dias de Treino</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`p-4 rounded-xl text-center transition-all border ${
                formData.training_days.includes(day.value)
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/50 text-white'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <Dumbbell className={`w-6 h-6 mx-auto mb-2 ${formData.training_days.includes(day.value) ? 'text-orange-500' : ''}`} />
              <span className="font-medium">{day.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferred_time">Horário Preferido</Label>
        <Select
          value={formData.preferred_time}
          onValueChange={(value) => updateField('preferred_time', value)}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((time) => (
              <SelectItem key={time} value={time}>{time}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.training_days.length > 0 && (
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <p className="text-sm text-zinc-400 mb-2">Resumo do plano de treino:</p>
          <p className="font-medium">
            {formData.training_days.length} dia{formData.training_days.length > 1 ? 's' : ''} por semana
            {' · '}
            {DAYS_OF_WEEK.filter(d => formData.training_days.includes(d.value)).map(d => d.label).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

function StepAulas({ formData, toggleClass, classes }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-3 block">Aulas Coletivas</Label>
        <p className="text-sm text-zinc-400 mb-4">Selecione as aulas em que o aluno será matriculado</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {classes.map((cls: any) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => toggleClass(cls.id)}
              className={`p-4 rounded-xl text-left transition-all border ${
                formData.selected_classes.includes(cls.id)
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/50'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-medium ${formData.selected_classes.includes(cls.id) ? 'text-white' : 'text-zinc-300'}`}>
                    {cls.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {cls.duration_minutes || 60} min
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.selected_classes.includes(cls.id)
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-zinc-600'
                }`}>
                  {formData.selected_classes.includes(cls.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {formData.selected_classes.length > 0 && (
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <p className="text-sm text-zinc-400 mb-2">Aulas selecionadas:</p>
          <p className="font-medium">
            {classes.filter((c: any) => formData.selected_classes.includes(c.id)).map((c: any) => c.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

function StepFinanceiro({ formData, updateField, plans }: any) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Plano de Assinatura</Label>
        <p className="text-sm text-zinc-400 mb-4">Selecione o plano do aluno (opcional)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan: any) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => updateField('plan_id', plan.id === formData.plan_id ? '' : plan.id)}
              className={`p-6 rounded-xl text-left transition-all border relative ${
                formData.plan_id === plan.id
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {formData.plan_id === plan.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <h4 className="text-lg font-semibold mb-1">{plan.name}</h4>
              <p className="text-2xl font-bold text-orange-500 mb-2">
                {formatPrice(plan.price_cents)}
                <span className="text-sm text-zinc-400 font-normal">
                  /{plan.duration_months} {plan.duration_months === 1 ? 'mês' : 'meses'}
                </span>
              </p>
              {plan.description && (
                <p className="text-sm text-zinc-400">{plan.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {!formData.plan_id && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-sm text-yellow-400">
            ⚠️ Sem plano selecionado, o aluno será cadastrado sem assinatura ativa.
          </p>
        </div>
      )}
    </div>
  );
}

function StepRevisao({ formData, plans, classes }: any) {
  const selectedPlan = plans.find((p: any) => p.id === formData.plan_id);
  const selectedClasses = classes.filter((c: any) => formData.selected_classes.includes(c.id));
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-orange-500">Confirme os dados antes de criar</h3>
      
      {/* Dados Pessoais */}
      <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-orange-500" />
          Dados Pessoais
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-zinc-400">Nome:</span> {formData.full_name}</div>
          <div><span className="text-zinc-400">Email:</span> {formData.email}</div>
          <div><span className="text-zinc-400">Telefone:</span> {formData.phone || '-'}</div>
          <div><span className="text-zinc-400">Tipo:</span> {formData.role}</div>
        </div>
      </div>

      {/* Dados Físicos */}
      {(formData.height_cm || formData.weight_kg || formData.goals.length > 0) && (
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-orange-500" />
            Dados Físicos
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {formData.height_cm && <div><span className="text-zinc-400">Altura:</span> {formData.height_cm} cm</div>}
            {formData.weight_kg && <div><span className="text-zinc-400">Peso:</span> {formData.weight_kg} kg</div>}
            {formData.goals.length > 0 && (
              <div className="col-span-2">
                <span className="text-zinc-400">Objetivos:</span> {formData.goals.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Treino */}
      {formData.training_days.length > 0 && (
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-500" />
            Plano de Treino
          </h4>
          <p className="text-sm">
            {formData.training_days.length} dias/semana às {formData.preferred_time}
            <br />
            <span className="text-zinc-400">
              {DAYS_OF_WEEK.filter(d => formData.training_days.includes(d.value)).map(d => d.label).join(', ')}
            </span>
          </p>
        </div>
      )}

      {/* Aulas */}
      {selectedClasses.length > 0 && (
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-orange-500" />
            Aulas Coletivas
          </h4>
          <p className="text-sm">{selectedClasses.map((c: any) => c.name).join(', ')}</p>
        </div>
      )}

      {/* Financeiro */}
      <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-orange-500" />
          Plano Financeiro
        </h4>
        {selectedPlan ? (
          <p className="text-sm">
            {selectedPlan.name} - <span className="text-orange-500 font-semibold">{formatPrice(selectedPlan.price_cents)}</span>
          </p>
        ) : (
          <p className="text-sm text-zinc-400">Sem plano selecionado</p>
        )}
      </div>
    </div>
  );
}
