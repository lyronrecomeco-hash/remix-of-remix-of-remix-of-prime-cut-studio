 import { motion } from 'framer-motion';
 import { 
   CreditCard, 
   MessageCircle, 
   BarChart3, 
   Users, 
   Activity, 
   Receipt,
   DoorOpen,
   Dumbbell,
   ExternalLink,
   CheckCircle2,
   Clock
 } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 
 interface Integration {
   name: string;
   description: string;
   logo: string;
   category: string;
   status: 'available' | 'coming_soon' | 'connected';
   popular?: boolean;
 }
 
 const integrations: Integration[] = [
   // Pagamentos & Financeiro
   { name: 'Stripe', description: 'Pagamentos internacionais e cartões', logo: '💳', category: 'Pagamentos', status: 'available', popular: true },
   { name: 'Vindi', description: 'Cobrança recorrente automatizada', logo: '🔄', category: 'Pagamentos', status: 'available', popular: true },
   { name: 'Pagar.me', description: 'Gateway de pagamentos brasileiro', logo: '💰', category: 'Pagamentos', status: 'available' },
   { name: 'Asaas', description: 'Cobranças e gestão financeira', logo: '🏦', category: 'Pagamentos', status: 'available' },
   { name: 'Stone', description: 'Maquininhas e pagamentos', logo: '💎', category: 'Pagamentos', status: 'coming_soon' },
   { name: 'Cielo', description: 'Adquirente líder no Brasil', logo: '🔵', category: 'Pagamentos', status: 'coming_soon' },
   { name: 'Enotas', description: 'Emissão automática de NF-e', logo: '📄', category: 'Pagamentos', status: 'available' },
   
   // Marketing & CRM
   { name: 'RD Station', description: 'Automação de marketing completa', logo: '🚀', category: 'Marketing', status: 'available', popular: true },
   { name: 'WhatsApp Business API', description: 'Comunicação oficial e chatbots', logo: '💬', category: 'Marketing', status: 'available', popular: true },
   { name: 'BuzzLead', description: 'Programa de indicações', logo: '🐝', category: 'Marketing', status: 'coming_soon' },
   { name: 'Mailchimp', description: 'Email marketing profissional', logo: '📧', category: 'Marketing', status: 'available' },
   { name: 'HubSpot', description: 'CRM e automação de vendas', logo: '🧡', category: 'Marketing', status: 'coming_soon' },
   
   // Ecossistema Fitness
   { name: 'Gympass', description: 'Benefícios corporativos', logo: '🏋️', category: 'Fitness', status: 'available', popular: true },
   { name: 'TotalPass', description: 'Rede de academias', logo: '🎫', category: 'Fitness', status: 'available' },
   { name: 'Spivi', description: 'Monitoramento cardio em grupo', logo: '❤️', category: 'Fitness', status: 'coming_soon' },
   { name: 'Apple Health', description: 'Sincronização de dados de saúde', logo: '🍎', category: 'Fitness', status: 'coming_soon' },
   { name: 'Google Fit', description: 'Integração Android', logo: '🏃', category: 'Fitness', status: 'coming_soon' },
   { name: 'Garmin', description: 'Wearables e smartwatches', logo: '⌚', category: 'Fitness', status: 'coming_soon' },
   
   // Controle de Acesso
   { name: 'Control iD', description: 'Catracas e biometria', logo: '🚪', category: 'Acesso', status: 'available' },
   { name: 'Henry', description: 'Controle de ponto e acesso', logo: '🔐', category: 'Acesso', status: 'available' },
   { name: 'Facial Recognition', description: 'Reconhecimento facial IA', logo: '👤', category: 'Acesso', status: 'coming_soon' },
   
   // Analytics & BI
   { name: 'Google Analytics', description: 'Análise de comportamento', logo: '📊', category: 'Analytics', status: 'available' },
   { name: 'Google Data Studio', description: 'Dashboards personalizados', logo: '📈', category: 'Analytics', status: 'coming_soon' },
   { name: 'Power BI', description: 'Business Intelligence Microsoft', logo: '📉', category: 'Analytics', status: 'coming_soon' },
   
   // ERP & Gestão
   { name: 'TOTVS', description: 'ERP empresarial completo', logo: '🏢', category: 'Gestão', status: 'coming_soon' },
   { name: 'Conta Azul', description: 'Gestão financeira simplificada', logo: '🔷', category: 'Gestão', status: 'coming_soon' },
 ];
 
 const categoryIcons: Record<string, React.ReactNode> = {
   'Pagamentos': <CreditCard className="w-5 h-5" />,
   'Marketing': <MessageCircle className="w-5 h-5" />,
   'Fitness': <Dumbbell className="w-5 h-5" />,
   'Acesso': <DoorOpen className="w-5 h-5" />,
   'Analytics': <BarChart3 className="w-5 h-5" />,
   'Gestão': <Receipt className="w-5 h-5" />,
 };
 
 const categories = ['Pagamentos', 'Marketing', 'Fitness', 'Acesso', 'Analytics', 'Gestão'];
 
 export default function GymAdminIntegrations() {
   return (
     <div className="space-y-6 w-full">
       {/* Header */}
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
       >
         <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
         <p className="text-muted-foreground mt-1">
           Conecte sua academia às melhores plataformas do mercado
         </p>
       </motion.div>
 
       {/* Stats */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="grid grid-cols-1 sm:grid-cols-3 gap-4"
       >
         <Card className="bg-card border-border">
           <CardContent className="p-4 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
               <CheckCircle2 className="w-6 h-6 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">
                 {integrations.filter(i => i.status === 'available').length}
               </p>
               <p className="text-sm text-muted-foreground">Disponíveis</p>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-card border-border">
           <CardContent className="p-4 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
               <Clock className="w-6 h-6 text-yellow-500" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">
                 {integrations.filter(i => i.status === 'coming_soon').length}
               </p>
               <p className="text-sm text-muted-foreground">Em Breve</p>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-card border-border">
           <CardContent className="p-4 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
               <Activity className="w-6 h-6 text-green-500" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">
                 {integrations.filter(i => i.status === 'connected').length}
               </p>
               <p className="text-sm text-muted-foreground">Conectadas</p>
             </div>
           </CardContent>
         </Card>
       </motion.div>
 
       {/* Integration Categories */}
       {categories.map((category, catIndex) => {
         const categoryIntegrations = integrations.filter(i => i.category === category);
         
         return (
           <motion.div
             key={category}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 + catIndex * 0.05 }}
             className="bg-card border border-border rounded-2xl p-6"
           >
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                 {categoryIcons[category]}
               </div>
               <div>
                 <h2 className="font-semibold text-lg text-foreground">{category}</h2>
                 <p className="text-sm text-muted-foreground">
                   {categoryIntegrations.length} integrações
                 </p>
               </div>
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {categoryIntegrations.map((integration) => (
                 <Card 
                   key={integration.name}
                   className="bg-muted/50 border-border hover:border-primary/50 transition-colors"
                 >
                   <CardContent className="p-4">
                     <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-2xl">
                           {integration.logo}
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <h3 className="font-semibold text-foreground">{integration.name}</h3>
                             {integration.popular && (
                               <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                 Popular
                               </Badge>
                             )}
                           </div>
                           <p className="text-xs text-muted-foreground">{integration.description}</p>
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between mt-4">
                       {integration.status === 'available' ? (
                         <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                           <CheckCircle2 className="w-3 h-3 mr-1" />
                           Disponível
                         </Badge>
                       ) : integration.status === 'coming_soon' ? (
                         <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                           <Clock className="w-3 h-3 mr-1" />
                           Em Breve
                         </Badge>
                       ) : (
                         <Badge className="bg-primary/20 text-primary border-primary/30">
                           <Activity className="w-3 h-3 mr-1" />
                           Conectado
                         </Badge>
                       )}
                       
                       <Button 
                         size="sm" 
                         variant={integration.status === 'available' ? 'default' : 'outline'}
                         disabled={integration.status === 'coming_soon'}
                         className="h-8"
                       >
                         {integration.status === 'connected' ? 'Gerenciar' : 
                          integration.status === 'available' ? 'Conectar' : 'Aguardar'}
                         {integration.status === 'available' && <ExternalLink className="w-3 h-3 ml-1" />}
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </motion.div>
         );
       })}
     </div>
   );
 }