import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Users, Play, Pause, Trash2 } from 'lucide-react';

export default function QueueTab() {
  const {
    appointments,
    queueEnabled,
    setQueueEnabled,
    maxQueueSize,
    setMaxQueueSize,
    queue,
    removeFromQueue,
    callNextInQueue,
  } = useApp();
  const { notify } = useNotification();

  const waitingQueue = queue.filter((q) => q.status === 'waiting');

  const handleCallNext = () => {
    const next = callNextInQueue();
    if (next) {
      const apt = appointments.find((a) => a.id === next.appointmentId);
      if (apt) {
        notify.queue(`${apt.clientName} chamado!`, 'Próximo cliente na fila');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Fila de Espera</h2>
        <button
          onClick={() => setQueueEnabled(!queueEnabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            queueEnabled ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
          }`}
        >
          {queueEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {queueEnabled ? 'Ativa' : 'Desativada'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Na fila</p>
          <p className="text-3xl font-bold text-primary">{waitingQueue.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Limite máximo</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={maxQueueSize}
              onChange={(e) => setMaxQueueSize(Number(e.target.value))}
              className="w-20 text-2xl font-bold bg-transparent focus:outline-none"
            />
            <span className="text-muted-foreground">pessoas</span>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Tempo médio</p>
          <p className="text-3xl font-bold">~25 min</p>
        </div>
      </div>

      <Button
        variant="hero"
        size="lg"
        onClick={handleCallNext}
        className="w-full mb-6"
        disabled={waitingQueue.length === 0}
      >
        Chamar Próximo Cliente
      </Button>

      {waitingQueue.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum cliente na fila</p>
        </div>
      ) : (
        <div className="space-y-2">
          {waitingQueue.map((q) => {
            const apt = appointments.find((a) => a.id === q.appointmentId);
            if (!apt) return null;
            return (
              <div key={q.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {q.position}°
                  </div>
                  <div>
                    <h3 className="font-semibold">{apt.clientName}</h3>
                    <p className="text-sm text-muted-foreground">{apt.service.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimativa</p>
                    <p className="font-medium">~{q.estimatedWait} min</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      try {
                        await removeFromQueue(apt.id);
                        notify.info(`${apt.clientName} removido da fila`);
                      } catch (e) {
                        notify.error('Erro ao remover da fila');
                      }
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
