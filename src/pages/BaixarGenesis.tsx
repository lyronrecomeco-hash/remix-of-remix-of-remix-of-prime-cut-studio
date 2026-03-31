import { motion } from "framer-motion";
import { Download, Package, CheckCircle2, FileCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const features = [
  "Login completo com autenticação (GenesisIALogin)",
  "Login alternativo (GenesisLogin)",
  "Dashboard completo (GenesisIADashboard)",
  "Scanner IA e Radar Global",
  "Propostas com IA e Biblioteca",
  "Contratos, Financeiro, Configurações",
  "Comunidade, Academia, Promocional",
  "Criar Projetos e Dashboard Builder",
  "Componentes UI (shadcn/ui)",
  "Integração Supabase (client + types)",
  "194 arquivos React/TypeScript",
];

export default function BaixarGenesis() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // The ZIP is available as a document artifact
    const link = document.createElement("a");
    link.href = "/genesis-hub-react.zip";
    link.download = "genesis-hub-react.zip";
    link.click();
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Genesis Hub — Source Code
          </h1>
          <p className="text-gray-400 text-center text-sm mb-6">
            React 18 + TypeScript + Tailwind CSS + Supabase
          </p>

          {/* Stack badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {["React 18", "TypeScript", "Vite 5", "Tailwind CSS", "Framer Motion", "Supabase", "shadcn/ui"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/5"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2 mb-8">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileCode className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium">Código-fonte original</p>
                <p className="text-xs text-blue-300/70 mt-1">
                  Inclui Login + Dashboard completo com todas as abas. 
                  Basta copiar os arquivos para um projeto React/Vite existente.
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Preparando download...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Baixar ZIP (1.8 MB)
              </>
            )}
          </Button>

          <p className="text-center text-gray-500 text-xs mt-4">
            194 arquivos • React/TypeScript • Pronto para usar
          </p>
        </div>
      </motion.div>
    </div>
  );
}
