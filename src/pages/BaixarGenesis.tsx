import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Package, CheckCircle2, Server, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const features = [
  "Site comercial completo (Landing Page)",
  "Login com autenticação PHP/MySQL",
  "Dashboard completo com glassmorphism",
  "Scanner IA, Radar Global, Propostas",
  "Biblioteca, Contratos, Promocional",
  "Financeiro, Configurações, Ajuda",
  "Painel Admin (Usuários, Pagamentos, API Keys)",
  "Dock Menu animado e responsivo",
  "Instalador automático (install.php)",
];

// ── PHP FILES ──────────────────────────────────────────────

const CONFIG_PHP = `<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'genesis_hub');
define('DB_USER', 'root');
define('DB_PASS', '');
define('APP_NAME', 'Genesis Hub');
define('APP_VERSION', '1.0.0');

session_start();

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    die("Erro de conexão: " . $e->getMessage());
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

function sanitize($str) {
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>`;

const LANDING_PHP = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genesis Hub - Seu Hub de Automação</title>
    <meta name="description" content="Crie, Gerencie e Escale. Radar de prospecção com IA, automação de WhatsApp, gerador de páginas e contratos — tudo em um só lugar.">
    <link rel="stylesheet" href="assets/css/landing.css">
</head>
<body>
    <!-- Header -->
    <header class="floating-header">
        <div class="header-inner">
            <a href="index.php" class="header-logo">
                <div class="logo-icon-header">G</div>
                <span class="logo-text">Genesis Hub</span>
            </a>
            <div class="header-sep"></div>
            <nav class="header-nav">
                <a href="#inicio" class="nav-link">Início</a>
                <a href="#recursos" class="nav-link">Recursos</a>
                <a href="#como-funciona" class="nav-link">Como Funciona</a>
                <a href="#planos" class="nav-link">Planos</a>
            </nav>
            <button class="mobile-menu-btn" onclick="toggleMobile()">☰</button>
        </div>
    </header>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <a href="#inicio" onclick="toggleMobile()">Início</a>
        <a href="#recursos" onclick="toggleMobile()">Recursos</a>
        <a href="#como-funciona" onclick="toggleMobile()">Como Funciona</a>
        <a href="#planos" onclick="toggleMobile()">Planos</a>
    </div>

    <!-- Hero -->
    <section id="inicio" class="hero-section">
        <div class="hero-bg"></div>
        <div class="container hero-content">
            <div class="trust-badge">
                <span class="pulse-dot"></span>
                <span>Assine e comece a fechar negócios hoje</span>
            </div>

            <h1 class="hero-title">
                Seu Hub de Automação<br>
                <span class="hero-typed" id="typedText"></span><span class="cursor-blink">|</span>
            </h1>

            <p class="hero-subtitle">
                Radar de prospecção com IA, automação de WhatsApp, gerador de páginas e contratos — tudo em um só lugar.
            </p>

            <div class="hero-cta">
                <a href="#planos" class="btn btn-primary btn-lg">
                    ✨ Assinar Agora →
                </a>
                <a href="#planos" class="btn btn-outline btn-lg">
                    Ver Planos
                </a>
            </div>

            <div class="trust-points">
                <span>✅ Setup em 5 minutos</span>
                <span>✅ Suporte 24h</span>
                <span>✅ Cancele quando quiser</span>
            </div>

            <!-- Dashboard Mockup -->
            <div class="mockup-wrapper">
                <div class="mockup-glow"></div>
                <div class="mockup-frame">
                    <div class="mockup-bar">
                        <div class="mockup-dots">
                            <span class="dot red"></span>
                            <span class="dot yellow"></span>
                            <span class="dot green"></span>
                        </div>
                        <div class="mockup-url">genesis-ia.app/dashboard</div>
                    </div>
                    <div class="mockup-screen">
                        <div class="mock-sidebar">
                            <div class="mock-logo">G</div>
                            <div class="mock-nav-items">
                                <div class="mock-nav active">📊 Dashboard</div>
                                <div class="mock-nav">🔍 Scanner IA</div>
                                <div class="mock-nav">📡 Radar</div>
                                <div class="mock-nav">📋 Propostas</div>
                                <div class="mock-nav">📚 Biblioteca</div>
                                <div class="mock-nav">📄 Contratos</div>
                                <div class="mock-nav">💰 Financeiro</div>
                            </div>
                        </div>
                        <div class="mock-main">
                            <div class="mock-stats">
                                <div class="mock-stat"><span class="mock-stat-val">247</span><span class="mock-stat-lbl">Prospects</span></div>
                                <div class="mock-stat"><span class="mock-stat-val">18</span><span class="mock-stat-lbl">Contratos</span></div>
                                <div class="mock-stat"><span class="mock-stat-val">R$ 12.4k</span><span class="mock-stat-lbl">Receita</span></div>
                                <div class="mock-stat"><span class="mock-stat-val">5</span><span class="mock-stat-lbl">Propostas</span></div>
                            </div>
                            <div class="mock-chart">
                                <div class="chart-bar" style="height:40%"></div>
                                <div class="chart-bar" style="height:65%"></div>
                                <div class="chart-bar" style="height:45%"></div>
                                <div class="chart-bar" style="height:80%"></div>
                                <div class="chart-bar" style="height:55%"></div>
                                <div class="chart-bar" style="height:70%"></div>
                                <div class="chart-bar" style="height:90%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Resources -->
    <section id="recursos" class="section">
        <div class="container">
            <div class="section-badge">⚡ Recursos</div>
            <h2 class="section-title">Tudo para você <span class="text-accent">vender mais</span></h2>

            <div class="resources-grid">
                <div class="resource-card active">
                    <div class="resource-icon">📡</div>
                    <h3>Radar de Prospecção</h3>
                    <p>Encontre empresas prontas para comprar. A IA analisa, qualifica e entrega leads quentes.</p>
                </div>
                <div class="resource-card">
                    <div class="resource-icon">📄</div>
                    <h3>Propostas com IA</h3>
                    <p>Crie propostas personalizadas em segundos. Argumentos que convencem e fecham.</p>
                </div>
                <div class="resource-card">
                    <div class="resource-icon">🎓</div>
                    <h3>Academia de Vendas</h3>
                    <p>Treinamentos práticos, simuladores de objeções e scripts de ligação prontos.</p>
                </div>
            </div>

            <div class="section-extra">
                <span>✨ E muito mais...</span>
            </div>
        </div>
    </section>

    <!-- Radar Showcase -->
    <section class="section section-alt">
        <div class="container">
            <div class="section-badge">✨ Clientes Prontos para Fechar Negócio</div>
            <h2 class="section-title">Veja oportunidades <span class="text-accent">reais</span></h2>
            <p class="section-desc">Empresas esperando por você. Assine e tenha acesso completo aos contatos.</p>

            <div class="radar-scroll" id="radarScroll">
                <div class="radar-track">
                    <div class="lead-card"><div class="lead-head"><span class="lead-emoji">💈</span><div><strong>Barbearia Premium</strong><span class="lead-niche">Barbearia</span></div></div><div class="lead-values"><div><small>VALOR ESTIMADO</small><strong>R$ 600</strong></div><div><small>RECORRÊNCIA</small><strong class="text-green">+R$ 50/mês</strong></div></div><div class="lead-blur"><span>🔒 Assine para ver</span></div></div>
                    <div class="lead-card"><div class="lead-head"><span class="lead-emoji">🍽️</span><div><strong>Restaurante Sabor</strong><span class="lead-niche">Restaurante</span></div></div><div class="lead-values"><div><small>VALOR ESTIMADO</small><strong>R$ 1.200</strong></div><div><small>RECORRÊNCIA</small><strong class="text-green">+R$ 80/mês</strong></div></div><div class="lead-blur"><span>🔒 Assine para ver</span></div></div>
                    <div class="lead-card"><div class="lead-head"><span class="lead-emoji">🏥</span><div><strong>Clínica Bem Estar</strong><span class="lead-niche">Clínica</span></div></div><div class="lead-values"><div><small>VALOR ESTIMADO</small><strong>R$ 2.000</strong></div><div><small>RECORRÊNCIA</small><strong class="text-green">+R$ 150/mês</strong></div></div><div class="lead-blur"><span>🔒 Assine para ver</span></div></div>
                    <div class="lead-card"><div class="lead-head"><span class="lead-emoji">🐾</span><div><strong>Pet Center Amigo</strong><span class="lead-niche">Pet Shop</span></div></div><div class="lead-values"><div><small>VALOR ESTIMADO</small><strong>R$ 900</strong></div><div><small>RECORRÊNCIA</small><strong class="text-green">+R$ 70/mês</strong></div></div><div class="lead-blur"><span>🔒 Assine para ver</span></div></div>
                    <div class="lead-card"><div class="lead-head"><span class="lead-emoji">💇</span><div><strong>Salão Beleza Total</strong><span class="lead-niche">Salão</span></div></div><div class="lead-values"><div><small>VALOR ESTIMADO</small><strong>R$ 700</strong></div><div><small>RECORRÊNCIA</small><strong class="text-green">+R$ 55/mês</strong></div></div><div class="lead-blur"><span>🔒 Assine para ver</span></div></div>
                    <div class="lead-card"><div class="lead-head"><span class="lead-emoji">🏋️</span><div><strong>Studio Fitness Pro</strong><span class="lead-niche">Academia</span></div></div><div class="lead-values"><div><small>VALOR ESTIMADO</small><strong>R$ 800</strong></div><div><small>RECORRÊNCIA</small><strong class="text-green">+R$ 90/mês</strong></div></div><div class="lead-blur"><span>🔒 Assine para ver</span></div></div>
                </div>
            </div>
        </div>
    </section>

    <!-- How it works -->
    <section id="como-funciona" class="section">
        <div class="container">
            <div class="section-badge">✨ Como Funciona</div>
            <h2 class="section-title">Do zero ao SaaS em <span class="text-accent">minutos</span></h2>
            <p class="section-desc">Um processo simples, guiado e 100% visual — sem código, sem complicação.</p>

            <div class="steps-timeline">
                <div class="step-item">
                    <div class="step-number">1</div>
                    <div class="step-card">
                        <div class="step-icon">💬</div>
                        <h3>Descreva sua ideia</h3>
                        <p>Conte o que você quer criar. Nossa IA interpreta e estrutura tudo automaticamente.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">2</div>
                    <div class="step-card">
                        <div class="step-icon">🎨</div>
                        <h3>Personalize o visual</h3>
                        <p>Escolha cores, fontes e estilo. Seu projeto já nasce com identidade profissional.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">3</div>
                    <div class="step-card">
                        <div class="step-icon">🖱️</div>
                        <h3>Gere instantaneamente</h3>
                        <p>Com um clique, seu SaaS está pronto — páginas, fluxos e estrutura completa.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">4</div>
                    <div class="step-card">
                        <div class="step-icon">🚀</div>
                        <h3>Lance e monetize</h3>
                        <p>Publique, conecte pagamentos e comece a faturar com seu produto digital.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Why Choose -->
    <section class="section section-alt">
        <div class="container">
            <div class="section-badge">✨ Diferenciais</div>
            <h2 class="section-title">Por que escolher o <span class="text-accent">Genesis Hub</span>?</h2>
            <p class="section-desc">Não somos apenas mais um gerador de sites. Somos a plataforma completa para criar, evoluir e escalar seu negócio digital.</p>

            <div class="why-grid">
                <div class="why-card why-card-main">
                    <div class="why-icon">🤖</div>
                    <h3>IA contextual</h3>
                    <p>Entendemos seu nicho, público e objetivos — e geramos estruturas otimizadas para cada cenário.</p>
                    <span class="why-tag">Prompts inteligentes</span>
                </div>
                <div class="why-card">
                    <div class="why-icon">⚡</div>
                    <h3>Evolução contínua</h3>
                    <p>Itere sobre projetos existentes sem recriar do zero. Versões, histórico e rollback.</p>
                    <span class="why-tag">Versões ilimitadas</span>
                </div>
                <div class="why-card">
                    <div class="why-icon">🎨</div>
                    <h3>Design system</h3>
                    <p>Paletas, tipografia e espaçamentos harmonizados — visual profissional sem esforço.</p>
                    <span class="why-tag">Zero design skills</span>
                </div>
                <div class="why-card">
                    <div class="why-icon">📊</div>
                    <h3>Analytics nativo</h3>
                    <p>Métricas, conversões e performance em tempo real direto do seu painel Genesis.</p>
                    <span class="why-tag">Dados ao vivo</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Partnerships -->
    <section id="parcerias" class="section">
        <div class="container">
            <div class="section-badge">✨ Nossas Parcerias</div>
            <h2 class="section-title">Conectados com as <span class="text-accent">melhores tecnologias</span></h2>
            <p class="section-desc">Parcerias estratégicas que garantem qualidade, performance e inovação contínua.</p>

            <div class="partners-grid">
                <div class="partner-card">
                    <div class="partner-logo-box">L</div>
                    <h3>Parceria com Lovable</h3>
                    <p class="partner-sub">Desenvolvimento Acelerado</p>
                    <p>Integração completa com a plataforma Lovable para desenvolvimento e deploy automático de projetos.</p>
                    <div class="partner-badge">✨ Bônus Exclusivo! — 10 créditos grátis na Lovable</div>
                    <ul class="partner-benefits">
                        <li>✅ Deploy automático de projetos</li>
                        <li>✅ Hospedagem profissional incluída</li>
                        <li>✅ Atualizações em tempo real</li>
                    </ul>
                </div>
                <div class="partner-card">
                    <div class="partner-logo-box">G</div>
                    <h3>Parceria com Google</h3>
                    <p class="partner-sub">Infraestrutura de Classe Mundial</p>
                    <p>Potencializado pela infraestrutura e IA do Google para máxima performance e confiabilidade.</p>
                    <div class="partner-badge">✨ Tecnologia Google — IA avançada e infraestrutura cloud</div>
                    <ul class="partner-benefits">
                        <li>✅ Google AI e Machine Learning</li>
                        <li>✅ Infraestrutura cloud confiável</li>
                        <li>✅ Escalabilidade garantida</li>
                    </ul>
                </div>
            </div>

            <div class="trust-bar">
                <span>🛡️ Segurança Certificada</span>
                <span>🤖 IA de Última Geração</span>
                <span>☁️ Cloud Enterprise</span>
                <span>⚡ 99.9% Uptime</span>
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <section id="planos" class="section section-alt">
        <div class="container">
            <h2 class="section-title" style="font-style:italic">Escolha o plano ideal para você</h2>
            <p class="section-desc">Planos flexíveis para todas as necessidades</p>

            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Mensal</h3>
                    <p class="pricing-tagline">Teste sem compromisso</p>
                    <div class="pricing-price">R$ 97<span>/mês</span></div>
                    <ul class="pricing-features">
                        <li>✅ Radar de Prospecção</li>
                        <li>✅ Gerador de Propostas</li>
                        <li>✅ Biblioteca de Projetos</li>
                        <li>✅ Academia de Vendas</li>
                        <li>✅ Suporte via WhatsApp</li>
                    </ul>
                    <a href="login.php" class="btn btn-outline btn-block">Assinar Mensal</a>
                </div>
                <div class="pricing-card pricing-popular">
                    <div class="popular-badge">MAIS POPULAR</div>
                    <h3>Trimestral</h3>
                    <p class="pricing-tagline">Mais economia</p>
                    <div class="pricing-old">de R$ 291</div>
                    <div class="pricing-price accent">R$ 247<span>/3 meses</span></div>
                    <ul class="pricing-features">
                        <li>✅ Tudo do Mensal</li>
                        <li>✅ Prioridade no suporte</li>
                        <li>✅ Templates premium</li>
                        <li>✅ Contratos ilimitados</li>
                        <li>✅ Multi-idioma</li>
                    </ul>
                    <div class="discount-badge">15% de desconto</div>
                    <a href="login.php" class="btn btn-primary btn-block">Assinar Trimestral</a>
                </div>
                <div class="pricing-card">
                    <h3>Anual</h3>
                    <p class="pricing-tagline">Melhor custo-benefício</p>
                    <div class="pricing-old">de R$ 1.164</div>
                    <div class="pricing-price">R$ 797<span>/ano</span></div>
                    <ul class="pricing-features">
                        <li>✅ Tudo do Trimestral</li>
                        <li>✅ Acesso vitalício a updates</li>
                        <li>✅ Consultoria 1-on-1</li>
                        <li>✅ White-label</li>
                        <li>✅ API ilimitada</li>
                    </ul>
                    <div class="discount-badge">32% de desconto</div>
                    <a href="login.php" class="btn btn-outline btn-block">Assinar Anual</a>
                </div>
            </div>

            <div class="trust-bar" style="margin-top:32px">
                <span>🛡️ Garantia 7 dias</span>
                <span>⭐ +3.500 clientes satisfeitos</span>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="section">
        <div class="container" style="max-width:800px">
            <div class="section-badge">❓ Tire Suas Dúvidas</div>
            <h2 class="section-title">Perguntas <span class="text-accent">Frequentes</span></h2>

            <div class="faq-list">
                <div class="faq-item open">
                    <button class="faq-question" onclick="toggleFaq(this)">Quanto tempo leva para começar a usar? <span class="faq-arrow">▼</span></button>
                    <div class="faq-answer">Imediatamente! Após o pagamento, você recebe acesso total ao painel em menos de 1 minuto.</div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">Preciso ter experiência com vendas ou tecnologia? <span class="faq-arrow">▼</span></button>
                    <div class="faq-answer">Não! O Genesis Hub foi criado para quem está começando. A Academia Genesis inclui treinamentos de vendas do zero.</div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">Como funciona a busca de clientes? <span class="faq-arrow">▼</span></button>
                    <div class="faq-answer">O Radar de Prospecção varre empresas por cidade e nicho, mostra quais não têm site e gera propostas automáticas com IA.</div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">E se eu não conseguir vender? <span class="faq-arrow">▼</span></button>
                    <div class="faq-answer">Garantia incondicional de 7 dias. Se não gostar, devolvemos 100% do valor — sem perguntas.</div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">Consigo atender clientes de qualquer lugar? <span class="faq-arrow">▼</span></button>
                    <div class="faq-answer">Sim! O painel funciona 100% online. Você pode prospectar em qualquer cidade do Brasil e até internacionalmente.</div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">O que está incluso no plano? <span class="faq-arrow">▼</span></button>
                    <div class="faq-answer">Acesso completo a: Radar de Prospecção com IA, Gerador de Propostas, Biblioteca de Projetos, Academia de Vendas, Gestão de Contratos e suporte via WhatsApp.</div>
                </div>
            </div>

            <div class="faq-cta">
                <p><strong>Ainda tem dúvidas?</strong> Nossa equipe responde em até 24h</p>
                <a href="https://wa.me/5511999999999" target="_blank" class="btn btn-primary">💬 Falar no WhatsApp</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
        <div class="container footer-inner">
            <a href="index.php" class="header-logo">
                <div class="logo-icon-header">G</div>
                <span class="logo-text">Genesis Hub</span>
            </a>
            <p>© 2025 GENESIS HUB. Transformando ideias em realidade.</p>
        </div>
    </footer>

    <script src="assets/js/landing.js"></script>
