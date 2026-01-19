import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  Shield,
  FileX,
  MapPin,
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContractWizardProps {
  affiliateId: string;
  onBack: () => void;
  onComplete: () => void;
}

interface FormData {
  // Contratante
  contractor_name: string;
  contractor_document: string;
  contractor_document_type: 'cpf' | 'cnpj';
  contractor_address: string;
  contractor_email: string;
  contractor_phone: string;
  
  // Contratado
  contracted_name: string;
  contracted_document: string;
  contracted_document_type: 'cpf' | 'cnpj';
  contracted_address: string;
  contracted_email: string;
  contracted_phone: string;
  
  // Objeto
  service_type: string;
  service_description: string;
  service_modality: 'pontual' | 'recorrente' | 'demanda';
  delivery_type: 'digital' | 'fisico' | 'ambos';
  
  // Prazo
  start_date: string;
  end_date: string;
  delivery_in_stages: boolean;
  allows_extension: boolean;
  
  // Valores
  total_value: string;
  payment_method: string;
  installments: number;
  late_fee_percentage: string;
  
  // Garantias
  has_warranty: boolean;
  warranty_period: string;
  liability_limit: string;
  not_included: string;
  
  // Rescisão
  allows_early_termination: boolean;
  termination_penalty_percentage: string;
  notice_period_days: number;
  
  // Foro
  jurisdiction_city: string;
  jurisdiction_state: string;
}

const initialFormData: FormData = {
  contractor_name: '',
  contractor_document: '',
  contractor_document_type: 'cpf',
  contractor_address: '',
  contractor_email: '',
  contractor_phone: '',
  contracted_name: '',
  contracted_document: '',
  contracted_document_type: 'cpf',
  contracted_address: '',
  contracted_email: '',
  contracted_phone: '',
  service_type: '',
  service_description: '',
  service_modality: 'pontual',
  delivery_type: 'digital',
  start_date: '',
  end_date: '',
  delivery_in_stages: false,
  allows_extension: false,
  total_value: '',
  payment_method: '',
  installments: 1,
  late_fee_percentage: '',
  has_warranty: false,
  warranty_period: '',
  liability_limit: '',
  not_included: '',
  allows_early_termination: true,
  termination_penalty_percentage: '',
  notice_period_days: 30,
  jurisdiction_city: '',
  jurisdiction_state: '',
};

const steps = [
  { id: 'contractor', title: 'Contratante', icon: User, description: 'Dados de quem contrata', requiredFields: ['contractor_name', 'contractor_document', 'contractor_address'] },
  { id: 'contracted', title: 'Contratado', icon: Briefcase, description: 'Dados do prestador', requiredFields: ['contracted_name', 'contracted_document', 'contracted_address'] },
  { id: 'object', title: 'Objeto', icon: FileX, description: 'Descrição do serviço', requiredFields: ['service_type', 'service_description'] },
  { id: 'deadline', title: 'Prazo', icon: Calendar, description: 'Datas e prazos', requiredFields: ['start_date'] },
  { id: 'payment', title: 'Pagamento', icon: DollarSign, description: 'Valores e forma', requiredFields: ['total_value', 'payment_method'] },
  { id: 'warranty', title: 'Garantias', icon: Shield, description: 'Responsabilidades', requiredFields: [] },
  { id: 'termination', title: 'Rescisão', icon: FileX, description: 'Condições de término', requiredFields: [] },
  { id: 'jurisdiction', title: 'Foro', icon: MapPin, description: 'Jurisdição legal', requiredFields: ['jurisdiction_city', 'jurisdiction_state'] },
];

