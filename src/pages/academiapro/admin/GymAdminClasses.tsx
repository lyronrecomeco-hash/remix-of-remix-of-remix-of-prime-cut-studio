import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  Clock,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function GymAdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('gym_classes')
      .select('*')
      .order('name');

    if (data) {
      setClasses(data);
    }
    setIsLoading(false);
  };

  const formatDays = (days: number[] | null) => {
    if (!days || days.length === 0) return 'Sem dias';
    if (days.length === 7) return 'Todos os dias';
    return days.map(d => WEEKDAYS[d].slice(0, 3)).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Aulas Coletivas</h1>
          <p className="text-zinc-400 mt-1">Gerencie as aulas da academia</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Aula
        </Button>
      </motion.div>

      {/* Classes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-2/3 mb-4" />
              <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-4" />
              <div className="h-10 bg-zinc-800 rounded" />
            </div>
          ))
        ) : classes.length > 0 ? (
          classes.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-zinc-900 border rounded-2xl p-6 ${
                classItem.is_active ? 'border-zinc-800' : 'border-red-500/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{classItem.name}</h3>
                  {!classItem.is_active && (
                    <span className="text-xs text-red-500">Desativada</span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Criar sessão</DropdownMenuItem>
                    <DropdownMenuItem>Ver inscritos</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      {classItem.is_active ? 'Desativar' : 'Reativar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                {classItem.description || 'Sem descrição'}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  {formatDays(classItem.recurring_days)}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {classItem.start_time?.slice(0, 5) || '--:--'} ({classItem.duration_minutes || 60} min)
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Users className="w-4 h-4 text-orange-500" />
                  Máx. {classItem.max_capacity || 20} alunos
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {classItem.location || 'Local não definido'}
                </div>
              </div>

              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800">
                Gerenciar Sessões
              </Button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma aula cadastrada</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Crie sua primeira aula coletiva
            </p>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
