import { useState, useEffect } from 'react';
import { FileText, Image, Video, Link2, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Material {
  id: string;
  title: string;
  type: string;
  content: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

const AffiliateMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_materials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success('Copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'link':
        return <Link2 className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'banner':
        return 'Banners';
      case 'video':
        return 'Vídeos';
      case 'copy':
        return 'Textos';
      case 'link':
        return 'Links';
      default:
        return 'Outros';
    }
  };

  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.type]) {
      acc[material.type] = [];
    }
    acc[material.type].push(material);
    return acc;
  }, {} as Record<string, Material[]>);

  const types = Object.keys(groupedMaterials);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Materiais de Divulgação</h2>
        <p className="text-muted-foreground mt-1">
          Utilize estes materiais para promover e aumentar suas vendas
        </p>
      </div>

      {materials.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum material disponível</h3>
            <p className="text-muted-foreground mt-2">
              Novos materiais serão adicionados em breve.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={types[0] || 'banner'} className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 bg-secondary/50 p-1 h-auto">
            {types.map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {getTypeIcon(type)}
                {getTypeLabel(type)}
                <span className="ml-1 text-xs bg-background/20 px-2 py-0.5 rounded-full">
                  {groupedMaterials[type].length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {types.map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedMaterials[type].map((material) => (
                  <Card key={material.id} className="bg-card border-border overflow-hidden">
                    {material.image_url && (
                      <div className="aspect-video bg-secondary/50 relative">
                        <img
                          src={material.image_url}
                          alt={material.title}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="sm"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                          onClick={() => window.open(material.image_url!, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground">{material.title}</h3>
                      {material.content && (
                        <div className="mt-3">
                          <div className="bg-secondary/50 rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {material.content}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => copyContent(material.id, material.content!)}
                          >
                            {copiedId === material.id ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Texto
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      {type === 'link' && material.content && (
                        <Button
                          size="sm"
                          className="mt-3 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => window.open(material.content!, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Acessar Link
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AffiliateMaterials;
