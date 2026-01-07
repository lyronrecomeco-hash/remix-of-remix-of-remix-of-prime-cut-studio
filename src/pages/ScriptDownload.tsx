import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, Check, Terminal, Server } from 'lucide-react';
import { getVPSScriptV8 } from '@/components/genesis/scripts/vps-script-v8';
import { toast } from 'sonner';

const ScriptDownload = () => {
  const [copied, setCopied] = useState(false);

  const script = getVPSScriptV8('SEU_MASTER_TOKEN_AQUI');

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
              Versão mais recente com integração ao Chatbot Engine
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
                    Copiar Código
                  </>
                )}
              </Button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mt-6">
              <h3 className="text-emerald-400 font-semibold mb-3">📋 Instruções de Instalação:</h3>
              <ol className="text-gray-300 space-y-2 text-sm list-decimal list-inside">
                <li>Pare o PM2: <code className="bg-gray-800 px-2 py-1 rounded">pm2 stop genesis</code></li>
                <li>Substitua o arquivo: <code className="bg-gray-800 px-2 py-1 rounded">nano /opt/whatsapp-backend/genesis-v8.js</code></li>
                <li>Cole o conteúdo completo e salve (Ctrl+X, Y, Enter)</li>
                <li>Atualize o <code className="bg-gray-800 px-2 py-1 rounded">MASTER_TOKEN</code> no início do arquivo</li>
                <li>Reinicie: <code className="bg-gray-800 px-2 py-1 rounded">pm2 start genesis-v8.js --name genesis && pm2 save</code></li>
                <li>Verifique: <code className="bg-gray-800 px-2 py-1 rounded">pm2 logs genesis --lines 50</code></li>
              </ol>
            </div>

            <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mt-4">
              <h3 className="text-amber-400 font-semibold mb-2">⚠️ Importante:</h3>
              <p className="text-amber-200 text-sm">
                Substitua <code className="bg-gray-800 px-2 py-1 rounded">SEU_MASTER_TOKEN_AQUI</code> pelo 
                seu token real antes de usar. O script tem ~1700 linhas - certifique-se de copiar tudo!
              </p>
            </div>

            <div className="text-center text-gray-500 text-sm mt-6">
              Linhas do script: {script.split('\n').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScriptDownload;
