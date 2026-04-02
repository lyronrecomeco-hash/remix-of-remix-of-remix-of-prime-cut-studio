// Template models data with categories and realistic images
import imgPizzaria from '@/assets/templates/pizzaria.jpg';
import imgBarbearia from '@/assets/templates/barbearia.jpg';
import imgPetshop from '@/assets/templates/petshop.jpg';
import imgAcademia from '@/assets/templates/academia.jpg';
import imgSalaoBeleza from '@/assets/templates/salao-beleza.jpg';
import imgHamburgueria from '@/assets/templates/hamburgueria.jpg';
import imgRestaurante from '@/assets/templates/restaurante.jpg';
import imgClinica from '@/assets/templates/clinica.jpg';
import imgEmpresa from '@/assets/templates/empresa-servicos.jpg';
import imgLoja from '@/assets/templates/loja-local.jpg';
import imgEscola from '@/assets/templates/escola.jpg';
import imgEcommerce from '@/assets/templates/ecommerce.jpg';
import imgAgendamentos from '@/assets/templates/agendamentos.jpg';
import imgSiteComercial from '@/assets/templates/site-comercial.jpg';
import imgAppMobile from '@/assets/templates/app-mobile.jpg';

export type TemplateCategory = 'site' | 'app';

export interface TemplateModel {
  id: string;
  name: string;
  description: string;
  image: string;
  category: TemplateCategory;
  suggestedPages: string[];
  suggestedFeatures: string[];
  objectives: string[];
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'site', label: 'Site' },
  { id: 'app', label: 'App' },
];