</body>
</html>`;

const LOGIN_PHP = `<?php
require_once 'config.php';

if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email && $password) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Email ou senha inválidos.';
        }
    } else {
        $error = 'Preencha todos os campos.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - <?= APP_NAME ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-body">
    <div class="login-container">
        <div class="login-card glass">
            <div class="login-logo">
                <div class="logo-icon">G</div>
                <h1><?= APP_NAME ?></h1>
                <p>Painel de Administração</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error"><?= sanitize($error) ?></div>
            <?php endif; ?>

            <form method="POST" class="login-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required placeholder="seu@email.com" class="form-input" value="<?= sanitize($email ?? '') ?>">
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" name="password" required placeholder="••••••••" class="form-input">
                </div>
                <button type="submit" class="btn btn-primary btn-block">Entrar</button>
            </form>
        </div>
    </div>
</body>
</html>`;

const DASHBOARD_PHP = `<?php
require_once 'config.php';
requireLogin();

$currentPage = $_GET['page'] ?? 'dashboard';
$userName = sanitize($_SESSION['user_name']);
$userRole = $_SESSION['user_role'];

// Fetch stats
$stats = [];
try {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM prospects");
    $stats['prospects'] = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM contracts WHERE status = 'active'");
    $stats['contracts'] = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COALESCE(SUM(amount),0) as total FROM financial_records WHERE type = 'income' AND MONTH(created_at) = MONTH(NOW())");
    $stats['revenue'] = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM proposals WHERE status = 'pending'");
    $stats['proposals'] = $stmt->fetch()['total'];
} catch(Exception $e) {
    $stats = ['prospects' => 0, 'contracts' => 0, 'revenue' => 0, 'proposals' => 0];
}

$menuItems = [
    ['id' => 'dashboard', 'icon' => '📊', 'label' => 'Dashboard'],
    ['id' => 'scanner', 'icon' => '🔍', 'label' => 'Scanner IA'],
    ['id' => 'radar', 'icon' => '📡', 'label' => 'Radar Global'],
    ['id' => 'proposals', 'icon' => '📋', 'label' => 'Propostas'],
    ['id' => 'library', 'icon' => '📚', 'label' => 'Biblioteca'],
    ['id' => 'contracts', 'icon' => '📄', 'label' => 'Contratos'],
    ['id' => 'promo', 'icon' => '🎯', 'label' => 'Promocional'],
    ['id' => 'financial', 'icon' => '💰', 'label' => 'Financeiro'],
    ['id' => 'settings', 'icon' => '⚙️', 'label' => 'Configurações'],
    ['id' => 'help', 'icon' => '❓', 'label' => 'Ajuda'],
];

if ($userRole === 'super_admin' || $userRole === 'admin') {
    $menuItems[] = ['id' => 'admin-users', 'icon' => '👥', 'label' => 'Usuários'];
    $menuItems[] = ['id' => 'admin-payments', 'icon' => '💳', 'label' => 'Pagamentos'];
    $menuItems[] = ['id' => 'admin-apikeys', 'icon' => '🔑', 'label' => 'API Keys'];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - <?= APP_NAME ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="dashboard-body">
    <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar glass">
            <div class="sidebar-header">
                <div class="logo-icon-sm">G</div>
                <span class="sidebar-title"><?= APP_NAME ?></span>
            </div>
            <nav class="sidebar-nav">
                <?php foreach($menuItems as $item): ?>
                    <a href="dashboard.php?page=<?= $item['id'] ?>" class="nav-item <?= $currentPage === $item['id'] ? 'active' : '' ?>">
                        <span class="nav-icon"><?= $item['icon'] ?></span>
                        <span class="nav-label"><?= $item['label'] ?></span>
                    </a>
                <?php endforeach; ?>
            </nav>
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar"><?= strtoupper(substr($userName, 0, 1)) ?></div>
                    <div>
                        <div class="user-name"><?= $userName ?></div>
                        <div class="user-role"><?= ucfirst($userRole) ?></div>
                    </div>
                </div>
                <a href="logout.php" class="btn btn-sm btn-outline">Sair</a>
            </div>
        </aside>

        <!-- Main -->
        <main class="main-content">
            <header class="content-header">
                <h2><?= sanitize(ucfirst($currentPage)) ?></h2>
                <span class="version-badge">v<?= APP_VERSION ?></span>
            </header>

            <div class="content-body">
                <?php if ($currentPage === 'dashboard'): ?>
                    <div class="stats-grid">
                        <div class="stat-card glass"><div class="stat-icon">🔍</div><div class="stat-info"><div class="stat-value"><?= $stats['prospects'] ?></div><div class="stat-label">Prospects</div></div></div>
                        <div class="stat-card glass"><div class="stat-icon">📄</div><div class="stat-info"><div class="stat-value"><?= $stats['contracts'] ?></div><div class="stat-label">Contratos Ativos</div></div></div>
                        <div class="stat-card glass"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">R$ <?= number_format($stats['revenue'], 2, ',', '.') ?></div><div class="stat-label">Receita do Mês</div></div></div>
                        <div class="stat-card glass"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value"><?= $stats['proposals'] ?></div><div class="stat-label">Propostas Pendentes</div></div></div>
                    </div>
                    <div class="welcome-card glass">
                        <h3>Bem-vindo, <?= $userName ?>!</h3>
                        <p>Use o menu lateral para navegar entre os módulos do sistema.</p>
                    </div>

                <?php elseif ($currentPage === 'scanner'): ?>
                    <?php include 'modules/scanner.php'; ?>
                <?php elseif ($currentPage === 'radar'): ?>
                    <?php include 'modules/radar.php'; ?>
                <?php elseif ($currentPage === 'proposals'): ?>
                    <?php include 'modules/proposals.php'; ?>
                <?php elseif ($currentPage === 'library'): ?>
                    <?php include 'modules/library.php'; ?>
                <?php elseif ($currentPage === 'contracts'): ?>
                    <?php include 'modules/contracts.php'; ?>
                <?php elseif ($currentPage === 'promo'): ?>
                    <?php include 'modules/promo.php'; ?>
                <?php elseif ($currentPage === 'financial'): ?>
                    <?php include 'modules/financial.php'; ?>
                <?php elseif ($currentPage === 'settings'): ?>
                    <?php include 'modules/settings.php'; ?>
                <?php elseif ($currentPage === 'help'): ?>
                    <?php include 'modules/help.php'; ?>
                <?php elseif ($currentPage === 'admin-users'): ?>
                    <?php include 'modules/admin-users.php'; ?>
                <?php elseif ($currentPage === 'admin-payments'): ?>
                    <?php include 'modules/admin-payments.php'; ?>
                <?php elseif ($currentPage === 'admin-apikeys'): ?>
                    <?php include 'modules/admin-apikeys.php'; ?>
                <?php else: ?>
                    <div class="empty-state glass"><p>Módulo não encontrado.</p></div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <!-- Dock Menu (mobile) -->
    <div class="dock-menu">
        <?php foreach(array_slice($menuItems, 0, 5) as $item): ?>
            <a href="dashboard.php?page=<?= $item['id'] ?>" class="dock-item <?= $currentPage === $item['id'] ? 'active' : '' ?>">
                <span><?= $item['icon'] ?></span>
            </a>
        <?php endforeach; ?>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>`;

const LOGOUT_PHP = `<?php
session_start();
session_destroy();
header('Location: login.php');
exit;
?>`;

const INSTALL_PHP = `<?php
$host = $_POST['db_host'] ?? 'localhost';
$name = $_POST['db_name'] ?? 'genesis_hub';
$user = $_POST['db_user'] ?? 'root';
$pass = $_POST['db_pass'] ?? '';
$admin_email = $_POST['admin_email'] ?? 'admin@genesis.com';
$admin_pass = $_POST['admin_pass'] ?? 'admin123';
$admin_name = $_POST['admin_name'] ?? 'Administrador';

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS \\\`$name\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE \\\`$name\\\`");

        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('super_admin','admin','barber','user') DEFAULT 'user',
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS prospects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            company_email VARCHAR(255),
            company_phone VARCHAR(50),
            company_website VARCHAR(255),
            niche VARCHAR(100),
            score INT DEFAULT 0,
            status ENUM('new','contacted','qualified','proposal_sent','won','lost') DEFAULT 'new',
            notes TEXT,
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS contracts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            client_email VARCHAR(255),
            service_type VARCHAR(100),
            value DECIMAL(10,2) DEFAULT 0,
            status ENUM('draft','active','completed','cancelled') DEFAULT 'draft',
            start_date DATE,
            end_date DATE,
            notes TEXT,
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS financial_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type ENUM('income','expense') NOT NULL,
            category VARCHAR(100),
            description VARCHAR(255),
            amount DECIMAL(10,2) NOT NULL,
            date DATE,
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS proposals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            contact_name VARCHAR(255),
            contact_email VARCHAR(255),
            value DECIMAL(10,2),
            status ENUM('draft','pending','sent','accepted','rejected') DEFAULT 'draft',
            content TEXT,
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS promo_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            slug VARCHAR(100) UNIQUE,
            url TEXT,
            clicks INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS api_keys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            api_key VARCHAR(255),
            service VARCHAR(100),
            is_active TINYINT(1) DEFAULT 1,
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(255),
            customer_email VARCHAR(255),
            amount DECIMAL(10,2),
            method VARCHAR(50),
            status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
            reference VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
        ";

        $pdo->exec($sql);

        // Create admin
        $hash = password_hash($admin_pass, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'super_admin')");
        $stmt->execute([$admin_name, $admin_email, $hash]);

        // Update config.php
        $configContent = '<?php' . PHP_EOL;
        $configContent .= "define('DB_HOST', '$host');" . PHP_EOL;
        $configContent .= "define('DB_NAME', '$name');" . PHP_EOL;
        $configContent .= "define('DB_USER', '$user');" . PHP_EOL;
        $configContent .= "define('DB_PASS', '$pass');" . PHP_EOL;
        $configContent .= "define('APP_NAME', 'Genesis Hub');" . PHP_EOL;
        $configContent .= "define('APP_VERSION', '1.0.0');" . PHP_EOL . PHP_EOL;
        $configContent .= 'session_start();' . PHP_EOL . PHP_EOL;
        $configContent .= 'try {' . PHP_EOL;
        $configContent .= '    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);' . PHP_EOL;
        $configContent .= '} catch(PDOException $e) { die("Erro: " . $e->getMessage()); }' . PHP_EOL . PHP_EOL;
        $configContent .= 'function isLoggedIn() { return isset($_SESSION["user_id"]); }' . PHP_EOL;
        $configContent .= 'function requireLogin() { if (!isLoggedIn()) { header("Location: login.php"); exit; } }' . PHP_EOL;
        $configContent .= 'function sanitize($str) { return htmlspecialchars(trim($str), ENT_QUOTES, "UTF-8"); }' . PHP_EOL;
        $configContent .= 'function jsonResponse($data, $code = 200) { http_response_code($code); header("Content-Type: application/json"); echo json_encode($data); exit; }' . PHP_EOL;
        $configContent .= '?>';
        file_put_contents('config.php', $configContent);

        $success = true;
    } catch(Exception $e) {
        $error = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador - Genesis Hub</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-body">
    <div class="login-container">
        <div class="login-card glass" style="max-width:500px">
            <div class="login-logo">
                <div class="logo-icon">G</div>
                <h1>Instalador Genesis Hub</h1>
                <p>Configure o banco de dados e crie o admin</p>
            </div>

            <?php if ($success): ?>
                <div class="alert alert-success">
                    ✅ Instalação concluída!<br>
                    <a href="login.php" class="btn btn-primary btn-block" style="margin-top:12px">Ir para Login</a>
                </div>
            <?php else: ?>
                <?php if ($error): ?>
                    <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                <form method="POST" class="login-form">
                    <h3 style="color:#94a3b8;margin-bottom:8px">Banco de Dados</h3>
                    <div class="form-group"><label>Host</label><input type="text" name="db_host" value="localhost" class="form-input"></div>
                    <div class="form-group"><label>Nome do Banco</label><input type="text" name="db_name" value="genesis_hub" class="form-input"></div>
                    <div class="form-group"><label>Usuário</label><input type="text" name="db_user" value="root" class="form-input"></div>
                    <div class="form-group"><label>Senha</label><input type="password" name="db_pass" class="form-input"></div>
                    <h3 style="color:#94a3b8;margin:16px 0 8px">Admin</h3>
                    <div class="form-group"><label>Nome</label><input type="text" name="admin_name" value="Administrador" class="form-input"></div>
                    <div class="form-group"><label>Email</label><input type="email" name="admin_email" value="admin@genesis.com" class="form-input"></div>
                    <div class="form-group"><label>Senha</label><input type="password" name="admin_pass" value="admin123" class="form-input"></div>
                    <button type="submit" class="btn btn-primary btn-block">Instalar</button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>`;

const STYLE_CSS = `/* Genesis Hub - Dashboard & Login CSS */
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-glass: rgba(255,255,255,0.05);
    --border-glass: rgba(255,255,255,0.1);
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --success: #22c55e;
    --danger: #ef4444;
    --warning: #f59e0b;
    --radius: 12px;
    --radius-lg: 16px;
}

body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; }

.glass {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius-lg);
}

/* Login */
.login-body { background: linear-gradient(180deg, #0f172a 0%, #1a1f3a 50%, #0f172a 100%); }
.login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.login-card { padding: 40px; width: 100%; max-width: 400px; }
.login-logo { text-align: center; margin-bottom: 32px; }
.login-logo h1 { font-size: 24px; margin-top: 16px; }
.login-logo p { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
.logo-icon { width: 72px; height: 72px; margin: 0 auto; border-radius: 16px; background: rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: var(--accent); }
.logo-icon-sm { width: 36px; height: 36px; border-radius: 8px; background: rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: var(--accent); flex-shrink: 0; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
.form-input { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; transition: border-color .2s; }
.form-input:focus { border-color: var(--accent); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; text-decoration: none; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { background: transparent; border: 1px solid var(--border-glass); color: var(--text-secondary); }
.btn-outline:hover { background: rgba(255,255,255,0.05); }
.btn-block { width: 100%; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-danger { background: var(--danger); color: #fff; }
.btn-lg { padding: 14px 28px; font-size: 16px; }

.alert { padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
.alert-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
.alert-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }

/* Dashboard */
.dashboard-body { background: var(--bg-primary); }
.dashboard-layout { display: flex; min-height: 100vh; }

.sidebar { width: 260px; display: flex; flex-direction: column; border-radius: 0; border-right: 1px solid var(--border-glass); border-top: none; border-bottom: none; border-left: none; position: fixed; top: 0; left: 0; bottom: 0; z-index: 10; }
.sidebar-header { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-glass); }
.sidebar-title { font-weight: 700; font-size: 16px; }
.sidebar-nav { flex: 1; padding: 12px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: var(--text-secondary); text-decoration: none; font-size: 14px; transition: all .2s; margin-bottom: 2px; }
.nav-item:hover, .nav-item.active { background: rgba(59,130,246,0.15); color: var(--accent); }
.nav-icon { font-size: 18px; width: 24px; text-align: center; }
.sidebar-footer { padding: 16px; border-top: 1px solid var(--border-glass); display: flex; align-items: center; justify-content: space-between; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.user-name { font-size: 13px; font-weight: 600; }
.user-role { font-size: 11px; color: var(--text-muted); }

.main-content { flex: 1; margin-left: 260px; padding: 24px; }
.content-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.content-header h2 { font-size: 22px; }
.version-badge { background: rgba(59,130,246,0.15); color: var(--accent); padding: 4px 10px; border-radius: 20px; font-size: 12px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { padding: 20px; display: flex; align-items: center; gap: 16px; }
.stat-icon { font-size: 28px; }
.stat-value { font-size: 24px; font-weight: 700; }
.stat-label { font-size: 13px; color: var(--text-muted); }

.welcome-card { padding: 24px; }
.welcome-card h3 { margin-bottom: 8px; }
.welcome-card p { color: var(--text-secondary); font-size: 14px; }

.empty-state { padding: 60px 20px; text-align: center; color: var(--text-muted); }

/* Data table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-glass); font-size: 14px; }
.data-table th { color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }

.badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-success { background: rgba(34,197,94,0.15); color: var(--success); }
.badge-warning { background: rgba(245,158,11,0.15); color: var(--warning); }
.badge-danger { background: rgba(239,68,68,0.15); color: var(--danger); }
.badge-info { background: rgba(59,130,246,0.15); color: var(--accent); }

.card { border-radius: var(--radius); padding: 20px; margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-title { font-size: 16px; font-weight: 600; }

/* Dock */
.dock-menu { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(15,23,42,0.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border-glass); padding: 8px; z-index: 50; justify-content: space-around; }
.dock-item { padding: 8px 16px; border-radius: 12px; text-decoration: none; font-size: 20px; transition: all .2s; }
.dock-item.active { background: rgba(59,130,246,0.2); }

@media (max-width: 768px) {
    .sidebar { display: none; }
    .main-content { margin-left: 0; padding-bottom: 80px; }
    .dock-menu { display: flex; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

const LANDING_CSS = `/* Genesis Hub - Landing Page CSS */
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
    --bg: #0a0e1a;
    --bg-card: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.08);
    --text: #f1f5f9;
    --text-sec: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --accent-glow: rgba(59,130,246,0.15);
    --green: #22c55e;
}

