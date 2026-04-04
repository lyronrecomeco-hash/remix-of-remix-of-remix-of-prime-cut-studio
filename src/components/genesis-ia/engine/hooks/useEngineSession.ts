import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { EngineNode, EngineEdge, EngineSession, ProposalForEngine } from '../types';
import { NODE_CATALOG } from '../types';

export function useEngineSession(affiliateId: string | null, proposal: ProposalForEngine | null) {
  const [session, setSession] = useState<EngineSession | null>(null);
  const [nodes, setNodes] = useState<EngineNode[]>([]);
  const [edges, setEdges] = useState<EngineEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load or create session
  const loadSession = useCallback(async () => {
    if (!affiliateId || !proposal) return;
    setLoading(true);

    try {
      // Check for existing session
      const { data: existing } = await supabase
        .from('engine_sessions')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .eq('proposal_id', proposal.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const s = existing as unknown as EngineSession;
        setSession(s);
        setNodes(s.nodes || []);
        setEdges(s.edges || []);
      } else {
        // Create initial session with prospect node
        const qa = proposal.questionnaire_answers || {};
        const prospectNode: EngineNode = {
          id: 'prospect-1',
          type: 'engineNode',
          position: { x: 100, y: 200 },
          data: {
            label: proposal.company_name,
            content: `Empresa: ${proposal.company_name}\nContato: ${proposal.contact_name || 'N/A'}\nTelefone: ${proposal.company_phone || 'N/A'}\nEmail: ${proposal.company_email || 'N/A'}\nNicho: ${(qa as any).niche || 'N/A'}`,
            nodeType: 'prospect',
            icon: 'Building2',
            color: '#3b82f6',
          },
        };

        const diagnosisNode: EngineNode = {
          id: 'diagnosis-1',
          type: 'engineNode',
          position: { x: 450, y: 100 },
          data: {
            label: 'Diagnóstico',
            content: '',
            nodeType: 'diagnosis',
            icon: 'Search',
            color: '#8b5cf6',
          },
        };

        const offerNode: EngineNode = {
          id: 'offer-1',
          type: 'engineNode',
          position: { x: 450, y: 320 },
          data: {
            label: 'Oferta',
            content: '',
            nodeType: 'offer',
            icon: 'Zap',
            color: '#f59e0b',
          },
        };

        const initialNodes = [prospectNode, diagnosisNode, offerNode];
        const initialEdges: EngineEdge[] = [
          { id: 'e-p-d', source: 'prospect-1', target: 'diagnosis-1' },
          { id: 'e-p-o', source: 'prospect-1', target: 'offer-1' },
        ];

        const prospectContext = {
          company_name: proposal.company_name,
          contact_name: proposal.contact_name,
          company_phone: proposal.company_phone,
          company_email: proposal.company_email,
          company_cnpj: proposal.company_cnpj,
          notes: proposal.notes,
          questionnaire_answers: proposal.questionnaire_answers,
        };

        const { data: newSession, error } = await supabase
          .from('engine_sessions')
          .insert({
            affiliate_id: affiliateId,
            proposal_id: proposal.id,
            title: `Engine - ${proposal.company_name}`,
            nodes: initialNodes as any,
            edges: initialEdges as any,
            prospect_context: prospectContext as any,
          })
          .select('*')
          .single();

        if (error) throw error;
        const s = newSession as unknown as EngineSession;
        setSession(s);
        setNodes(initialNodes);
        setEdges(initialEdges);
      }
    } catch (err) {
      console.error('Error loading engine session:', err);
      toast.error('Erro ao carregar sessão do Engine');
    } finally {
      setLoading(false);
    }
  }, [affiliateId, proposal]);

  // Autosave with debounce
  const saveSession = useCallback(async (newNodes: EngineNode[], newEdges: EngineEdge[]) => {
    if (!session) return;
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        await supabase
          .from('engine_sessions')
          .update({
            nodes: newNodes as any,
            edges: newEdges as any,
          })
          .eq('id', session.id);
      } catch (err) {
        console.error('Autosave error:', err);
      } finally {
        setSaving(false);
      }
    }, 2000);
  }, [session]);

  // Add node
  const addNode = useCallback((type: string) => {
    const catalog = NODE_CATALOG.find(n => n.type === type);
    if (!catalog) return;

    const newNode: EngineNode = {
      id: `${type}-${Date.now()}`,
      type: 'engineNode',
      position: { x: 200 + Math.random() * 300, y: 150 + Math.random() * 200 },
      data: {
        label: catalog.label,
        content: '',
        nodeType: catalog.type,
        icon: catalog.icon,
        color: catalog.color,
        description: catalog.description,
      },
    };

    const updated = [...nodes, newNode];
    setNodes(updated);
    saveSession(updated, edges);
    return newNode;
  }, [nodes, edges, saveSession]);

  // Update nodes/edges
  const updateNodes = useCallback((newNodes: EngineNode[]) => {
    setNodes(newNodes);
    saveSession(newNodes, edges);
  }, [edges, saveSession]);

  const updateEdges = useCallback((newEdges: EngineEdge[]) => {
    setEdges(newEdges);
    saveSession(nodes, newEdges);
  }, [nodes, saveSession]);

  // Create snapshot
  const createSnapshot = useCallback(async (label?: string) => {
    if (!session) return;
    try {
      await supabase.from('engine_snapshots').insert({
        session_id: session.id,
        nodes: nodes as any,
        edges: edges as any,
        label: label || `Snapshot ${new Date().toLocaleString('pt-BR')}`,
      });
      toast.success('Snapshot salvo!');
    } catch (err) {
      toast.error('Erro ao salvar snapshot');
    }
  }, [session, nodes, edges]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    nodes,
    edges,
    loading,
    saving,
    setNodes: updateNodes,
    setEdges: updateEdges,
    addNode,
    createSnapshot,
    loadSession,
  };
}
