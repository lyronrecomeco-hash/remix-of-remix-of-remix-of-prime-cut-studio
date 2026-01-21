/**
 * CHECKOUT SYSTEM - PIX Display Component
 * Exibe QR Code e código copia-e-cola do PIX - Layout responsivo otimizado
 */

import React, { useState } from 'react';
import { Copy, Check, QrCode, Smartphone, CheckCircle2, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PixIcon } from './PaymentIcons';

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
    <div className="space-y-5">
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
          <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-lg">
            {qrCodeBase64 ? (
              <img
                src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60"
              />
            ) : (
              <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 flex items-center justify-center bg-gray-100 rounded-lg">
                <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Corner decorations */}
          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg" />
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg" />
          <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg" />
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-emerald-500 rounded-br-lg" />
        </div>

        <p className="mt-4 text-xs sm:text-sm text-white/60 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Escaneie com o app do seu banco
        </p>
      </div>

      {/* Divider with text */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] sm:text-xs text-white/40 font-medium whitespace-nowrap">OU COPIE O CÓDIGO</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Copy-paste code - Fully responsive */}
      <div className="space-y-2">
        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="font-mono text-[10px] sm:text-xs text-white/70 break-all max-h-16 sm:max-h-20 overflow-y-auto leading-relaxed mb-3">
            {brCode}
          </div>
          
          <button
            onClick={handleCopy}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg",
              "text-sm font-semibold transition-all",
              copied
                ? "bg-emerald-500 text-white"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 active:bg-emerald-500/40"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Código copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar código PIX
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions - Compact */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
        <h4 className="font-semibold text-white text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          Como pagar com PIX
        </h4>
        <div className="space-y-2">
          {[
            'Abra o app do seu banco ou carteira digital',
            'Escolha pagar com PIX e escaneie ou cole o código',
            'Confirme o pagamento e aguarde a confirmação'
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <span className="text-[11px] sm:text-sm text-white/70 leading-tight">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security badges */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] sm:text-xs">
          <PixIcon className="w-6 h-4 sm:w-8 sm:h-5" />
          <span>Pagamento via PIX</span>
        </div>
        <div className="hidden sm:block w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] sm:text-xs">
          <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
          <span>Banco Central do Brasil</span>
        </div>
      </div>
    </div>
  );
}