body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
a { color: inherit; text-decoration: none; }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; text-decoration: none; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-sec); }
.btn-outline:hover { background: rgba(255,255,255,0.05); }
.btn-lg { padding: 16px 32px; font-size: 16px; border-radius: 12px; }
.btn-block { width: 100%; }

/* Header */
.floating-header { position: fixed; top: 16px; left: 0; right: 0; z-index: 100; display: flex; justify-content: center; padding: 0 16px; }
.header-inner { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 999px; background: rgba(15,23,42,0.8); backdrop-filter: blur(20px); border: 1px solid var(--border); }
.header-logo { display: flex; align-items: center; gap: 8px; padding: 0 8px; }
.logo-icon-header { width: 32px; height: 32px; border-radius: 8px; background: var(--accent-glow); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent); font-size: 14px; }
.logo-text { font-weight: 700; font-size: 14px; }
.header-sep { width: 1px; height: 24px; background: var(--border); margin: 0 4px; }
.header-nav { display: flex; align-items: center; }
.nav-link { padding: 8px 16px; font-size: 14px; color: var(--text-sec); border-radius: 999px; transition: all .2s; }
.nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); }
.mobile-menu-btn { display: none; background: none; border: none; color: var(--text); font-size: 20px; cursor: pointer; padding: 4px 8px; }
.mobile-menu { display: none; position: fixed; top: 72px; left: 16px; right: 16px; z-index: 99; background: rgba(15,23,42,0.95); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 16px; padding: 16px; flex-direction: column; gap: 4px; }
.mobile-menu.open { display: flex; }
.mobile-menu a { padding: 12px 16px; color: var(--text-sec); border-radius: 12px; font-size: 14px; }
.mobile-menu a:hover { background: rgba(255,255,255,0.05); color: var(--text); }

