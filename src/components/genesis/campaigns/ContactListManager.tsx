import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Search,
  FileSpreadsheet,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { toast } from 'sonner';

interface ContactList {
  id: string;
  name: string;
  description?: string;
  contact_count: number;
  is_active: boolean;
  created_at: string;
}

interface Contact {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  custom_data?: unknown;
}

interface ContactListManagerProps {
  onSelectContacts?: (contacts: Array<{ phone: string; name?: string }>) => void;
  selectionMode?: boolean;
}

export function ContactListManager({ onSelectContacts, selectionMode = false }: ContactListManagerProps) {
  const { genesisUser } = useGenesisAuth();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Form states
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [bulkContacts, setBulkContacts] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load lists
  const loadLists = useCallback(async () => {
    if (!genesisUser) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('genesis_contact_lists')
        .select('*')
        .eq('user_id', genesisUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);
    } catch (err) {
      console.error('Error loading lists:', err);
      toast.error('Erro ao carregar listas');
    } finally {
      setIsLoading(false);
    }
  }, [genesisUser]);

  // Load contacts for a list
  const loadContacts = useCallback(async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('genesis_contact_list_items')
        .select('*')
        .eq('list_id', listId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Error loading contacts:', err);
      toast.error('Erro ao carregar contatos');
    }
  }, []);

  // Create new list
  const handleCreateList = async () => {
    if (!newListName.trim() || !genesisUser) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('genesis_contact_lists')
        .insert({
          user_id: genesisUser.id,
          name: newListName.trim(),
          description: newListDescription.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setLists([data, ...lists]);
      setShowCreateModal(false);
      setNewListName('');
      setNewListDescription('');
      toast.success('Lista criada com sucesso!');
    } catch (err) {
      console.error('Error creating list:', err);
      toast.error('Erro ao criar lista');
    } finally {
      setIsSaving(false);
    }
  };

  // Add single contact
  const handleAddContact = async () => {
    if (!newContactPhone.trim() || !selectedList) return;

    setIsSaving(true);
    try {
      const cleanPhone = newContactPhone.replace(/\D/g, '');
      
      const { data, error } = await supabase
        .from('genesis_contact_list_items')
        .insert({
          list_id: selectedList.id,
          phone: cleanPhone,
          name: newContactName.trim() || null,
          email: newContactEmail.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setContacts([data, ...contacts]);
      setShowAddContactModal(false);
      setNewContactPhone('');
      setNewContactName('');
      setNewContactEmail('');
      toast.success('Contato adicionado!');
    } catch (err) {
      console.error('Error adding contact:', err);
      toast.error('Erro ao adicionar contato');
    } finally {
      setIsSaving(false);
    }
  };

  // Import contacts in bulk
  const handleImportContacts = async () => {
    if (!bulkContacts.trim() || !selectedList) return;

    setIsSaving(true);
    try {
      // Parse contacts - supports various formats:
      // phone,name,email or just phone per line
      const lines = bulkContacts.split('\n').filter(l => l.trim());
      const contactsToInsert = lines.map(line => {
        const parts = line.split(/[,;\t]/).map(p => p.trim());
        const phone = parts[0]?.replace(/\D/g, '');
        
        return {
          list_id: selectedList.id,
          phone,
          name: parts[1] || null,
          email: parts[2] || null,
        };
      }).filter(c => c.phone && c.phone.length >= 10);

      if (contactsToInsert.length === 0) {
        toast.error('Nenhum contato válido encontrado');
        return;
      }

      const { error } = await supabase
        .from('genesis_contact_list_items')
        .insert(contactsToInsert);

      if (error) throw error;

      await loadContacts(selectedList.id);
      setShowImportModal(false);
      setBulkContacts('');
      toast.success(`${contactsToInsert.length} contatos importados!`);
    } catch (err) {
      console.error('Error importing contacts:', err);
      toast.error('Erro ao importar contatos');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setBulkContacts(text);
    };
    reader.readAsText(file);
  };

  // Delete list
  const handleDeleteList = async (listId: string) => {
    try {
      await supabase
        .from('genesis_contact_lists')
        .update({ is_active: false })
        .eq('id', listId);

      setLists(lists.filter(l => l.id !== listId));
      if (selectedList?.id === listId) {
        setSelectedList(null);
        setContacts([]);
      }
      toast.success('Lista removida');
    } catch (err) {
      console.error('Error deleting list:', err);
      toast.error('Erro ao remover lista');
    }
  };

  // Delete contact
  const handleDeleteContact = async (contactId: string) => {
    try {
      await supabase
        .from('genesis_contact_list_items')
        .update({ is_active: false })
        .eq('id', contactId);

      setContacts(contacts.filter(c => c.id !== contactId));
      toast.success('Contato removido');
    } catch (err) {
      console.error('Error deleting contact:', err);
      toast.error('Erro ao remover contato');
    }
  };

  // Use contacts from list
  const handleUseContacts = () => {
    if (!onSelectContacts || contacts.length === 0) return;
    
    onSelectContacts(contacts.map(c => ({
      phone: c.phone,
      name: c.name,
    })));
    toast.success(`${contacts.length} contatos selecionados`);
  };

  // Initial load
  useState(() => {
    loadLists();
  });

  const filteredContacts = contacts.filter(c => 
    c.phone.includes(searchQuery) ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Listas de Contatos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie seus contatos para campanhas
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Lista
        </Button>
      </div>

      {/* Lists Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">Nenhuma lista criada</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Crie sua primeira lista de contatos para usar em campanhas
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Lista
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedList?.id === list.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => {
                setSelectedList(list);
                loadContacts(list.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{list.name}</h4>
                  {list.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {list.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{list.contact_count} contatos</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected List Contacts */}
      <AnimatePresence>
        {selectedList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Contatos de "{selectedList.name}"
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddContactModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
                {selectionMode && contacts.length > 0 && (
                  <Button size="sm" onClick={handleUseContacts}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Usar Contatos
                  </Button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contatos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contacts Table */}
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum contato encontrado
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm font-medium">Telefone</th>
                      <th className="text-left px-4 py-2 text-sm font-medium">Nome</th>
                      <th className="text-left px-4 py-2 text-sm font-medium">Email</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-t">
                        <td className="px-4 py-2 font-mono text-sm">{contact.phone}</td>
                        <td className="px-4 py-2 text-sm">{contact.name || '-'}</td>
                        <td className="px-4 py-2 text-sm">{contact.email || '-'}</td>
                        <td className="px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create List Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Lista de Contatos</DialogTitle>
            <DialogDescription>
              Crie uma lista para organizar seus contatos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Lista</Label>
              <Input
                placeholder="Ex: Clientes VIP"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Descrição da lista..."
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateList} disabled={isSaving || !newListName.trim()}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contact Modal */}
      <Dialog open={showAddContactModal} onOpenChange={setShowAddContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Contato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="11999999999"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome (opcional)</Label>
              <Input
                placeholder="Nome do contato"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email (opcional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddContactModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddContact} disabled={isSaving || !newContactPhone.trim()}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
            <DialogDescription>
              Cole uma lista de contatos ou faça upload de um arquivo CSV/TXT
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Arraste um arquivo ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </label>
              </Button>
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <Label>Ou cole os contatos abaixo</Label>
              <Textarea
                placeholder={`Um contato por linha:\n11999999999,Nome,email@exemplo.com\n11888888888,Outro Nome\n11777777777`}
                value={bulkContacts}
                onChange={(e) => setBulkContacts(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Formato: telefone,nome,email (nome e email são opcionais)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportContacts} disabled={isSaving || !bulkContacts.trim()}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContactListManager;
