import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/plain; charset=utf-8",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const scriptType = url.searchParams.get("type") || "full";

    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch config
    const { data: config, error } = await supabase
      .from("owner_github_config")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        `#!/bin/bash\necho "Erro ao buscar configuração: ${error.message}"\nexit 1`,
        { headers: corsHeaders }
      );
    }

    if (!config) {
      return new Response(
        `#!/bin/bash\necho "Nenhuma configuração GitHub ativa encontrada"\nexit 1`,
        { headers: corsHeaders }
      );
    }

    const {
      repository_url,
      branch,
      project_name,
      install_path,
      pm2_app_name,
      node_version,
    } = config;

    // Generate scripts based on type
    let script = "";

    if (scriptType === "install") {
      script = generateInstallScript({
        repository_url,
        branch,
        project_name,
        install_path,
        pm2_app_name,
        node_version,
      });
    } else if (scriptType === "update") {
      script = generateUpdateScript({
        repository_url,
        branch,
        install_path,
        pm2_app_name,
      });
    } else {
      // Full script - detect and do both
      script = generateFullScript({
        repository_url,
        branch,
        project_name,
        install_path,
        pm2_app_name,
        node_version,
      });
    }

    return new Response(script, { headers: corsHeaders });
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      `#!/bin/bash\necho "Erro interno: ${errorMessage}"\nexit 1`,
      { headers: corsHeaders }
    );
  }
});

interface ScriptConfig {
  repository_url: string;
  branch: string;
  project_name: string;
  install_path: string;
  pm2_app_name: string;
  node_version: string;
}

function generateInstallScript(config: ScriptConfig): string {
  return `#!/bin/bash
set -e

# ============================================================
# ${config.project_name.toUpperCase()} - SCRIPT DE INSTALAÇÃO
# Gerado automaticamente pelo Owner Panel
# ============================================================

echo "=============================================="
echo "  ${config.project_name} - INSTALAÇÃO"
echo "=============================================="

# Cores
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

log_info() { echo -e "\${GREEN}[INFO]\${NC} \$1"; }
log_warn() { echo -e "\${YELLOW}[WARN]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }

# Verificar root
if [ "\$EUID" -ne 0 ]; then
  log_error "Execute como root: sudo bash <(curl -fsSL URL)"
  exit 1
fi

# Variáveis
REPO_URL="${config.repository_url}"
BRANCH="${config.branch}"
INSTALL_PATH="${config.install_path}"
PM2_APP="${config.pm2_app_name}"
NODE_VERSION="${config.node_version}"

log_info "Repositório: \$REPO_URL"
log_info "Branch: \$BRANCH"
log_info "Instalação: \$INSTALL_PATH"

# ============================================================
# 1. ATUALIZAR SISTEMA
# ============================================================
log_info "Atualizando sistema..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget git build-essential

# ============================================================
# 2. INSTALAR NODE.JS
# ============================================================
if ! command -v node &> /dev/null; then
  log_info "Instalando Node.js v\$NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_\${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
else
  log_info "Node.js já instalado: \$(node -v)"
fi

# ============================================================
# 3. INSTALAR PM2
# ============================================================
if ! command -v pm2 &> /dev/null; then
  log_info "Instalando PM2..."
  npm install -g pm2
  pm2 startup
else
  log_info "PM2 já instalado"
fi

# ============================================================
# 4. CLONAR REPOSITÓRIO
# ============================================================
if [ -d "\$INSTALL_PATH" ]; then
  log_warn "Diretório \$INSTALL_PATH já existe. Fazendo backup..."
  mv "\$INSTALL_PATH" "\${INSTALL_PATH}_backup_\$(date +%Y%m%d_%H%M%S)"
fi

log_info "Clonando repositório..."
git clone --branch \$BRANCH \$REPO_URL \$INSTALL_PATH
cd \$INSTALL_PATH

# ============================================================
# 5. INSTALAR DEPENDÊNCIAS
# ============================================================
log_info "Instalando dependências..."
if [ -f "package.json" ]; then
  npm install --production
fi

# ============================================================
# 6. CONFIGURAR .ENV (SE NECESSÁRIO)
# ============================================================
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  log_info "Criando arquivo .env a partir do exemplo..."
  cp .env.example .env
  log_warn "IMPORTANTE: Configure o arquivo .env em \$INSTALL_PATH/.env"
fi

# ============================================================
# 7. INICIAR COM PM2
# ============================================================
log_info "Iniciando aplicação com PM2..."
pm2 delete \$PM2_APP 2>/dev/null || true

# Verificar arquivo de entrada
if [ -f "src/index.js" ]; then
  pm2 start src/index.js --name \$PM2_APP
elif [ -f "index.js" ]; then
  pm2 start index.js --name \$PM2_APP
elif [ -f "dist/index.js" ]; then
  pm2 start dist/index.js --name \$PM2_APP
else
  log_warn "Arquivo de entrada não encontrado. Configure manualmente."
fi

pm2 save

# ============================================================
# FINALIZADO
# ============================================================
echo ""
echo "=============================================="
echo -e "\${GREEN}  INSTALAÇÃO CONCLUÍDA COM SUCESSO!\${NC}"
echo "=============================================="
echo ""
echo "  Diretório: \$INSTALL_PATH"
echo "  PM2 App: \$PM2_APP"
echo ""
echo "  Comandos úteis:"
echo "    pm2 logs \$PM2_APP    - Ver logs"
echo "    pm2 restart \$PM2_APP - Reiniciar"
echo "    pm2 status           - Ver status"
echo ""
`;
}

