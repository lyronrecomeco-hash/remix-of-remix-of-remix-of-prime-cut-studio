import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, QrCode, Copy, Check, Download, ArrowLeft, Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const VendaFerramentas = () => {
  const navigate = useNavigate();
  
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
      const url = await QRCode.toDataURL(content, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrImageUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQr = () => {
    if (!qrImageUrl) return;
    const link = document.createElement('a');
    link.download = `genesis-qrcode-${Date.now()}.png`;
    link.href = qrImageUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/venda-genesis')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg">Ferramentas Grátis</span>
            </div>

            <Button 
              onClick={() => navigate('/venda-genesis#precos')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              size="sm"
            >
              <span className="hidden sm:inline">Começar Grátis</span>
              <span className="sm:hidden">Começar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
              100% Gratuito • Sem Cadastro
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Ferramentas <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Gratuitas</span>
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Link className="w-6 h-6 text-white" />
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
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Gerar Link
                  </Button>

                  {generatedLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-muted rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-500">Link Gerado!</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex gap-2">
                        <Input value={generatedLink} readOnly className="flex-1 text-sm" />
                        <Button 
                          onClick={copyLink}
                          variant="outline"
                          className="shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Gerador de QR Code</CardTitle>
                      <CardDescription>Com marca Genesis</CardDescription>
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
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
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
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-xl" />
                        <div className="relative bg-white p-4 rounded-xl shadow-lg">
                          <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 md:w-64 md:h-64" />
                          {/* Genesis Logo Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl md:text-2xl">G</span>
                            </div>
                          </div>
                        </div>
                        {/* Genesis Watermark */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                          <span className="text-white text-xs font-medium">Powered by Genesis</span>
                        </div>
                      </div>

                      {qrType === 'temporary' && (
                        <Badge variant="outline" className="text-orange-500 border-orange-500/50">
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
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-600/5">
              <CardContent className="py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  Quer mais recursos?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Descubra como a Genesis pode automatizar todo seu atendimento no WhatsApp com IA
                </p>
                <Button 
                  onClick={() => navigate('/venda-genesis')}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Conhecer a Genesis
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
