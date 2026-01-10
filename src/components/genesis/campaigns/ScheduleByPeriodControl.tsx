/**
 * SCHEDULE BY PERIOD CONTROL - Controle de horários por período do dia
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sun, Sunrise, Moon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PeriodSchedule {
  enabled: boolean;
  start: string;
  end: string;
}

export interface ScheduleByPeriod {
  morning: PeriodSchedule;
  afternoon: PeriodSchedule;
  night: PeriodSchedule;
}

interface ScheduleByPeriodControlProps {
  value: ScheduleByPeriod;
  onChange: (schedule: ScheduleByPeriod) => void;
}

const DEFAULT_SCHEDULE: ScheduleByPeriod = {
  morning: { enabled: true, start: '08:00', end: '12:00' },
  afternoon: { enabled: true, start: '14:00', end: '18:00' },
  night: { enabled: false, start: '19:00', end: '21:00' },
};

const PERIODS = [
  {
    key: 'morning' as const,
    label: 'Manhã',
    icon: Sunrise,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    key: 'afternoon' as const,
    label: 'Tarde',
    icon: Sun,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    key: 'night' as const,
    label: 'Noite',
    icon: Moon,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
];

export function ScheduleByPeriodControl({ value, onChange }: ScheduleByPeriodControlProps) {
  const handlePeriodChange = (
    period: keyof ScheduleByPeriod,
    field: keyof PeriodSchedule,
    newValue: string | boolean
  ) => {
    onChange({
      ...value,
      [period]: {
        ...value[period],
        [field]: newValue,
      },
    });
  };

  const enabledCount = Object.values(value).filter(p => p.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-medium">Horários por Período</span>
        </div>
        <Badge variant="secondary">
          {enabledCount} de 3 períodos ativos
        </Badge>
      </div>

      <div className="grid gap-4">
        {PERIODS.map((period) => {
          const schedule = value[period.key];
          const Icon = period.icon;

          return (
            <Card 
              key={period.key}
              className={cn(
                "transition-all",
                schedule.enabled 
                  ? `border-2 ${period.border} ${period.bg}`
                  : "border bg-muted/30 opacity-60"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      period.bg
                    )}>
                      <Icon className={cn("w-5 h-5", period.color)} />
                    </div>
                    <div>
                      <p className="font-medium">{period.label}</p>
                      {schedule.enabled ? (
                        <p className="text-sm text-muted-foreground">
                          {schedule.start} até {schedule.end}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Desativado</p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(v) => handlePeriodChange(period.key, 'enabled', v)}
                  />
                </div>

                {schedule.enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Início</Label>
                      <Input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => handlePeriodChange(period.key, 'start', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Fim</Label>
                      <Input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => handlePeriodChange(period.key, 'end', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Configure os períodos do dia em que as mensagens podem ser enviadas. 
        Isso ajuda a respeitar o horário comercial e evitar envios em horários inadequados.
      </p>
    </div>
  );
}

export { DEFAULT_SCHEDULE };