export function ContractWizard({ affiliateId, onBack, onComplete }: ContractWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generating, setGenerating] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = (): boolean => {
    const currentStepData = steps[currentStep];
    const requiredFields = currentStepData.requiredFields;
    
    for (const field of requiredFields) {
      const value = formData[field as keyof FormData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        toast.error('Preencha todos os campos obrigatórios antes de continuar.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CTR-${year}${month}-${random}`;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setGenerating(true);
    
    try {
      const contractNumber = generateContractNumber();
      const signatureHash = crypto.randomUUID();
      
      const contractData = {
        affiliate_id: affiliateId,
        contract_number: contractNumber,
        title: `${formData.service_type} - ${formData.contractor_name}`,
        status: 'draft',
        contractor_name: formData.contractor_name,
        contractor_document: formData.contractor_document,
        contractor_document_type: formData.contractor_document_type,
        contractor_address: formData.contractor_address,
        contractor_email: formData.contractor_email || null,
        contractor_phone: formData.contractor_phone || null,
        contracted_name: formData.contracted_name,
        contracted_document: formData.contracted_document,
        contracted_document_type: formData.contracted_document_type,
        contracted_address: formData.contracted_address,
        contracted_email: formData.contracted_email || null,
        contracted_phone: formData.contracted_phone || null,
        service_type: formData.service_type,
        service_description: formData.service_description,
        service_modality: formData.service_modality,
        delivery_type: formData.delivery_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        delivery_in_stages: formData.delivery_in_stages,
        allows_extension: formData.allows_extension,
        total_value: parseFloat(formData.total_value.replace(/[^\d.,]/g, '').replace(',', '.')),
        payment_method: formData.payment_method,
        installments: formData.installments,
        late_fee_percentage: formData.late_fee_percentage ? parseFloat(formData.late_fee_percentage) : null,
        has_warranty: formData.has_warranty,
        warranty_period: formData.warranty_period || null,
        liability_limit: formData.liability_limit || null,
        not_included: formData.not_included || null,
        allows_early_termination: formData.allows_early_termination,
        termination_penalty_percentage: formData.termination_penalty_percentage ? parseFloat(formData.termination_penalty_percentage) : null,
        notice_period_days: formData.notice_period_days,
        jurisdiction_city: formData.jurisdiction_city,
        jurisdiction_state: formData.jurisdiction_state,
        signature_hash: signatureHash,
        questionnaire_answers: JSON.parse(JSON.stringify(formData)),
      };

      const { data: insertedContract, error } = await supabase
        .from('contracts')
        .insert([contractData])
        .select()
        .single();

      if (error) throw error;

      // Enviar contrato via WhatsApp automaticamente se tiver telefone
      if (formData.contractor_phone) {
        const signatureUrl = `${window.location.origin}/contratos/assinar/${signatureHash}`;
        
        try {
          await supabase.functions.invoke('send-contract-whatsapp', {
            body: {
              phone: formData.contractor_phone,
              contractorName: formData.contractor_name,
              contractNumber: contractNumber,
              signatureUrl: signatureUrl,
              serviceName: formData.service_type,
              totalValue: parseFloat(formData.total_value.replace(/[^\d.,]/g, '').replace(',', '.'))
            }
          });
          toast.success('Contrato criado e enviado via WhatsApp!', {
            description: `Número: ${contractNumber}`
          });
        } catch (whatsappError) {
          console.error('Error sending WhatsApp:', whatsappError);
          toast.success('Contrato criado com sucesso!', {
            description: `Número: ${contractNumber}`
          });
        }
      } else {
        toast.success('Contrato criado com sucesso!', {
          description: `Número: ${contractNumber}`
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Erro ao criar contrato');
    } finally {
      setGenerating(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'contractor':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome completo do Contratante *</Label>
                <Input
                  value={formData.contractor_name}
                  onChange={(e) => updateField('contractor_name', e.target.value)}
                  placeholder="Nome completo ou razão social"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <RadioGroup
                  value={formData.contractor_document_type}
                  onValueChange={(v) => updateField('contractor_document_type', v as 'cpf' | 'cnpj')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpf" id="contractor_cpf" />
                    <Label htmlFor="contractor_cpf">CPF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cnpj" id="contractor_cnpj" />
                    <Label htmlFor="contractor_cnpj">CNPJ</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>{formData.contractor_document_type.toUpperCase()} *</Label>
                <Input
                  value={formData.contractor_document}
                  onChange={(e) => updateField('contractor_document', e.target.value)}
                  placeholder={formData.contractor_document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Endereço completo *</Label>
                <Input
                  value={formData.contractor_address}
                  onChange={(e) => updateField('contractor_address', e.target.value)}
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.contractor_email}
                  onChange={(e) => updateField('contractor_email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone/WhatsApp *</Label>
                <Input
                  value={formData.contractor_phone}
                  onChange={(e) => updateField('contractor_phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="bg-card/50"
                />
                <p className="text-[10px] text-muted-foreground">O contrato será enviado automaticamente para este número</p>
              </div>
            </div>
          </div>
        );

      case 'contracted':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome completo do Contratado *</Label>
                <Input
                  value={formData.contracted_name}
                  onChange={(e) => updateField('contracted_name', e.target.value)}
                  placeholder="Nome completo ou razão social"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <RadioGroup
                  value={formData.contracted_document_type}
                  onValueChange={(v) => updateField('contracted_document_type', v as 'cpf' | 'cnpj')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpf" id="contracted_cpf" />
                    <Label htmlFor="contracted_cpf">CPF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cnpj" id="contracted_cnpj" />
                    <Label htmlFor="contracted_cnpj">CNPJ</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>{formData.contracted_document_type.toUpperCase()} *</Label>
                <Input
                  value={formData.contracted_document}
                  onChange={(e) => updateField('contracted_document', e.target.value)}
                  placeholder={formData.contracted_document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Endereço completo *</Label>
                <Input
                  value={formData.contracted_address}
                  onChange={(e) => updateField('contracted_address', e.target.value)}
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.contracted_email}
                  onChange={(e) => updateField('contracted_email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.contracted_phone}
                  onChange={(e) => updateField('contracted_phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="bg-card/50"
                />
              </div>
            </div>
          </div>
        );

      case 'object':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de serviço prestado *</Label>
              <Input
                value={formData.service_type}
                onChange={(e) => updateField('service_type', e.target.value)}
                placeholder="Ex: Desenvolvimento de Website, Consultoria, Marketing Digital..."
                className="bg-card/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição detalhada do serviço *</Label>
              <Textarea
                value={formData.service_description}
                onChange={(e) => updateField('service_description', e.target.value)}
                placeholder="Descreva em detalhes o que será entregue, quais são os entregáveis, metodologia..."
                className="bg-card/50 min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Modalidade do serviço *</Label>
              <RadioGroup
                value={formData.service_modality}
                onValueChange={(v) => updateField('service_modality', v as 'pontual' | 'recorrente' | 'demanda')}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {[
                  { value: 'pontual', label: 'Pontual', desc: 'Serviço único' },
                  { value: 'recorrente', label: 'Recorrente', desc: 'Mensal/contínuo' },
                  { value: 'demanda', label: 'Por demanda', desc: 'Quando solicitado' },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border bg-card/50 hover:border-primary/50 transition-colors">
                    <RadioGroupItem value={option.value} id={`modality_${option.value}`} />
                    <div>
                      <Label htmlFor={`modality_${option.value}`} className="cursor-pointer">{option.label}</Label>
                      <p className="text-[10px] text-muted-foreground">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Tipo de entrega</Label>
              <RadioGroup
                value={formData.delivery_type}
                onValueChange={(v) => updateField('delivery_type', v as 'digital' | 'fisico' | 'ambos')}
                className="flex flex-wrap gap-3"
              >
                {[
                  { value: 'digital', label: 'Digital' },
                  { value: 'fisico', label: 'Físico' },
                  { value: 'ambos', label: 'Ambos' },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`delivery_${option.value}`} />
                    <Label htmlFor={`delivery_${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 'deadline':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de início *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField('start_date', e.target.value)}
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de término (opcional)</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateField('end_date', e.target.value)}
                  className="bg-card/50"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div>
                <Label>Entrega em etapas?</Label>
                <p className="text-xs text-muted-foreground">O serviço será entregue em partes</p>
              </div>
              <Switch
                checked={formData.delivery_in_stages}
                onCheckedChange={(v) => updateField('delivery_in_stages', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div>
                <Label>Permite prorrogação?</Label>
                <p className="text-xs text-muted-foreground">O prazo pode ser estendido</p>
              </div>
              <Switch
                checked={formData.allows_extension}
                onCheckedChange={(v) => updateField('allows_extension', v)}
              />
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor total do serviço *</Label>
                <Input
                  value={formData.total_value}
                  onChange={(e) => updateField('total_value', e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de pagamento *</Label>
                <Input
                  value={formData.payment_method}
                  onChange={(e) => updateField('payment_method', e.target.value)}
                  placeholder="Ex: Pix, Transferência, Boleto..."
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Número de parcelas</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={formData.installments}
                  onChange={(e) => updateField('installments', parseInt(e.target.value) || 1)}
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Multa por atraso (%)</Label>
                <Input
                  value={formData.late_fee_percentage}
                  onChange={(e) => updateField('late_fee_percentage', e.target.value)}
                  placeholder="Ex: 2"
                  className="bg-card/50"
                />
              </div>
            </div>
          </div>
        );

      case 'warranty':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div>
                <Label>O serviço possui garantia?</Label>
                <p className="text-xs text-muted-foreground">Período de garantia após entrega</p>
              </div>
              <Switch
                checked={formData.has_warranty}
                onCheckedChange={(v) => updateField('has_warranty', v)}
              />
            </div>
            {formData.has_warranty && (
              <div className="space-y-2">
                <Label>Período de garantia</Label>
                <Input
                  value={formData.warranty_period}
                  onChange={(e) => updateField('warranty_period', e.target.value)}
                  placeholder="Ex: 90 dias, 6 meses, 1 ano..."
                  className="bg-card/50"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Limite de responsabilidade (opcional)</Label>
              <Input
                value={formData.liability_limit}
                onChange={(e) => updateField('liability_limit', e.target.value)}
                placeholder="Ex: Limitado ao valor do contrato"
                className="bg-card/50"
              />
            </div>
            <div className="space-y-2">
              <Label>O que NÃO está incluso (opcional)</Label>
              <Textarea
                value={formData.not_included}
                onChange={(e) => updateField('not_included', e.target.value)}
                placeholder="Liste itens que não fazem parte do escopo..."
                className="bg-card/50 min-h-[80px]"
              />
            </div>
          </div>
        );

      case 'termination':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div>
                <Label>Permite rescisão antecipada?</Label>
                <p className="text-xs text-muted-foreground">Qualquer parte pode cancelar antes do prazo</p>
              </div>
              <Switch
                checked={formData.allows_early_termination}
                onCheckedChange={(v) => updateField('allows_early_termination', v)}
              />
            </div>
            {formData.allows_early_termination && (
              <>
                <div className="space-y-2">
                  <Label>Multa por rescisão (%)</Label>
                  <Input
                    value={formData.termination_penalty_percentage}
                    onChange={(e) => updateField('termination_penalty_percentage', e.target.value)}
                    placeholder="Ex: 10"
                    className="bg-card/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aviso prévio (dias)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.notice_period_days}
                    onChange={(e) => updateField('notice_period_days', parseInt(e.target.value) || 0)}
                    className="bg-card/50"
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'jurisdiction':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Defina a cidade e estado onde serão resolvidas eventuais disputas judiciais relacionadas a este contrato.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Input
                  value={formData.jurisdiction_city}
                  onChange={(e) => updateField('jurisdiction_city', e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Input
                  value={formData.jurisdiction_state}
                  onChange={(e) => updateField('jurisdiction_state', e.target.value)}
                  placeholder="Ex: SP"
                  className="bg-card/50"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Etapa {currentStep + 1} de {steps.length}</span>
          <span className="text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps indicator - scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div
              key={step.id}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-muted/30 text-muted-foreground'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <StepIcon className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-card to-card/80">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">{currentStepData.title}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{currentStepData.description}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={handleBack} className="gap-2 flex-1 sm:flex-none">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{currentStep === 0 ? 'Cancelar' : 'Voltar'}</span>
        </Button>
        
        <Button 
          onClick={handleNext} 
          disabled={generating}
          className="gap-2 flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Gerando...</span>
            </>
          ) : currentStep === steps.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Gerar Contrato</span>
              <span className="sm:hidden">Gerar</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Próximo</span>
              <span className="sm:hidden">Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
