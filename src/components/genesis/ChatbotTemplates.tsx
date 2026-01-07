import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Headphones,
  Calendar,
  MessageCircle,
  Moon,
  Bot,
  Sparkles,
  Loader2,
  Check,
  ArrowRight,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatbotTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  is_featured: boolean;
  trigger_keywords: string[];
  trigger_type: string;
  response_type: string;
  response_content: string | null;
  ai_enabled: boolean;
  ai_system_prompt: string;
  ai_temperature: number;
  menu_options: any;
  variables: Record<string, string>;
}

interface ChatbotTemplatesProps {
  onTemplateApply: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'shopping-cart': ShoppingCart,
  'headphones': Headphones,
  'calendar': Calendar,
  'message-circle': MessageCircle,
  'moon': Moon,
  'bot': Bot,
};

export function ChatbotTemplates({ onTemplateApply, isOpen, onOpenChange }: ChatbotTemplatesProps) {
  const [templates, setTemplates] = useState<ChatbotTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ChatbotTemplate | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTemplates((data || []) as unknown as ChatbotTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: ChatbotTemplate) => {
    setSelectedTemplate(template);
    // Inicializar customizações com variáveis do template
    const vars = template.variables || {};
    setCustomizations(vars);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsApplying(true);
    try {
      // Substituir variáveis no prompt e response_content
      let finalPrompt = selectedTemplate.ai_system_prompt || '';
      let finalResponseContent = selectedTemplate.response_content || '';
      
      Object.entries(customizations).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        finalPrompt = finalPrompt.replace(regex, value || `[${key}]`);
        finalResponseContent = finalResponseContent.replace(regex, value || `[${key}]`);
      });

      // Determinar response_type baseado no template
      const responseType = selectedTemplate.ai_enabled ? 'ai' : 'text';

      // Criar chatbot a partir do template com TODOS os dados
      const chatbotData = {
        name: `${selectedTemplate.name} - ${new Date().toLocaleDateString('pt-BR')}`,
        trigger_type: selectedTemplate.trigger_type || 'keyword',
        trigger_keywords: selectedTemplate.trigger_keywords || [],
        response_type: responseType,
        response_content: finalResponseContent,
        ai_enabled: selectedTemplate.ai_enabled ?? true,
        ai_model: 'Luna IA',
        ai_temperature: selectedTemplate.ai_temperature || 0.7,
        ai_system_prompt: finalPrompt,
        is_active: true,
        priority: 1,
        delay_seconds: 2,
      };

      const { error } = await supabase
        .from('whatsapp_automations')
        .insert(chatbotData);

      if (error) throw error;

      toast.success('🎉 Chatbot criado e ativado! Já está funcionando.');
      onTemplateApply();
      onOpenChange(false);
      setSelectedTemplate(null);
      setCustomizations({});
      
      // Disparar evento para atualizar lista
      window.dispatchEvent(new CustomEvent('chatbot-created'));
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Erro ao aplicar template');
    } finally {
      setIsApplying(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Bot;
    return IconComponent;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      comercial: 'from-emerald-500 to-emerald-600',
      suporte: 'from-blue-500 to-blue-600',
      agendamento: 'from-purple-500 to-purple-600',
      sac: 'from-orange-500 to-orange-600',
      '24h': 'from-indigo-500 to-indigo-600',
    };
    return colors[category] || 'from-primary to-primary/80';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Templates de Chatbot
          </DialogTitle>
          <DialogDescription>
            Escolha um template pronto e personalize para seu negócio
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedTemplate ? (
            /* Template Customization View */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 py-4"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
                className="gap-2"
              >
                ← Voltar aos templates
              </Button>

              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(selectedTemplate.category)} flex items-center justify-center text-white`}>
                      {(() => {
                        const Icon = getIcon(selectedTemplate.icon);
                        return <Icon className="w-6 h-6" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Keywords Preview */}
                  <div>
                    <Label className="text-sm font-medium">Palavras-chave de ativação</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTemplate.trigger_keywords.slice(0, 8).map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                      ))}
                      {selectedTemplate.trigger_keywords.length > 8 && (
                        <Badge variant="outline">+{selectedTemplate.trigger_keywords.length - 8}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Customization Fields */}
                  {Object.keys(selectedTemplate.variables || {}).length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Personalize para seu negócio</Label>
                      {Object.entries(selectedTemplate.variables || {}).map(([key, defaultValue]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm capitalize">{key.replace(/_/g, ' ')}</Label>
                          <Input
                            value={customizations[key] || ''}
                            onChange={(e) => setCustomizations({ ...customizations, [key]: e.target.value })}
                            placeholder={defaultValue || `Digite ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Prompt Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Prompt da IA (preview)</Label>
                    <Textarea
                      value={selectedTemplate.ai_system_prompt.slice(0, 500) + '...'}
                      readOnly
                      rows={6}
                      className="text-xs bg-muted/50"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Template Grid */
            <div className="grid gap-4 md:grid-cols-2 py-4">
              {templates.map((template, index) => {
                const Icon = getIcon(template.icon);
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 relative overflow-hidden"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      {template.is_featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-amber-500 text-white border-0 gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Popular
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(template.category)} flex items-center justify-center text-white flex-shrink-0`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1">{template.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="outline" className="text-xs">
                                {template.trigger_keywords.length} palavras-chave
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                IA integrada
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {selectedTemplate && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyTemplate} disabled={isApplying} className="gap-2">
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Criar Chatbot
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
