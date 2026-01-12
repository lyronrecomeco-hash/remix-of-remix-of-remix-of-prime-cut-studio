import { useState, useCallback, useEffect } from 'react';
import type { MessageTemplate, PollTemplate, ReactionConfig } from '../types';

const TEMPLATES_KEY = 'genesis_message_templates';
const POLLS_KEY = 'genesis_poll_templates';
const REACTIONS_KEY = 'genesis_reaction_configs';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [pollTemplates, setPollTemplates] = useState<PollTemplate[]>([]);
  const [reactionConfigs, setReactionConfigs] = useState<ReactionConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
      if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
      
      const storedPolls = localStorage.getItem(POLLS_KEY);
      if (storedPolls) setPollTemplates(JSON.parse(storedPolls));
      
      const storedReactions = localStorage.getItem(REACTIONS_KEY);
      if (storedReactions) setReactionConfigs(JSON.parse(storedReactions));
    } catch (e) {
      console.error('Error loading templates:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save templates
  const saveTemplates = useCallback((newTemplates: MessageTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTemplates));
  }, []);

  // Save poll templates
  const savePollTemplates = useCallback((newPolls: PollTemplate[]) => {
    setPollTemplates(newPolls);
    localStorage.setItem(POLLS_KEY, JSON.stringify(newPolls));
  }, []);

  // Save reaction configs
  const saveReactionConfigs = useCallback((newConfigs: ReactionConfig[]) => {
    setReactionConfigs(newConfigs);
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(newConfigs));
  }, []);

  // Create message template
  const createTemplate = useCallback((template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'version'>): MessageTemplate => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      version: 1
    };
    
    saveTemplates([newTemplate, ...templates]);
    return newTemplate;
  }, [templates, saveTemplates]);

  // Update template
  const updateTemplate = useCallback((templateId: string, updates: Partial<MessageTemplate>) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: template.version + 1
    };
    
    saveTemplates(templates.map(t => t.id === templateId ? updatedTemplate : t));
  }, [templates, saveTemplates]);

  // Delete template
  const deleteTemplate = useCallback((templateId: string) => {
    saveTemplates(templates.filter(t => t.id !== templateId));
  }, [templates, saveTemplates]);

  // Create poll template
  const createPollTemplate = useCallback((poll: Omit<PollTemplate, 'id' | 'createdAt' | 'usageCount'>): PollTemplate => {
    const newPoll: PollTemplate = {
      ...poll,
      id: `poll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    
    savePollTemplates([newPoll, ...pollTemplates]);
    return newPoll;
  }, [pollTemplates, savePollTemplates]);

  // Update poll template
  const updatePollTemplate = useCallback((pollId: string, updates: Partial<PollTemplate>) => {
    savePollTemplates(pollTemplates.map(p => p.id === pollId ? { ...p, ...updates } : p));
  }, [pollTemplates, savePollTemplates]);

  // Delete poll template
  const deletePollTemplate = useCallback((pollId: string) => {
    savePollTemplates(pollTemplates.filter(p => p.id !== pollId));
  }, [pollTemplates, savePollTemplates]);

  // Create reaction config
  const createReactionConfig = useCallback((config: Omit<ReactionConfig, 'id' | 'createdAt'>): ReactionConfig => {
    const newConfig: ReactionConfig = {
      ...config,
      id: `react_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString()
    };
    
    saveReactionConfigs([newConfig, ...reactionConfigs]);
    return newConfig;
  }, [reactionConfigs, saveReactionConfigs]);

  // Update reaction config
  const updateReactionConfig = useCallback((configId: string, updates: Partial<ReactionConfig>) => {
    saveReactionConfigs(reactionConfigs.map(c => c.id === configId ? { ...c, ...updates } : c));
  }, [reactionConfigs, saveReactionConfigs]);

  // Delete reaction config
  const deleteReactionConfig = useCallback((configId: string) => {
    saveReactionConfigs(reactionConfigs.filter(c => c.id !== configId));
  }, [reactionConfigs, saveReactionConfigs]);

  // Increment usage counts
  const incrementTemplateUsage = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateTemplate(templateId, { usageCount: template.usageCount + 1 });
    }
  }, [templates, updateTemplate]);

  const incrementPollUsage = useCallback((pollId: string) => {
    const poll = pollTemplates.find(p => p.id === pollId);
    if (poll) {
      updatePollTemplate(pollId, { usageCount: poll.usageCount + 1 });
    }
  }, [pollTemplates, updatePollTemplate]);

  return {
    templates,
    pollTemplates,
    reactionConfigs,
    loading,
    // Message templates
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementTemplateUsage,
    // Poll templates
    createPollTemplate,
    updatePollTemplate,
    deletePollTemplate,
    incrementPollUsage,
    // Reaction configs
    createReactionConfig,
    updateReactionConfig,
    deleteReactionConfig
  };
};
