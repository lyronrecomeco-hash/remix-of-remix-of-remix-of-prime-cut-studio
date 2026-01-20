/**
 * CHECKOUT SYSTEM - PIX Display Component
 * Exibe QR Code e código copia-e-cola do PIX
 */

import React, { useState } from 'react';
import { Copy, Check, QrCode, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PixDisplayProps {
  brCode: string;
  qrCodeBase64?: string;
}

export function PixDisplay({ brCode, qrCodeBase64 }: PixDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            {qrCodeBase64 ? (
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-48 h-48 sm:w-56 sm:h-56"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-gray-100 rounded-lg">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
        </div>

        <p className="mt-4 text-sm text-white/60 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Escaneie o QR Code com seu app de banco
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">ou use o código abaixo</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Copy-paste code */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          PIX Copia e Cola
        </label>
        
        <div className="relative">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 font-mono text-xs text-white/80 break-all max-h-24 overflow-y-auto">
            {brCode}
          </div>
          
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-lg",
              "text-sm font-medium transition-all",
              copied
                ? "bg-emerald-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="font-medium text-white mb-3">Como pagar</h4>
        <ol className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-medium">
              1
            </span>
            Abra o app do seu banco ou carteira digital
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-medium">
              2
            </span>
            Escolha pagar com PIX e escaneie o QR Code ou cole o código
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-medium">
              3
            </span>
            Confirme o pagamento e aguarde a confirmação
          </li>
        </ol>
      </div>
    </div>
  );
}
