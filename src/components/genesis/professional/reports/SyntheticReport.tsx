import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown,
  MessageSquare, Users, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export function SyntheticReport() {
  const [period, setPeriod] = useState('7d');

  // Mock data - em produção viria do banco
  const metrics = [
    { label: 'Total Atendimentos', value: '1,234', change: '+12%', up: true, icon: MessageSquare },
    { label: 'Atendimentos IA', value: '876', change: '+25%', up: true, icon: Users },
    { label: 'Tempo Médio', value: '2m 30s', change: '-15%', up: true, icon: Clock },
    { label: 'Resolvidos', value: '95%', change: '+3%', up: true, icon: CheckCircle },
    { label: 'Transferidos', value: '5%', change: '-2%', up: true, icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold">Relatório Sintético</h3>
            <p className="text-sm text-muted-foreground">Visão geral consolidada</p>
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
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <Badge 
                    variant="secondary" 
                    className={metric.up ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'}
                  >
                    {metric.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {metric.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo Executivo</CardTitle>
          <CardDescription>Período: últimos {period === '1d' ? 'dia' : period.replace('d', ' dias')}</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            No período analisado, foram realizados <strong>1.234 atendimentos</strong>, 
            dos quais <strong>876 (71%)</strong> foram resolvidos integralmente pela IA Luna.
          </p>
          <p>
            O tempo médio de atendimento foi de <strong>2 minutos e 30 segundos</strong>, 
            uma redução de 15% em relação ao período anterior.
          </p>
          <p>
            A taxa de satisfação (NPS) permaneceu em <strong>87 pontos</strong>, 
            classificando a experiência como "Excelente".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