export const TEMPLATE_MODELS: TemplateModel[] = [
  {
    id: 'pizzaria',
    name: 'Pizzaria',
    description: 'Cardápio digital, pedidos e delivery',
    image: imgPizzaria,
    category: 'site',
    suggestedPages: ['Home', 'Cardápio', 'Promoções', 'Localização', 'Contato'],
    suggestedFeatures: ['Cardápio interativo com categorias e filtros', 'Botão WhatsApp flutuante para pedidos', 'Galeria de fotos profissional', 'Horário de funcionamento dinâmico', 'Mapa interativo com Google Maps', 'Sistema de avaliações de clientes'],
    objectives: ['Receber pedidos via WhatsApp', 'Mostrar cardápio digital completo', 'Exibir localização e rotas', 'Destacar promoções do dia', 'Aceitar reservas online'],
  },
  {
    id: 'hamburgueria',
    name: 'Hamburgueria',
    description: 'Cardápio gourmet e pedidos online',
    image: imgHamburgueria,
    category: 'site',
    suggestedPages: ['Home', 'Cardápio', 'Combos', 'Sobre', 'Contato'],
    suggestedFeatures: ['Cardápio visual com fotos HD', 'Sistema de combos e promoções', 'Botão WhatsApp flutuante', 'Integração delivery', 'Galeria de ambiente', 'Reviews de clientes'],
    objectives: ['Apresentar cardápio gourmet', 'Receber pedidos online', 'Destacar combos e promoções', 'Mostrar ambiente', 'Captar clientes locais'],
  },
  {
    id: 'barbearia',
    name: 'Barbearia',
    description: 'Agendamento online e serviços',
    image: imgBarbearia,
    category: 'site',
    suggestedPages: ['Home', 'Serviços', 'Profissionais', 'Agendamento', 'Galeria', 'Contato'],
    suggestedFeatures: ['Sistema de agendamento online', 'Perfil detalhado dos barbeiros', 'Galeria de trabalhos realizados', 'Botão WhatsApp flutuante', 'Reviews e avaliações', 'Programa de fidelidade'],
    objectives: ['Agendamento online automatizado', 'Apresentar serviços e preços', 'Mostrar equipe profissional', 'Captar clientes locais', 'Fidelizar clientes recorrentes'],
  },
  {
    id: 'petshop',
    name: 'Petshop',
    description: 'Serviços para pets e agendamento',
    image: imgPetshop,
    category: 'site',
    suggestedPages: ['Home', 'Serviços', 'Produtos', 'Agendamento', 'Sobre', 'Contato'],
    suggestedFeatures: ['Agendamento de banho e tosa', 'Catálogo de produtos', 'Galeria de pets atendidos', 'Botão WhatsApp flutuante', 'Dicas e cuidados com pets'],
    objectives: ['Agendar banho e tosa online', 'Mostrar serviços disponíveis', 'Vender produtos online', 'Programa de fidelidade', 'Informar sobre veterinária'],
  },
  {
    id: 'academia',
    name: 'Academia',
    description: 'Planos, treinos e matrículas',
    image: imgAcademia,
    category: 'site',
    suggestedPages: ['Home', 'Planos', 'Estrutura', 'Aulas', 'Horários', 'Contato'],
    suggestedFeatures: ['Tabela de planos e preços', 'Tour virtual da estrutura', 'Calendário de aulas', 'Botão WhatsApp flutuante', 'Depoimentos de alunos'],
    objectives: ['Captar novos alunos', 'Mostrar planos e preços', 'Apresentar estrutura', 'Informar horários de aulas', 'Promover aulas especiais'],
  },
  {
    id: 'salao-beleza',
    name: 'Salão de Beleza',
    description: 'Agendamento e serviços de beleza',
    image: imgSalaoBeleza,
    category: 'site',
    suggestedPages: ['Home', 'Serviços', 'Profissionais', 'Portfolio', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Sistema de agendamento', 'Galeria de trabalhos', 'Perfil das profissionais', 'Botão WhatsApp flutuante', 'Avaliações de clientes'],
    objectives: ['Agendamento online', 'Mostrar serviços e preços', 'Apresentar profissionais', 'Exibir portfolio', 'Promover ofertas sazonais'],
  },
  {
    id: 'restaurante',
    name: 'Restaurante',
    description: 'Cardápio, reservas e delivery',
    image: imgRestaurante,
    category: 'site',
    suggestedPages: ['Home', 'Cardápio', 'Reservas', 'Galeria', 'Eventos', 'Contato'],
    suggestedFeatures: ['Cardápio digital categorizado', 'Sistema de reservas online', 'Galeria do ambiente', 'Botão WhatsApp flutuante', 'Mapa de localização'],
    objectives: ['Mostrar cardápio completo', 'Aceitar reservas online', 'Pedidos para delivery', 'Apresentar o ambiente', 'Promover eventos especiais'],
  },
  {
    id: 'clinica',
    name: 'Clínica / Saúde',
    description: 'Agendamento médico e serviços',
    image: imgClinica,
    category: 'site',
    suggestedPages: ['Home', 'Especialidades', 'Equipe', 'Convênios', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Sistema de agendamento médico', 'Perfil dos profissionais', 'Lista de convênios aceitos', 'Botão WhatsApp flutuante', 'Depoimentos de pacientes'],
    objectives: ['Agendamento de consultas', 'Apresentar especialidades', 'Mostrar equipe médica', 'Informar convênios', 'Gerar confiança e credibilidade'],
  },
  {
    id: 'empresa-servicos',
    name: 'Empresa de Serviços',
    description: 'Portfólio e orçamentos',
    image: imgEmpresa,
    category: 'site',
    suggestedPages: ['Home', 'Serviços', 'Portfólio', 'Sobre', 'Orçamento', 'Contato'],
    suggestedFeatures: ['Formulário de orçamento detalhado', 'Galeria de projetos realizados', 'Depoimentos de clientes', 'Botão WhatsApp flutuante', 'Cases de sucesso'],
    objectives: ['Apresentar serviços', 'Gerar orçamentos qualificados', 'Mostrar portfólio', 'Captar leads qualificados', 'Construir autoridade no mercado'],
  },
  {
    id: 'loja-local',
    name: 'Loja Local',
    description: 'Catálogo de produtos e vendas',
    image: imgLoja,
    category: 'site',
    suggestedPages: ['Home', 'Produtos', 'Ofertas', 'Sobre', 'Localização', 'Contato'],
    suggestedFeatures: ['Catálogo de produtos com filtros', 'Carrinho de compras', 'Sistema de ofertas e promoções', 'Botão WhatsApp flutuante', 'Newsletter de ofertas'],
    objectives: ['Mostrar catálogo completo', 'Vender online', 'Informar localização', 'Promover ofertas semanais', 'Fidelizar clientes'],
  },
  {
    id: 'escola',
    name: 'Escola / Curso',
    description: 'Cursos, matrículas e informações',
    image: imgEscola,
    category: 'site',
    suggestedPages: ['Home', 'Cursos', 'Metodologia', 'Estrutura', 'Matrícula', 'Contato'],
    suggestedFeatures: ['Lista de cursos detalhada', 'Formulário de matrícula', 'Tour virtual da estrutura', 'Botão WhatsApp flutuante', 'Depoimentos de alunos'],
    objectives: ['Captar novos alunos', 'Mostrar grade de cursos', 'Facilitar matrículas online', 'Informar metodologia', 'Apresentar estrutura'],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Loja virtual completa',
    image: imgEcommerce,
    category: 'app',
    suggestedPages: ['Home', 'Produtos', 'Categorias', 'Carrinho', 'Checkout', 'Minha Conta', 'Contato'],
    suggestedFeatures: ['Catálogo de produtos com busca e filtros', 'Carrinho de compras e checkout', 'Sistema de pagamento integrado', 'Painel administrativo', 'Gestão de estoque', 'Sistema de cupons e descontos'],
    objectives: ['Vender produtos online', 'Gestão de pedidos', 'Integrar meios de pagamento', 'Dashboard de vendas', 'Marketing e promoções'],
  },
  {
    id: 'agendamentos',
    name: 'Sistema de Agendamentos',
    description: 'Plataforma de booking completa',
    image: imgAgendamentos,
    category: 'app',
    suggestedPages: ['Home', 'Serviços', 'Agenda', 'Meus Agendamentos', 'Perfil', 'Admin'],
    suggestedFeatures: ['Calendário interativo de agendamento', 'Gestão de horários e profissionais', 'Notificações por WhatsApp/email', 'Dashboard administrativo', 'Relatórios de atendimento', 'Sistema de avaliação'],
    objectives: ['Automatizar agendamentos', 'Reduzir faltas com lembretes', 'Gestão de profissionais', 'Relatórios de performance', 'Integrar com WhatsApp'],
  },
  {
    id: 'site-comercial',
    name: 'Site Comercial',
    description: 'Landing page institucional profissional',
    image: imgSiteComercial,
    category: 'site',
    suggestedPages: ['Home', 'Sobre', 'Serviços', 'Portfolio', 'Blog', 'Contato'],
    suggestedFeatures: ['Hero section impactante', 'Seção de serviços com ícones', 'Formulário de contato', 'Botão WhatsApp flutuante', 'SEO otimizado', 'Integração com redes sociais'],
    objectives: ['Apresentar a empresa online', 'Captar leads via formulário', 'Construir presença digital', 'Mostrar credibilidade', 'Ranquear no Google'],
  },
  {
    id: 'app-mobile',
    name: 'App Mobile',
    description: 'Aplicativo mobile completo',
    image: imgAppMobile,
    category: 'app',
    suggestedPages: ['Splash', 'Login', 'Home', 'Dashboard', 'Perfil', 'Configurações'],
    suggestedFeatures: ['Autenticação completa (login/registro)', 'Dashboard com métricas', 'Notificações push', 'Modo offline', 'Design responsivo mobile-first', 'PWA com instalação'],
    objectives: ['Criar experiência mobile nativa', 'Autenticação segura', 'Funcionalidades offline', 'Push notifications', 'Publicação em lojas de apps'],
  },
];
