import imgPizzaria from '@/assets/templates/pizzaria.jpg';
import imgBarbearia from '@/assets/templates/barbearia.jpg';
import imgPetshop from '@/assets/templates/petshop.jpg';
import imgAcademia from '@/assets/templates/academia.jpg';
import imgSalaoBeleza from '@/assets/templates/salao-beleza.jpg';
import imgHamburgueria from '@/assets/templates/hamburgueria.jpg';
import imgRestaurante from '@/assets/templates/restaurante.jpg';
import imgClinica from '@/assets/templates/clinica.jpg';
import imgEcommerce from '@/assets/templates/ecommerce.jpg';
import imgAgendamentos from '@/assets/templates/agendamentos.jpg';
import imgCafeteria from '@/assets/templates/cafeteria.jpg';
import imgImobiliaria from '@/assets/templates/imobiliaria.jpg';
import imgTattoo from '@/assets/templates/tattoo.jpg';
import imgLavaCar from '@/assets/templates/lava-car.jpg';
import imgSushi from '@/assets/templates/sushi.jpg';
import imgDentista from '@/assets/templates/dentista.jpg';
import imgSorveteria from '@/assets/templates/sorveteria.jpg';
import imgPadaria from '@/assets/templates/padaria.jpg';
import imgNailDesigner from '@/assets/templates/nail-designer.jpg';
import imgChurrascaria from '@/assets/templates/churrascaria.jpg';
import imgOficina from '@/assets/templates/oficina.jpg';
import imgFloricultura from '@/assets/templates/floricultura.jpg';
import imgLandingPage from '@/assets/templates/landing-page.jpg';

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
    description: 'Cardapio digital e pedidos online',
    image: imgPizzaria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Promocoes', 'Localizacao', 'Contato'],
    suggestedFeatures: ['Cardapio interativo com categorias', 'Botao WhatsApp flutuante', 'Galeria de fotos', 'Horario de funcionamento', 'Mapa interativo', 'Avaliacoes de clientes'],
    objectives: ['Receber pedidos via WhatsApp', 'Mostrar cardapio digital', 'Exibir localizacao', 'Destacar promocoes', 'Aceitar reservas'],
  },
  {
    id: 'hamburgueria',
    name: 'Hamburgueria',
    description: 'Menu interativo e delivery para hamburguerias',
    image: imgHamburgueria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Combos', 'Sobre', 'Contato'],
    suggestedFeatures: ['Cardapio visual com fotos HD', 'Sistema de combos', 'Botao WhatsApp flutuante', 'Integracao delivery', 'Galeria de ambiente', 'Reviews'],
    objectives: ['Apresentar cardapio gourmet', 'Receber pedidos online', 'Destacar combos', 'Mostrar ambiente', 'Captar clientes'],
  },
  {
    id: 'barbearia',
    name: 'Barbearia',
    description: 'Agendamento online e portfolio',
    image: imgBarbearia,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Profissionais', 'Agendamento', 'Galeria', 'Contato'],
    suggestedFeatures: ['Sistema de agendamento', 'Perfil dos barbeiros', 'Galeria de trabalhos', 'Botao WhatsApp flutuante', 'Reviews', 'Programa de fidelidade'],
    objectives: ['Agendamento online', 'Apresentar servicos e precos', 'Mostrar equipe', 'Captar clientes locais', 'Fidelizar clientes'],
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    description: 'Vitrine digital e fidelidade para cafeterias',
    image: imgCafeteria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Sobre', 'Galeria', 'Contato'],
    suggestedFeatures: ['Cardapio com fotos', 'Programa de fidelidade', 'Botao WhatsApp', 'Galeria do ambiente', 'Horarios de funcionamento', 'Eventos especiais'],
    objectives: ['Mostrar cardapio completo', 'Fidelizar clientes', 'Apresentar ambiente', 'Promover eventos', 'Captar clientes locais'],
  },
  {
    id: 'restaurante',
    name: 'Restaurante',
    description: 'Cardapio digital, reservas e delivery',
    image: imgRestaurante,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Reservas', 'Galeria', 'Eventos', 'Contato'],
    suggestedFeatures: ['Cardapio digital categorizado', 'Sistema de reservas', 'Galeria do ambiente', 'Botao WhatsApp flutuante', 'Mapa de localizacao'],
    objectives: ['Mostrar cardapio', 'Aceitar reservas', 'Pedidos delivery', 'Apresentar ambiente', 'Promover eventos'],
  },
  {
    id: 'sushi',
    name: 'Sushi / Japonesa',
    description: 'Cardapio japones e pedidos online',
    image: imgSushi,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Combos', 'Delivery', 'Sobre', 'Contato'],
    suggestedFeatures: ['Cardapio japones com fotos', 'Sistema de combos', 'Pedidos online', 'Botao WhatsApp', 'Galeria do ambiente', 'Avaliacoes'],
    objectives: ['Apresentar cardapio japones', 'Receber pedidos delivery', 'Destacar combos', 'Mostrar ambiente', 'Captar clientes'],
  },
  {
    id: 'churrascaria',
    name: 'Churrascaria',
    description: 'Rodizio, carnes e reservas',
    image: imgChurrascaria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Rodizio', 'Reservas', 'Galeria', 'Contato'],
    suggestedFeatures: ['Cardapio de carnes', 'Sistema de reservas', 'Galeria do salao', 'Botao WhatsApp', 'Eventos e confraternizacoes', 'Avaliacoes'],
    objectives: ['Mostrar cardapio de carnes', 'Aceitar reservas online', 'Promover rodizio', 'Apresentar estrutura', 'Eventos corporativos'],
  },
  {
    id: 'sorveteria',
    name: 'Sorveteria / Acai',
    description: 'Sorvetes, acai e sobremesas',
    image: imgSorveteria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Sabores', 'Promocoes', 'Contato'],
    suggestedFeatures: ['Cardapio de sabores', 'Combos e promocoes', 'Pedidos via WhatsApp', 'Galeria de produtos', 'Programa fidelidade'],
    objectives: ['Mostrar sabores disponiveis', 'Receber pedidos', 'Promover combos', 'Fidelizar clientes', 'Captar clientes locais'],
  },
  {
    id: 'padaria',
    name: 'Padaria / Confeitaria',
    description: 'Paes artesanais, bolos e doces',
    image: imgPadaria,
    category: 'site',
    suggestedPages: ['Home', 'Produtos', 'Encomendas', 'Galeria', 'Sobre', 'Contato'],
    suggestedFeatures: ['Catalogo de produtos', 'Sistema de encomendas', 'Galeria de bolos', 'Botao WhatsApp', 'Horarios de funcionamento'],
    objectives: ['Mostrar produtos artesanais', 'Receber encomendas', 'Apresentar especialidades', 'Captar clientes locais', 'Promover produtos sazonais'],
  },
  {
    id: 'petshop',
    name: 'Petshop',
    description: 'Servicos para pets e agendamento',
    image: imgPetshop,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Produtos', 'Agendamento', 'Sobre', 'Contato'],
    suggestedFeatures: ['Agendamento de banho e tosa', 'Catalogo de produtos', 'Galeria de pets', 'Botao WhatsApp', 'Dicas e cuidados'],
    objectives: ['Agendar banho e tosa', 'Mostrar servicos', 'Vender produtos', 'Programa fidelidade', 'Informar sobre veterinaria'],
  },
  {
    id: 'academia',
    name: 'Academia',
    description: 'Planos, treinos e matriculas',
    image: imgAcademia,
    category: 'site',
    suggestedPages: ['Home', 'Planos', 'Estrutura', 'Aulas', 'Horarios', 'Contato'],
    suggestedFeatures: ['Tabela de planos e precos', 'Tour virtual', 'Calendario de aulas', 'Botao WhatsApp', 'Depoimentos de alunos'],
    objectives: ['Captar novos alunos', 'Mostrar planos', 'Apresentar estrutura', 'Informar horarios', 'Promover aulas especiais'],
  },
  {
    id: 'salao-beleza',
    name: 'Salao de Beleza',
    description: 'Agendamento e servicos de beleza',
    image: imgSalaoBeleza,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Profissionais', 'Portfolio', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Sistema de agendamento', 'Galeria de trabalhos', 'Perfil das profissionais', 'Botao WhatsApp', 'Avaliacoes'],
    objectives: ['Agendamento online', 'Mostrar servicos e precos', 'Apresentar profissionais', 'Exibir portfolio', 'Promover ofertas'],
  },
  {
    id: 'nail-designer',
    name: 'Nail Designer',
    description: 'Catalogo de unhas e agendamento',
    image: imgNailDesigner,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Portfolio', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Galeria de trabalhos', 'Agendamento online', 'Catalogo de servicos', 'Botao WhatsApp', 'Depoimentos de clientes'],
    objectives: ['Mostrar portfolio de unhas', 'Agendar online', 'Apresentar servicos', 'Captar clientes', 'Fidelizar com promocoes'],
  },
  {
    id: 'clinica',
    name: 'Clinica / Saude',
    description: 'Agendamento medico e servicos',
    image: imgClinica,
    category: 'site',
    suggestedPages: ['Home', 'Especialidades', 'Equipe', 'Convenios', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Sistema de agendamento', 'Perfil dos profissionais', 'Lista de convenios', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Agendamento de consultas', 'Apresentar especialidades', 'Mostrar equipe', 'Informar convenios', 'Gerar credibilidade'],
  },
  {
    id: 'dentista',
    name: 'Dentista',
    description: 'Consultorio odontologico online',
    image: imgDentista,
    category: 'site',
    suggestedPages: ['Home', 'Tratamentos', 'Equipe', 'Agendamento', 'Blog', 'Contato'],
    suggestedFeatures: ['Agendamento online', 'Lista de tratamentos', 'Antes e depois', 'Botao WhatsApp', 'Convenios aceitos', 'Blog de saude bucal'],
    objectives: ['Agendar consultas', 'Mostrar tratamentos', 'Gerar confianca', 'Informar convenios', 'Educar pacientes'],
  },
  {
    id: 'tattoo',
    name: 'Studio Tattoo',
    description: 'Portfolio de tatuagens e agendamento',
    image: imgTattoo,
    category: 'site',
    suggestedPages: ['Home', 'Portfolio', 'Artistas', 'Estilos', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Galeria de trabalhos', 'Perfil dos artistas', 'Agendamento online', 'Botao WhatsApp', 'Cuidados pos-tattoo'],
    objectives: ['Mostrar portfolio', 'Apresentar artistas', 'Agendar sessoes', 'Captar clientes', 'Informar cuidados'],
  },
  {
    id: 'imobiliaria',
    name: 'Imobiliaria',
    description: 'Catalogo de imoveis e contato',
    image: imgImobiliaria,
    category: 'site',
    suggestedPages: ['Home', 'Imoveis', 'Venda', 'Aluguel', 'Corretores', 'Contato'],
    suggestedFeatures: ['Catalogo de imoveis com filtros', 'Busca avancada', 'Tour virtual', 'Botao WhatsApp', 'Mapa de localizacao', 'Formulario de interesse'],
    objectives: ['Mostrar imoveis disponiveis', 'Captar leads', 'Facilitar contato com corretor', 'Filtrar por tipo/preco', 'Apresentar construtora'],
  },
  {
    id: 'lava-car',
    name: 'Lava Car',
    description: 'Servicos automotivos e agendamento',
    image: imgLavaCar,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Planos', 'Agendamento', 'Galeria', 'Contato'],
    suggestedFeatures: ['Lista de servicos e precos', 'Agendamento online', 'Planos mensais', 'Botao WhatsApp', 'Galeria antes/depois'],
    objectives: ['Agendar lavagens', 'Mostrar servicos', 'Vender planos mensais', 'Captar clientes', 'Fidelizar com planos'],
  },
  {
    id: 'oficina',
    name: 'Oficina Mecanica',
    description: 'Servicos automotivos e orcamentos',
    image: imgOficina,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Orcamento', 'Sobre', 'Galeria', 'Contato'],
    suggestedFeatures: ['Lista de servicos', 'Formulario de orcamento', 'Galeria de trabalhos', 'Botao WhatsApp', 'Depoimentos', 'Mapa'],
    objectives: ['Apresentar servicos', 'Gerar orcamentos', 'Captar clientes locais', 'Mostrar credibilidade', 'Facilitar contato'],
  },
  {
    id: 'floricultura',
    name: 'Floricultura',
    description: 'Catalogo de flores e delivery',
    image: imgFloricultura,
    category: 'site',
    suggestedPages: ['Home', 'Catalogo', 'Ocasioes', 'Delivery', 'Sobre', 'Contato'],
    suggestedFeatures: ['Catalogo de arranjos', 'Pedidos por ocasiao', 'Delivery de flores', 'Botao WhatsApp', 'Galeria de arranjos'],
    objectives: ['Vender arranjos online', 'Delivery de flores', 'Catalogo por ocasiao', 'Captar clientes', 'Presentes e datas especiais'],
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Pagina de vendas e captacao',
    image: imgLandingPage,
    category: 'site',
    suggestedPages: ['Hero', 'Beneficios', 'Depoimentos', 'Precos', 'FAQ', 'CTA'],
    suggestedFeatures: ['Hero section impactante', 'Secao de beneficios', 'Depoimentos', 'Tabela de precos', 'FAQ', 'Formulario de captura'],
    objectives: ['Captar leads', 'Vender produto/servico', 'Gerar conversoes', 'Apresentar beneficios', 'Construir autoridade'],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Loja virtual completa',
    image: imgEcommerce,
    category: 'app',
    suggestedPages: ['Home', 'Produtos', 'Categorias', 'Carrinho', 'Checkout', 'Minha Conta', 'Contato'],
    suggestedFeatures: ['Catalogo com busca e filtros', 'Carrinho e checkout', 'Pagamento integrado', 'Painel admin', 'Gestao de estoque', 'Cupons e descontos'],
    objectives: ['Vender produtos online', 'Gestao de pedidos', 'Integrar pagamentos', 'Dashboard de vendas', 'Marketing e promocoes'],
  },
  {
    id: 'agendamentos',
    name: 'App de Agendamentos',
    description: 'Plataforma de booking completa',
    image: imgAgendamentos,
    category: 'app',
    suggestedPages: ['Home', 'Servicos', 'Agenda', 'Meus Agendamentos', 'Perfil', 'Admin'],
    suggestedFeatures: ['Calendario interativo', 'Gestao de horarios', 'Notificacoes WhatsApp/email', 'Dashboard admin', 'Relatorios', 'Avaliacoes'],
    objectives: ['Automatizar agendamentos', 'Reduzir faltas', 'Gestao de profissionais', 'Relatorios de performance', 'Integrar WhatsApp'],
  },
];
