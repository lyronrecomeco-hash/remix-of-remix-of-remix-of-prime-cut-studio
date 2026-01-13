import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, Meh, TrendingUp, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface NPSStats {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  score: number;
}

export function NPSSurveys() {
  const { genesisUser } = useGenesisAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NPSStats>({
    total: 0,
    promoters: 0,
    passives: 0,
    detractors: 0,
    score: 0,
  });
  const [recentSurveys, setRecentSurveys] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [genesisUser]);

  const fetchData = async () => {
    if (!genesisUser) return;

    // Buscar instâncias do usuário
    const { data: instances } = await supabase
      .from('genesis_instances')
      .select('id')
      .eq('user_id', genesisUser.id);

    if (!instances || instances.length === 0) {
      setLoading(false);
      return;
    }

    const instanceIds = instances.map(i => i.id);

    // Buscar surveys
    const { data: surveys } = await supabase
      .from('genesis_nps_surveys')
      .select('*')
      .in('instance_id', instanceIds)
      .not('score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (surveys && surveys.length > 0) {
      const promoters = surveys.filter(s => s.score >= 9).length;
      const passives = surveys.filter(s => s.score >= 7 && s.score < 9).length;
      const detractors = surveys.filter(s => s.score < 7).length;
      const score = Math.round(((promoters - detractors) / surveys.length) * 100);

      setStats({
        total: surveys.length,
        promoters,
        passives,
        detractors,
        score,
      });
      setRecentSurveys(surveys.slice(0, 10));
    }

    setLoading(false);
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-500';
    if (score >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 9) return <ThumbsUp className="w-4 h-4 text-green-500" />;
    if (score >= 7) return <Meh className="w-4 h-4 text-yellow-500" />;
    return <ThumbsDown className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Avaliação NPS</h2>
          <p className="text-sm text-muted-foreground">Net Promoter Score dos atendimentos</p>
        </div>
      </motion.div>

      {/* Score Principal */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">NPS Score</p>
            <p className={`text-5xl font-bold ${getNPSColor(stats.score)}`}>
              {stats.score}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.score >= 50 ? 'Excelente' : stats.score >= 0 ? 'Bom' : 'Precisa Melhorar'}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Distribuição</CardTitle>
            <CardDescription>{stats.total} respostas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  Promotores (9-10)
                </span>
                <span className="text-sm font-medium">{stats.promoters}</span>
              </div>
              <Progress value={(stats.promoters / Math.max(stats.total, 1)) * 100} className="h-2 bg-muted" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm flex items-center gap-2">
                  <Meh className="w-4 h-4 text-yellow-500" />
                  Neutros (7-8)
                </span>
                <span className="text-sm font-medium">{stats.passives}</span>
              </div>
              <Progress value={(stats.passives / Math.max(stats.total, 1)) * 100} className="h-2 bg-muted" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  Detratores (0-6)
                </span>
                <span className="text-sm font-medium">{stats.detractors}</span>
              </div>
              <Progress value={(stats.detractors / Math.max(stats.total, 1)) * 100} className="h-2 bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Últimas Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSurveys.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma avaliação ainda
            </p>
          ) : (
            <div className="space-y-3">
              {recentSurveys.map((survey, i) => (
                <motion.div
                  key={survey.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                    {getScoreIcon(survey.score)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{survey.contact_name || survey.contact_phone}</span>
                      <Badge variant="outline">{survey.score}/10</Badge>
                    </div>
                    {survey.feedback && (
                      <p className="text-sm text-muted-foreground truncate">{survey.feedback}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(survey.answered_at || survey.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
