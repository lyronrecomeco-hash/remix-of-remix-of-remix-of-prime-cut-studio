import { motion } from "framer-motion";
import { Download, Package, CheckCircle2, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function BaixarGenesis() {
  const handleDownload = () => {
    // The ZIP is served from documents
    const link = document.createElement("a");
    link.href = "/documents/genesis-hub-php.zip";
    link.download = "genesis-hub-php.zip";
    link.click();
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

        <Button onClick={handleDownload} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl gap-3">
          <Download className="w-6 h-6" />
          Baixar ZIP
        </Button>

        <p className="text-center text-white/30 text-xs mt-4">PHP 7.4+ • MySQL 5.7+ • Compatível com cPanel</p>
      </motion.div>
    </div>
  );
}
