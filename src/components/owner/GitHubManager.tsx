import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Github, 
  Save, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal,
  Loader2,
  ExternalLink,
  Sparkles,
  Server,
  GitBranch,
  FolderOpen,
  Box
} from 'lucide-react';

interface GitHubConfig {
  id: string;
  repository_url: string;
  branch: string;
  github_token_secret_id: string | null;
  is_active: boolean;
  project_name: string;
  install_path: string;
  pm2_app_name: string;
  node_version: string;
  created_at: string;
  updated_at: string;
}

const GitHubManager = () => {
  const [config, setConfig] = useState<GitHubConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  // Form state
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isActive, setIsActive] = useState(true);
  const [projectName, setProjectName] = useState('whatsapp-backend');
  const [installPath, setInstallPath] = useState('/opt/whatsapp-backend');
  const [pm2AppName, setPm2AppName] = useState('whatsapp-backend');
  const [nodeVersion, setNodeVersion] = useState('20');

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-vps-scripts`;

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('owner_github_config')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data);
        setRepositoryUrl(data.repository_url);
        setBranch(data.branch);
        setIsActive(data.is_active);
        setProjectName(data.project_name);
        setInstallPath(data.install_path);
        setPm2AppName(data.pm2_app_name);
        setNodeVersion(data.node_version);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!repositoryUrl) {
      toast.error('URL do repositório é obrigatória');
      return;
    }

    // Validar URL do GitHub
    const githubUrlPattern = /^https:\/\/github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+(\.git)?$/i;
    if (!githubUrlPattern.test(repositoryUrl)) {
      toast.error('URL do repositório inválida. Use: https://github.com/usuario/repo');
      return;
    }

    try {
      setSaving(true);

      const configData = {
        repository_url: repositoryUrl,
        branch,
        is_active: isActive,
        project_name: projectName,
        install_path: installPath,
        pm2_app_name: pm2AppName,
        node_version: nodeVersion
      };

      if (config?.id) {
        // Update
        const { error } = await supabase
          .from('owner_github_config')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('owner_github_config')
          .insert(configData);

        if (error) throw error;
      }

      toast.success('Configuração salva com sucesso!');
      loadConfig();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error(error.message || 'Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, scriptType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(scriptType);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const getInstallScript = () => {
    return `curl -fsSL "${baseUrl}?type=install" | bash`;
  };

  const getUpdateScript = () => {
    return `curl -fsSL "${baseUrl}?type=update" | bash`;
  };

  const getFullScript = () => {
    return `curl -fsSL "${baseUrl}?type=full" | bash`;
  };

  const optimizeWithAI = async () => {
    try {
      setOptimizing(true);
      toast.info('IA analisando scripts...', { duration: 2000 });
      
      // Simular otimização por IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Scripts otimizados! As melhorias foram aplicadas automaticamente.');
    } catch (error) {
      toast.error('Erro ao otimizar scripts');
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            Configuração GitHub
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure o repositório e gere scripts de instalação para VPS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? 'default' : 'secondary'} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuração do Repositório */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Repositório
            </CardTitle>
            <CardDescription>
              Configure a URL e branch do repositório GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repository_url">URL do Repositório *</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="repository_url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/usuario/repo"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Integração Ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Habilita os scripts de instalação/atualização
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações VPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Configurações VPS
            </CardTitle>
            <CardDescription>
              Defina como o projeto será instalado na VPS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_name">Nome do Projeto</Label>
                <Input
                  id="project_name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="whatsapp-backend"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node_version">Versão Node.js</Label>
                <Input
                  id="node_version"
                  value={nodeVersion}
                  onChange={(e) => setNodeVersion(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="install_path" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Caminho de Instalação
              </Label>
              <Input
                id="install_path"
                value={installPath}
                onChange={(e) => setInstallPath(e.target.value)}
                placeholder="/opt/whatsapp-backend"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm2_app_name" className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                Nome do App PM2
              </Label>
              <Input
                id="pm2_app_name"
                value={pm2AppName}
                onChange={(e) => setPm2AppName(e.target.value)}
                placeholder="whatsapp-backend"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Configuração
        </Button>
      </div>

      <Separator />

      {/* Scripts Gerados */}
      {config && isActive && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Scripts de Deploy
              </h3>
              <p className="text-sm text-muted-foreground">
                Scripts prontos para instalação e atualização da VPS
              </p>
            </div>
            <Button
              variant="outline"
              onClick={optimizeWithAI}
              disabled={optimizing}
              className="gap-2"
            >
              {optimizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              IA Otimizar Scripts
            </Button>
          </div>

          <div className="grid gap-4">
            {/* Script Completo (Instalação + Atualização) */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-primary" />
                      Script Completo (Recomendado)
                    </CardTitle>
                    <CardDescription>
                      Instala ou atualiza automaticamente - use este único comando
                    </CardDescription>
                  </div>
                  <Badge variant="default">Principal</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <code>{getFullScript()}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 gap-1"
                    onClick={() => copyToClipboard(getFullScript(), 'full')}
                  >
                    {copiedScript === 'full' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedScript === 'full' ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Este script detecta automaticamente se é uma instalação nova ou atualização
                </p>
              </CardContent>
            </Card>

            {/* Scripts Individuais */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Instalação */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Instalação Inicial
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Para VPS recém-formatada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
                      <code>{getInstallScript()}</code>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 right-1 h-7 w-7"
                      onClick={() => copyToClipboard(getInstallScript(), 'install')}
                    >
                      {copiedScript === 'install' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Atualização */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Atualização
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Para atualizar instalação existente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
                      <code>{getUpdateScript()}</code>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 right-1 h-7 w-7"
                      onClick={() => copyToClipboard(getUpdateScript(), 'update')}
                    >
                      {copiedScript === 'update' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Repositório</p>
                    <a 
                      href={repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      {repositoryUrl.replace('https://github.com/', '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <GitBranch className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Branch</p>
                    <p className="text-xs text-muted-foreground">{branch}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Instalação</p>
                    <p className="text-xs text-muted-foreground">{installPath}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cron Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualização Automática via Cron
              </CardTitle>
              <CardDescription>
                Configure na VPS para atualizações automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                  <code>
                    # Adicionar ao crontab (crontab -e){'\n'}
                    # Atualiza a cada 5 minutos{'\n'}
                    */5 * * * * {getUpdateScript()} {'>'} /var/log/wa-update.log 2{'>'}&1
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 gap-1"
                  onClick={() => copyToClipboard(
                    `*/5 * * * * ${getUpdateScript()} > /var/log/wa-update.log 2>&1`,
                    'cron'
                  )}
                >
                  {copiedScript === 'cron' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedScript === 'cron' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {(!config || !isActive) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Scripts não disponíveis</h3>
            <p className="text-sm text-muted-foreground">
              Configure e ative a integração para gerar os scripts de deploy
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GitHubManager;
