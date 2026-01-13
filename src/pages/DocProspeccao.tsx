import { ArrowLeft, Search, Target, FileText, CheckCircle, AlertTriangle, Lightbulb, Users, MessageSquare, Star, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const DocProspeccao = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Documentação: Prospector</h1>
            <p className="text-sm text-muted-foreground">Guia completo da ferramenta de prospecção</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Intro */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">O que é o Prospector?</CardTitle>
                <CardDescription>Sua ferramenta de captação inteligente de clientes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              O <strong>Prospector</strong> é uma ferramenta poderosa que permite buscar estabelecimentos comerciais 
              em qualquer cidade do Brasil, filtrar por nicho de mercado, e transformá-los em potenciais clientes 
              para o Genesis Hub. Com ele, você pode prospectar de forma profissional e escalável.
            </p>
          </CardContent>
        </Card>

        {/* Como usar */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Como Usar o Prospector
          </h2>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0">1</Badge>
                  Buscar Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Na aba <strong>"Buscar"</strong>, preencha os campos:
                </p>
                <ul className="text-sm space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Cidade:</strong> Digite o nome da cidade (ex: São Paulo, Curitiba)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Estado:</strong> Selecione o estado brasileiro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Nicho:</strong> Escolha o tipo de negócio (Barbearia, Salão, Clínica, etc.)</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Clique em <strong>"Buscar Estabelecimentos"</strong> e aguarde os resultados. 
                  A busca retorna até <Badge variant="outline">100 resultados</Badge> por pesquisa.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0">2</Badge>
                  Adicionar à Lista de Prospectos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ao encontrar um estabelecimento interessante, clique em <strong>"+ Adicionar"</strong> 
                  para salvá-lo na sua lista de prospectos. Você pode gerenciar todos na aba <strong>"Lista"</strong>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0">3</Badge>
                  Criar Proposta Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Na aba <strong>"Proposta"</strong>, a Luna IA gera uma proposta comercial personalizada 
                  para cada prospect, considerando o nicho e as dores específicas do negócio.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Limites */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Limites e Boas Práticas
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-yellow-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  Limites de Busca
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Máximo de <strong>100 resultados</strong> por busca</li>
                  <li>• Evite buscas repetitivas em curto intervalo</li>
                  <li>• Varie entre cidades para melhor cobertura</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Boas Práticas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Foque em nichos que você domina</li>
                  <li>• Personalize a abordagem por segmento</li>
                  <li>• Acompanhe o status de cada prospect</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Identificando bons estabelecimentos */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Como Identificar um Bom Estabelecimento
          </h2>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sinais Positivos
                  </h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Tem website mas é desatualizado ou não tem agendamento online</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Avaliação entre 4.0 e 4.8 (espaço para melhorar)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Número de reviews acima de 50 (estabelecimento ativo)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Telefone comercial disponível</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Localização em área comercial movimentada</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Sinais de Alerta
                  </h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Avaliação abaixo de 3.5 (problemas estruturais)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Poucas avaliações (negócio novo ou pouco movimento)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Sem telefone ou website (baixa maturidade digital)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Já possui sistema de agendamento robusto</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        {/* Revisando propostas */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Revisando Propostas Antes de Enviar
          </h2>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Personalize a Mensagem</h3>
                  <p className="text-sm text-muted-foreground">
                    A Luna IA gera uma base, mas você deve revisar e adicionar toques pessoais. 
                    Mencione algo específico que você notou sobre o estabelecimento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Tom de Voz</h3>
                  <p className="text-sm text-muted-foreground">
                    Mantenha um tom profissional mas amigável. Evite parecer spam. 
                    A proposta deve soar como se fosse de uma pessoa real interessada em ajudar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Verifique o Contexto</h3>
                  <p className="text-sm text-muted-foreground">
                    Antes de enviar, visite o site/redes do estabelecimento. 
                    Certifique-se de que a proposta faz sentido para a realidade deles.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Follow-up</h3>
                  <p className="text-sm text-muted-foreground">
                    Se não houver resposta em 3-5 dias, faça um follow-up gentil. 
                    Atualize o status do prospect para acompanhar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dica Final */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dica de Ouro</h3>
                <p className="text-sm text-muted-foreground">
                  O segredo da prospecção efetiva não é o volume, mas a qualidade. 
                  10 abordagens personalizadas convertem mais que 100 mensagens genéricas. 
                  Use o Prospector para encontrar leads, mas invista tempo em entender 
                  cada negócio antes de fazer contato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DocProspeccao;
