import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, QrCode, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import QRCode from 'qrcode';

const VendaFerramentas = () => {
  // Link Generator State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // QR Code Generator State
  const [qrType, setQrType] = useState<'permanent' | 'temporary'>('permanent');
  const [qrContent, setQrContent] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');

  const generateLink = () => {
    if (!phoneNumber) return;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
    const link = `https://genesis-wa.me/${cleanPhone}${encodedMessage}`;
    setGeneratedLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateQr = async () => {
    if (!qrContent) return;
    
    let content = qrContent;
    if (qrType === 'temporary') {
      const expireTime = Date.now() + (24 * 60 * 60 * 1000);
      content = `${qrContent}?expires=${expireTime}`;
    }
    
    try {
      // Generate QR with Genesis branding colors
      const url = await QRCode.toDataURL(content, {
        width: 280,
        margin: 3,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' // High error correction to allow logo overlay
      });
      setQrImageUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQr = () => {
    if (!qrImageUrl) return;
    
    // Create canvas to add Genesis branding
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height + 40;
      
      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR
        ctx.drawImage(img, 0, 0);
        
        // Add Genesis branding at bottom
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, img.height, canvas.width, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Genesis • Automação WhatsApp', canvas.width / 2, img.height + 25);
        
        // Download
        const link = document.createElement('a');
        link.download = `genesis-qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    img.src = qrImageUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Use the same header as main Genesis page */}
      <VendaHeader />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              100% Gratuito • Sem Cadastro
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Ferramentas <span className="text-primary">Gratuitas</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gere links e QR codes para WhatsApp sem cadastro, totalmente gratuito
            </p>
          </motion.div>

          {/* Tools */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Link Generator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Gerador de Link</CardTitle>
                      <CardDescription>Crie links genesis-wa.me</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Número do WhatsApp</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 bg-muted rounded-lg">
                        <span className="text-lg">🇧🇷</span>
                        <span className="text-sm text-muted-foreground">+55</span>
                      </div>
                      <Input
                        placeholder="11999999999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mensagem (opcional)</label>
                    <Textarea
                      placeholder="Olá! Vi seu anúncio e gostaria de mais informações..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={generateLink}
                    className="w-full"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Gerar Link
                  </Button>

                  {generatedLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-muted rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">Link Gerado!</span>
                      </div>
                      <div className="flex gap-2">
                        <Input value={generatedLink} readOnly className="flex-1 text-sm" />
                        <Button 
                          onClick={copyLink}
                          variant="outline"
                          className="shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* QR Code Generator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Gerador de QR Code</CardTitle>
                      <CardDescription>Com marca Genesis integrada</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={qrType} onValueChange={(v) => setQrType(v as 'permanent' | 'temporary')}>
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="permanent">Permanente</TabsTrigger>
                      <TabsTrigger value="temporary">Temporário (24h)</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {qrType === 'temporary' ? 'Link (expira em 24h)' : 'Link ou Texto'}
                    </label>
                    <Input
                      placeholder="https://exemplo.com ou texto qualquer"
                      value={qrContent}
                      onChange={(e) => setQrContent(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={generateQr}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Gerar QR Code
                  </Button>

                  {qrImageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 p-6 bg-muted rounded-xl"
                    >
                      {/* QR Code with Genesis Branding */}
                      <div className="relative bg-white p-4 rounded-xl shadow-lg">
                        <img src={qrImageUrl} alt="QR Code" className="w-56 h-56 md:w-64 md:h-64" />
                        {/* Genesis Logo Overlay in center */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg border-4 border-white">
                            <span className="text-white font-bold text-xl md:text-2xl">G</span>
                          </div>
                        </div>
                        {/* Bottom branding bar */}
                        <div className="mt-3 pt-3 border-t border-border/30 text-center">
                          <span className="text-xs font-medium text-muted-foreground">Genesis • Automação WhatsApp</span>
                        </div>
                      </div>

                      {qrType === 'temporary' && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                          ⏱️ Expira em 24 horas
                        </Badge>
                      )}

                      <Button 
                        onClick={downloadQr}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar QR Code
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: '🚀', title: 'Sem Cadastro', desc: 'Use imediatamente' },
              { icon: '💰', title: '100% Grátis', desc: 'Sem custos ocultos' },
              { icon: '🔒', title: 'Seguro', desc: 'Seus dados protegidos' },
              { icon: '♾️', title: 'Ilimitado', desc: 'Gere quantos quiser' },
            ].map((feature, i) => (
              <Card key={i} className="text-center border-border/50 bg-card/30">
                <CardContent className="pt-6">
                  <span className="text-3xl mb-3 block">{feature.icon}</span>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
              <CardContent className="py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  Quer mais recursos?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Descubra como a Genesis pode automatizar todo seu atendimento no WhatsApp com IA
                </p>
                <Button 
                  asChild
                  size="lg"
                >
                  <a href="/venda-genesis#precos">Conhecer Planos</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VendaFerramentas;
