import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Copy,
  Dumbbell,
  Calendar,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function GymAdminWorkouts() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('gym_workout_templates')
      .select(`
        *,
        gym_workout_template_exercises(
          id,
          gym_exercises(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setTemplates(data);
    }
    setIsLoading(false);
  };

  const filteredTemplates = templates.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'iniciante': return { label: 'Iniciante', color: 'text-green-500 bg-green-500/20' };
      case 'intermediario': return { label: 'Intermediário', color: 'text-yellow-500 bg-yellow-500/20' };
      case 'avancado': return { label: 'Avançado', color: 'text-red-500 bg-red-500/20' };
      default: return { label: difficulty, color: 'text-zinc-400 bg-zinc-800' };
    }
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
          <h1 className="text-3xl font-bold">Treinos</h1>
          <p className="text-zinc-400 mt-1">Crie e gerencie templates de treino</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Treino
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            placeholder="Buscar treino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-2/3 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4" />
              <div className="h-20 bg-zinc-800 rounded mb-4" />
              <div className="h-10 bg-zinc-800 rounded" />
            </div>
          ))
        ) : filteredTemplates.length > 0 ? (
          filteredTemplates.map((template, index) => {
            const difficulty = getDifficultyBadge(template.difficulty);
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${difficulty.color}`}>
                      {difficulty.label}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuItem>Atribuir a aluno</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                  {template.description || 'Sem descrição'}
                </p>

                <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-4 h-4" />
                    {template.gym_workout_template_exercises?.length || 0} exercícios
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    ~{template.estimated_duration_min || 60} min
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-zinc-700 hover:bg-zinc-800">
                    Editar
                  </Button>
                  <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum treino encontrado</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Crie seu primeiro template de treino
            </p>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Treino
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
