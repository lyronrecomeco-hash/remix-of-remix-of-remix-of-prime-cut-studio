import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Save,
  X,
  Volume2,
  Clock,
  Tag,
  Plus,
  Search,
  Library,
  Music,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioLibrary } from '../hooks/useAudioLibrary';
import type { AudioItem } from '../types';

interface AudioLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAudio?: (audio: AudioItem) => void;
  mode?: 'library' | 'record' | 'both';
}

export const AudioLibraryModal = ({ 
  open, 
  onOpenChange, 
  onSelectAudio,
  mode = 'both'
}: AudioLibraryModalProps) => {
  const {
    audios,
    recording,
    recordingTime,
    playing,
    startRecording,
    stopRecording,
    cancelRecording,
    saveAudio,
    deleteAudio,
    playAudio,
    stopPlaying,
    formatDuration
  } = useAudioLibrary();

  const [activeTab, setActiveTab] = useState<string>(mode === 'record' ? 'record' : 'library');
  const [pendingAudio, setPendingAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [audioName, setAudioName] = useState('');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioTags, setAudioTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartRecording = async () => {
    setError(null);
    const success = await startRecording();
    if (!success) {
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const handleStopRecording = async () => {
    const result = await stopRecording();
    if (result) {
      setPendingAudio(result);
      setAudioName(`Áudio ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
    setPendingAudio(null);
    setAudioName('');
    setAudioDescription('');
    setAudioTags([]);
  };

  const handleSaveAudio = async () => {
    if (!pendingAudio || !audioName.trim()) return;
    
    setSaving(true);
    try {
      const saved = await saveAudio(
        pendingAudio.blob,
        audioName.trim(),
        pendingAudio.duration,
        audioDescription.trim() || undefined,
        audioTags
      );
      
      setPendingAudio(null);
      setAudioName('');
      setAudioDescription('');
      setAudioTags([]);
      setActiveTab('library');
      
      if (onSelectAudio) {
        onSelectAudio(saved);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !audioTags.includes(tagInput.trim())) {
      setAudioTags([...audioTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setAudioTags(audioTags.filter(t => t !== tag));
  };

  const filteredAudios = audios.filter(audio => 
    audio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audio.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            Biblioteca de Áudios
          </DialogTitle>
          <DialogDescription>
            Grave e gerencie seus áudios para usar nos flows de mensagens
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          {mode === 'both' && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library" className="gap-2">
                <Music className="w-4 h-4" />
                Biblioteca
              </TabsTrigger>
              <TabsTrigger value="record" className="gap-2">
                <Mic className="w-4 h-4" />
                Gravar
              </TabsTrigger>
            </TabsList>
          )}

          {/* Library Tab */}
          <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Audio List */}
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                <AnimatePresence>
                  {filteredAudios.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Nenhum áudio encontrado</p>
                      <p className="text-sm">Grave seu primeiro áudio na aba "Gravar"</p>
                    </div>
                  ) : (
                    filteredAudios.map((audio) => (
                      <motion.div
                        key={audio.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "p-4 rounded-lg border transition-all",
                          "hover:border-primary/50 hover:bg-primary/5",
                          playing === audio.id && "border-primary bg-primary/10"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Play button */}
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "shrink-0",
                              playing === audio.id && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => {
                              if (playing === audio.id) {
                                stopPlaying();
                              } else {
                                playAudio(audio.id);
                              }
                            }}
                          >
                            {playing === audio.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{audio.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(audio.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Volume2 className="w-3 h-3" />
                                {audio.usageCount} usos
                              </span>
                            </div>
                            {audio.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {audio.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-[10px]">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 shrink-0">
                            {onSelectAudio && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  onSelectAudio(audio);
                                  onOpenChange(false);
                                }}
                              >
                                Usar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteAudio(audio.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Record Tab */}
          <TabsContent value="record" className="flex-1 flex flex-col min-h-0 mt-4">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Recording Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {!recording && !pendingAudio && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <Button
                    size="lg"
                    className="w-24 h-24 rounded-full mb-4"
                    onClick={handleStartRecording}
                  >
                    <Mic className="w-10 h-10" />
                  </Button>
                  <p className="text-muted-foreground">Clique para gravar</p>
                </motion.div>
              )}

              {recording && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-24 h-24 rounded-full bg-destructive flex items-center justify-center mb-4 mx-auto"
                  >
                    <Mic className="w-10 h-10 text-destructive-foreground" />
                  </motion.div>
                  
                  <p className="text-3xl font-mono font-bold mb-2">
                    {formatDuration(recordingTime)}
                  </p>
                  <p className="text-muted-foreground mb-6">Gravando...</p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={handleCancelRecording}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleStopRecording}
                      className="gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Parar
                    </Button>
                  </div>
                </motion.div>
              )}

              {pendingAudio && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-md space-y-4"
                >
                  {/* Preview */}
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-lg font-mono mb-1">
                      {formatDuration(pendingAudio.duration)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Áudio gravado com sucesso
                    </p>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="audio-name">Nome do áudio *</Label>
                      <Input
                        id="audio-name"
                        value={audioName}
                        onChange={(e) => setAudioName(e.target.value)}
                        placeholder="Ex: Saudação inicial"
                      />
                    </div>

                    <div>
                      <Label htmlFor="audio-description">Descrição (opcional)</Label>
                      <Textarea
                        id="audio-description"
                        value={audioDescription}
                        onChange={(e) => setAudioDescription(e.target.value)}
                        placeholder="Uma breve descrição do áudio..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Tags (opcional)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Adicionar tag..."
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        />
                        <Button variant="outline" size="icon" onClick={handleAddTag}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {audioTags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {audioTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                              {tag}
                              <button onClick={() => handleRemoveTag(tag)}>
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelRecording}
                    >
                      Descartar
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleSaveAudio}
                      disabled={!audioName.trim() || saving}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Salvando...' : 'Salvar na Biblioteca'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