@media (max-width: 768px) {
    .header-nav, .header-sep { display: none; }
    .mobile-menu-btn { display: block; }
    .logo-text { display: none; }
}

/* Hero */
.hero-section { min-height: 100vh; display: flex; flex-direction: column; position: relative; padding-top: 100px; }
.hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at top, var(--accent-glow), transparent 60%); pointer-events: none; }
.hero-content { position: relative; z-index: 1; text-align: center; flex: 1; }
.trust-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 999px; background: var(--bg-card); border: 1px solid var(--border); font-size: 13px; color: var(--text-sec); margin-bottom: 24px; }
.pulse-dot { position: relative; width: 8px; height: 8px; }
.pulse-dot::before { content: ''; position: absolute; inset: 0; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
.pulse-dot::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: var(--accent); }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(2); opacity: 0; } }

.hero-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px; }
.hero-typed { color: var(--accent); }
.cursor-blink { color: rgba(59,130,246,0.5); animation: blink .6s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
.hero-subtitle { font-size: 16px; color: var(--text-sec); max-width: 600px; margin: 0 auto 32px; line-height: 1.6; }
.hero-cta { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 24px; }
.trust-points { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; font-size: 13px; color: var(--text-sec); margin-bottom: 48px; }

/* Mockup */
.mockup-wrapper { position: relative; max-width: 900px; margin: 0 auto; }
.mockup-glow { position: absolute; inset: -40px; background: radial-gradient(ellipse, var(--accent-glow), transparent 70%); border-radius: 40px; filter: blur(40px); opacity: 0.6; }
.mockup-frame { position: relative; background: #0f172a; border-radius: 16px; border: 4px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
.mockup-bar { display: flex; align-items: center; padding: 10px 16px; background: #0f172a; border-bottom: 1px solid var(--border); }
.mockup-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #22c55e; }
.mockup-url { flex: 1; text-align: center; padding: 4px 16px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 12px; color: var(--text-muted); }
.mockup-screen { display: flex; height: 300px; }
.mock-sidebar { width: 180px; border-right: 1px solid var(--border); padding: 12px; flex-shrink: 0; }
.mock-logo { width: 28px; height: 28px; border-radius: 6px; background: var(--accent-glow); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent); font-size: 12px; margin-bottom: 12px; }
.mock-nav-items { display: flex; flex-direction: column; gap: 2px; }
.mock-nav { padding: 6px 8px; border-radius: 6px; font-size: 11px; color: var(--text-muted); }
.mock-nav.active { background: var(--accent-glow); color: var(--accent); }
.mock-main { flex: 1; padding: 16px; }
.mock-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
.mock-stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 8px; text-align: center; }
.mock-stat-val { display: block; font-size: 14px; font-weight: 700; }
.mock-stat-lbl { display: block; font-size: 9px; color: var(--text-muted); margin-top: 2px; }
.mock-chart { display: flex; align-items: flex-end; justify-content: center; gap: 6px; height: 120px; padding: 8px; }
.chart-bar { width: 24px; border-radius: 4px 4px 0 0; background: linear-gradient(to top, rgba(59,130,246,0.4), var(--accent)); }

@media (max-width: 768px) {
    .mock-sidebar { display: none; }
    .mock-stats { grid-template-columns: repeat(2, 1fr); }
    .mockup-screen { height: 200px; }
}

/* Sections */
.section { padding: 80px 0; position: relative; }
.section-alt { background: rgba(255,255,255,0.02); }
.section-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: var(--accent-glow); border: 1px solid rgba(59,130,246,0.2); font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 16px; }
.section-title { font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 900; margin-bottom: 12px; }
.section-desc { color: var(--text-sec); max-width: 600px; margin: 0 auto 40px; }
.text-accent { color: var(--accent); }
.text-green { color: var(--green); }
.section-extra { text-align: center; margin-top: 32px; }
.section-extra span { padding: 12px 24px; border-radius: 999px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.15); font-weight: 700; color: var(--accent); font-size: 16px; }

