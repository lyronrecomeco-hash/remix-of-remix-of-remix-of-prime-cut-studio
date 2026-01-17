import { supabase } from "@/integrations/supabase/client";
import { queryWithRetry, type RetryOptions } from "@/lib/queryWithRetry";

export function buildWhatsAppLink(phone: string, message: string) {
  const cleaned = String(phone).replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Fallback confiável para mobile (evita popup-blocker após awaits).
 */
export function openWhatsAppLink(phone: string, message: string) {
  const url = buildWhatsAppLink(phone, message);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);

  if (typeof window === "undefined") return;

  if (isMobile) {
    window.location.assign(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Envia via backend (send-petshop-whatsapp) com retry de rede.
 * Lança erro se não conseguir enviar.
 */
export async function sendPetshopWhatsAppWithRetry(
  params: { phone: string; message: string },
  options: RetryOptions = {}
) {
  return queryWithRetry(async () => {
    const { data, error } = await supabase.functions.invoke("send-petshop-whatsapp", {
      body: params,
    });

    if (error) throw error;
    if (!(data as any)?.success) {
      throw new Error((data as any)?.error || "Falha ao enviar WhatsApp");
    }

    return data;
  }, options);
}
