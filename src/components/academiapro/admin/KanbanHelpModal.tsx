import { 
  GripVertical, 
  ArrowRight, 
  CheckCircle2,
  Info,
  Lightbulb,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KanbanHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'workouts' | 'classes' | 'attendance' | 'financial';
}

const helpContent = {
  workouts: {
    title: 'Como usar o Kanban de Treinos',
    description: 'Organize e atribua treinos aos alunos usando o sistema de arrastar e soltar.',
    columns: [
      { name: 'Rascunho', color: 'bg-zinc-500', description: 'Treinos em criação ou edição' },
      { name: 'Pronto', color: 'bg-blue-500', description: 'Treinos prontos para serem atribuídos' },
      { name: 'Atribuído', color: 'bg-orange-500', description: 'Treinos já atribuídos a alunos' },
      { name: 'Concluído', color: 'bg-green-500', description: 'Treinos finalizados pelos alunos' },
    ],
    tips: [
      'Arraste um treino de uma coluna para outra para mudar o status',
      'Clique em "Atribuir" para selecionar os alunos que receberão o treino',
      'Use a busca para encontrar treinos específicos',
    ]
  },
  classes: {
    title: 'Como usar o Kanban de Aulas',
    description: 'Gerencie o status e matrículas das aulas coletivas.',
    columns: [
      { name: 'Inativas', color: 'bg-zinc-500', description: 'Aulas desativadas temporariamente' },
      { name: 'Rascunho', color: 'bg-blue-500', description: 'Aulas em planejamento' },
      { name: 'Ativas', color: 'bg-green-500', description: 'Aulas disponíveis para inscrição' },
      { name: 'Lotadas', color: 'bg-orange-500', description: 'Aulas com capacidade máxima atingida' },
    ],
    tips: [
      'Arraste aulas para ativar ou desativar conforme necessário',
      'Clique em "Matricular Alunos" para adicionar participantes',
      'Aulas lotadas não aceitam novas inscrições',
    ]
  },
  attendance: {
    title: 'Como usar o Controle de Presença',
    description: 'Registre a presença e faltas dos alunos de forma visual.',
    columns: [
      { name: 'Aguardando', color: 'bg-zinc-500', description: 'Alunos que ainda não chegaram' },
      { name: 'Presente', color: 'bg-green-500', description: 'Alunos que compareceram' },
      { name: 'Faltou', color: 'bg-red-500', description: 'Alunos que não vieram' },
    ],
    tips: [
      'Arraste o card do aluno para a coluna correspondente',
      'O check-in via QR Code move automaticamente para "Presente"',
      'Use o filtro de data para ver histórico de presenças',
    ]
  },
  financial: {
    title: 'Como usar o Kanban Financeiro',
    description: 'Acompanhe o status dos pagamentos e cobranças.',
    columns: [
      { name: 'Pendente', color: 'bg-yellow-500', description: 'Aguardando pagamento' },
      { name: 'Pago', color: 'bg-green-500', description: 'Pagamento confirmado' },
      { name: 'Atrasado', color: 'bg-red-500', description: 'Pagamento em atraso' },
      { name: 'Cancelado', color: 'bg-zinc-500', description: 'Pagamento cancelado' },
    ],
    tips: [
      'Pagamentos são atualizados automaticamente via integração',
      'Arraste para atualizar o status manualmente se necessário',
      'Use filtros para visualizar por período ou aluno',
    ]
  }
};

export function KanbanHelpModal({ open, onOpenChange, type }: KanbanHelpModalProps) {
  const content = helpContent[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg max-h-[85vh] overflow-hidden flex flex-col fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[100]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-orange-500" />
            </div>
            <span>{content.title}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mt-4">
          <p className="text-zinc-400 text-sm">{content.description}</p>

          {/* Drag Demo */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <GripVertical className="w-5 h-5 text-zinc-500" />
              <span className="text-sm font-medium">Arraste os cards</span>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">para mudar status</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {content.columns.map((col) => (
                <div 
                  key={col.name}
                  className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded-lg flex-shrink-0"
                >
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-xs">{col.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columns Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-zinc-300">Status disponíveis:</h3>
            {content.columns.map((col) => (
              <div 
                key={col.name}
                className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg"
              >
                <div className={`w-3 h-3 rounded-full ${col.color} mt-1 flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="font-medium text-sm">{col.name}</p>
                  <p className="text-xs text-zinc-400">{col.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-zinc-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Dicas:
            </h3>
            <ul className="space-y-2">
              {content.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex-shrink-0">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Entendi!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
