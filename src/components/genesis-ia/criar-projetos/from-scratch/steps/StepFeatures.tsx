import { motion } from 'framer-motion';
import { Zap, Link, Check, Star, Database } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { COMMON_FEATURES, INTEGRATIONS } from '../types';
import { getAppNicheById } from '../appNicheContexts';

// Features específicas para APPS
const APP_CORE_FEATURES = [
  'Autenticação segura (login/registro)',
  'Controle de permissões por perfil',
  'Dashboard com métricas',
  'Relatórios exportáveis (PDF/Excel)',
  'Logs de auditoria',
  'Notificações em tempo real',
  'Busca global',
  'Modo offline (PWA)',
  'Backup automático',
  'API REST para integrações',
  'Multi-tenant',
  'Temas claro/escuro'
];

// Integrações específicas para APPS
const APP_INTEGRATIONS = [
  { id: 'supabase', name: 'Supabase', icon: '🔷', description: 'Backend as a Service' },
  { id: 'stripe', name: 'Stripe', icon: '💳', description: 'Pagamentos e assinaturas' },
  { id: 'whatsapp-api', name: 'WhatsApp API', icon: '📱', description: 'Notificações e chatbot' },
  { id: 'email-smtp', name: 'Email SMTP', icon: '📧', description: 'Envio de emails transacionais' },
  { id: 'storage', name: 'Cloud Storage', icon: '☁️', description: 'Upload de arquivos' },
  { id: 'analytics', name: 'Analytics', icon: '📊', description: 'Métricas e eventos' },
  { id: 'oauth', name: 'OAuth Social', icon: '🔐', description: 'Login com Google/GitHub' },
  { id: 'webhook', name: 'Webhooks', icon: '🔗', description: 'Integrações externas' },
];

export function StepFeatures() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();
  
  const isApp = formData.projectType === 'app';
  const appNiche = isApp ? getAppNicheById(formData.nicheId) : null;

  // Definir features baseado no tipo de projeto
  const suggestedFeatures = isApp 
    ? (appNiche?.coreFeatures || [])
    : (selectedNiche?.suggestedFeatures || []);
  
  const baseFeatures = isApp ? APP_CORE_FEATURES : COMMON_FEATURES;
  const allFeatures = [...new Set([...suggestedFeatures, ...baseFeatures])];
  
  const integrations = isApp ? APP_INTEGRATIONS : INTEGRATIONS;

  const toggleFeature = (feature: string) => {
    const current = formData.selectedFeatures;
    if (current.includes(feature)) {
      updateFormData('selectedFeatures', current.filter(f => f !== feature));
    } else {
      updateFormData('selectedFeatures', [...current, feature]);
    }
  };

  const toggleIntegration = (integration: string) => {
    const current = formData.integrations;
    if (current.includes(integration)) {
      updateFormData('integrations', current.filter(i => i !== integration));
    } else {
      updateFormData('integrations', [...current, integration]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Features */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          {isApp ? <Database className="w-4 h-4 text-primary" /> : <Zap className="w-4 h-4 text-primary" />}
          {isApp ? 'Funcionalidades do Sistema' : 'Funcionalidades'}
        </label>
        <div className="flex flex-wrap gap-2">
          {allFeatures.map((feature, index) => {
            const isSelected = formData.selectedFeatures.includes(feature);
            const isSuggested = suggestedFeatures.includes(feature);
            
            return (
              <motion.button
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.015 }}
                onClick={() => toggleFeature(feature)}
                className={`relative px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {feature}
                  {isSuggested && !isSelected && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Integrations */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Link className="w-4 h-4 text-primary" />
          {isApp ? 'Integrações do Sistema' : 'Integrações Externas'}
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {integrations.map((integration, index) => {
            const isSelected = formData.integrations.includes(integration.id);
            
            return (
              <motion.button
                key={integration.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => toggleIntegration(integration.id)}
                className={`relative p-2.5 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-xl block">{integration.icon}</span>
                <span className="text-xs font-medium line-clamp-1">{integration.name}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            formData.selectedFeatures.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
          }`}>
            {formData.selectedFeatures.length}
          </div>
          <span className="text-sm text-muted-foreground">features</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            formData.integrations.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
          }`}>
            {formData.integrations.length}
          </div>
          <span className="text-sm text-muted-foreground">integrações</span>
        </div>
      </div>
    </div>
  );
}
