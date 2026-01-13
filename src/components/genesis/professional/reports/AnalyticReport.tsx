import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Download, Calendar, Filter,
  MessageSquare, Users, Clock, Bot, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalyticReport() {
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const hourlyData = [
    { hour: '08h', count: 45 },
    { hour: '09h', count: 78 },
    { hour: '10h', count: 120 },
    { hour: '11h', count: 145 },
    { hour: '12h', count: 89 },
    { hour: '13h', count: 67 },
    { hour: '14h', count: 134 },
    { hour: '15h', count: 156 },
    { hour: '16h', count: 143 },
    { hour: '17h', count: 98 },
    { hour: '18h', count: 56 },
  ];

  const topKeywords = [
    { word: 'preço', count: 234 },
    { word: 'horário', count: 189 },
    { word: 'agendamento', count: 156 },
    { word: 'cancelar', count: 98 },
    { word: 'promoção', count: 87 },
  ];

  const aiPerformance = [
    { metric: 'Taxa de Resolução', value: '87%' },
    { metric: 'Precisão', value: '94%' },
    { metric: 'Satisfação', value: '92%' },
    { metric: 'Tempo Economia', value: '45min/dia' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold">Relatório Analítico</h3>
            <p className="text-sm text-muted-foreground">Análise detalhada por segmento</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoje</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-1">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1">
            <Bot className="w-4 h-4" />
            Performance IA
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-1">
            <MessageSquare className="w-4 h-4" />
            Palavras-chave
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Horário</CardTitle>
              <CardDescription>Volume de atendimentos ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40">
                {hourlyData.map((item, index) => (
                  <motion.div
                    key={item.hour}
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.count / 160) * 100}%` }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors relative group"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-1 mt-2">
                {hourlyData.map((item) => (
                  <div key={item.hour} className="flex-1 text-center text-xs text-muted-foreground">
                    {item.hour}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aiPerformance.map((item, index) => (
              <motion.div
                key={item.metric}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.metric}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Palavras-chave</CardTitle>
              <CardDescription>Termos mais frequentes nas conversas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topKeywords.map((item, index) => (
                  <motion.div
                    key={item.word}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-8 text-sm text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium flex-1">{item.word}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / 250) * 100}%` }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
