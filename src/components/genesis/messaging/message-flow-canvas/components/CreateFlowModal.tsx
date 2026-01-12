import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, Sparkles } from 'lucide-react';

interface CreateFlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description?: string) => void;
}

export const CreateFlowModal = ({ open, onOpenChange, onCreate }: CreateFlowModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <span>Novo Message Flow</span>
          </DialogTitle>
          <DialogDescription>
            Crie um fluxo de mensagens inteligente para suas automações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="flow-name">Nome do Flow *</Label>
            <Input
              id="flow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boas-vindas Premium"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flow-description">Descrição (opcional)</Label>
            <Textarea
              id="flow-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo deste flow..."
              rows={3}
            />
          </div>

          {/* Tip */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">Dica Pro</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Message Flows são referenciados pelos seus flows de automação. 
                  Use nomes descritivos para facilitar a identificação.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Criar Flow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
