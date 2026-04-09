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
import imgYogaStudio from '@/assets/templates/yoga-studio.jpg';
import imgCoworking from '@/assets/templates/coworking.jpg';
import imgAdvocacia from '@/assets/templates/advocacia.jpg';
import imgPsicologo from '@/assets/templates/psicologo.jpg';
import imgClinicaEstetica from '@/assets/templates/clinica-estetica.jpg';
import imgFotografo from '@/assets/templates/fotografo.jpg';
import imgLavanderia from '@/assets/templates/lavanderia.jpg';
import imgCervejaria from '@/assets/templates/cervejaria.jpg';
import imgOtica from '@/assets/templates/otica.jpg';
import imgContabilidade from '@/assets/templates/contabilidade.jpg';
import imgDeliveryApp from '@/assets/templates/delivery-app.jpg';
import imgFitnessApp from '@/assets/templates/fitness-app.jpg';
import imgPetshopApp from '@/assets/templates/petshop-app.jpg';
import imgImobiliariaApp from '@/assets/templates/imobiliaria-app.jpg';
import imgVeterinario from '@/assets/templates/veterinario.jpg';
import imgFunilaria from '@/assets/templates/funilaria.jpg';
import imgCrmApp from '@/assets/templates/crm-app.jpg';
import imgEscolaMusica from '@/assets/templates/escola-musica.jpg';
import imgConstrutora from '@/assets/templates/construtora.jpg';
import imgAgenciaViagens from '@/assets/templates/agencia-viagens.jpg';
import imgNutricionista from '@/assets/templates/nutricionista.jpg';
import imgFisioterapia from '@/assets/templates/fisioterapia.jpg';
import imgArquitetura from '@/assets/templates/arquitetura.jpg';
import imgCorretor from '@/assets/templates/corretor.jpg';
import imgProteseDentaria from '@/assets/templates/protese-dentaria.jpg';
import imgAutoescola from '@/assets/templates/autoescola.jpg';
import imgEscolaInfantil from '@/assets/templates/escola-infantil.jpg';
import imgAgenciaMarketing from '@/assets/templates/agencia-marketing.jpg';
import imgPersonalTrainer from '@/assets/templates/personal-trainer.jpg';
import imgFarmacia from '@/assets/templates/farmacia.jpg';
// New template images
import imgCrossfit from '@/assets/templates/crossfit.jpg';
import imgOrtodontia from '@/assets/templates/ortodontia.jpg';
import imgConcessionaria from '@/assets/templates/concessionaria.jpg';
import imgEventos from '@/assets/templates/eventos.jpg';
import imgPodcast from '@/assets/templates/podcast.jpg';
import imgLimpeza from '@/assets/templates/limpeza.jpg';
import imgConfeitaria from '@/assets/templates/confeitaria.jpg';
import imgSuplementos from '@/assets/templates/suplementos.jpg';
import imgBandaMusica from '@/assets/templates/banda-musica.jpg';
import imgEncanador from '@/assets/templates/encanador.jpg';
import imgSaasApp from '@/assets/templates/saas-app.jpg';
import imgIgreja from '@/assets/templates/igreja.jpg';
import imgCreche from '@/assets/templates/creche.jpg';
import imgCursosOnline from '@/assets/templates/cursos-online.jpg';
import imgSeguranca from '@/assets/templates/seguranca.jpg';
import imgModaFitness from '@/assets/templates/moda-fitness.jpg';
import imgDogWalker from '@/assets/templates/dog-walker.jpg';
import imgGestaoRestauranteApp from '@/assets/templates/gestao-restaurante-app.jpg';
import imgConsultoriaFinanceira from '@/assets/templates/consultoria-financeira.jpg';
import imgLojaRoupas from '@/assets/templates/loja-roupas.jpg';

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
  // ========== ALIMENTAÇÃO - SITES ==========
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
    description: 'Menu interativo e delivery',
    image: imgHamburgueria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Combos', 'Sobre', 'Contato'],
    suggestedFeatures: ['Cardapio visual com fotos HD', 'Sistema de combos', 'Botao WhatsApp flutuante', 'Integracao delivery', 'Galeria de ambiente', 'Reviews'],
    objectives: ['Apresentar cardapio gourmet', 'Receber pedidos online', 'Destacar combos', 'Mostrar ambiente', 'Captar clientes'],
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
    description: 'Cardapio japones e pedidos',
    image: imgSushi,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Combos', 'Delivery', 'Sobre', 'Contato'],
    suggestedFeatures: ['Cardapio japones com fotos', 'Sistema de combos', 'Pedidos online', 'Botao WhatsApp', 'Galeria', 'Avaliacoes'],
    objectives: ['Apresentar cardapio japones', 'Receber pedidos delivery', 'Destacar combos', 'Mostrar ambiente', 'Captar clientes'],
  },
  {
    id: 'churrascaria',
    name: 'Churrascaria',
    description: 'Rodizio, carnes e reservas',
    image: imgChurrascaria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Rodizio', 'Reservas', 'Galeria', 'Contato'],
    suggestedFeatures: ['Cardapio de carnes', 'Sistema de reservas', 'Galeria do salao', 'Botao WhatsApp', 'Eventos e confraternizacoes'],
    objectives: ['Mostrar cardapio', 'Aceitar reservas online', 'Promover rodizio', 'Apresentar estrutura', 'Eventos corporativos'],
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    description: 'Vitrine digital e fidelidade',
    image: imgCafeteria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Sobre', 'Galeria', 'Contato'],
    suggestedFeatures: ['Cardapio com fotos', 'Programa de fidelidade', 'Botao WhatsApp', 'Galeria do ambiente', 'Horarios de funcionamento'],
    objectives: ['Mostrar cardapio completo', 'Fidelizar clientes', 'Apresentar ambiente', 'Promover eventos', 'Captar clientes locais'],
  },
  {
    id: 'sorveteria',
    name: 'Sorveteria / Acai',
    description: 'Sorvetes, acai e sobremesas',
    image: imgSorveteria,
    category: 'site',
    suggestedPages: ['Home', 'Cardapio', 'Sabores', 'Promocoes', 'Contato'],
    suggestedFeatures: ['Cardapio de sabores', 'Combos e promocoes', 'Pedidos via WhatsApp', 'Galeria de produtos', 'Programa fidelidade'],
    objectives: ['Mostrar sabores', 'Receber pedidos', 'Promover combos', 'Fidelizar clientes', 'Captar clientes locais'],
  },
  {
    id: 'padaria',
    name: 'Padaria / Confeitaria',
    description: 'Paes artesanais, bolos e doces',
    image: imgPadaria,
    category: 'site',
    suggestedPages: ['Home', 'Produtos', 'Encomendas', 'Galeria', 'Sobre', 'Contato'],
    suggestedFeatures: ['Catalogo de produtos', 'Sistema de encomendas', 'Galeria de bolos', 'Botao WhatsApp', 'Horarios de funcionamento'],
    objectives: ['Mostrar produtos artesanais', 'Receber encomendas', 'Apresentar especialidades', 'Captar clientes', 'Promover produtos sazonais'],
  },
  {
    id: 'cervejaria',
    name: 'Cervejaria Artesanal',
    description: 'Bar e cervejaria craft',
    image: imgCervejaria,
    category: 'site',
    suggestedPages: ['Home', 'Cervejas', 'Cardapio', 'Eventos', 'Sobre', 'Contato'],
    suggestedFeatures: ['Catalogo de cervejas', 'Menu de petiscos', 'Agenda de eventos', 'Botao WhatsApp', 'Galeria do ambiente'],
    objectives: ['Apresentar cervejas artesanais', 'Promover eventos', 'Reservas online', 'Captar clientes', 'Mostrar ambiente'],
  },

  // ========== BELEZA & ESTÉTICA ==========
  {
    id: 'barbearia',
    name: 'Barbearia',
    description: 'Agendamento online e portfolio',
    image: imgBarbearia,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Profissionais', 'Agendamento', 'Galeria', 'Contato'],
    suggestedFeatures: ['Sistema de agendamento', 'Perfil dos barbeiros', 'Galeria de trabalhos', 'Botao WhatsApp flutuante', 'Reviews'],
    objectives: ['Agendamento online', 'Apresentar servicos e precos', 'Mostrar equipe', 'Captar clientes locais', 'Fidelizar clientes'],
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
    suggestedFeatures: ['Galeria de trabalhos', 'Agendamento online', 'Catalogo de servicos', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Mostrar portfolio', 'Agendar online', 'Apresentar servicos', 'Captar clientes', 'Fidelizar com promocoes'],
  },
  {
    id: 'clinica-estetica',
    name: 'Clinica Estetica',
    description: 'Procedimentos esteticos e agendamento',
    image: imgClinicaEstetica,
    category: 'site',
    suggestedPages: ['Home', 'Procedimentos', 'Antes e Depois', 'Equipe', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Lista de procedimentos', 'Galeria antes/depois', 'Agendamento online', 'Perfil profissional', 'Depoimentos', 'Convenios'],
    objectives: ['Agendar procedimentos', 'Mostrar resultados', 'Gerar confianca', 'Captar clientes', 'Informar sobre tratamentos'],
  },

  // ========== SAÚDE ==========
  {
    id: 'clinica',
    name: 'Clinica Medica',
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
    suggestedFeatures: ['Agendamento online', 'Lista de tratamentos', 'Antes e depois', 'Botao WhatsApp', 'Convenios aceitos', 'Blog'],
    objectives: ['Agendar consultas', 'Mostrar tratamentos', 'Gerar confianca', 'Informar convenios', 'Educar pacientes'],
  },
  {
    id: 'psicologo',
    name: 'Psicologo / Terapeuta',
    description: 'Consultas e atendimento online',
    image: imgPsicologo,
    category: 'site',
    suggestedPages: ['Home', 'Sobre', 'Especialidades', 'Agendamento', 'Blog', 'Contato'],
    suggestedFeatures: ['Agendamento online', 'Atendimento presencial e online', 'Perfil profissional', 'Blog com artigos', 'Botao WhatsApp'],
    objectives: ['Agendar consultas', 'Apresentar abordagem terapeutica', 'Gerar confianca', 'Educar pacientes', 'Atendimento remoto'],
  },
  {
    id: 'veterinario',
    name: 'Veterinario',
    description: 'Clinica veterinaria e consultas',
    image: imgVeterinario,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Equipe', 'Emergencia', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Agendamento de consultas', 'Servicos veterinarios', 'Plantao 24h', 'Galeria de pacientes', 'Botao WhatsApp', 'Dicas de cuidados'],
    objectives: ['Agendar consultas', 'Apresentar servicos', 'Atendimento de emergencia', 'Gerar confianca', 'Captar clientes'],
  },
  {
    id: 'yoga-studio',
    name: 'Yoga / Pilates',
    description: 'Aulas, horarios e matriculas',
    image: imgYogaStudio,
    category: 'site',
    suggestedPages: ['Home', 'Modalidades', 'Horarios', 'Instrutores', 'Planos', 'Contato'],
    suggestedFeatures: ['Grade de horarios', 'Planos e precos', 'Perfil dos instrutores', 'Galeria do espaco', 'Botao WhatsApp', 'Aulas experimentais'],
    objectives: ['Captar novos alunos', 'Mostrar modalidades', 'Informar horarios', 'Vender planos', 'Aula experimental'],
  },

  // ========== SERVIÇOS ==========
  {
    id: 'advocacia',
    name: 'Escritorio de Advocacia',
    description: 'Servicos juridicos e consultas',
    image: imgAdvocacia,
    category: 'site',
    suggestedPages: ['Home', 'Areas de Atuacao', 'Equipe', 'Blog', 'Contato'],
    suggestedFeatures: ['Areas de atuacao detalhadas', 'Perfil dos advogados', 'Blog juridico', 'Formulario de consulta', 'Botao WhatsApp'],
    objectives: ['Apresentar areas juridicas', 'Gerar autoridade', 'Captar clientes', 'Educar com conteudo', 'Facilitar contato'],
  },
  {
    id: 'contabilidade',
    name: 'Contabilidade',
    description: 'Servicos contabeis e consultoria',
    image: imgContabilidade,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Planos', 'Blog', 'Sobre', 'Contato'],
    suggestedFeatures: ['Lista de servicos', 'Tabela de planos', 'Blog fiscal', 'Calculadoras online', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Apresentar servicos', 'Vender planos', 'Gerar confianca', 'Educar com conteudo', 'Captar empresas'],
  },
  {
    id: 'fotografo',
    name: 'Fotografo / Videomaker',
    description: 'Portfolio e orcamentos',
    image: imgFotografo,
    category: 'site',
    suggestedPages: ['Home', 'Portfolio', 'Servicos', 'Pacotes', 'Sobre', 'Contato'],
    suggestedFeatures: ['Galeria de portfolio', 'Pacotes de servicos', 'Formulario de orcamento', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Mostrar portfolio', 'Apresentar pacotes', 'Gerar orcamentos', 'Captar clientes', 'Exibir trabalhos recentes'],
  },
  {
    id: 'coworking',
    name: 'Coworking / Espaco',
    description: 'Planos, salas e reservas',
    image: imgCoworking,
    category: 'site',
    suggestedPages: ['Home', 'Espacos', 'Planos', 'Reservas', 'Galeria', 'Contato'],
    suggestedFeatures: ['Catalogo de espacos', 'Tabela de planos', 'Tour virtual', 'Reserva online', 'Botao WhatsApp'],
    objectives: ['Apresentar espacos', 'Vender planos', 'Reserva de salas', 'Mostrar estrutura', 'Captar empresas'],
  },
  {
    id: 'construtora',
    name: 'Construtora / Engenharia',
    description: 'Projetos, obras e orcamentos',
    image: imgConstrutora,
    category: 'site',
    suggestedPages: ['Home', 'Projetos', 'Servicos', 'Portfolio', 'Sobre', 'Contato'],
    suggestedFeatures: ['Galeria de projetos', 'Lista de servicos', 'Formulario de orcamento', 'Depoimentos', 'Botao WhatsApp', 'Certificacoes'],
    objectives: ['Apresentar projetos', 'Gerar orcamentos', 'Mostrar portfolio', 'Captar clientes', 'Gerar credibilidade'],
  },
  {
    id: 'escola-musica',
    name: 'Escola de Musica',
    description: 'Aulas, instrumentos e matriculas',
    image: imgEscolaMusica,
    category: 'site',
    suggestedPages: ['Home', 'Cursos', 'Professores', 'Horarios', 'Matricula', 'Contato'],
    suggestedFeatures: ['Catalogo de cursos', 'Perfil dos professores', 'Grade de horarios', 'Formulario de matricula', 'Galeria de eventos', 'Botao WhatsApp'],
    objectives: ['Captar novos alunos', 'Apresentar cursos', 'Mostrar professores', 'Facilitar matricula', 'Promover eventos'],
  },
  {
    id: 'agencia-viagens',
    name: 'Agencia de Viagens',
    description: 'Pacotes turisticos e reservas',
    image: imgAgenciaViagens,
    category: 'site',
    suggestedPages: ['Home', 'Destinos', 'Pacotes', 'Promocoes', 'Blog', 'Contato'],
    suggestedFeatures: ['Catalogo de destinos', 'Pacotes com precos', 'Formulario de reserva', 'Blog de viagens', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Vender pacotes', 'Mostrar destinos', 'Captar leads', 'Promover ofertas', 'Gerar confianca'],
  },

  // ========== AUTOMOTIVO ==========
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
    suggestedFeatures: ['Lista de servicos', 'Formulario de orcamento', 'Galeria de trabalhos', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Apresentar servicos', 'Gerar orcamentos', 'Captar clientes locais', 'Mostrar credibilidade', 'Facilitar contato'],
  },
  {
    id: 'funilaria',
    name: 'Funilaria / Pintura',
    description: 'Reparos automotivos e orcamentos',
    image: imgFunilaria,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Antes e Depois', 'Orcamento', 'Sobre', 'Contato'],
    suggestedFeatures: ['Galeria antes/depois', 'Lista de servicos', 'Formulario de orcamento', 'Botao WhatsApp', 'Depoimentos', 'Parcerias com seguradoras'],
    objectives: ['Mostrar resultados', 'Gerar orcamentos', 'Parcerias com seguradoras', 'Captar clientes', 'Apresentar servicos'],
  },

  // ========== PETS ==========
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

  // ========== VAREJO ==========
  {
    id: 'floricultura',
    name: 'Floricultura',
    description: 'Catalogo de flores e delivery',
    image: imgFloricultura,
    category: 'site',
    suggestedPages: ['Home', 'Catalogo', 'Ocasioes', 'Delivery', 'Sobre', 'Contato'],
    suggestedFeatures: ['Catalogo de arranjos', 'Pedidos por ocasiao', 'Delivery de flores', 'Botao WhatsApp', 'Galeria'],
    objectives: ['Vender arranjos online', 'Delivery de flores', 'Catalogo por ocasiao', 'Captar clientes', 'Datas especiais'],
  },
  {
    id: 'otica',
    name: 'Otica',
    description: 'Catalogo de armacoes e lentes',
    image: imgOtica,
    category: 'site',
    suggestedPages: ['Home', 'Armacoes', 'Lentes', 'Exame de Vista', 'Marcas', 'Contato'],
    suggestedFeatures: ['Catalogo de armacoes', 'Agendamento de exame', 'Marcas disponiveis', 'Botao WhatsApp', 'Filtros por estilo'],
    objectives: ['Mostrar armacoes', 'Agendar exames', 'Apresentar marcas', 'Captar clientes', 'Promover ofertas'],
  },
  {
    id: 'lavanderia',
    name: 'Lavanderia',
    description: 'Servicos de lavagem e delivery',
    image: imgLavanderia,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Precos', 'Delivery', 'Sobre', 'Contato'],
    suggestedFeatures: ['Lista de servicos e precos', 'Servico de coleta/entrega', 'Planos mensais', 'Botao WhatsApp', 'Agendamento'],
    objectives: ['Apresentar servicos', 'Coleta e entrega', 'Vender planos', 'Captar clientes', 'Fidelizar'],
  },

  // ========== ARTE & CULTURA ==========
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

  // ========== IMOBILIÁRIO ==========
  {
    id: 'imobiliaria',
    name: 'Imobiliaria',
    description: 'Catalogo de imoveis e contato',
    image: imgImobiliaria,
    category: 'site',
    suggestedPages: ['Home', 'Imoveis', 'Venda', 'Aluguel', 'Corretores', 'Contato'],
    suggestedFeatures: ['Catalogo com filtros', 'Busca avancada', 'Tour virtual', 'Botao WhatsApp', 'Mapa', 'Formulario de interesse'],
    objectives: ['Mostrar imoveis', 'Captar leads', 'Facilitar contato', 'Filtrar por tipo/preco', 'Apresentar construtora'],
  },

  // ========== FITNESS ==========
  {
    id: 'academia',
    name: 'Academia / CrossFit',
    description: 'Planos, treinos e matriculas',
    image: imgAcademia,
    category: 'site',
    suggestedPages: ['Home', 'Planos', 'Estrutura', 'Aulas', 'Horarios', 'Contato'],
    suggestedFeatures: ['Tabela de planos e precos', 'Tour virtual', 'Calendario de aulas', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Captar novos alunos', 'Mostrar planos', 'Apresentar estrutura', 'Informar horarios', 'Promover aulas especiais'],
  },

  // ========== LANDING & MARKETING ==========
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

  // ========== APPS ==========
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Loja virtual completa',
    image: imgEcommerce,
    category: 'app',
    suggestedPages: ['Home', 'Produtos', 'Categorias', 'Carrinho', 'Checkout', 'Minha Conta', 'Contato'],
    suggestedFeatures: ['Catalogo com busca e filtros', 'Carrinho e checkout', 'Pagamento integrado', 'Painel admin', 'Gestao de estoque', 'Cupons'],
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
  {
    id: 'delivery-app',
    name: 'App de Delivery',
    description: 'Pedidos online e rastreamento',
    image: imgDeliveryApp,
    category: 'app',
    suggestedPages: ['Home', 'Cardapio', 'Carrinho', 'Rastreamento', 'Historico', 'Perfil'],
    suggestedFeatures: ['Cardapio digital', 'Carrinho de compras', 'Rastreamento em tempo real', 'Pagamento online', 'Notificacoes push', 'Historico de pedidos'],
    objectives: ['Receber pedidos online', 'Rastrear entregas', 'Pagamento integrado', 'Fidelizar clientes', 'Dashboard do restaurante'],
  },
  {
    id: 'fitness-app',
    name: 'App Fitness / Treino',
    description: 'Treinos, progresso e planos',
    image: imgFitnessApp,
    category: 'app',
    suggestedPages: ['Home', 'Treinos', 'Progresso', 'Dieta', 'Perfil', 'Planos'],
    suggestedFeatures: ['Biblioteca de exercicios', 'Planos de treino', 'Tracking de progresso', 'Graficos de evolucao', 'Timer de treino', 'Planos alimentares'],
    objectives: ['Treinos personalizados', 'Acompanhar progresso', 'Planos alimentares', 'Fidelizar alunos', 'Dashboard do personal'],
  },
  {
    id: 'petshop-app',
    name: 'App Pet Care',
    description: 'Gestao de pets e agendamento',
    image: imgPetshopApp,
    category: 'app',
    suggestedPages: ['Home', 'Meus Pets', 'Agendamento', 'Vacinacao', 'Loja', 'Perfil'],
    suggestedFeatures: ['Perfil dos pets', 'Agendamento de servicos', 'Carteira de vacinacao', 'Loja virtual', 'Notificacoes de lembretes', 'Historico veterinario'],
    objectives: ['Gerenciar pets', 'Agendar banho e tosa', 'Controle de vacinacao', 'Vender produtos', 'Fidelizar clientes'],
  },
  {
    id: 'imobiliaria-app',
    name: 'App Imobiliario',
    description: 'Busca de imoveis e visitas',
    image: imgImobiliariaApp,
    category: 'app',
    suggestedPages: ['Home', 'Busca', 'Favoritos', 'Mapa', 'Agendamento de Visita', 'Perfil'],
    suggestedFeatures: ['Busca com filtros avancados', 'Mapa interativo', 'Tour virtual 360', 'Favoritos', 'Agendamento de visitas', 'Chat com corretor'],
    objectives: ['Buscar imoveis', 'Agendar visitas', 'Tour virtual', 'Chat com corretores', 'Gestao de favoritos'],
  },
  {
    id: 'crm-app',
    name: 'App CRM / Gestao',
    description: 'Gestao de clientes e vendas',
    image: imgCrmApp,
    category: 'app',
    suggestedPages: ['Dashboard', 'Clientes', 'Pipeline', 'Tarefas', 'Relatorios', 'Configuracoes'],
    suggestedFeatures: ['Pipeline de vendas', 'Cadastro de clientes', 'Gestao de tarefas', 'Relatorios e graficos', 'Integracao WhatsApp', 'Notificacoes'],
    objectives: ['Gerenciar clientes', 'Pipeline de vendas', 'Acompanhar tarefas', 'Relatorios de performance', 'Automatizar follow-ups'],
  },

  // ========== NOVOS TEMPLATES - SAÚDE & BEM-ESTAR ==========
  {
    id: 'nutricionista',
    name: 'Nutricionista',
    description: 'Consultas, planos alimentares e dicas',
    image: imgNutricionista,
    category: 'site',
    suggestedPages: ['Home', 'Sobre', 'Servicos', 'Planos Alimentares', 'Blog', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Agendamento online', 'Planos alimentares personalizados', 'Blog de nutricao', 'Depoimentos', 'Botao WhatsApp', 'Receitas saudaveis'],
    objectives: ['Agendar consultas', 'Apresentar especialidades', 'Educar pacientes', 'Captar clientes', 'Mostrar resultados'],
  },
  {
    id: 'fisioterapia',
    name: 'Fisioterapia / Reabilitação',
    description: 'Tratamentos fisioterapeuticos e recuperação',
    image: imgFisioterapia,
    category: 'site',
    suggestedPages: ['Home', 'Tratamentos', 'Equipe', 'Estrutura', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Lista de tratamentos', 'Agendamento online', 'Galeria da clinica', 'Perfil profissional', 'Botao WhatsApp', 'Convenios aceitos'],
    objectives: ['Agendar sessoes', 'Apresentar tratamentos', 'Mostrar estrutura', 'Informar convenios', 'Gerar confianca'],
  },
  {
    id: 'protese-dentaria',
    name: 'Protese Dentaria',
    description: 'Laboratorio de proteses e implantes',
    image: imgProteseDentaria,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Antes e Depois', 'Tecnologia', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Catalogo de servicos', 'Galeria antes/depois', 'Tecnologia utilizada', 'Agendamento online', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Mostrar resultados', 'Agendar avaliacoes', 'Apresentar tecnologia', 'Gerar confianca', 'Captar pacientes'],
  },
  {
    id: 'farmacia',
    name: 'Farmacia / Drogaria',
    description: 'Catalogo de produtos e delivery',
    image: imgFarmacia,
    category: 'site',
    suggestedPages: ['Home', 'Produtos', 'Manipulados', 'Delivery', 'Promocoes', 'Contato'],
    suggestedFeatures: ['Catalogo de produtos', 'Pedidos via WhatsApp', 'Delivery de medicamentos', 'Promocoes', 'Botao WhatsApp', 'Horario de funcionamento'],
    objectives: ['Vender produtos', 'Delivery', 'Promover ofertas', 'Captar clientes locais', 'Fidelizar'],
  },

  // ========== NOVOS TEMPLATES - SERVIÇOS PROFISSIONAIS ==========
  {
    id: 'arquitetura',
    name: 'Arquitetura / Design Interior',
    description: 'Portfolio de projetos e orcamentos',
    image: imgArquitetura,
    category: 'site',
    suggestedPages: ['Home', 'Portfolio', 'Servicos', 'Processo', 'Sobre', 'Contato'],
    suggestedFeatures: ['Galeria de projetos', 'Portfolio 3D', 'Formulario de orcamento', 'Depoimentos', 'Botao WhatsApp', 'Blog de tendencias'],
    objectives: ['Mostrar portfolio', 'Gerar orcamentos', 'Apresentar processo criativo', 'Captar clientes', 'Gerar autoridade'],
  },
  {
    id: 'corretor',
    name: 'Corretor de Imoveis',
    description: 'Catalogo pessoal de imoveis',
    image: imgCorretor,
    category: 'site',
    suggestedPages: ['Home', 'Imoveis a Venda', 'Aluguel', 'Sobre Mim', 'Depoimentos', 'Contato'],
    suggestedFeatures: ['Catalogo com filtros', 'Tour virtual', 'Perfil profissional', 'Formulario de interesse', 'Botao WhatsApp', 'Mapa de localizacao'],
    objectives: ['Mostrar imoveis', 'Captar leads', 'Gerar credibilidade', 'Facilitar contato', 'Agendamento de visitas'],
  },
  {
    id: 'agencia-marketing',
    name: 'Agencia de Marketing',
    description: 'Servicos de marketing digital e resultados',
    image: imgAgenciaMarketing,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Cases', 'Planos', 'Blog', 'Contato'],
    suggestedFeatures: ['Apresentacao de servicos', 'Cases de sucesso', 'Tabela de planos', 'Blog de marketing', 'Botao WhatsApp', 'Formulario de briefing'],
    objectives: ['Captar clientes', 'Mostrar resultados', 'Vender planos', 'Gerar autoridade', 'Apresentar servicos'],
  },
  {
    id: 'autoescola',
    name: 'Autoescola / CFC',
    description: 'Cursos, categorias e matriculas',
    image: imgAutoescola,
    category: 'site',
    suggestedPages: ['Home', 'Cursos', 'Categorias', 'Simulado', 'Matricula', 'Contato'],
    suggestedFeatures: ['Lista de cursos e categorias', 'Formulario de matricula', 'Simulado online', 'Horarios de aulas', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Captar alunos', 'Facilitar matricula', 'Informar cursos', 'Mostrar aprovacoes', 'Agendamento de aulas'],
  },

  // ========== NOVOS TEMPLATES - EDUCAÇÃO ==========
  {
    id: 'escola-infantil',
    name: 'Escola Infantil / Creche',
    description: 'Matriculas, atividades e estrutura',
    image: imgEscolaInfantil,
    category: 'site',
    suggestedPages: ['Home', 'Proposta Pedagogica', 'Estrutura', 'Atividades', 'Matricula', 'Contato'],
    suggestedFeatures: ['Tour virtual', 'Proposta pedagogica', 'Galeria de atividades', 'Formulario de matricula', 'Botao WhatsApp', 'Calendario escolar'],
    objectives: ['Captar matriculas', 'Mostrar estrutura', 'Apresentar metodologia', 'Gerar confianca', 'Facilitar contato'],
  },

  // ========== NOVOS TEMPLATES - FITNESS ==========
  {
    id: 'personal-trainer',
    name: 'Personal Trainer',
    description: 'Treinos personalizados e resultados',
    image: imgPersonalTrainer,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Resultados', 'Planos', 'Sobre', 'Contato'],
    suggestedFeatures: ['Galeria de resultados', 'Planos de treino', 'Agendamento de avaliacao', 'Depoimentos', 'Botao WhatsApp', 'Blog fitness'],
    objectives: ['Captar alunos', 'Mostrar resultados', 'Vender planos', 'Agendar avaliacoes', 'Gerar autoridade'],
  },

  // ========== NOVOS - ALIMENTAÇÃO ==========
  {
    id: 'confeitaria',
    name: 'Confeitaria / Doces',
    description: 'Bolos decorados, doces e encomendas',
    image: imgConfeitaria,
    category: 'site',
    suggestedPages: ['Home', 'Catalogo', 'Encomendas', 'Sabores', 'Galeria', 'Contato'],
    suggestedFeatures: ['Catalogo de bolos e doces', 'Sistema de encomendas', 'Galeria de criações', 'Calculadora de precos', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Receber encomendas', 'Mostrar portfolio de bolos', 'Calcular precos', 'Captar clientes', 'Promover datas especiais'],
  },

  // ========== NOVOS - SAÚDE ==========
  {
    id: 'ortodontia',
    name: 'Ortodontia / Implantes',
    description: 'Tratamentos odontologicos avancados',
    image: imgOrtodontia,
    category: 'site',
    suggestedPages: ['Home', 'Tratamentos', 'Antes e Depois', 'Tecnologia', 'Equipe', 'Agendamento', 'Contato'],
    suggestedFeatures: ['Lista de tratamentos', 'Galeria antes/depois', 'Tecnologia 3D', 'Agendamento online', 'Simulador de sorriso', 'Convenios aceitos'],
    objectives: ['Agendar avaliacoes', 'Mostrar resultados', 'Apresentar tecnologia', 'Gerar confianca', 'Captar pacientes'],
  },

  // ========== NOVOS - AUTOMOTIVO ==========
  {
    id: 'concessionaria',
    name: 'Concessionaria / Veiculos',
    description: 'Catalogo de veiculos e test drive',
    image: imgConcessionaria,
    category: 'site',
    suggestedPages: ['Home', 'Estoque', 'Novos', 'Seminovos', 'Financiamento', 'Contato'],
    suggestedFeatures: ['Catalogo de veiculos com filtros', 'Fotos 360°', 'Simulador de financiamento', 'Agendamento test drive', 'Botao WhatsApp', 'Comparador'],
    objectives: ['Vender veiculos', 'Agendar test drive', 'Simular financiamento', 'Mostrar estoque', 'Captar leads'],
  },

  // ========== NOVOS - EVENTOS ==========
  {
    id: 'eventos',
    name: 'Eventos / Festas',
    description: 'Organizacao de eventos e orcamentos',
    image: imgEventos,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Portfolio', 'Pacotes', 'Depoimentos', 'Contato'],
    suggestedFeatures: ['Portfolio de eventos', 'Pacotes de servicos', 'Formulario de orcamento', 'Galeria de fotos', 'Botao WhatsApp', 'Calendario de disponibilidade'],
    objectives: ['Receber orcamentos', 'Mostrar portfolio', 'Apresentar pacotes', 'Captar clientes', 'Divulgar eventos realizados'],
  },

  // ========== NOVOS - MÍDIA ==========
  {
    id: 'podcast',
    name: 'Podcast / Radio',
    description: 'Episodios, convidados e audiencia',
    image: imgPodcast,
    category: 'site',
    suggestedPages: ['Home', 'Episodios', 'Sobre', 'Convidados', 'Contato', 'Patrocine'],
    suggestedFeatures: ['Player de audio integrado', 'Lista de episodios', 'Perfil de convidados', 'Newsletter', 'Links de plataformas', 'Formulario de patrocinio'],
    objectives: ['Aumentar audiencia', 'Listar episodios', 'Atrair patrocinadores', 'Captar assinantes', 'Promover convidados'],
  },
  {
    id: 'banda-musica',
    name: 'Banda / Musico',
    description: 'Shows, discografia e contratacao',
    image: imgBandaMusica,
    category: 'site',
    suggestedPages: ['Home', 'Sobre', 'Discografia', 'Shows', 'Galeria', 'Contato'],
    suggestedFeatures: ['Player de musicas', 'Agenda de shows', 'Galeria de fotos e videos', 'Biografia', 'Formulario de contratacao', 'Links de streaming'],
    objectives: ['Promover shows', 'Mostrar discografia', 'Facilitar contratacao', 'Captar fas', 'Aumentar seguidores'],
  },

  // ========== NOVOS - SERVIÇOS ==========
  {
    id: 'limpeza',
    name: 'Limpeza / Diarista',
    description: 'Servicos de limpeza e higienizacao',
    image: imgLimpeza,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Planos', 'Orcamento', 'Depoimentos', 'Contato'],
    suggestedFeatures: ['Lista de servicos', 'Planos residencial/comercial', 'Formulario de orcamento', 'Botao WhatsApp', 'Fotos antes/depois', 'Certificacoes'],
    objectives: ['Captar clientes', 'Mostrar servicos', 'Vender planos', 'Gerar orcamentos', 'Fidelizar'],
  },
  {
    id: 'encanador',
    name: 'Encanador / Eletricista',
    description: 'Servicos tecnicos e manutencao',
    image: imgEncanador,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Orcamento', 'Emergencia', 'Sobre', 'Contato'],
    suggestedFeatures: ['Lista de servicos', 'Atendimento emergencial', 'Formulario de orcamento', 'Botao WhatsApp', 'Depoimentos', 'Area de atuacao'],
    objectives: ['Atendimento rapido', 'Gerar orcamentos', 'Mostrar servicos', 'Captar clientes locais', 'Plantao emergencial'],
  },
  {
    id: 'seguranca',
    name: 'Seguranca Patrimonial',
    description: 'Monitoramento e vigilancia',
    image: imgSeguranca,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Tecnologia', 'Planos', 'Clientes', 'Contato'],
    suggestedFeatures: ['Lista de servicos', 'Tecnologia e equipamentos', 'Planos de monitoramento', 'Botao WhatsApp', 'Casos de sucesso', 'Certificacoes'],
    objectives: ['Vender planos', 'Apresentar tecnologia', 'Captar empresas', 'Gerar credibilidade', 'Atendimento 24h'],
  },
  {
    id: 'consultoria-financeira',
    name: 'Consultoria Financeira',
    description: 'Investimentos e planejamento financeiro',
    image: imgConsultoriaFinanceira,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Sobre', 'Blog', 'Simulador', 'Contato'],
    suggestedFeatures: ['Servicos de consultoria', 'Simulador financeiro', 'Blog de educacao financeira', 'Perfil dos consultores', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Captar clientes', 'Gerar autoridade', 'Educar sobre financas', 'Vender consultorias', 'Agendar reunioes'],
  },

  // ========== NOVOS - VAREJO ==========
  {
    id: 'suplementos',
    name: 'Loja de Suplementos',
    description: 'Suplementos e nutricao esportiva',
    image: imgSuplementos,
    category: 'site',
    suggestedPages: ['Home', 'Produtos', 'Categorias', 'Promocoes', 'Blog', 'Contato'],
    suggestedFeatures: ['Catalogo de produtos', 'Filtros por categoria', 'Promocoes e combos', 'Blog de nutricao', 'Botao WhatsApp', 'Carrinho de compras'],
    objectives: ['Vender suplementos', 'Promover ofertas', 'Educar sobre nutricao', 'Captar clientes', 'Fidelizar'],
  },
  {
    id: 'loja-roupas',
    name: 'Loja de Roupas / Moda',
    description: 'Fashion e-commerce e lookbook',
    image: imgLojaRoupas,
    category: 'site',
    suggestedPages: ['Home', 'Colecoes', 'Categorias', 'Lookbook', 'Sobre', 'Contato'],
    suggestedFeatures: ['Catalogo com filtros', 'Lookbook sazonal', 'Tabela de tamanhos', 'Botao WhatsApp', 'Instagram feed', 'Programa fidelidade'],
    objectives: ['Vender roupas', 'Mostrar colecoes', 'Captar clientes', 'Promover lookbook', 'Fidelizar'],
  },
  {
    id: 'moda-fitness',
    name: 'Moda Fitness / Sportswear',
    description: 'Roupas esportivas e acessorios',
    image: imgModaFitness,
    category: 'site',
    suggestedPages: ['Home', 'Produtos', 'Colecoes', 'Atacado', 'Sobre', 'Contato'],
    suggestedFeatures: ['Catalogo de produtos', 'Colecoes por modalidade', 'Venda atacado', 'Tabela de medidas', 'Botao WhatsApp', 'Instagram feed'],
    objectives: ['Vender online', 'Mostrar colecoes', 'Atender atacado', 'Captar clientes', 'Promover marca'],
  },

  // ========== NOVOS - PETS ==========
  {
    id: 'dog-walker',
    name: 'Dog Walker / Pet Sitter',
    description: 'Passeios, hospedagem e cuidados pet',
    image: imgDogWalker,
    category: 'site',
    suggestedPages: ['Home', 'Servicos', 'Planos', 'Equipe', 'Galeria', 'Contato'],
    suggestedFeatures: ['Servicos de passeio e hospedagem', 'Planos mensais', 'Perfil dos cuidadores', 'Galeria de pets', 'Botao WhatsApp', 'Depoimentos'],
    objectives: ['Captar clientes', 'Mostrar servicos', 'Vender planos', 'Gerar confianca', 'Fidelizar tutores'],
  },

  // ========== NOVOS - RELIGIOSO ==========
  {
    id: 'igreja',
    name: 'Igreja / Ministerio',
    description: 'Programacao, cultos e comunidade',
    image: imgIgreja,
    category: 'site',
    suggestedPages: ['Home', 'Sobre', 'Programacao', 'Ministerios', 'Celulas', 'Contato'],
    suggestedFeatures: ['Programacao de cultos', 'Ministerios e celulas', 'Transmissao ao vivo', 'Galeria de eventos', 'Botao WhatsApp', 'Doacoes online'],
    objectives: ['Informar programacao', 'Conectar membros', 'Transmitir cultos', 'Receber doacoes', 'Divulgar eventos'],
  },

  // ========== NOVOS - EDUCAÇÃO ==========
  {
    id: 'creche',
    name: 'Creche / Bercario',
    description: 'Cuidados infantis e matriculas',
    image: imgCreche,
    category: 'site',
    suggestedPages: ['Home', 'Proposta', 'Estrutura', 'Turmas', 'Matricula', 'Contato'],
    suggestedFeatures: ['Tour virtual', 'Proposta pedagogica', 'Galeria de atividades', 'Formulario de matricula', 'Botao WhatsApp', 'Cardapio alimentar'],
    objectives: ['Captar matriculas', 'Mostrar estrutura', 'Gerar confianca dos pais', 'Informar turmas', 'Facilitar contato'],
  },

  // ========== NOVOS - FITNESS ==========
  {
    id: 'crossfit',
    name: 'CrossFit / Box',
    description: 'WODs, planos e comunidade fitness',
    image: imgCrossfit,
    category: 'site',
    suggestedPages: ['Home', 'WODs', 'Planos', 'Coaches', 'Estrutura', 'Contato'],
    suggestedFeatures: ['WOD do dia', 'Tabela de planos', 'Perfil dos coaches', 'Galeria do box', 'Botao WhatsApp', 'Ranking e recordes'],
    objectives: ['Captar atletas', 'Mostrar WODs', 'Vender planos', 'Apresentar coaches', 'Comunidade fitness'],
  },

  // ========== NOVOS APPS ==========
  {
    id: 'saas-app',
    name: 'App SaaS / Startup',
    description: 'Dashboard, planos e onboarding',
    image: imgSaasApp,
    category: 'app',
    suggestedPages: ['Landing', 'Dashboard', 'Planos', 'Login', 'Configuracoes', 'Suporte'],
    suggestedFeatures: ['Dashboard com graficos', 'Sistema de planos', 'Onboarding guiado', 'Autenticacao', 'API integrada', 'Notificacoes'],
    objectives: ['Vender assinaturas', 'Apresentar produto', 'Converter trial', 'Suporte ao cliente', 'Dashboard analitico'],
  },
  {
    id: 'cursos-online',
    name: 'Plataforma de Cursos',
    description: 'EAD com video aulas e certificados',
    image: imgCursosOnline,
    category: 'app',
    suggestedPages: ['Home', 'Cursos', 'Player de Aulas', 'Meu Progresso', 'Certificados', 'Perfil'],
    suggestedFeatures: ['Player de video', 'Progresso de aulas', 'Certificados automaticos', 'Quiz e avaliacoes', 'Forum de alunos', 'Dashboard do instrutor'],
    objectives: ['Vender cursos', 'Engajar alunos', 'Emitir certificados', 'Acompanhar progresso', 'Gestao de instrutores'],
  },
  {
    id: 'gestao-restaurante-app',
    name: 'App Gestao Restaurante',
    description: 'Mesas, pedidos e controle',
    image: imgGestaoRestauranteApp,
    category: 'app',
    suggestedPages: ['Dashboard', 'Mesas', 'Pedidos', 'Cardapio', 'Caixa', 'Relatorios'],
    suggestedFeatures: ['Mapa de mesas interativo', 'Gestao de pedidos', 'Cardapio digital admin', 'Controle de caixa', 'Relatorios de vendas', 'Comanda eletronica'],
    objectives: ['Gerenciar mesas', 'Controlar pedidos', 'Fechar caixa', 'Relatorios diarios', 'Otimizar atendimento'],
  },
];
