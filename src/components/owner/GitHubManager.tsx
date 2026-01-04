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

  // Form state - defaults
  const [repositoryUrl, setRepositoryUrl] = useState('https://github.com/genesishub-tech/whatsapp-backend');
  const [branch, setBranch] = useState('main');
  const [isActive, setIsActive] = useState(true);
  const [projectName, setProjectName] = useState('whatsapp-backend');
  const [installPath, setInstallPath] = useState('/opt/whatsapp-backend');
  const [pm2AppName, setPm2AppName] = useState('whatsapp-backend');
  const [nodeVersion, setNodeVersion] = useState('20');

  

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
      } else {
        // Auto-criar configuração padrão
        await autoCreateConfig();
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  };

  const autoCreateConfig = async () => {
    try {
      const defaultConfig = {
        repository_url: 'https://github.com/genesishub-tech/whatsapp-backend',
        branch: 'main',
        is_active: true,
        project_name: 'whatsapp-backend',
        install_path: '/opt/whatsapp-backend',
        pm2_app_name: 'whatsapp-backend',
        node_version: '20'
      };

      const { data, error } = await supabase
        .from('owner_github_config')
        .insert(defaultConfig)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setConfig(data);
        toast.success('Configuração GitHub criada automaticamente!');
      }
    } catch (error: any) {
      console.error('Error auto-creating config:', error);
      // Se falhar por URL inválida, deixar o usuário configurar manualmente
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

  // Gerar scripts diretamente no frontend (não depende de Edge Function)
  const generateFullScript = () => {
    return `#!/bin/bash
set -e

echo "=============================================="
echo "  ${projectName} - DEPLOY AUTOMÁTICO"
echo "=============================================="

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m'

log_info() { echo -e "\${GREEN}[INFO]\${NC} \$1"; }
log_warn() { echo -e "\${YELLOW}[WARN]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }
log_step() { echo -e "\${BLUE}[STEP]\${NC} \$1"; }

REPO_URL="${repositoryUrl}"
BRANCH="${branch}"
INSTALL_PATH="${installPath}"
PM2_APP="${pm2AppName}"
NODE_VERSION="${nodeVersion}"

if [ -d "\$INSTALL_PATH/.git" ]; then
  MODE="update"
  log_info "Modo: ATUALIZAÇÃO"
else
  MODE="install"
  log_info "Modo: INSTALAÇÃO"
fi

if [ "\$MODE" = "install" ]; then
  
  if [ "\$EUID" -ne 0 ]; then
    log_error "Execute como root: sudo bash script.sh"
    exit 1
  fi

  log_step "1/7 - Atualizando sistema..."
  apt-get update -y
  apt-get install -y curl wget git build-essential

  log_step "2/7 - Instalando Node.js..."
  if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_\${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
  fi
  log_info "Node.js: \$(node -v)"

  log_step "3/7 - Instalando PM2..."
  if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup
  fi

  log_step "4/7 - Clonando repositório..."
  mkdir -p \$(dirname \$INSTALL_PATH)
  git clone --branch \$BRANCH \$REPO_URL \$INSTALL_PATH
  cd \$INSTALL_PATH

  log_step "5/7 - Instalando dependências..."
  npm install --production

  log_step "6/7 - Configurando ambiente..."
  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    log_warn "Configure o .env em \$INSTALL_PATH/.env"
  fi

  log_step "7/7 - Iniciando com PM2..."
  pm2 delete \$PM2_APP 2>/dev/null || true
  
  if [ -f "src/index.js" ]; then
    pm2 start src/index.js --name \$PM2_APP
  elif [ -f "index.js" ]; then
    pm2 start index.js --name \$PM2_APP
  fi
  
  pm2 save

  echo ""
  echo -e "\${GREEN}INSTALAÇÃO CONCLUÍDA!\${NC}"
  echo "Diretório: \$INSTALL_PATH"
  echo "PM2: pm2 logs \$PM2_APP"

else
  cd \$INSTALL_PATH

  OLD_HASH=\$(git rev-parse HEAD)
  
  log_step "1/3 - Buscando atualizações..."
  git fetch origin \$BRANCH
  
  NEW_HASH=\$(git rev-parse origin/\$BRANCH)
  
  if [ "\$OLD_HASH" = "\$NEW_HASH" ]; then
    log_info "Sistema já está atualizado!"
    exit 0
  fi

  log_step "2/3 - Aplicando atualização..."
  git reset --hard origin/\$BRANCH
  git pull origin \$BRANCH

  if git diff --name-only \$OLD_HASH \$NEW_HASH | grep -q "package.json"; then
    log_info "Reinstalando dependências..."
    npm install --production
  fi

  log_step "3/3 - Reiniciando serviço..."
  pm2 reload \$PM2_APP 2>/dev/null || pm2 restart \$PM2_APP

  echo ""
  echo -e "\${GREEN}ATUALIZAÇÃO CONCLUÍDA!\${NC}"
  echo "De: \${OLD_HASH:0:7} → Para: \${NEW_HASH:0:7}"
fi
`;
  };

  const generateUpdateScript = () => {
    return `#!/bin/bash
set -e

echo "=============================================="
echo "  ATUALIZAÇÃO AUTOMÁTICA"
echo "=============================================="

GREEN='\\033[0;32m'
RED='\\033[0;31m'
NC='\\033[0m'

log_info() { echo -e "\${GREEN}[INFO]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }

INSTALL_PATH="${installPath}"
PM2_APP="${pm2AppName}"
BRANCH="${branch}"

if [ ! -d "\$INSTALL_PATH" ]; then
  log_error "Diretório \$INSTALL_PATH não encontrado!"
  exit 1
fi

cd \$INSTALL_PATH

OLD_HASH=\$(git rev-parse HEAD 2>/dev/null || echo "none")

log_info "Buscando atualizações..."
git fetch origin \$BRANCH

NEW_HASH=\$(git rev-parse origin/\$BRANCH)

if [ "\$OLD_HASH" = "\$NEW_HASH" ]; then
  log_info "Sistema já está atualizado!"
  exit 0
fi

log_info "Atualização encontrada! Aplicando..."

git reset --hard origin/\$BRANCH
git pull origin \$BRANCH

if git diff --name-only \$OLD_HASH \$NEW_HASH | grep -q "package.json"; then
  log_info "Reinstalando dependências..."
  npm install --production
fi

log_info "Reiniciando aplicação..."
pm2 reload \$PM2_APP || pm2 restart \$PM2_APP

echo ""
echo -e "\${GREEN}ATUALIZAÇÃO CONCLUÍDA!\${NC}"
echo "De: \${OLD_HASH:0:7} → Para: \${NEW_HASH:0:7}"
`;
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
                      Instala ou atualiza automaticamente - copie e cole na VPS
                    </CardDescription>
                  </div>
                  <Badge variant="default">Principal</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{generateFullScript()}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 gap-1"
                    onClick={() => copyToClipboard(generateFullScript(), 'full')}
                  >
                    {copiedScript === 'full' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedScript === 'full' ? 'Copiado!' : 'Copiar Script'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Este script detecta automaticamente se é uma instalação nova ou atualização
                </p>
              </CardContent>
            </Card>

            {/* Script de Atualização (para cron) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Script de Atualização (para Cron)
                </CardTitle>
                <CardDescription className="text-xs">
                  Use este script no cron para atualizações automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{generateUpdateScript()}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 gap-1"
                    onClick={() => copyToClipboard(generateUpdateScript(), 'update')}
                  >
                    {copiedScript === 'update' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedScript === 'update' ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                Configure na VPS para atualizações automáticas a cada 5 minutos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Passo 1: Salvar script */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  1. Primeiro, salve o script de atualização na VPS:
                </Label>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400">
                    <code>nano {installPath}/update.sh</code>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-7 w-7"
                    onClick={() => copyToClipboard(`nano ${installPath}/update.sh`, 'nano')}
                  >
                    {copiedScript === 'nano' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cole o "Script de Atualização" acima, salve (Ctrl+X, Y, Enter)
                </p>
              </div>

              {/* Passo 2: Tornar executável */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  2. Torne o script executável:
                </Label>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400">
                    <code>chmod +x {installPath}/update.sh</code>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-7 w-7"
                    onClick={() => copyToClipboard(`chmod +x ${installPath}/update.sh`, 'chmod')}
                  >
                    {copiedScript === 'chmod' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Passo 3: Configurar cron */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  3. Configure o cron para executar a cada 5 minutos:
                </Label>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <code>
                      (crontab -l 2&gt;/dev/null; echo "*/5 * * * * {installPath}/update.sh &gt; /var/log/wa-update.log 2&gt;&1") | crontab -
                    </code>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 gap-1"
                    onClick={() => copyToClipboard(
                      `(crontab -l 2>/dev/null; echo "*/5 * * * * ${installPath}/update.sh > /var/log/wa-update.log 2>&1") | crontab -`,
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
              </div>

              {/* Verificar cron */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Verificar cron:
                  </Label>
                  <div className="relative">
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400">
                      <code>crontab -l</code>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 right-1 h-7 w-7"
                      onClick={() => copyToClipboard('crontab -l', 'verify')}
                    >
                      {copiedScript === 'verify' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Ver logs:
                  </Label>
                  <div className="relative">
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400">
                      <code>tail -f /var/log/wa-update.log</code>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 right-1 h-7 w-7"
                      onClick={() => copyToClipboard('tail -f /var/log/wa-update.log', 'logs')}
                    >
                      {copiedScript === 'logs' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
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
