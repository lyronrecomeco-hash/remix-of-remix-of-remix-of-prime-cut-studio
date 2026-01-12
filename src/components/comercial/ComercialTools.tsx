import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link2, QrCode, Copy, Check, Download, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCode from 'qrcode';

const ComercialTools = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Link Generator State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // QR Code State
  const [qrPhone, setQrPhone] = useState('');
  const [qrMessage, setQrMessage] = useState('');
  const [qrColor, setQrColor] = useState('#3B82F6');
  const [qrType, setQrType] = useState<'permanent' | 'temporary'>('permanent');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateLink = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
    const link = `https://genesis-wa.link/${cleanPhone}${encodedMessage}`;
    setGeneratedLink(link);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const generateQRCode = async () => {
    const cleanPhone = qrPhone.replace(/\D/g, '');
    const waLink = `https://wa.me/${cleanPhone}${qrMessage ? `?text=${encodeURIComponent(qrMessage)}` : ''}`;
    
    try {
      const url = await QRCode.toDataURL(waLink, {
        width: 300,
        margin: 2,
        color: {
          dark: qrColor,
          light: '#0F172A',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.download = `genesis-qr-${qrPhone}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <section id="ferramentas" ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Ferramentas Gratuitas</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
            Ferramentas <span className="text-gold-shine">grátis</span> para você
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Utilize nossas ferramentas exclusivas sem precisar de conta. É grátis e sempre será!
          </p>
        </motion.div>

        {/* Tools Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-xl p-1.5 mb-10 border border-border/50">
              <TabsTrigger 
                value="link" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border font-semibold py-3"
              >
                <Link2 className="w-5 h-5" />
                Gerador de Link
              </TabsTrigger>
              <TabsTrigger 
                value="qr" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border font-semibold py-3"
              >
                <QrCode className="w-5 h-5" />
                QR Code Genesis
              </TabsTrigger>
            </TabsList>

            {/* Link Generator */}
            <TabsContent value="link">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Número do WhatsApp
                      </label>
                      <Input
                        placeholder="5511999999999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-14 text-lg rounded-xl bg-secondary/50 border-border focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Com código do país (55 para Brasil)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Mensagem Pré-definida (opcional)
                      </label>
                      <Input
                        placeholder="Olá! Vi seu anúncio e gostaria de saber mais..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="h-14 text-lg rounded-xl bg-secondary/50 border-border focus:border-primary"
                      />
                    </div>

                    <Button
                      onClick={generateLink}
                      disabled={!phoneNumber}
                      className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25"
                    >
                      <Link2 className="w-5 h-5 mr-2" />
                      Gerar Link Genesis
                    </Button>
                  </div>

                  <div className="flex flex-col justify-center items-center p-8 bg-secondary/30 rounded-xl border-2 border-dashed border-border">
                    {generatedLink ? (
                      <div className="w-full space-y-4">
                        <div className="bg-background p-4 rounded-xl border border-border break-all">
                          <p className="text-primary font-mono text-sm">{generatedLink}</p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={copyLink}
                            className="flex-1 bg-foreground hover:bg-foreground/90 text-background"
                          >
                            {linkCopied ? (
                              <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-2" /> Copiar</>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.open(generatedLink, '_blank')}
                            className="border-border"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Link2 className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-muted-foreground">Seu link aparecerá aqui</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">genesis-wa.link/seunumero</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* QR Code Generator */}
            <TabsContent value="qr">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Número do WhatsApp
                      </label>
                      <Input
                        placeholder="5511999999999"
                        value={qrPhone}
                        onChange={(e) => setQrPhone(e.target.value)}
                        className="h-14 text-lg rounded-xl bg-secondary/50 border-border focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Mensagem (opcional)
                      </label>
                      <Input
                        placeholder="Olá! Escaneei o QR Code..."
                        value={qrMessage}
                        onChange={(e) => setQrMessage(e.target.value)}
                        className="h-14 text-lg rounded-xl bg-secondary/50 border-border focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">
                        Cor do QR Code
                      </label>
                      <div className="flex gap-3">
                        {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#FFFFFF'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setQrColor(color)}
                            className={`w-10 h-10 rounded-xl transition-all border-2 ${
                              qrColor === color ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110' : 'border-border'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">
                        Tipo do QR Code
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setQrType('permanent')}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all border ${
                            qrType === 'permanent'
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                              : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
                          }`}
                        >
                          Permanente
                        </button>
                        <button
                          onClick={() => setQrType('temporary')}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all border ${
                            qrType === 'temporary'
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                              : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
                          }`}
                        >
                          Temporário (24h)
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={generateQRCode}
                      disabled={!qrPhone}
                      className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Gerar QR Code
                    </Button>
                  </div>

                  <div className="flex flex-col justify-center items-center p-8 bg-secondary/30 rounded-xl border-2 border-dashed border-border">
                    {qrCodeUrl ? (
                      <div className="space-y-6 text-center">
                        <div className="bg-background p-4 rounded-2xl border border-border inline-block">
                          <img src={qrCodeUrl} alt="QR Code Genesis" className="w-48 h-48" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {qrType === 'permanent' ? '✓ QR Code permanente' : '⏱ Válido por 24 horas'}
                          </p>
                          <Button
                            onClick={downloadQRCode}
                            className="bg-foreground hover:bg-foreground/90 text-background"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PNG
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <QrCode className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-muted-foreground">Seu QR Code aparecerá aqui</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">Personalize as cores e baixe</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialTools;