/* Resources */
.resources-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.resource-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all .3s; cursor: pointer; }
.resource-card:hover, .resource-card.active { background: var(--accent-glow); border-color: rgba(59,130,246,0.3); }
.resource-icon { font-size: 28px; margin-bottom: 12px; }
.resource-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.resource-card p { font-size: 14px; color: var(--text-sec); line-height: 1.5; }

/* Radar */
.radar-scroll { overflow: hidden; position: relative; }
.radar-scroll::before, .radar-scroll::after { content: ''; position: absolute; top: 0; bottom: 0; width: 60px; z-index: 2; pointer-events: none; }
.radar-scroll::before { left: 0; background: linear-gradient(to right, var(--bg), transparent); }
.radar-scroll::after { right: 0; background: linear-gradient(to left, rgba(255,255,255,0.02), transparent); }
.radar-track { display: flex; gap: 16px; animation: scrollCards 30s linear infinite; width: max-content; }
@keyframes scrollCards { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.lead-card { flex-shrink: 0; width: 300px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
.lead-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.lead-emoji { font-size: 24px; width: 44px; height: 44px; border-radius: 12px; background: var(--accent-glow); display: flex; align-items: center; justify-content: center; }
.lead-head strong { display: block; font-size: 14px; }
.lead-niche { font-size: 12px; color: var(--text-muted); }
.lead-values { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.lead-values small { display: block; font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
.lead-values strong { font-size: 16px; }
.lead-blur { position: relative; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 8px; text-align: center; }
.lead-blur span { font-size: 12px; color: var(--text-muted); }

/* Steps */
.steps-timeline { display: grid; gap: 24px; max-width: 600px; margin: 0 auto; }
.step-item { display: flex; gap: 16px; align-items: flex-start; }
.step-number { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent); flex-shrink: 0; }
.step-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; flex: 1; }
.step-icon { font-size: 24px; margin-bottom: 8px; }
.step-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.step-card p { font-size: 14px; color: var(--text-sec); line-height: 1.5; }

/* Why Choose */
.why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.why-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all .3s; }
.why-card:hover { border-color: rgba(59,130,246,0.3); }
.why-card-main { grid-column: span 2; }
@media (max-width: 768px) { .why-card-main { grid-column: span 1; } }
.why-icon { font-size: 28px; margin-bottom: 12px; }
.why-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.why-card p { font-size: 14px; color: var(--text-sec); line-height: 1.5; margin-bottom: 12px; }
.why-tag { display: inline-block; padding: 4px 12px; border-radius: 999px; background: var(--accent-glow); border: 1px solid rgba(59,130,246,0.2); font-size: 12px; color: var(--accent); font-weight: 600; }

/* Partners */
.partners-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 900px; margin: 0 auto 32px; }
.partner-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all .3s; }
.partner-card:hover { border-color: rgba(59,130,246,0.3); }
.partner-logo-box { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; color: var(--accent); margin-bottom: 16px; }
.partner-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.partner-sub { color: var(--accent); font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.partner-card > p { font-size: 14px; color: var(--text-sec); margin-bottom: 12px; line-height: 1.5; }
.partner-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: var(--accent-glow); border: 1px solid rgba(59,130,246,0.2); font-size: 12px; color: var(--accent); font-weight: 600; margin-bottom: 16px; }
.partner-benefits { list-style: none; padding: 0; }
.partner-benefits li { padding: 6px 0; font-size: 14px; color: var(--text-sec); }

