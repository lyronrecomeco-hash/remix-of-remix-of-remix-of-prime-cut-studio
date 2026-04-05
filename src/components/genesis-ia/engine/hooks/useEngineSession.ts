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

  const loadSession = useCallback(async () => {
    if (!affiliateId || !proposal) return;
    setLoading(true);

    try {
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
        const qa = (proposal.questionnaire_answers || {}) as any;
        
        // Create a meaningful initial structure
        const prospectNode: EngineNode = {
          id: 'prospect-1',
          type: 'engineNode',
          position: { x: 80, y: 250 },
          data: {
            label: proposal.company_name,
            content: [
              `Empresa: ${proposal.company_name}`,
              proposal.contact_name ? `Contato: ${proposal.contact_name}` : null,
              proposal.company_phone ? `Telefone: ${proposal.company_phone}` : null,
              proposal.company_email ? `Email: ${proposal.company_email}` : null,
              qa.niche ? `Nicho: ${qa.niche}` : null,
              qa.address ? `Endereço: ${qa.address}` : null,
              qa.city ? `Cidade: ${qa.city}` : null,
              qa.state ? `Estado: ${qa.state}` : null,
              qa.website ? `Website: ${qa.website}` : null,
              qa.instagram ? `Instagram: ${qa.instagram}` : null,
              qa.services ? `Serviços: ${qa.services}` : null,
              qa.opening_hours ? `Horário: ${qa.opening_hours}` : null,
            ].filter(Boolean).join('\n'),
            nodeType: 'prospect',
            icon: 'Building2',
            color: '#3b82f6',
          },
        };

        const diagnosisNode: EngineNode = {
          id: 'diagnosis-1',
          type: 'engineNode',
          position: { x: 400, y: 150 },
          data: {
            label: 'Diagnóstico',
            content: '',
            nodeType: 'diagnosis',
            icon: 'Search',
            color: '#8b5cf6',
            description: 'Análise da situação atual',
          },
        };

        const strategyNode: EngineNode = {
          id: 'strategy-1',
          type: 'engineNode',
          position: { x: 400, y: 350 },
          data: {
            label: 'Estratégia',
            content: '',
            nodeType: 'strategy',
            icon: 'Target',
            color: '#f59e0b',
            description: 'Plano estratégico',
          },
        };

        const initialNodes = [prospectNode, diagnosisNode, strategyNode];
        const initialEdges: EngineEdge[] = [
          { id: 'e-p-d', source: 'prospect-1', target: 'diagnosis-1', animated: true },
          { id: 'e-p-s', source: 'prospect-1', target: 'strategy-1', animated: true },
        ];

        const prospectContext = {
          company_name: proposal.company_name,
          contact_name: proposal.contact_name,
          company_phone: proposal.company_phone,
          company_email: proposal.company_email,
          company_cnpj: proposal.company_cnpj,
          company_website: qa.website || null,
          company_address: qa.address || null,
          company_city: qa.city || null,
          company_state: qa.state || null,
          instagram: qa.instagram || null,
          services: qa.services || null,
          opening_hours: qa.opening_hours || null,
          notes: proposal.notes,
          questionnaire_answers: proposal.questionnaire_answers,
          niche: qa.niche,
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

  const addNode = useCallback((type: string) => {
    const catalog = NODE_CATALOG.find(n => n.type === type);
    if (!catalog) return;

    const newNode: EngineNode = {
      id: `${type}-${Date.now()}`,
      type: type === 'whatsapp' ? 'whatsappNode' : 'engineNode',
      position: { x: 250 + Math.random() * 200, y: 200 + Math.random() * 150 },
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

  // Add multiple nodes at once (for AI canvas actions)
  const addMultipleNodes = useCallback((newNodesData: any[], newEdgesData?: any[]) => {
    const timestamp = Date.now();
    const createdNodes: EngineNode[] = newNodesData.map((nd, i) => {
      const catalog = NODE_CATALOG.find(n => n.type === nd.type);
      return {
        id: nd.id || `${nd.type}-${timestamp}-${i}`,
        type: nd.type === 'whatsapp' ? 'whatsappNode' : 'engineNode',
        position: nd.position || { x: 400 + (i % 3) * 280, y: 100 + Math.floor(i / 3) * 200 },
        data: {
          label: nd.label || catalog?.label || nd.type,
          content: nd.content || '',
          nodeType: nd.type,
          icon: catalog?.icon || 'StickyNote',
          color: catalog?.color || '#3b82f6',
          description: catalog?.description,
        },
      };
    });

    const createdEdges: EngineEdge[] = (newEdgesData || []).map((ed: any, i: number) => ({
      id: ed.id || `e-ai-${timestamp}-${i}`,
      source: ed.source,
      target: ed.target,
      animated: true,
    }));

    const updatedNodes = [...nodes, ...createdNodes];
    const updatedEdges = [...edges, ...createdEdges];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    saveSession(updatedNodes, updatedEdges);
  }, [nodes, edges, saveSession]);

  const updateNodes = useCallback((newNodes: EngineNode[]) => {
    setNodes(newNodes);
    saveSession(newNodes, edges);
  }, [edges, saveSession]);

  const updateEdges = useCallback((newEdges: EngineEdge[]) => {
    setEdges(newEdges);
    saveSession(nodes, newEdges);
  }, [nodes, saveSession]);

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
    addMultipleNodes,
    createSnapshot,
    loadSession,
  };
}
