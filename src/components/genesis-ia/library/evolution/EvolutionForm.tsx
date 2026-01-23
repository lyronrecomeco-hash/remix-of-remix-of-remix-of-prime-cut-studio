import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EvolutionType, EvolutionField } from './evolutionTypes';
import { cn } from '@/lib/utils';

interface EvolutionFormProps {
  evolutionType: EvolutionType;
  answers: Record<string, string | boolean | string[]>;
  onChange: (fieldId: string, value: string | boolean | string[]) => void;
}

export function EvolutionForm({ evolutionType, answers, onChange }: EvolutionFormProps) {
  const renderField = (field: EvolutionField, index: number) => {
    const value = answers[field.id] ?? '';

    switch (field.type) {
      case 'text':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <Label 
              htmlFor={field.id} 
              className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground"
            >
              {field.label}
              {field.required && <span className="text-amber-400 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="bg-white/5 border-white/10 h-10"
            />
          </motion.div>
        );

      case 'textarea':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <Label 
              htmlFor={field.id} 
              className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground"
            >
              {field.label}
              {field.required && <span className="text-amber-400 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="bg-white/5 border-white/10 resize-none"
            />
          </motion.div>
        );

      case 'select':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <Label 
              htmlFor={field.id} 
              className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground"
            >
              {field.label}
              {field.required && <span className="text-amber-400 ml-1">*</span>}
            </Label>
            <Select
              value={typeof value === 'string' ? value : ''}
              onValueChange={(val) => onChange(field.id, val)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 h-10">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        );

      case 'checkbox':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center space-x-3 py-2"
          >
            <Checkbox
              id={field.id}
              checked={typeof value === 'boolean' ? value : false}
              onCheckedChange={(checked) => onChange(field.id, checked === true)}
              className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <Label htmlFor={field.id} className="text-sm text-muted-foreground cursor-pointer">
              {field.label}
            </Label>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {evolutionType.fields.map((field, index) => renderField(field, index))}
    </div>
  );
}
