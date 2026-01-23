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
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="bg-background/50"
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
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="bg-background/50 resize-none"
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
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={typeof value === 'string' ? value : ''}
              onValueChange={(val) => onChange(field.id, val)}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
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
            />
            <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
              {field.label}
            </Label>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <evolutionType.icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{evolutionType.title}</h3>
          <p className="text-xs text-muted-foreground">{evolutionType.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {evolutionType.fields.map((field, index) => renderField(field, index))}
      </div>
    </div>
  );
}
