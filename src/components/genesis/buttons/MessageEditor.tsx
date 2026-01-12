import { useState } from 'react';
import { Plus, Trash2, GripVertical, Link, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  InteractiveMessage, 
  MessageType, 
  ButtonItem, 
  ListSection,
  WHATSAPP_LIMITS 
} from './types';

interface MessageEditorProps {
  message: InteractiveMessage;
  onChange: (message: InteractiveMessage) => void;
}

export function MessageEditor({ message, onChange }: MessageEditorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMessage = (updates: Partial<InteractiveMessage>) => {
    onChange({ ...message, ...updates });
  };

  const validateText = (field: string, value: string, maxLength: number) => {
    if (value.length > maxLength) {
      setErrors(prev => ({ ...prev, [field]: `Máximo ${maxLength} caracteres` }));
    } else {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Button handlers
  const addButton = () => {
    if (message.buttons.length >= WHATSAPP_LIMITS.MAX_BUTTONS) return;
    
    const newButton: ButtonItem = {
      id: `btn_${Date.now()}`,
      text: '',
      type: message.type === 'url' ? 'url' : 'quick_reply',
    };
    
    updateMessage({ buttons: [...message.buttons, newButton] });
  };

  const updateButton = (index: number, updates: Partial<ButtonItem>) => {
    const newButtons = [...message.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    updateMessage({ buttons: newButtons });
  };

  const removeButton = (index: number) => {
    updateMessage({ buttons: message.buttons.filter((_, i) => i !== index) });
  };

  // List handlers
  const addSection = () => {
    if (message.listSections.length >= WHATSAPP_LIMITS.MAX_LIST_SECTIONS) return;
    
    const newSection: ListSection = {
      id: `sec_${Date.now()}`,
      title: '',
      rows: [{ id: `row_${Date.now()}`, title: '', description: '' }],
    };
    
    updateMessage({ listSections: [...message.listSections, newSection] });
  };

  const updateSection = (sectionIndex: number, updates: Partial<ListSection>) => {
    const newSections = [...message.listSections];
    newSections[sectionIndex] = { ...newSections[sectionIndex], ...updates };
    updateMessage({ listSections: newSections });
  };

  const removeSection = (sectionIndex: number) => {
    updateMessage({ listSections: message.listSections.filter((_, i) => i !== sectionIndex) });
  };

  const addRow = (sectionIndex: number) => {
    const totalRows = message.listSections.reduce((acc, s) => acc + s.rows.length, 0);
    if (totalRows >= WHATSAPP_LIMITS.MAX_TOTAL_ROWS) return;
    
    const newSections = [...message.listSections];
    newSections[sectionIndex].rows.push({
      id: `row_${Date.now()}`,
      title: '',
      description: '',
    });
    updateMessage({ listSections: newSections });
  };

  const updateRow = (sectionIndex: number, rowIndex: number, updates: Partial<{ title: string; description: string }>) => {
    const newSections = [...message.listSections];
    newSections[sectionIndex].rows[rowIndex] = { 
      ...newSections[sectionIndex].rows[rowIndex], 
      ...updates 
    };
    updateMessage({ listSections: newSections });
  };

  const removeRow = (sectionIndex: number, rowIndex: number) => {
    const newSections = [...message.listSections];
    newSections[sectionIndex].rows = newSections[sectionIndex].rows.filter((_, i) => i !== rowIndex);
    updateMessage({ listSections: newSections });
  };

  const totalRows = message.listSections.reduce((acc, s) => acc + s.rows.length, 0);

  return (
    <div className="space-y-6">
      {/* Message Type */}
      <div className="space-y-2">
        <Label>Tipo de Mensagem</Label>
        <Select 
          value={message.type} 
          onValueChange={(value: MessageType) => {
            // Reset buttons/lists when changing type
            if (value === 'list') {
              updateMessage({ 
                type: value, 
                buttons: [],
                listSections: [{ id: 'sec_1', title: '', rows: [{ id: 'row_1', title: '', description: '' }] }],
              });
            } else if (value === 'url') {
              updateMessage({ 
                type: value, 
                buttons: [{ id: 'btn_1', text: '', type: 'url', url: '' }],
                listSections: [],
              });
            } else {
              updateMessage({ 
                type: value, 
                buttons: [{ id: 'btn_1', text: '', type: 'quick_reply' }],
                listSections: [],
              });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buttons">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Botões (Resposta Rápida)
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                Lista Interativa
              </div>
            </SelectItem>
            <SelectItem value="url">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Botão URL
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Message Text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Mensagem *</Label>
          <span className={cn(
            "text-xs",
            message.text.length > WHATSAPP_LIMITS.MAX_MESSAGE_LENGTH ? "text-destructive" : "text-muted-foreground"
          )}>
            {message.text.length}/{WHATSAPP_LIMITS.MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <Textarea
          value={message.text}
          onChange={(e) => {
            updateMessage({ text: e.target.value });
            validateText('text', e.target.value, WHATSAPP_LIMITS.MAX_MESSAGE_LENGTH);
          }}
          placeholder="Digite sua mensagem..."
          rows={4}
          className={cn(errors.text && "border-destructive")}
        />
        {errors.text && <p className="text-xs text-destructive">{errors.text}</p>}
        <p className="text-xs text-muted-foreground">
          Use *negrito*, _itálico_ ou ~tachado~ para formatar
        </p>
      </div>

      {/* Footer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Rodapé (opcional)</Label>
          <span className={cn(
            "text-xs",
            (message.footer?.length || 0) > WHATSAPP_LIMITS.MAX_FOOTER_LENGTH ? "text-destructive" : "text-muted-foreground"
          )}>
            {message.footer?.length || 0}/{WHATSAPP_LIMITS.MAX_FOOTER_LENGTH}
          </span>
        </div>
        <Input
          value={message.footer || ''}
          onChange={(e) => updateMessage({ footer: e.target.value })}
          placeholder="Ex: Powered by Genesis"
          maxLength={WHATSAPP_LIMITS.MAX_FOOTER_LENGTH}
        />
      </div>

      {/* Buttons Editor */}
      {(message.type === 'buttons' || message.type === 'url') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Botões</Label>
            <Badge variant="secondary">
              {message.buttons.length}/{WHATSAPP_LIMITS.MAX_BUTTONS}
            </Badge>
          </div>
          
          {message.buttons.map((btn, index) => (
            <Card key={btn.id} className="border-dashed">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={btn.text}
                      onChange={(e) => updateButton(index, { text: e.target.value })}
                      placeholder="Texto do botão"
                      maxLength={WHATSAPP_LIMITS.MAX_BUTTON_TEXT_LENGTH}
                    />
                    <span className="text-xs text-muted-foreground">
                      {btn.text.length}/{WHATSAPP_LIMITS.MAX_BUTTON_TEXT_LENGTH}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeButton(index)}
                    className="text-destructive hover:text-destructive"
                    disabled={message.buttons.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {message.type === 'url' && (
                  <div className="space-y-1">
                    <Label className="text-xs">URL do Link</Label>
                    <Input
                      value={btn.url || ''}
                      onChange={(e) => updateButton(index, { url: e.target.value })}
                      placeholder="https://exemplo.com"
                      type="url"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {message.buttons.length < WHATSAPP_LIMITS.MAX_BUTTONS && (
            <Button
              variant="outline"
              size="sm"
              onClick={addButton}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Botão
            </Button>
          )}
        </div>
      )}

      {/* List Editor */}
      {message.type === 'list' && (
        <div className="space-y-4">
          {/* Button Text for List */}
          <div className="space-y-2">
            <Label>Texto do Botão da Lista</Label>
            <Input
              value={message.buttonText}
              onChange={(e) => updateMessage({ buttonText: e.target.value })}
              placeholder="Ver opções"
              maxLength={WHATSAPP_LIMITS.MAX_BUTTON_TEXT_LIST_LENGTH}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Seções da Lista</Label>
            <Badge variant="secondary">
              {totalRows}/{WHATSAPP_LIMITS.MAX_TOTAL_ROWS} itens
            </Badge>
          </div>
          
          {message.listSections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                    placeholder="Título da seção"
                    maxLength={WHATSAPP_LIMITS.MAX_SECTION_TITLE_LENGTH}
                    className="font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-destructive hover:text-destructive"
                    disabled={message.listSections.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Rows */}
                <div className="pl-3 border-l-2 border-dashed space-y-2">
                  {section.rows.map((row, rowIndex) => (
                    <div key={row.id} className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <Input
                          value={row.title}
                          onChange={(e) => updateRow(sectionIndex, rowIndex, { title: e.target.value })}
                          placeholder="Título do item"
                          maxLength={WHATSAPP_LIMITS.MAX_ROW_TITLE_LENGTH}
                          className="text-sm"
                        />
                        <Input
                          value={row.description || ''}
                          onChange={(e) => updateRow(sectionIndex, rowIndex, { description: e.target.value })}
                          placeholder="Descrição (opcional)"
                          maxLength={WHATSAPP_LIMITS.MAX_ROW_DESCRIPTION_LENGTH}
                          className="text-xs"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(sectionIndex, rowIndex)}
                        className="text-destructive hover:text-destructive h-8 w-8"
                        disabled={section.rows.length <= 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {totalRows < WHATSAPP_LIMITS.MAX_TOTAL_ROWS && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addRow(sectionIndex)}
                      className="gap-1 text-xs h-7"
                    >
                      <Plus className="w-3 h-3" />
                      Item
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {message.listSections.length < WHATSAPP_LIMITS.MAX_LIST_SECTIONS && totalRows < WHATSAPP_LIMITS.MAX_TOTAL_ROWS && (
            <Button
              variant="outline"
              size="sm"
              onClick={addSection}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Seção
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
