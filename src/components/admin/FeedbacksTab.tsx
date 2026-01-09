import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Copy, Star, Check, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeedback, Feedback } from '@/contexts/FeedbackContext';
import { useNotification } from '@/contexts/NotificationContext';
import FeatureLock from '@/components/subscription/FeatureLock';

export default function FeedbacksTab() {
  const { feedbacks, updateFeedbackStatus, getNewFeedbacksCount, deleteFeedback } = useFeedback();
  const { notify } = useNotification();

  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'new' | 'published' | 'archived'>('all');
  const newFeedbacksCount = getNewFeedbacksCount();

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (feedbackFilter === 'all') return f.status !== 'archived';
    return f.status === feedbackFilter;
  });

  const handleCopyFeedbackLink = () => {
    const currentDomain = window.location.origin;
    const feedbackLink = `${currentDomain}/avaliar`;
    navigator.clipboard.writeText(feedbackLink);
    notify.success('Link copiado!', feedbackLink);
  };

  const handlePublishFeedback = (id: string) => {
    updateFeedbackStatus(id, 'published');
    notify.success('Feedback publicado no site');
  };

  return (
    <FeatureLock feature="feedbacks">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Gerenciar Feedbacks</h2>
          {newFeedbacksCount > 0 && (
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
              {newFeedbacksCount} novo(s)
            </span>
          )}
        </div>

        {/* Generate link */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" />
            Gerar Link de Avaliação
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Compartilhe este link com seus clientes para coletar avaliações
          </p>
          <Button variant="hero" onClick={handleCopyFeedbackLink}>
            <Copy className="w-4 h-4" />
            Copiar Link
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'new', 'published', 'archived'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFeedbackFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                feedbackFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {filter === 'all' && 'Todos'}
              {filter === 'new' && `Novos (${newFeedbacksCount})`}
              {filter === 'published' && 'Publicados'}
              {filter === 'archived' && 'Arquivados'}
            </button>
          ))}
        </div>

        {/* Feedbacks list */}
        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum feedback encontrado</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onPublish={() => handlePublishFeedback(feedback.id)}
                onArchive={() => updateFeedbackStatus(feedback.id, 'archived')}
                onMarkRead={() => updateFeedbackStatus(feedback.id, 'read')}
                onDelete={() => deleteFeedback(feedback.id)}
              />
            ))
          )}
        </div>
      </div>
    </FeatureLock>
  );
}

function FeedbackCard({
  feedback,
  onPublish,
  onArchive,
  onMarkRead,
  onDelete,
}: {
  feedback: Feedback;
  onPublish: () => void;
  onArchive: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const isNew = feedback.status === 'new';
  const isPublished = feedback.status === 'published';

  return (
    <motion.div
      layout
      className={`glass-card rounded-xl p-4 relative ${isNew ? 'ring-2 ring-primary/50' : ''}`}
    >
      {isNew && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
          NOVO
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
          {feedback.avatarUrl ? (
            <img src={feedback.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {feedback.isAnonymous ? '?' : feedback.name[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{feedback.name}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= feedback.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(feedback.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm">{feedback.text}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        {isNew && (
          <Button variant="ghost" size="sm" onClick={onMarkRead}>
            <Check className="w-4 h-4" />
            Marcar como lido
          </Button>
        )}
        {!isPublished && (
          <Button variant="hero" size="sm" onClick={onPublish}>
            <Eye className="w-4 h-4" />
            Publicar no site
          </Button>
        )}
        {isPublished && (
          <span className="text-sm text-primary flex items-center gap-1">
            <Check className="w-4 h-4" />
            Publicado
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={onArchive} className="ml-auto">
          Arquivar
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
