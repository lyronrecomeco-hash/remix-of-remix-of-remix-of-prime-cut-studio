import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { useNotification } from '@/contexts/NotificationContext';

// Generate all possible time slots for a day
const allPossibleSlots = (() => {
  const slots: string[] = [];
  for (let hour = 9; hour < 20; hour++) {
    for (const minute of [0, 30]) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
})();

export default function ScheduleTab() {
  const {
    barbers,
    blockedSlots,
    addBlockedSlot,
    removeBlockedSlot,
    getBarberDayAvailability,
    setBarberDayAvailability,
  } = useApp();
  const { notify } = useNotification();

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [selectedBarberForAvailability, setSelectedBarberForAvailability] = useState(barbers[0]?.id || '');
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const [blockSlotForm, setBlockSlotForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '13:00',
    reason: '',
    barberId: barbers[0]?.id || '',
  });

  // Load barber availability when date or barber changes
  useEffect(() => {
    if (selectedBarberForAvailability && availabilityDate) {
      const existing = getBarberDayAvailability(selectedBarberForAvailability, availabilityDate);
      setSelectedTimeSlots(existing || []);
    }
  }, [selectedBarberForAvailability, availabilityDate, getBarberDayAvailability]);

  const handleToggleTimeSlot = (time: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort()
    );
  };

  const handleSaveAvailability = () => {
    setBarberDayAvailability(selectedBarberForAvailability, availabilityDate, selectedTimeSlots);
    notify.success('Disponibilidade salva', `Horários atualizados para ${availabilityDate}`);
  };

  const handleAddBlockedSlot = () => {
    addBlockedSlot({
      date: blockSlotForm.date,
      startTime: blockSlotForm.startTime,
      endTime: blockSlotForm.endTime,
      reason: blockSlotForm.reason,
      barberId: blockSlotForm.barberId,
    });
    notify.success('Horário bloqueado');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Horários</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Availability Card */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Disponibilidade Diária</h3>
              <p className="text-sm text-muted-foreground">Configure horários por dia</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setShowAvailabilityModal(true)}>
            <Plus className="w-4 h-4" />
            Configurar Disponibilidade
          </Button>
        </div>

        {/* Block Slots Card */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <X className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">Bloquear Horários</h3>
              <p className="text-sm text-muted-foreground">Intervalos indisponíveis</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setShowBlockModal(true)}>
            <Plus className="w-4 h-4" />
            Adicionar Bloqueio
          </Button>
        </div>
      </div>

      {/* Blocked Slots List */}
      {blockedSlots.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Horários Bloqueados</h3>
          <div className="space-y-2">
            {blockedSlots.map((slot) => (
              <div key={slot.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {new Date(slot.date + 'T12:00:00').toLocaleDateString('pt-BR')} •{' '}
                    {slot.startTime} - {slot.endTime}
                  </p>
                  {slot.reason && <p className="text-sm text-muted-foreground">{slot.reason}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBlockedSlot(slot.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showAvailabilityModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                  onClick={() => setShowAvailabilityModal(false)}
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Configurar Disponibilidade</h3>
                      <button
                        onClick={() => setShowAvailabilityModal(false)}
                        className="p-2 hover:bg-secondary rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Profissional</label>
                        <select
                          value={selectedBarberForAvailability}
                          onChange={(e) => setSelectedBarberForAvailability(e.target.value)}
                          className="w-full bg-secondary px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Data</label>
                        <Input
                          type="date"
                          value={availabilityDate}
                          onChange={(e) => setAvailabilityDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedTimeSlots([...allPossibleSlots])}>
                        Selecionar Todos
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTimeSlots([])}>
                        Limpar Todos
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                      {allPossibleSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleToggleTimeSlot(time)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTimeSlots.includes(time)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {selectedTimeSlots.length} horário(s) selecionado(s)
                      </p>
                      <Button
                        variant="hero"
                        onClick={() => {
                          handleSaveAvailability();
                          setShowAvailabilityModal(false);
                        }}
                      >
                        <Check className="w-4 h-4" />
                        Salvar
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Block Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showBlockModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                  onClick={() => setShowBlockModal(false)}
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-card border border-border rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Bloquear Horários</h3>
                      <button
                        onClick={() => setShowBlockModal(false)}
                        className="p-2 hover:bg-secondary rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">
                      Ao adicionar um bloqueio, este intervalo ficará indisponível para novos agendamentos.
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Data</label>
                          <Input
                            type="date"
                            value={blockSlotForm.date}
                            onChange={(e) => setBlockSlotForm((prev) => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Motivo</label>
                          <Input
                            placeholder="Ex: Reunião"
                            value={blockSlotForm.reason}
                            onChange={(e) => setBlockSlotForm((prev) => ({ ...prev, reason: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Início</label>
                          <Input
                            type="time"
                            value={blockSlotForm.startTime}
                            onChange={(e) => setBlockSlotForm((prev) => ({ ...prev, startTime: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Fim</label>
                          <Input
                            type="time"
                            value={blockSlotForm.endTime}
                            onChange={(e) => setBlockSlotForm((prev) => ({ ...prev, endTime: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button
                        variant="hero"
                        onClick={() => {
                          handleAddBlockedSlot();
                          setShowBlockModal(false);
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Bloqueio
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
