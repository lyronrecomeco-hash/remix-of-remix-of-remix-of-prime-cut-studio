import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, Check, Terminal, Server } from 'lucide-react';
import { getVPSScriptV8 } from '@/components/genesis/scripts/vps-script-v8';
import { toast } from 'sonner';

// Token padrão do sistema
const MASTER_TOKEN = 'genesis-master-token-2024-secure';

const CopyCommand = ({ command, label }: { command: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      toast.success(`${label} copiado!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
      <code className="flex-1 text-emerald-400 text-sm font-mono overflow-x-auto">{command}</code>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="h-7 px-2 hover:bg-gray-700 shrink-0"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </Button>
    </div>
  );
};

const ScriptDownload = () => {
  const [copied, setCopied] = useState(false);

  // Script já com token atualizado
  const script = getVPSScriptV8(MASTER_TOKEN);

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'genesis-v8.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download iniciado!');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast.success('Script copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  const commands = [
    { label: 'Parar PM2', command: 'pm2 stop genesis' },
    { label: 'Editar arquivo', command: 'nano /opt/whatsapp-backend/genesis-v8.js' },
    { label: 'Iniciar PM2', command: 'pm2 start /opt/whatsapp-backend/genesis-v8.js --name genesis && pm2 save' },
    { label: 'Ver logs', command: 'pm2 logs genesis --lines 50' },
    { label: 'Verificar linhas', command: 'wc -l /opt/whatsapp-backend/genesis-v8.js' },
    { label: 'Reiniciar', command: 'pm2 restart genesis' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Server className="w-10 h-10 text-emerald-500" />
            <h1 className="text-3xl font-bold text-white">Genesis VPS Script v8</h1>
          </div>
          <p className="text-gray-400">Script atualizado para WhatsApp Multi-Instância</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              Download do Script
            </CardTitle>
            <CardDescription>
              Versão mais recente com MASTER_TOKEN já configurado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleDownload}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar genesis-v8.js
              </Button>
              <Button 
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-gray-600 text-white hover:bg-gray-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código Completo
                  </>
                )}
              </Button>
            </div>

            <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
              <h3 className="text-emerald-400 font-semibold mb-2">✅ Token Configurado:</h3>
              <CopyCommand command={MASTER_TOKEN} label="Token" />
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mt-6">
              <h3 className="text-emerald-400 font-semibold mb-4">📋 Comandos (clique para copiar):</h3>
              <div className="space-y-3">
                {commands.map((cmd, index) => (
                  <div key={index}>
                    <span className="text-gray-500 text-xs mb-1 block">{index + 1}. {cmd.label}</span>
                    <CopyCommand command={cmd.command} label={cmd.label} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mt-4">
              <h3 className="text-amber-400 font-semibold mb-2">⚠️ Atenção:</h3>
              <p className="text-amber-200 text-sm">
                Ao colar no nano, use <kbd className="bg-gray-800 px-2 py-0.5 rounded text-xs">Ctrl+Shift+V</kbd> ou 
                clique com botão direito. Depois <kbd className="bg-gray-800 px-2 py-0.5 rounded text-xs">Ctrl+X</kbd> → 
                <kbd className="bg-gray-800 px-2 py-0.5 rounded text-xs">Y</kbd> → 
                <kbd className="bg-gray-800 px-2 py-0.5 rounded text-xs">Enter</kbd> para salvar.
              </p>
            </div>

            <div className="text-center text-gray-500 text-sm mt-6 flex items-center justify-center gap-4">
              <span>📄 Linhas: {script.split('\n').length}</span>
              <span>📦 Tamanho: {(script.length / 1024).toFixed(1)} KB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScriptDownload;
