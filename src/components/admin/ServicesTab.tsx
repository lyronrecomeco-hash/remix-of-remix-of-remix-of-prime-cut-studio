import { useState } from 'react';
import { Scissors, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useNotification } from '@/contexts/NotificationContext';

export default function ServicesTab() {
  const { services, addService, deleteService, toggleServiceVisibility } = useApp();
  const { notify } = useNotification();

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
  });

  const handleAddService = () => {
    if (!newService.name.trim()) return;
    addService({
      name: newService.name,
      description: newService.description,
      duration: newService.duration,
      price: newService.price,
      icon: 'Scissors',
    });
    setNewService({ name: '', description: '', duration: 30, price: 0 });
    notify.success('Serviço adicionado');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gerenciar Serviços</h2>

      {/* Add new service */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Adicionar Novo Serviço</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nome do serviço"
              value={newService.name}
              onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Preço (R$)"
              value={newService.price || ''}
              onChange={(e) => setNewService((prev) => ({ ...prev, price: Number(e.target.value) }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Duração (min)"
              value={newService.duration}
              onChange={(e) => setNewService((prev) => ({ ...prev, duration: Number(e.target.value) }))}
            />
            <Textarea
              placeholder="Descrição"
              value={newService.description}
              onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-[40px]"
            />
          </div>
          <Button variant="hero" onClick={handleAddService} className="w-full">
            <Plus className="w-4 h-4" />
            Adicionar Serviço
          </Button>
        </div>
      </div>

      {/* Services list */}
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.duration} min</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">R$ {service.price}</p>
                </div>
                <button
                  onClick={() => toggleServiceVisibility(service.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    service.visible !== false
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                  title={service.visible !== false ? 'Ocultar' : 'Exibir'}
                >
                  {service.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="w-8 h-8 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
