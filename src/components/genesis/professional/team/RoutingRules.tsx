import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shuffle, Users, Zap, Target, Scale, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoutingRules() {
  const [rules, setRules] = useState([
    { id: '1', name: 'Round Robin', method: 'round_robin', active: true, icon: Shuffle },
    { id: '2', name: 'Menos Ocupado', method: 'least_busy', active: false, icon: Scale },
    { id: '3', name: 'Por Habilidade', method: 'skills_based', active: false, icon: Target },
  ]);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Shuffle className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Distribuição Automática</h2>
          <p className="text-sm text-muted-foreground">Configure como atendimentos são distribuídos</p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative ${rule.active ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <rule.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Switch checked={rule.active} />
                </div>
                <CardTitle className="text-lg mt-2">{rule.name}</CardTitle>
                <CardDescription>
                  {rule.method === 'round_robin' && 'Distribui igualmente entre agentes disponíveis'}
                  {rule.method === 'least_busy' && 'Envia para o agente com menos atendimentos'}
                  {rule.method === 'skills_based' && 'Direciona baseado nas habilidades do agente'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={rule.active ? 'default' : 'secondary'}>
                  {rule.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configurações de Timeout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span>Tempo máximo para aceitar atendimento</span>
            <Badge variant="outline">5 minutos</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span>Ação se timeout expirar</span>
            <Badge variant="outline">Enfileirar</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span>Máximo de atendimentos por agente</span>
            <Badge variant="outline">10 simultâneos</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