function generateUpdateScript(config: Partial<ScriptConfig>): string {
  return `#!/bin/bash
set -e

# ============================================================
# SCRIPT DE ATUALIZAÇÃO
# Gerado automaticamente pelo Owner Panel
# ============================================================

echo "=============================================="
echo "  ATUALIZAÇÃO AUTOMÁTICA"
echo "=============================================="

# Cores
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

log_info() { echo -e "\${GREEN}[INFO]\${NC} \$1"; }
log_warn() { echo -e "\${YELLOW}[WARN]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }

# Variáveis
INSTALL_PATH="${config.install_path}"
PM2_APP="${config.pm2_app_name}"
BRANCH="${config.branch}"

# Verificar se diretório existe
if [ ! -d "\$INSTALL_PATH" ]; then
  log_error "Diretório \$INSTALL_PATH não encontrado!"
  log_error "Execute o script de instalação primeiro."
  exit 1
fi

cd \$INSTALL_PATH

# Salvar hash atual
OLD_HASH=\$(git rev-parse HEAD 2>/dev/null || echo "none")

# Buscar atualizações
log_info "Verificando atualizações..."
git fetch origin \$BRANCH

# Verificar se há mudanças
NEW_HASH=\$(git rev-parse origin/\$BRANCH)

if [ "\$OLD_HASH" = "\$NEW_HASH" ]; then
  log_info "Nenhuma atualização disponível."
  exit 0
fi

log_info "Atualização encontrada! Aplicando..."

# Fazer pull
git reset --hard origin/\$BRANCH
git pull origin \$BRANCH

# Reinstalar dependências se package.json mudou
if git diff --name-only \$OLD_HASH \$NEW_HASH | grep -q "package.json"; then
  log_info "package.json alterado. Reinstalando dependências..."
  npm install --production
fi

# Reiniciar PM2
log_info "Reiniciando aplicação..."
pm2 reload \$PM2_APP || pm2 restart \$PM2_APP

log_info "Atualização concluída!"
echo "  Versão anterior: \${OLD_HASH:0:7}"
echo "  Versão atual: \${NEW_HASH:0:7}"
`;
}

function generateFullScript(config: ScriptConfig): string {
  return `#!/bin/bash
set -e

# ============================================================
# ${config.project_name.toUpperCase()} - SCRIPT COMPLETO
# Detecta automaticamente: instalação ou atualização
# Gerado automaticamente pelo Owner Panel
# ============================================================

echo "=============================================="
echo "  ${config.project_name} - DEPLOY AUTOMÁTICO"
echo "=============================================="

# Cores
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m'

log_info() { echo -e "\${GREEN}[INFO]\${NC} \$1"; }
log_warn() { echo -e "\${YELLOW}[WARN]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }
log_step() { echo -e "\${BLUE}[STEP]\${NC} \$1"; }

# Variáveis
REPO_URL="${config.repository_url}"
BRANCH="${config.branch}"
INSTALL_PATH="${config.install_path}"
PM2_APP="${config.pm2_app_name}"
NODE_VERSION="${config.node_version}"

# ============================================================
# DETECTAR MODO: INSTALAÇÃO OU ATUALIZAÇÃO
# ============================================================
if [ -d "\$INSTALL_PATH/.git" ]; then
  MODE="update"
  log_info "Modo: ATUALIZAÇÃO"
else
  MODE="install"
  log_info "Modo: INSTALAÇÃO"
fi

# ============================================================
# MODO INSTALAÇÃO
# ============================================================
if [ "\$MODE" = "install" ]; then
  
  # Verificar root
  if [ "\$EUID" -ne 0 ]; then
    log_error "Execute como root: sudo bash <(curl -fsSL URL)"
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
    log_warn "Configure o arquivo .env em \$INSTALL_PATH/.env"
  fi

  log_step "7/7 - Iniciando com PM2..."
  pm2 delete \$PM2_APP 2>/dev/null || true
  
  if [ -f "src/index.js" ]; then
    pm2 start src/index.js --name \$PM2_APP
  elif [ -f "index.js" ]; then
    pm2 start index.js --name \$PM2_APP
  elif [ -f "dist/index.js" ]; then
    pm2 start dist/index.js --name \$PM2_APP
  else
    log_warn "Configure o arquivo de entrada manualmente"
  fi
  
  pm2 save

  echo ""
  echo -e "\${GREEN}=============================================="
  echo "  INSTALAÇÃO CONCLUÍDA!"
  echo "=============================================\${NC}"
  echo ""
  echo "  Diretório: \$INSTALL_PATH"
  echo "  PM2: pm2 logs \$PM2_APP"
  echo ""

# ============================================================
# MODO ATUALIZAÇÃO
# ============================================================
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

  # Reinstalar deps se necessário
  if git diff --name-only \$OLD_HASH \$NEW_HASH | grep -q "package.json"; then
    log_info "Reinstalando dependências..."
    npm install --production
  fi

  log_step "3/3 - Reiniciando serviço..."
  pm2 reload \$PM2_APP 2>/dev/null || pm2 restart \$PM2_APP

  echo ""
  echo -e "\${GREEN}=============================================="
  echo "  ATUALIZAÇÃO CONCLUÍDA!"
  echo "=============================================\${NC}"
  echo ""
  echo "  De: \${OLD_HASH:0:7}"
  echo "  Para: \${NEW_HASH:0:7}"
  echo ""
fi
`;
}