.trust-bar { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; font-size: 14px; color: var(--text-sec); }

/* Pricing */
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 950px; margin: 0 auto; }
.pricing-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 32px 24px; text-align: center; position: relative; transition: all .3s; }
.pricing-card:hover { border-color: rgba(59,130,246,0.3); }
.pricing-popular { border: 2px solid rgba(59,130,246,0.4); background: linear-gradient(to bottom, var(--accent-glow), var(--bg-card)); transform: scale(1.02); box-shadow: 0 20px 40px rgba(59,130,246,0.1); }
.popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 16px; border-radius: 999px; }
.pricing-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.pricing-tagline { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }
.pricing-old { font-size: 14px; color: var(--text-muted); text-decoration: line-through; margin-bottom: 4px; }
.pricing-price { font-size: 36px; font-weight: 900; margin-bottom: 24px; }
.pricing-price.accent { color: var(--accent); }
.pricing-price span { font-size: 14px; font-weight: 400; color: var(--text-sec); }
.pricing-features { list-style: none; padding: 0; text-align: left; margin-bottom: 20px; }
.pricing-features li { padding: 8px 0; font-size: 14px; color: var(--text-sec); border-bottom: 1px solid rgba(255,255,255,0.04); }
.pricing-features li:last-child { border: none; }
.discount-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: var(--accent-glow); font-size: 12px; color: var(--accent); font-weight: 600; margin-bottom: 16px; }

/* FAQ */
.faq-list { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
.faq-item { border-bottom: 1px solid rgba(255,255,255,0.06); }
.faq-item:last-child { border: none; }
.faq-question { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 16px 0; background: none; border: none; color: var(--text); font-size: 14px; font-weight: 500; cursor: pointer; text-align: left; }
.faq-question:hover { color: var(--accent); }
.faq-arrow { font-size: 12px; transition: transform .2s; }
.faq-item.open .faq-arrow { transform: rotate(180deg); color: var(--accent); }
.faq-answer { display: none; padding: 0 0 16px; font-size: 14px; color: var(--text-sec); line-height: 1.6; }
.faq-item.open .faq-answer { display: block; }
.faq-cta { text-align: center; margin-top: 40px; padding: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; }
.faq-cta p { margin-bottom: 12px; color: var(--text-sec); font-size: 14px; }

/* Footer */
.landing-footer { border-top: 1px solid var(--border); padding: 24px 0; }
.footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.footer-inner p { font-size: 13px; color: var(--text-muted); }

/* Smooth scroll */
html { scroll-behavior: smooth; }
`;

const LANDING_JS = `// Genesis Hub - Landing Page JS

// Typing effect
document.addEventListener('DOMContentLoaded', function() {
    var text = 'Crie, Gerencie e Escale';
    var el = document.getElementById('typedText');
    var i = 0;
    var timer = setInterval(function() {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, 50);
});

// Mobile menu
function toggleMobile() {
    var menu = document.getElementById('mobileMenu');
    menu.classList.toggle('open');
}

// FAQ toggle
function toggleFaq(btn) {
    var item = btn.parentElement;
    var wasOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(function(el) {
        el.classList.remove('open');
    });
    // Toggle clicked
    if (!wasOpen) {
        item.classList.add('open');
    }
}

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
`;

const APP_JS = `// Genesis Hub - Dashboard JS
document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts
    document.querySelectorAll('.alert').forEach(function(el) {
        setTimeout(function() { el.style.opacity = '0'; setTimeout(function() { el.remove(); }, 300); }, 5000);
    });

    // Confirm deletes
    document.querySelectorAll('[data-confirm]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            if (!confirm(el.dataset.confirm)) e.preventDefault();
        });
    });
});
`;

// ── MODULE FILES ───────────────────────────────────────────

const MODULE_SCANNER = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">🔍 Scanner IA</h3><a href="dashboard.php?page=scanner&action=new" class="btn btn-primary btn-sm">+ Novo Prospect</a></div>
    <?php
    $stmt = $pdo->query("SELECT * FROM prospects ORDER BY created_at DESC LIMIT 20");
    $prospects = $stmt->fetchAll();
    ?>
    <?php if (count($prospects) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Empresa</th><th>Nicho</th><th>Score</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>
            <?php foreach($prospects as $p): ?>
            <tr>
                <td><?= sanitize($p['company_name']) ?></td>
                <td><?= sanitize($p['niche'] ?? '-') ?></td>
                <td><?= $p['score'] ?></td>
                <td><span class="badge badge-info"><?= $p['status'] ?></span></td>
                <td><?= date('d/m/Y', strtotime($p['created_at'])) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhum prospect encontrado.</p>
    <?php endif; ?>
</div>`;

