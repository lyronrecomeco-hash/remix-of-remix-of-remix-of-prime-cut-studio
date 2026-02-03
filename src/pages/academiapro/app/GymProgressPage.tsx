import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Scale, Ruler, Calendar } from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GymProgressPage() {
  const { profile, user } = useGymAuth();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [prs, setPRs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [measurementsRes, prsRes] = await Promise.all([
      supabase
        .from('gym_body_measurements')
        .select('*')
        .eq('user_id', user?.id)
        .order('measured_at', { ascending: false })
        .limit(10),
      supabase
        .from('gym_personal_records')
        .select(`
          *,
          gym_exercises(name)
        `)
        .eq('user_id', user?.id)
        .order('achieved_at', { ascending: false })
        .limit(10)
    ]);

    if (measurementsRes.data) setMeasurements(measurementsRes.data);
    if (prsRes.data) setPRs(prsRes.data);
    setIsLoading(false);
  };

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const calcDiff = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return (current - previous).toFixed(1);
  };

  const DiffBadge = ({ diff }: { diff: string | null }) => {
    if (!diff) return null;
    const isPositive = parseFloat(diff) > 0;
    return (
      <span className={`text-xs ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
        {isPositive ? '+' : ''}{diff}
      </span>
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="text-2xl font-bold">Minha Evolução</h1>
        <p className="text-zinc-400 text-sm">Acompanhe seu progresso</p>
      </motion.div>

      {/* Current Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Scale className="w-4 h-4" />
            <span className="text-sm">Peso</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">
              {latestMeasurement?.weight_kg || profile?.weight_kg || '--'}
            </span>
            <span className="text-zinc-400 text-sm mb-1">kg</span>
            <DiffBadge diff={calcDiff(latestMeasurement?.weight_kg, previousMeasurement?.weight_kg)} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Ruler className="w-4 h-4" />
            <span className="text-sm">% Gordura</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">
              {latestMeasurement?.body_fat_percent || '--'}
            </span>
            <span className="text-zinc-400 text-sm mb-1">%</span>
            <DiffBadge diff={calcDiff(latestMeasurement?.body_fat_percent, previousMeasurement?.body_fat_percent)} />
          </div>
        </div>
      </motion.div>

      {/* Body Measurements */}
      {latestMeasurement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Medidas Corporais</h2>
            <span className="text-xs text-zinc-400">
              {format(new Date(latestMeasurement.measured_at), "d 'de' MMM", { locale: ptBR })}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Peito', value: latestMeasurement.chest_cm },
              { label: 'Cintura', value: latestMeasurement.waist_cm },
              { label: 'Quadril', value: latestMeasurement.hips_cm },
              { label: 'Bíceps E', value: latestMeasurement.biceps_left_cm },
              { label: 'Bíceps D', value: latestMeasurement.biceps_right_cm },
              { label: 'Coxa', value: latestMeasurement.thigh_left_cm },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-zinc-400 mb-1">{item.label}</p>
                <p className="font-semibold">{item.value || '--'} <span className="text-xs text-zinc-500">cm</span></p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Personal Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2 text-foreground">
            <Trophy className="w-5 h-5 text-primary" />
            Records Pessoais
          </h2>
        </div>

        {prs.length > 0 ? (
          <div className="space-y-3">
            {prs.map((pr, index) => (
              <motion.div
                key={pr.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-foreground">{pr.gym_exercises?.name || 'Exercício'}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(pr.achieved_at), "d 'de' MMM", { locale: ptBR })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">{pr.weight_kg}</span>
                  <span className="text-muted-foreground text-sm ml-1">kg</span>
                  <p className="text-xs text-muted-foreground">{pr.reps} rep{pr.reps > 1 ? 's' : ''}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum PR registrado</h3>
            <p className="text-zinc-400 text-sm">
              Continue treinando para bater seus primeiros records!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
