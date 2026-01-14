import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutTemplate, 
  Wand2, 
  ArrowRight,
  Palette,
  Globe,
  Type,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface TemplateChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseReady: () => void;
  onChooseCustom: () => void;
}

export function TemplateChoiceModal({ 
  open, 
  onOpenChange, 
  onChooseReady,
  onChooseCustom 
}: TemplateChoiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Como você quer começar?
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Opção 1: Modelo Pronto */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="cursor-pointer group hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full"
              onClick={() => {
                onChooseReady();
                onOpenChange(false);
              }}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LayoutTemplate className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Escolher Modelo Pronto
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Selecione um template pré-configurado e personalize com os dados do cliente. Mais rápido para começar!
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Templates para vários nichos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Design profissional pronto
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Customização de cores e textos
                  </div>
                </div>

                <Button className="w-full gap-2 group-hover:bg-primary/90">
                  Escolher Template
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Opção 2: Criar do Zero */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="cursor-pointer group hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 h-full bg-gradient-to-br from-purple-500/5 to-purple-500/10"
              onClick={() => {
                onChooseCustom();
                onOpenChange(false);
              }}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-7 h-7 text-purple-500" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Criar do Zero com IA
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Preencha um questionário e a IA gera um prompt estruturado para criar um site totalmente personalizado.
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="w-4 h-4 text-purple-500" />
                    Escolha cores e estilo visual
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Type className="w-4 h-4 text-purple-500" />
                    Selecione fontes e tipografia
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4 text-purple-500" />
                    Defina idioma e funcionalidades
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-600">
                  Criar Personalizado
                  <Sparkles className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Você pode mudar de ideia depois. Ambas as opções geram um link de demo para enviar ao cliente.
        </p>
      </DialogContent>
    </Dialog>
  );
}
