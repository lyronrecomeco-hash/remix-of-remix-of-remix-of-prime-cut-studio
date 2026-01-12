import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link2, QrCode, Copy, Check, Download, Clock, Infinity, Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import QRCode from 'qrcode';

const SiteTools = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // Link Generator State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  // QR Code State
  const [qrPhone, setQrPhone] = useState('');
  const [qrMessage, setQrMessage] = useState('');
  const [qrType, setQrType] = useState<'temporary' | 'permanent'>('permanent');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const generateWhatsAppLink = () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) return;
    
    let link = `https://genesis-wa.link/${formattedPhone}`;
    if (message.trim()) {
      link += `?text=${encodeURIComponent(message)}`;
    }
    setGeneratedLink(link);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const generateQRCode = async () => {
    const formattedPhone = formatPhoneNumber(qrPhone);
    if (!formattedPhone) return;
    
    let waLink = `https://wa.me/${formattedPhone}`;
    if (qrMessage.trim()) {
      waLink += `?text=${encodeURIComponent(qrMessage)}`;
    }
    
    try {
      const dataUrl = await QRCode.toDataURL(waLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#059669',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
      setQrGenerated(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `genesis-qr-${formatPhoneNumber(qrPhone)}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <section id="ferramentas" ref={ref} className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Smartphone className="w-4 h-4" />
            Ferramentas Gratuitas
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ferramentas <span className="text-emerald-600">grátis</span> da Genesis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use nossas ferramentas sem precisar de conta. 
            <strong className="text-gray-900"> 100% gratuito, para sempre.</strong>
          </p>
        </motion.div>

        {/* Tools Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-14 bg-white border border-gray-200 rounded-2xl p-1 mb-8">
              <TabsTrigger 
                value="link" 
                className="rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600 font-medium"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Gerador de Link
              </TabsTrigger>
              <TabsTrigger 
                value="qr"
                className="rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600 font-medium"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Gerador de QR Code
              </TabsTrigger>
            </TabsList>

            {/* Link Generator */}
            <TabsContent value="link">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Genesis Link</h3>
                    <p className="text-sm text-gray-500">Crie links personalizados para WhatsApp</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-medium mb-2 block">Número do WhatsApp</Label>
                    <Input
                      placeholder="Ex: 5511999999999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Inclua o código do país (55 para Brasil)</p>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium mb-2 block">Mensagem (opcional)</Label>
                    <Textarea
                      placeholder="Olá! Vi seu site e gostaria de saber mais..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[100px] rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <Button 
                    onClick={generateWhatsAppLink}
                    disabled={!phoneNumber}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-emerald-500/25"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Gerar Link
                  </Button>

                  {generatedLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200"
                    >
                      <Label className="text-emerald-700 font-medium mb-2 block">Seu link Genesis:</Label>
                      <div className="flex gap-2">
                        <Input
                          value={generatedLink}
                          readOnly
                          className="flex-1 bg-white border-emerald-200 text-emerald-700 font-mono text-sm"
                        />
                        <Button
                          onClick={copyLink}
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                        >
                          {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                        >
                          <a href={generatedLink.replace('genesis-wa.link', 'wa.me')} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* QR Code Generator */}
            <TabsContent value="qr">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Genesis QR</h3>
                    <p className="text-sm text-gray-500">Crie QR Codes exclusivos para WhatsApp</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700 font-medium mb-2 block">Número do WhatsApp</Label>
                      <Input
                        placeholder="Ex: 5511999999999"
                        value={qrPhone}
                        onChange={(e) => setQrPhone(e.target.value)}
                        className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium mb-2 block">Mensagem (opcional)</Label>
                      <Textarea
                        placeholder="Mensagem pré-definida..."
                        value={qrMessage}
                        onChange={(e) => setQrMessage(e.target.value)}
                        className="min-h-[80px] rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium mb-3 block">Tipo de QR Code</Label>
                      <RadioGroup value={qrType} onValueChange={(v) => setQrType(v as 'temporary' | 'permanent')} className="flex gap-4">
                        <div className="flex-1">
                          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            qrType === 'permanent' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <RadioGroupItem value="permanent" id="permanent" />
                            <div>
                              <div className="flex items-center gap-2">
                                <Infinity className="w-4 h-4 text-emerald-600" />
                                <span className="font-medium text-gray-900">Permanente</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Nunca expira</p>
                            </div>
                          </label>
                        </div>
                        <div className="flex-1">
                          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            qrType === 'temporary' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <RadioGroupItem value="temporary" id="temporary" />
                            <div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span className="font-medium text-gray-900">Temporário</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Expira em 24h</p>
                            </div>
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button 
                      onClick={generateQRCode}
                      disabled={!qrPhone}
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-emerald-500/25"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Gerar QR Code
                    </Button>
                  </div>

                  {/* QR Code Preview */}
                  <div className="flex flex-col items-center justify-center">
                    {qrGenerated ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 inline-block mb-4">
                          <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {qrType === 'permanent' ? '✓ QR Code permanente' : '⏱ Expira em 24 horas'}
                        </p>
                        <Button
                          onClick={downloadQRCode}
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar PNG
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <QrCode className="w-12 h-12 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Seu QR Code aparecerá aqui</p>
                        </div>
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

export default SiteTools;
