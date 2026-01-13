import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Search, Plus, Star, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface Assignment {
  id: string;
  contact_phone: string;
  contact_name: string;
  agent_name: string;
  priority: 'low' | 'normal' | 'high' | 'vip';
  tags: string[];
}

export function ContactAssignments() {
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data
  const assignments: Assignment[] = [
    { id: '1', contact_phone: '+55 11 99999-1234', contact_name: 'Maria Silva', agent_name: 'Carlos', priority: 'vip', tags: ['Premium', 'Recorrente'] },
    { id: '2', contact_phone: '+55 11 98888-5678', contact_name: 'João Santos', agent_name: 'Ana', priority: 'high', tags: ['Novo'] },
    { id: '3', contact_phone: '+55 11 97777-9012', contact_name: 'Pedro Costa', agent_name: 'Carlos', priority: 'normal', tags: [] },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'vip': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'low': return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    }
  };

  const filteredAssignments = assignments.filter(a =>
    a.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.contact_phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Carteirização</h2>
            <p className="text-sm text-muted-foreground">Vincule contatos a agentes específicos</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Atribuição
        </Button>
      </motion.div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar contato..."
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filtrar por Agente</Button>
            <Button variant="outline">Filtrar por Prioridade</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="space-y-3">
        {filteredAssignments.map((assignment, i) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {assignment.contact_name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{assignment.contact_name}</span>
                        <Badge className={getPriorityColor(assignment.priority)}>
                          {assignment.priority === 'vip' && <Star className="w-3 h-3 mr-1" />}
                          {assignment.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{assignment.contact_phone}</p>
                      {assignment.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {assignment.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Agente responsável</p>
                    <p className="font-medium">{assignment.agent_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
