import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Package, CheckCircle2, Server, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const features = [
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
        header('Location: index.php');
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

const INDEX_PHP = `<?php
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
header('Location: index.php');
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
        $pdo->exec("CREATE DATABASE IF NOT EXISTS \`$name\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE \`$name\`");

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
        $config = "<?php\\ndefine('DB_HOST', '$host');\\ndefine('DB_NAME', '$name');\\ndefine('DB_USER', '$user');\\ndefine('DB_PASS', '$pass');\\ndefine('APP_NAME', 'Genesis Hub');\\ndefine('APP_VERSION', '1.0.0');\\n\\nsession_start();\\n\\ntry {\\n    \\$pdo = new PDO(\\"mysql:host=\\".DB_HOST.\\";dbname=\\".DB_NAME.\\";charset=utf8mb4\\", DB_USER, DB_PASS, [\\n        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\\n        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC\\n    ]);\\n} catch(PDOException \\$e) {\\n    die(\\"Erro de conexão: \\" . \\$e->getMessage());\\n}\\n\\nfunction isLoggedIn() { return isset(\\$_SESSION['user_id']); }\\nfunction requireLogin() { if (!isLoggedIn()) { header('Location: index.php'); exit; } }\\nfunction sanitize(\\$str) { return htmlspecialchars(trim(\\$str), ENT_QUOTES, 'UTF-8'); }\\nfunction jsonResponse(\\$data, \\$code = 200) { http_response_code(\\$code); header('Content-Type: application/json'); echo json_encode(\\$data); exit; }\\n?>";
        file_put_contents('config.php', $config);

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
                    <a href="index.php" class="btn btn-primary btn-block" style="margin-top:12px">Ir para Login</a>
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

const STYLE_CSS = `/* Genesis Hub - CSS */
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

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { width: 100%; max-width: 480px; padding: 24px; }

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

const APP_JS = `// Genesis Hub - App JS
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
    <p style="color:var(--text-secondary);padding:20px">Módulo de radar para monitoramento de oportunidades em tempo real. Configure filtros por nicho, região e score mínimo.</p>
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
    <p style="color:var(--text-secondary);padding:20px">Gerencie seus materiais de marketing, templates de propostas, modelos de contratos e documentos úteis.</p>
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
5. Acesse: seusite.com (login)

## Requisitos
- PHP 7.4+
- MySQL 5.7+
- mod_rewrite habilitado

## Estrutura
- index.php - Login
- dashboard.php - Painel principal
- install.php - Instalador
- config.php - Configurações do banco
- modules/ - Módulos do dashboard
- assets/css/ - Estilos
- assets/js/ - Scripts
- api/ - Endpoints

## Login padrão
- Email: admin@genesis.com
- Senha: admin123
`;

// ── ZIP GENERATOR ──────────────────────────────────────────

async function generateZip() {
  const zip = new JSZip();

  zip.file("config.php", CONFIG_PHP);
  zip.file("index.php", INDEX_PHP);
  zip.file("dashboard.php", DASHBOARD_PHP);
  zip.file("logout.php", LOGOUT_PHP);
  zip.file("install.php", INSTALL_PHP);
  zip.file(".htaccess", HTACCESS);
  zip.file("README.md", README);

  const assets = zip.folder("assets")!;
  assets.folder("css")!.file("style.css", STYLE_CSS);
  assets.folder("js")!.file("app.js", APP_JS);

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
