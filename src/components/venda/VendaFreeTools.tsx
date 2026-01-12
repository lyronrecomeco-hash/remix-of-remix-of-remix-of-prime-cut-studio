import { useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  Link2, QrCode, Copy, Check, Download, 
  Sparkles, Clock, Infinity, ExternalLink,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const VendaFreeTools = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // Link Generator State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // QR Code State
  const [qrType, setQrType] = useState<'permanent' | 'temporary'>('permanent');
  const [qrContent, setQrContent] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [genesisQrUrl, setGenesisQrUrl] = useState('');

  // Generate Genesis QR on mount
  useState(() => {
    const generateGenesisQr = async () => {
      try {
        const url = await QRCode.toDataURL('https://genesis.lovable.app', {
          width: 300,
          margin: 2,
          color: { dark: '#3b82f6', light: '#ffffff' }
        });
        setGenesisQrUrl(url);
      } catch (err) {
        console.error('Error generating Genesis QR:', err);
      }
    };
    generateGenesisQr();
  });

  // Generate Link
  const generateLink = useCallback(() => {
    if (!phoneNumber) {
      toast.error('Digite um número de telefone');
      return;
    }
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
    const link = `https://genesis-wa.me/${cleanPhone}${encodedMessage}`;
    setGeneratedLink(link);
    toast.success('Link gerado com sucesso!');
  }, [phoneNumber, message]);

  // Copy Link
  const copyLink = useCallback(async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  }, [generatedLink]);

  // Generate QR Code
  const generateQr = useCallback(async () => {
    if (!qrContent) {
      toast.error('Digite um conteúdo para o QR Code');
      return;
    }

    try {
      const finalContent = qrType === 'temporary' 
        ? `${qrContent}?expires=${Date.now() + 24 * 60 * 60 * 1000}` 
        : qrContent;
        
      const url = await QRCode.toDataURL(finalContent, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrImageUrl(url);
      toast.success(`QR Code ${qrType === 'permanent' ? 'permanente' : 'temporário (24h)'} gerado!`);
    } catch (err) {
      toast.error('Erro ao gerar QR Code');
    }
  }, [qrContent, qrType]);

  // Download QR
  const downloadQr = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }, []);

  return (
    <section id="ferramentas" ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-green-500/10 border border-green-500/20 text-green-500"
          >
            <Sparkles className="w-4 h-4" />
            100% Grátis
            <Badge variant="secondary" className="ml-1 text-[10px] bg-green-500/20 text-green-500 border-green-500/30">SEM CADASTRO</Badge>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ferramentas <span className="text-primary">Gratuitas</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Use agora mesmo, sem precisar criar conta. 
            <span className="text-foreground font-semibold"> Gerador de Link e QR Code</span> para WhatsApp.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Link Generator */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 md:p-8 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Gerador de Link</h3>
                  <p className="text-sm text-muted-foreground">genesis-wa.me</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Número do WhatsApp</Label>
                  <Input
                    placeholder="Ex: 5511999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mensagem pré-definida (opcional)</Label>
                  <Input
                    placeholder="Olá! Vi seu anúncio e gostaria de saber mais..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <Button onClick={generateLink} className="w-full gap-2">
                  <Link2 className="w-4 h-4" />
                  Gerar Link
                </Button>

                {generatedLink && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-sm text-primary truncate">
                        {generatedLink}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={copyLink}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(generatedLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Testar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* QR Code Generator */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 md:p-8 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Gerador de QR Code</h3>
                  <p className="text-sm text-muted-foreground">Permanente ou Temporário</p>
                </div>
              </div>

              <Tabs value={qrType} onValueChange={(v) => setQrType(v as 'permanent' | 'temporary')} className="mb-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="permanent" className="gap-2">
                    <Infinity className="w-4 h-4" />
                    Permanente
                  </TabsTrigger>
                  <TabsTrigger value="temporary" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Temporário (24h)
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Conteúdo do QR Code</Label>
                  <Input
                    placeholder="URL, texto, número de WhatsApp..."
                    value={qrContent}
                    onChange={(e) => setQrContent(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <Button onClick={generateQr} className="w-full gap-2" variant="secondary">
                  <QrCode className="w-4 h-4" />
                  Gerar QR Code
                </Button>

                {qrImageUrl && (
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex flex-col items-center gap-4">
                    <img 
                      src={qrImageUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 rounded-lg shadow-lg"
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant={qrType === 'permanent' ? 'default' : 'secondary'}>
                        {qrType === 'permanent' ? (
                          <><Infinity className="w-3 h-3 mr-1" /> Permanente</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> Expira em 24h</>
                        )}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => downloadQr(qrImageUrl, `qrcode-${qrType}.png`)}
                    >
                      <Download className="w-4 h-4" />
                      Baixar QR Code
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Genesis QR Code Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-md mx-auto p-6 md:p-8 bg-gradient-to-br from-primary/10 to-blue-600/10 border-primary/30">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Bot className="w-8 h-8 text-primary" />
              <div className="text-left">
                <h3 className="text-lg font-bold">QR Code Genesis</h3>
                <p className="text-sm text-muted-foreground">Acesse nossa plataforma</p>
              </div>
            </div>
            
            {genesisQrUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                  <img 
                    src={genesisQrUrl} 
                    alt="Genesis QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Escaneie para conhecer a Genesis
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="gap-2"
                  onClick={() => downloadQr(genesisQrUrl, 'genesis-qrcode.png')}
                >
                  <Download className="w-4 h-4" />
                  Baixar QR Genesis
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaFreeTools;
