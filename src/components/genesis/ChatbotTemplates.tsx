import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Loader2, Check, ArrowRight, Star, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PROFESSIONAL_TEMPLATES, ProfessionalTemplate, buildFlowConfigFromForm, ChatbotFormState, DEFAULT_FORM_STATE } from './chatbot-config';

interface ChatbotTemplatesProps {
  onTemplateApply: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '🎯' },
  { id: 'saude', label: 'Saúde', icon: '🏥' },
  { id: 'beleza', label: 'Beleza', icon: '💅' },
  { id: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'imoveis', label: 'Imóveis', icon: '🏠' },
  { id: 'pets', label: 'Pets', icon: '🐾' },
  { id: 'juridico', label: 'Jurídico', icon: '⚖️' },
  { id: 'educacao', label: 'Educação', icon: '📚' },
  { id: 'automotivo', label: 'Automotivo', icon: '🔧' },
];

export function ChatbotTemplates({ onTemplateApply, isOpen, onOpenChange }: ChatbotTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProfessionalTemplate | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = PROFESSIONAL_TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: ProfessionalTemplate) => {
    setSelectedTemplate(template);
    setCompanyName(template.form.company_name || '');
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsApplying(true);
    try {
      // Build form state from template
      const formState: ChatbotFormState = {
        ...DEFAULT_FORM_STATE,
        ...selectedTemplate.form,
        company_name: companyName || selectedTemplate.form.company_name || '',
      } as ChatbotFormState;

      // Replace {{empresa}} in all messages
      const replaceCompany = (text: string) => text?.replace(/\{\{empresa\}\}/g, companyName || formState.company_name) || '';
      
      formState.greeting_message = replaceCompany(formState.greeting_message);
      formState.morning_greeting = replaceCompany(formState.morning_greeting);
      formState.afternoon_greeting = replaceCompany(formState.afternoon_greeting);
      formState.evening_greeting = replaceCompany(formState.evening_greeting);
      formState.ai_system_prompt = replaceCompany(formState.ai_system_prompt);

      // Build flow config
      const flowConfig = buildFlowConfigFromForm(formState);

      const chatbotData = {
        name: `${selectedTemplate.name} - ${companyName || 'Minha Empresa'}`,
        trigger_type: 'keyword',
        trigger_keywords: selectedTemplate.keywords,
        response_type: 'menu',
        response_content: formState.greeting_message,
        response_list: {
          message: `${formState.menu_title}\n\n${formState.menu_description}`,
          options: formState.menu_options.filter(o => o.text.trim()).map((o, idx) => ({ id: String(idx + 1), text: o.text })),
        },
        delay_seconds: formState.delay,
        ai_enabled: formState.ai_mode !== 'disabled',
        ai_model: formState.ai_mode !== 'disabled' ? 'Luna IA' : null,
        ai_temperature: formState.ai_temperature,
        ai_system_prompt: formState.ai_system_prompt,
        flow_config: flowConfig,
        max_attempts: formState.max_attempts,
        fallback_message: formState.fallback_message,
        company_name: companyName || formState.company_name,
        is_active: true,
        priority: 1,
      };

      const { error } = await supabase.from('whatsapp_automations').insert(chatbotData as any);
      if (error) throw error;

      toast.success('🎉 Chatbot criado e ativado! Já está funcionando.');
      onTemplateApply();
      onOpenChange(false);
      setSelectedTemplate(null);
      setCompanyName('');
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Erro ao aplicar template');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Templates Profissionais
          </DialogTitle>
          <DialogDescription>
            Chatbots prontos para cada nicho. Apenas personalize e ative!
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedTemplate ? (
            /* Template Customization */
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 py-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)} className="gap-2">
                ← Voltar
              </Button>

              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedTemplate.color} flex items-center justify-center text-2xl`}>
                      {selectedTemplate.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                    {selectedTemplate.isFeatured && (
                      <Badge className="bg-amber-500"><Star className="w-3 h-3 mr-1" />Popular</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nome da sua Empresa *</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={selectedTemplate.form.company_name}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Este nome aparecerá nas mensagens do chatbot</p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <Label className="text-sm font-medium">Palavras-chave de ativação</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTemplate.keywords.slice(0, 8).map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Preview Menu */}
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <Label className="text-sm font-medium mb-3 block">Preview do Menu</Label>
                    <div className="space-y-2">
                      {selectedTemplate.form.menu_options?.slice(0, 5).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="font-mono w-6 h-6 p-0 justify-center">{i + 1}</Badge>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      Saudação por horário
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      Menu completo
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      Coleta de dados
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      Transferência humana
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Template Grid */
            <>
              {/* Search & Filter */}
              <div className="space-y-3 pb-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar template..."
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2">
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="gap-1.5 flex-shrink-0"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="grid gap-4 md:grid-cols-2 py-4">
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 relative overflow-hidden h-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        {template.isFeatured && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-amber-500 text-white border-0 gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-xl flex-shrink-0`}>
                              {template.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold mb-1">{template.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                              <div className="flex items-center gap-2 mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {template.keywords.length} palavras-chave
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {template.form.menu_options?.length || 5} opções
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {selectedTemplate && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancelar</Button>
            <Button onClick={handleApplyTemplate} disabled={isApplying || !companyName.trim()} className="gap-2">
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Criar Chatbot
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
