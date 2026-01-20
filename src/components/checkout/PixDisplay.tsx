/**
 * CHECKOUT SYSTEM - PIX Display Component
 * Exibe QR Code e código copia-e-cola do PIX - Layout single-column profissional
 */

import React, { useState } from 'react';
import { Copy, Check, QrCode, Smartphone, CheckCircle2, Clock } from 'lucide-react';
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

  // Check if it's dev mode (for warning)
  const isDevMode = brCode.includes('devmode-pix-');

  return (
    <div className="space-y-6">
      {/* Dev mode warning */}
      {isDevMode && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400 text-center">
            ⚠️ Modo de teste - QR Code não válido para pagamentos reais
          </p>
        </div>
      )}

      {/* QR Code - Centered, prominent */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="p-5 bg-white rounded-2xl shadow-lg">
            {qrCodeBase64 ? (
              <img
                src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-52 h-52 sm:w-60 sm:h-60"
              />
            ) : (
              <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center bg-gray-100 rounded-lg">
                <QrCode className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-3 border-l-3 border-emerald-500 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-3 border-r-3 border-emerald-500 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-3 border-l-3 border-emerald-500 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-3 border-r-3 border-emerald-500 rounded-br-lg" />
        </div>

        <p className="mt-5 text-sm text-white/60 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Escaneie com o app do seu banco
        </p>
      </div>

      {/* Divider with text */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40 font-medium">OU COPIE O CÓDIGO</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Copy-paste code with large button */}
      <div className="space-y-3">
        <div className="relative p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="font-mono text-xs text-white/70 break-all max-h-20 overflow-y-auto pr-16 leading-relaxed">
            {brCode}
          </div>
          
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-semibold transition-all",
              copied
                ? "bg-emerald-500 text-white"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
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

      {/* Instructions - Compact */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Como pagar com PIX
        </h4>
        <div className="space-y-2.5">
          {[
            'Abra o app do seu banco ou carteira digital',
            'Escolha pagar com PIX e escaneie ou cole o código',
            'Confirme o pagamento e aguarde a confirmação'
          ].map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <span className="text-sm text-white/70">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Pagamento seguro via Banco Central do Brasil</span>
      </div>
    </div>
  );
}
