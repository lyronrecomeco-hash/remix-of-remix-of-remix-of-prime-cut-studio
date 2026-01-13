import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Clock, Calendar, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
];

const defaultSchedules: WorkSchedule[] = DAYS_OF_WEEK.map(day => ({
  day_of_week: day.value,
  start_time: day.value === 0 || day.value === 6 ? '09:00' : '08:00',
  end_time: day.value === 0 || day.value === 6 ? '13:00' : '18:00',
  is_enabled: day.value !== 0, // Domingo desabilitado por padrão
}));

export function WorkScheduleSettings() {
  const { genesisUser } = useGenesisAuth();
  const [schedules, setSchedules] = useState<WorkSchedule[]>(defaultSchedules);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (genesisUser) fetchSchedules();
  }, [genesisUser]);

  const fetchSchedules = async () => {
    if (!genesisUser) return;

    const { data, error } = await supabase
      .from('genesis_work_schedules')
      .select('*')
      .eq('user_id', genesisUser.id)
      .order('day_of_week');

    if (data && data.length > 0) {
      setSchedules(data.map(d => ({
        day_of_week: d.day_of_week,
        start_time: d.start_time,
        end_time: d.end_time,
        is_enabled: d.is_enabled ?? true,
      })));
    }
    setLoading(false);
  };

  const updateSchedule = (dayOfWeek: number, field: keyof WorkSchedule, value: any) => {
    setSchedules(prev => prev.map(s => 
      s.day_of_week === dayOfWeek ? { ...s, [field]: value } : s
    ));
    setHasChanges(true);
  };

  const saveSchedules = async () => {
    if (!genesisUser) return;
    setSaving(true);

    // Upsert cada dia
    for (const schedule of schedules) {
      const { error } = await supabase
        .from('genesis_work_schedules')
        .upsert({
          user_id: genesisUser.id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_enabled: schedule.is_enabled,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,day_of_week' });

      if (error) {
        console.error('Error saving schedule:', error);
      }
    }

    toast.success('Jornada de trabalho salva!');
    setHasChanges(false);
    setSaving(false);
  };

  const applyTemplate = (template: 'comercial' | 'extendido' | 'sabado') => {
    const templates = {
      comercial: { start: '08:00', end: '18:00', weekend: false },
      extendido: { start: '07:00', end: '22:00', weekend: true },
      sabado: { start: '09:00', end: '17:00', weekend: 'saturday' },
    };

    const t = templates[template];
    setSchedules(prev => prev.map(s => ({
      ...s,
      start_time: t.start,
      end_time: t.end,
      is_enabled: t.weekend === true || (t.weekend === 'saturday' && s.day_of_week === 6) || (s.day_of_week > 0 && s.day_of_week < 6),
    })));
    setHasChanges(true);
    toast.success('Template aplicado!');
  };

  // Calcular horas semanais
  const totalHours = schedules.reduce((acc, s) => {
    if (!s.is_enabled) return acc;
    const [startH, startM] = s.start_time.split(':').map(Number);
    const [endH, endM] = s.end_time.split(':').map(Number);
    const hours = (endH + endM / 60) - (startH + startM / 60);
    return acc + Math.max(0, hours);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Jornada de Trabalho</h2>
            <p className="text-sm text-muted-foreground">
              {totalHours.toFixed(1)}h semanais configuradas
            </p>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={saveSchedules} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        )}
      </motion.div>

      {/* Templates Rápidos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Templates Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => applyTemplate('comercial')}>
            🏢 Comercial (8h-18h)
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyTemplate('extendido')}>
            ⏰ Extendido (7h-22h)
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyTemplate('sabado')}>
            📅 Seg-Sáb
          </Button>
        </CardContent>
      </Card>

      {/* Agenda Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Horários por Dia
          </CardTitle>
          <CardDescription>Configure os horários de atendimento de cada dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map(day => {
              const schedule = schedules.find(s => s.day_of_week === day.value)!;
              return (
                <motion.div
                  key={day.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: day.value * 0.05 }}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    schedule.is_enabled ? 'bg-card' : 'bg-muted/50'
                  }`}
                >
                  <Switch
                    checked={schedule.is_enabled}
                    onCheckedChange={(v) => updateSchedule(day.value, 'is_enabled', v)}
                  />
                  
                  <div className="w-20">
                    <span className={`font-medium ${!schedule.is_enabled && 'text-muted-foreground'}`}>
                      {day.label}
                    </span>
                  </div>

                  {schedule.is_enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) => updateSchedule(day.value, 'start_time', e.target.value)}
                        className="px-2 py-1 rounded border bg-background text-sm"
                      />
                      <span className="text-muted-foreground">até</span>
                      <input
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) => updateSchedule(day.value, 'end_time', e.target.value)}
                        className="px-2 py-1 rounded border bg-background text-sm"
                      />
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(() => {
                          const [startH, startM] = schedule.start_time.split(':').map(Number);
                          const [endH, endM] = schedule.end_time.split(':').map(Number);
                          const hours = (endH + endM / 60) - (startH + startM / 60);
                          return `${hours.toFixed(1)}h`;
                        })()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Folga</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
