import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, QrCode, Copy, Check, Download, CheckCircle, MessageSquare, ListChecks, Sparkles, Zap, ArrowRight, Lock, Shield, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import QRCode from 'qrcode';

const VendaFerramentas = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Link Generator State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // QR Code Generator State
  const [qrType, setQrType] = useState<'permanent' | 'temporary'>('permanent');
  const [qrContent, setQrContent] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');

  // Validator State
  const [validatorPhone, setValidatorPhone] = useState('');
  const [validationResult, setValidationResult] = useState<null | 'valid' | 'invalid'>(null);

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
        width: 280,
        margin: 3,
        color: { dark: '#1a1a2e', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
      setQrImageUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQr = () => {
    if (!qrImageUrl) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height + 40;
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, img.height, canvas.width, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Genesis • Automação WhatsApp', canvas.width / 2, img.height + 25);
        
        const link = document.createElement('a');
        link.download = `genesis-qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    img.src = qrImageUrl;
  };

  const validatePhone = () => {
    if (!validatorPhone) return;
    const clean = validatorPhone.replace(/\D/g, '');
    // Validação básica: 10-13 dígitos (com DDD e código do país)
    const isValid = clean.length >= 10 && clean.length <= 13;
    setValidationResult(isValid ? 'valid' : 'invalid');
  };

  // CTA Messages por nicho
  const ctaMessages = [
    { nicho: 'E-commerce', cta: 'Compre agora com desconto exclusivo! 🛒' },
    { nicho: 'Imobiliária', cta: 'Agende uma visita e conheça seu novo lar 🏠' },
    { nicho: 'Clínica', cta: 'Marque sua consulta em poucos segundos 👨‍⚕️' },
    { nicho: 'Restaurante', cta: 'Peça pelo WhatsApp e ganhe brinde 🍕' },
    { nicho: 'Educação', cta: 'Garanta sua vaga com matrícula online 🎓' },
    { nicho: 'Serviços', cta: 'Solicite seu orçamento gratuito agora 💼' },
  ];

  const advancedFeatures = [
    { icon: Sparkles, title: 'Luna IA', desc: 'Atendimento com inteligência artificial' },
    { icon: Zap, title: 'Automações', desc: 'Fluxos e campanhas automatizadas' },
    { icon: MessageSquare, title: 'Multi-atendentes', desc: 'Gerencie equipes no WhatsApp' },
    { icon: ListChecks, title: 'CRM Integrado', desc: 'Leads e funis de venda' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">100% Gratuito • Sem Cadastro</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Ferramentas <span className="text-primary">Gratuitas</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hub de ferramentas para potencializar seu WhatsApp Business — sem custo, sem limites</p>
          </motion.div>

          {/* Bloco 1 - Comece Grátis */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Comece Grátis</h2>
                <p className="text-sm text-muted-foreground">Ferramentas essenciais para qualquer negócio</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Link Generator */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Gerador de Link WhatsApp</CardTitle>
                      <CardDescription>Crie links genesis-wa.me personalizados</CardDescription>
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
                      <Input placeholder="11999999999" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mensagem (opcional)</label>
                    <Textarea placeholder="Olá! Vi seu anúncio e gostaria de mais informações..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
                  </div>

                  <Button onClick={generateLink} className="w-full">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Gerar Link
                  </Button>

                  {generatedLink && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-muted rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">Link Gerado!</span>
                      </div>
                      <div className="flex gap-2">
                        <Input value={generatedLink} readOnly className="flex-1 text-sm" />
                        <Button onClick={copyLink} variant="outline" className="shrink-0">
                          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* QR Code Generator */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Gerador de QR Code</CardTitle>
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
                    <label className="text-sm font-medium mb-2 block">{qrType === 'temporary' ? 'Link (expira em 24h)' : 'Link ou Texto'}</label>
                    <Input placeholder="https://exemplo.com ou texto qualquer" value={qrContent} onChange={(e) => setQrContent(e.target.value)} />
                  </div>

                  <Button onClick={generateQr} className="w-full">
                    <QrCode className="w-4 h-4 mr-2" />
                    Gerar QR Code
                  </Button>

                  {qrImageUrl && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 p-4 bg-muted rounded-xl">
                      <div className="relative bg-white p-3 rounded-xl shadow-lg">
                        <img src={qrImageUrl} alt="QR Code" className="w-48 h-48" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                            <span className="text-white font-bold text-lg">G</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/30 text-center">
                          <span className="text-xs font-medium text-muted-foreground">Genesis • Automação WhatsApp</span>
                        </div>
                      </div>

                      {qrType === 'temporary' && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50">⏱️ Expira em 24 horas</Badge>
                      )}

                      <Button onClick={downloadQr} variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar QR Code
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Bloco 2 - Produtividade */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Produtividade</h2>
                <p className="text-sm text-muted-foreground">Valide e formate antes de enviar</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Validador */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Validador de Número
                  </CardTitle>
                  <CardDescription>Verifique se o formato está correto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="11999999999" value={validatorPhone} onChange={(e) => setValidatorPhone(e.target.value)} />
                  <Button onClick={validatePhone} variant="outline" className="w-full">Validar Formato</Button>
                  {validationResult && (
                    <div className={`p-3 rounded-lg ${validationResult === 'valid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {validationResult === 'valid' ? '✅ Formato válido!' : '❌ Formato inválido. Verifique o número.'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Formatador de Mensagens */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Formatação WhatsApp
                  </CardTitle>
                  <CardDescription>Dicas de formatação para suas mensagens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-mono">*texto*</span>
                      <span className="font-bold">Negrito</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-mono">_texto_</span>
                      <span className="italic">Itálico</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-mono">~texto~</span>
                      <span className="line-through">Riscado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-mono">```texto```</span>
                      <span className="font-mono text-xs bg-card px-2 py-1 rounded">Código</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Bloco 3 - Conversão */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Conversão</h2>
                <p className="text-sm text-muted-foreground">CTAs prontos para usar</p>
              </div>
            </div>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Mensagens Prontas por Nicho</CardTitle>
                <CardDescription>Copie e personalize para seu negócio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ctaMessages.map((item, i) => (
                    <div key={i} className="p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors cursor-pointer group" onClick={() => navigator.clipboard.writeText(item.cta)}>
                      <p className="text-xs text-muted-foreground mb-1">{item.nicho}</p>
                      <p className="text-sm font-medium">{item.cta}</p>
                      <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Clique para copiar</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Bloco 4 - Recursos Avançados (Teaser) */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recursos Avançados</h2>
                <p className="text-sm text-muted-foreground">Disponíveis dentro da Genesis</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {advancedFeatures.map((feature, i) => (
                <Card key={i} className="border-primary/10 bg-gradient-to-br from-primary/5 to-blue-600/5 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs">Pro</Badge>
                  </div>
                  <CardContent className="pt-6 text-center">
                    <feature.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Features Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { icon: Zap, title: 'Sem Cadastro', desc: 'Use imediatamente' },
              { icon: Infinity, title: '100% Grátis', desc: 'Sem custos ocultos' },
              { icon: Shield, title: 'Seguro', desc: 'Seus dados protegidos' },
              { icon: Sparkles, title: 'Ilimitado', desc: 'Gere quantos quiser' },
            ].map((feature, i) => (
              <Card key={i} className="text-center border-border/50 bg-card/30">
                <CardContent className="pt-6">
                  <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Bloco 5 - CTA */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-center">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-blue-600/10">
              <CardContent className="py-12 md:py-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Quer automatizar seu WhatsApp?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Descubra como a Genesis pode transformar seu atendimento com IA, automações e muito mais</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <a href="/venda-genesis#precos">
                      Conhecer Planos
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="/venda-genesis">Acessar Plataforma</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default VendaFerramentas;
