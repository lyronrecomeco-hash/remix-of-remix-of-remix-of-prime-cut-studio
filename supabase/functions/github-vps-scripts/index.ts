import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/plain; charset=utf-8",
};

serve(async (req: Request) => {
  console.log("GitHub VPS Scripts - Request received");
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const scriptType = url.searchParams.get("type") || "full";
    console.log("Script type requested:", scriptType);

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
      console.log("No active config found");
      return new Response(
        `#!/bin/bash\necho "Nenhuma configuração GitHub ativa encontrada"\nexit 1`,
        { headers: corsHeaders }
      );
    }

    console.log("Config found:", config.repository_url);

    const repoUrl = config.repository_url;
    const branch = config.branch;
    const projectName = config.project_name;
    const installPath = config.install_path;
    const pm2AppName = config.pm2_app_name;
    const nodeVersion = config.node_version;

    let script = "";

    if (scriptType === "install") {
      script = getInstallScript(repoUrl, branch, projectName, installPath, pm2AppName, nodeVersion);
    } else if (scriptType === "update") {
      script = getUpdateScript(repoUrl, branch, installPath, pm2AppName);
    } else {
      script = getFullScript(repoUrl, branch, projectName, installPath, pm2AppName, nodeVersion);
    }

    console.log("Script generated successfully");
    return new Response(script, { headers: corsHeaders });
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      `#!/bin/bash\necho "Erro interno: ${errorMessage}"\nexit 1`,
      { headers: corsHeaders }
    );
  }
});

function getInstallScript(repoUrl: string, branch: string, projectName: string, installPath: string, pm2AppName: string, nodeVersion: string): string {
  return `#!/bin/bash
set -e

echo "=============================================="
echo "  ${projectName} - INSTALAÇÃO"
echo "=============================================="

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

log_info() { echo -e "\${GREEN}[INFO]\${NC} \$1"; }
log_warn() { echo -e "\${YELLOW}[WARN]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }

if [ "\$EUID" -ne 0 ]; then
  log_error "Execute como root: sudo bash <(curl -fsSL URL)"
  exit 1
fi

REPO_URL="${repoUrl}"
BRANCH="${branch}"
INSTALL_PATH="${installPath}"
PM2_APP="${pm2AppName}"
NODE_VERSION="${nodeVersion}"

log_info "Repositório: \$REPO_URL"
log_info "Branch: \$BRANCH"

log_info "Atualizando sistema..."
apt-get update -y
apt-get install -y curl wget git build-essential

if ! command -v node &> /dev/null; then
  log_info "Instalando Node.js v\$NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_\${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
  log_info "Instalando PM2..."
  npm install -g pm2
  pm2 startup
fi

if [ -d "\$INSTALL_PATH" ]; then
  log_warn "Fazendo backup..."
  mv "\$INSTALL_PATH" "\${INSTALL_PATH}_backup_\$(date +%Y%m%d_%H%M%S)"
fi

log_info "Clonando repositório..."
git clone --branch \$BRANCH \$REPO_URL \$INSTALL_PATH
cd \$INSTALL_PATH

log_info "Instalando dependências..."
npm install --production

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  log_warn "Configure o .env em \$INSTALL_PATH/.env"
fi

log_info "Iniciando com PM2..."
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
`;
}

function getUpdateScript(repoUrl: string, branch: string, installPath: string, pm2AppName: string): string {
  return `#!/bin/bash
set -e

echo "=============================================="
echo "  ATUALIZAÇÃO AUTOMÁTICA"
echo "=============================================="

GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
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
}

function getFullScript(repoUrl: string, branch: string, projectName: string, installPath: string, pm2AppName: string, nodeVersion: string): string {
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

REPO_URL="${repoUrl}"
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
}