const MODULE_RADAR = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">📡 Radar Global</h3></div>
    <p style="color:var(--text-secondary);padding:20px">Módulo de radar para monitoramento de oportunidades em tempo real.</p>
    <?php
    $stmt = $pdo->query("SELECT niche, COUNT(*) as total, AVG(score) as avg_score FROM prospects GROUP BY niche ORDER BY total DESC");
    $niches = $stmt->fetchAll();
    ?>
    <?php if (count($niches) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Nicho</th><th>Prospects</th><th>Score Médio</th></tr></thead>
        <tbody>
            <?php foreach($niches as $n): ?>
            <tr><td><?= sanitize($n['niche'] ?? 'Sem nicho') ?></td><td><?= $n['total'] ?></td><td><?= number_format($n['avg_score'],1) ?></td></tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhum dado disponível.</p>
    <?php endif; ?>
</div>`;

const MODULE_PROPOSALS = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">📋 Propostas</h3><a href="dashboard.php?page=proposals&action=new" class="btn btn-primary btn-sm">+ Nova Proposta</a></div>
    <?php
    $stmt = $pdo->query("SELECT * FROM proposals ORDER BY created_at DESC LIMIT 20");
    $proposals = $stmt->fetchAll();
    ?>
    <?php if (count($proposals) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Empresa</th><th>Contato</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>
            <?php foreach($proposals as $p): ?>
            <tr>
                <td><?= sanitize($p['company_name']) ?></td>
                <td><?= sanitize($p['contact_name'] ?? '-') ?></td>
                <td>R$ <?= number_format($p['value'] ?? 0, 2, ',', '.') ?></td>
                <td><span class="badge <?= $p['status']==='accepted'?'badge-success':($p['status']==='rejected'?'badge-danger':'badge-warning') ?>"><?= $p['status'] ?></span></td>
                <td><?= date('d/m/Y', strtotime($p['created_at'])) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhuma proposta encontrada.</p>
    <?php endif; ?>
</div>`;

const MODULE_LIBRARY = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">📚 Biblioteca</h3></div>
    <p style="color:var(--text-secondary);padding:20px">Gerencie seus materiais de marketing, templates e documentos.</p>
    <div class="empty-state"><p>Nenhum material cadastrado ainda.</p></div>
</div>`;

const MODULE_CONTRACTS = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">📄 Contratos</h3><a href="dashboard.php?page=contracts&action=new" class="btn btn-primary btn-sm">+ Novo Contrato</a></div>
    <?php
    $stmt = $pdo->query("SELECT * FROM contracts ORDER BY created_at DESC LIMIT 20");
    $contracts = $stmt->fetchAll();
    ?>
    <?php if (count($contracts) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Cliente</th><th>Serviço</th><th>Valor</th><th>Status</th><th>Início</th></tr></thead>
        <tbody>
            <?php foreach($contracts as $c): ?>
            <tr>
                <td><?= sanitize($c['client_name']) ?></td>
                <td><?= sanitize($c['service_type'] ?? '-') ?></td>
                <td>R$ <?= number_format($c['value'] ?? 0, 2, ',', '.') ?></td>
                <td><span class="badge <?= $c['status']==='active'?'badge-success':($c['status']==='cancelled'?'badge-danger':'badge-warning') ?>"><?= $c['status'] ?></span></td>
                <td><?= $c['start_date'] ? date('d/m/Y', strtotime($c['start_date'])) : '-' ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhum contrato encontrado.</p>
    <?php endif; ?>
</div>`;

const MODULE_PROMO = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">🎯 Promocional</h3><a href="dashboard.php?page=promo&action=new" class="btn btn-primary btn-sm">+ Novo Link</a></div>
    <?php
    $stmt = $pdo->query("SELECT * FROM promo_links ORDER BY created_at DESC LIMIT 20");
    $links = $stmt->fetchAll();
    ?>
    <?php if (count($links) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Título</th><th>Slug</th><th>Cliques</th><th>Ativo</th></tr></thead>
        <tbody>
            <?php foreach($links as $l): ?>
            <tr>
                <td><?= sanitize($l['title'] ?? '-') ?></td>
                <td><code><?= sanitize($l['slug']) ?></code></td>
                <td><?= $l['clicks'] ?></td>
                <td><span class="badge <?= $l['is_active'] ? 'badge-success' : 'badge-danger' ?>"><?= $l['is_active'] ? 'Sim' : 'Não' ?></span></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhum link promocional.</p>
    <?php endif; ?>
</div>`;

const MODULE_FINANCIAL = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">💰 Financeiro</h3><a href="dashboard.php?page=financial&action=new" class="btn btn-primary btn-sm">+ Novo Registro</a></div>
    <?php
    $stmt = $pdo->query("SELECT * FROM financial_records ORDER BY created_at DESC LIMIT 20");
    $records = $stmt->fetchAll();
    $stmt2 = $pdo->query("SELECT type, SUM(amount) as total FROM financial_records GROUP BY type");
    $totals = [];
    foreach($stmt2->fetchAll() as $r) $totals[$r['type']] = $r['total'];
    ?>
    <div class="stats-grid" style="margin-bottom:16px">
        <div class="stat-card glass"><div class="stat-icon">📈</div><div class="stat-info"><div class="stat-value" style="color:var(--success)">R$ <?= number_format($totals['income'] ?? 0, 2, ',', '.') ?></div><div class="stat-label">Receitas</div></div></div>
        <div class="stat-card glass"><div class="stat-icon">📉</div><div class="stat-info"><div class="stat-value" style="color:var(--danger)">R$ <?= number_format($totals['expense'] ?? 0, 2, ',', '.') ?></div><div class="stat-label">Despesas</div></div></div>
    </div>
    <?php if (count($records) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Data</th></tr></thead>
        <tbody>
            <?php foreach($records as $r): ?>
            <tr>
                <td><span class="badge <?= $r['type']==='income'?'badge-success':'badge-danger' ?>"><?= $r['type']==='income'?'Receita':'Despesa' ?></span></td>
                <td><?= sanitize($r['category'] ?? '-') ?></td>
                <td><?= sanitize($r['description'] ?? '-') ?></td>
                <td>R$ <?= number_format($r['amount'], 2, ',', '.') ?></td>
                <td><?= $r['date'] ? date('d/m/Y', strtotime($r['date'])) : '-' ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhum registro financeiro.</p>
    <?php endif; ?>
</div>`;

const MODULE_SETTINGS = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">⚙️ Configurações</h3></div>
    <form method="POST" action="api/settings.php" class="login-form" style="max-width:400px">
        <div class="form-group"><label>Nome</label><input type="text" name="name" value="<?= sanitize($_SESSION['user_name']) ?>" class="form-input"></div>
        <div class="form-group"><label>Email</label><input type="email" name="email" value="<?= sanitize($_SESSION['user_email']) ?>" class="form-input"></div>
        <div class="form-group"><label>Nova Senha (deixe vazio para manter)</label><input type="password" name="new_password" class="form-input"></div>
        <button type="submit" class="btn btn-primary">Salvar</button>
    </form>
</div>`;

const MODULE_HELP = `<div class="card glass">
    <div class="card-header"><h3 class="card-title">❓ Ajuda</h3></div>
    <div style="padding:20px;color:var(--text-secondary)">
        <h4 style="margin-bottom:12px;color:var(--text-primary)">Como usar o Genesis Hub</h4>
        <ul style="list-style:none;padding:0">
            <li style="padding:8px 0;border-bottom:1px solid var(--border-glass)">📊 <strong>Dashboard:</strong> Visão geral com métricas</li>
            <li style="padding:8px 0;border-bottom:1px solid var(--border-glass)">🔍 <strong>Scanner IA:</strong> Encontre prospects</li>
            <li style="padding:8px 0;border-bottom:1px solid var(--border-glass)">📡 <strong>Radar:</strong> Monitore oportunidades</li>
            <li style="padding:8px 0;border-bottom:1px solid var(--border-glass)">📋 <strong>Propostas:</strong> Crie e gerencie propostas</li>
            <li style="padding:8px 0;border-bottom:1px solid var(--border-glass)">📄 <strong>Contratos:</strong> Gerencie contratos</li>
            <li style="padding:8px 0;border-bottom:1px solid var(--border-glass)">🎯 <strong>Promocional:</strong> Links de divulgação</li>
            <li style="padding:8px 0;border-bottom:1px solid var(--border-glass)">💰 <strong>Financeiro:</strong> Controle financeiro</li>
            <li style="padding:8px 0">⚙️ <strong>Configurações:</strong> Ajustes do perfil</li>
        </ul>
        <p style="margin-top:20px;font-size:13px;color:var(--text-muted)">Versão <?= APP_VERSION ?> • PHP <?= phpversion() ?></p>
    </div>
</div>`;

const MODULE_ADMIN_USERS = `<?php if ($_SESSION['user_role'] !== 'super_admin' && $_SESSION['user_role'] !== 'admin') { echo '<div class="alert alert-error">Acesso negado.</div>'; return; } ?>
<div class="card glass">
    <div class="card-header"><h3 class="card-title">👥 Gerenciar Usuários</h3></div>
    <?php $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at DESC"); $users = $stmt->fetchAll(); ?>
    <table class="data-table">
        <thead><tr><th>Nome</th><th>Email</th><th>Role</th><th>Ativo</th><th>Criado em</th></tr></thead>
        <tbody>
            <?php foreach($users as $u): ?>
            <tr>
                <td><?= sanitize($u['name']) ?></td>
                <td><?= sanitize($u['email']) ?></td>
                <td><span class="badge badge-info"><?= $u['role'] ?></span></td>
                <td><span class="badge <?= $u['is_active'] ? 'badge-success' : 'badge-danger' ?>"><?= $u['is_active'] ? 'Sim' : 'Não' ?></span></td>
                <td><?= date('d/m/Y', strtotime($u['created_at'])) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>`;

const MODULE_ADMIN_PAYMENTS = `<?php if ($_SESSION['user_role'] !== 'super_admin' && $_SESSION['user_role'] !== 'admin') { echo '<div class="alert alert-error">Acesso negado.</div>'; return; } ?>
<div class="card glass">
    <div class="card-header"><h3 class="card-title">💳 Pagamentos</h3></div>
    <?php $stmt = $pdo->query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 20"); $payments = $stmt->fetchAll(); ?>
    <?php if (count($payments) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Cliente</th><th>Valor</th><th>Método</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>
            <?php foreach($payments as $p): ?>
            <tr>
                <td><?= sanitize($p['customer_name'] ?? '-') ?></td>
                <td>R$ <?= number_format($p['amount'] ?? 0, 2, ',', '.') ?></td>
                <td><?= sanitize($p['method'] ?? '-') ?></td>
                <td><span class="badge <?= $p['status']==='paid'?'badge-success':'badge-warning' ?>"><?= $p['status'] ?></span></td>
                <td><?= date('d/m/Y', strtotime($p['created_at'])) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhum pagamento registrado.</p>
    <?php endif; ?>
</div>`;

const MODULE_ADMIN_APIKEYS = `<?php if ($_SESSION['user_role'] !== 'super_admin' && $_SESSION['user_role'] !== 'admin') { echo '<div class="alert alert-error">Acesso negado.</div>'; return; } ?>
<div class="card glass">
    <div class="card-header"><h3 class="card-title">🔑 API Keys</h3><a href="dashboard.php?page=admin-apikeys&action=new" class="btn btn-primary btn-sm">+ Nova Key</a></div>
    <?php $stmt = $pdo->query("SELECT * FROM api_keys ORDER BY created_at DESC"); $keys = $stmt->fetchAll(); ?>
    <?php if (count($keys) > 0): ?>
    <table class="data-table">
        <thead><tr><th>Nome</th><th>Serviço</th><th>Key</th><th>Ativo</th></tr></thead>
        <tbody>
            <?php foreach($keys as $k): ?>
            <tr>
                <td><?= sanitize($k['name'] ?? '-') ?></td>
                <td><?= sanitize($k['service'] ?? '-') ?></td>
                <td><code><?= substr($k['api_key'], 0, 8) ?>...</code></td>
                <td><span class="badge <?= $k['is_active'] ? 'badge-success' : 'badge-danger' ?>"><?= $k['is_active'] ? 'Sim' : 'Não' ?></span></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
        <p style="color:var(--text-muted);text-align:center;padding:40px">Nenhuma API key cadastrada.</p>
    <?php endif; ?>
</div>`;

const API_SETTINGS = `<?php
require_once '../config.php';
requireLogin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $newPassword = $_POST['new_password'] ?? '';

    if ($name) {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        $stmt->execute([$name, $email, $_SESSION['user_id']]);
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
    }

    if ($newPassword) {
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$hash, $_SESSION['user_id']]);
    }

    header('Location: ../dashboard.php?page=settings&saved=1');
    exit;
}
header('Location: ../dashboard.php?page=settings');
?>`;

const HTACCESS = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^install$ install.php [L]
RewriteRule ^login$ login.php [L]

# Security
Options -Indexes
<Files config.php>
    Order Allow,Deny
    Deny from all
</Files>
`;

const README = `# Genesis Hub PHP

## Instalação (cPanel)

1. Faça upload de todos os arquivos para a pasta public_html (ou subpasta)
2. Acesse: seusite.com/install.php
3. Preencha os dados do banco MySQL e do admin
4. Clique em "Instalar"
5. Acesse: seusite.com (site comercial)
6. Acesse: seusite.com/login.php (login do painel)

## Estrutura
- index.php - Site Comercial (Landing Page)
- login.php - Login
- dashboard.php - Painel principal
- install.php - Instalador
- config.php - Configurações do banco
- modules/ - Módulos do dashboard
- assets/css/landing.css - Estilos da landing
- assets/css/style.css - Estilos do painel
- assets/js/landing.js - Scripts da landing
- assets/js/app.js - Scripts do painel
- api/ - Endpoints

## Requisitos
- PHP 7.4+
- MySQL 5.7+
- mod_rewrite habilitado

## Login padrão
- Email: admin@genesis.com
- Senha: admin123
`;

// ── ZIP GENERATOR ──────────────────────────────────────────

async function generateZip() {
  const zip = new JSZip();

  // Root files
  zip.file("config.php", CONFIG_PHP);
  zip.file("index.php", LANDING_PHP);
  zip.file("login.php", LOGIN_PHP);
  zip.file("dashboard.php", DASHBOARD_PHP);
  zip.file("logout.php", LOGOUT_PHP);
  zip.file("install.php", INSTALL_PHP);
  zip.file(".htaccess", HTACCESS);
  zip.file("README.md", README);

  // Assets
  const assets = zip.folder("assets")!;
  const css = assets.folder("css")!;
  css.file("style.css", STYLE_CSS);
  css.file("landing.css", LANDING_CSS);
  const js = assets.folder("js")!;
  js.file("app.js", APP_JS);
  js.file("landing.js", LANDING_JS);

  // Modules
  const modules = zip.folder("modules")!;
  modules.file("scanner.php", MODULE_SCANNER);
  modules.file("radar.php", MODULE_RADAR);
  modules.file("proposals.php", MODULE_PROPOSALS);
  modules.file("library.php", MODULE_LIBRARY);
  modules.file("contracts.php", MODULE_CONTRACTS);
  modules.file("promo.php", MODULE_PROMO);
  modules.file("financial.php", MODULE_FINANCIAL);
  modules.file("settings.php", MODULE_SETTINGS);
  modules.file("help.php", MODULE_HELP);
  modules.file("admin-users.php", MODULE_ADMIN_USERS);
  modules.file("admin-payments.php", MODULE_ADMIN_PAYMENTS);
  modules.file("admin-apikeys.php", MODULE_ADMIN_APIKEYS);

  // API
  const api = zip.folder("api")!;
  api.file("settings.php", API_SETTINGS);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "genesis-hub-php.zip");
}

// ── COMPONENT ──────────────────────────────────────────────

export default function BaixarGenesis() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generateZip();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Genesis Hub PHP</h1>
          <p className="text-white/50">Clone completo para hospedagem cPanel</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            O que está incluso:
          </h2>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                {f}
              </motion.li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleDownload}
          disabled={loading}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl gap-3"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
          {loading ? "Gerando ZIP..." : "Baixar ZIP"}
        </Button>

        <p className="text-center text-white/30 text-xs mt-4">PHP 7.4+ • MySQL 5.7+ • Compatível com cPanel</p>
      </motion.div>
    </div>
  );
}
