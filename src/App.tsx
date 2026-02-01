import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FeedbackProvider } from "@/contexts/FeedbackContext";
import { GalleryProvider } from "@/contexts/GalleryContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { GenesisAuthProvider } from "@/contexts/GenesisAuthContext";
import { GymAuthProvider } from "@/contexts/GymAuthContext";
import { GymAppLayout } from "@/components/academiapro/app/GymAppLayout";
import { GymAdminLayout } from "@/components/academiapro/admin/GymAdminLayout";
import { GymThemeBootstrap } from "@/components/academiapro/theme/GymThemeBootstrap";
import { useSecurityProtection } from "@/hooks/useSecurityProtection";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import UpgradeModal from "@/components/subscription/UpgradeModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PresenceTracker from "@/components/PresenceTracker";
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast as notify } from "sonner";

// Lazy loading de páginas para code splitting
const Index = lazy(() => import("./pages/Index"));
const GenesisLanding = lazy(() => import("./pages/GenesisLanding"));
const GenesisCommercial = lazy(() => import("./pages/GenesisCommercial"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingDirect = lazy(() => import("./pages/BookingDirect"));
const MyAppointments = lazy(() => import("./pages/MyAppointments"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const OwnerPanel = lazy(() => import("./pages/OwnerPanel"));
const EmailConfirmed = lazy(() => import("./pages/EmailConfirmed"));
const ConfirmarEmail = lazy(() => import("./pages/ConfirmarEmail"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const PoliticaDePrivacidade = lazy(() => import("./pages/PoliticaDePrivacidade"));
const Docs = lazy(() => import("./pages/Docs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AffiliateLogin = lazy(() => import("./pages/AffiliateLogin"));
const AffiliatePanel = lazy(() => import("./pages/AffiliatePanel"));
const ProposalPage = lazy(() => import("./pages/ProposalPage"));
const WADocsPage = lazy(() => import("./pages/WADocsPage"));
const GenesisLogin = lazy(() => import("./pages/GenesisLogin"));
const GenesisPanel = lazy(() => import("./pages/GenesisPanel"));
const GenesisVenda = lazy(() => import("./pages/GenesisVenda"));
const VendaFerramentas = lazy(() => import("./pages/VendaFerramentas"));
const VendaEmpresas = lazy(() => import("./pages/VendaEmpresas"));
const VendaAgentesIA = lazy(() => import("./pages/VendaAgentesIA"));
const CofPage = lazy(() => import("./pages/CofPage"));
const FlowBuilderDocs = lazy(() => import("./pages/FlowBuilderDocs"));
const Instrucoes = lazy(() => import("./pages/Instrucoes"));
const ScriptDownload = lazy(() => import("./pages/ScriptDownload"));
const Sobre = lazy(() => import("./pages/Sobre"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const DocProspeccao = lazy(() => import("./pages/DocProspeccao"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const DemoBookingPage = lazy(() => import("./pages/DemoBookingPage"));
const AcademiaPage = lazy(() => import("./pages/AcademiaPage"));
const AcademiaMatriculaPage = lazy(() => import("./pages/AcademiaMatriculaPage"));
const ClinicaEsteticaPage = lazy(() => import("./pages/ClinicaEsteticaPage"));
const ClinicaEsteticaAgendarPage = lazy(() => import("./pages/ClinicaEsteticaAgendarPage"));
const GenesisIALogin = lazy(() => import("./pages/GenesisIALogin"));
const GenesisIADashboard = lazy(() => import("./pages/GenesisIADashboard"));
const PetshopPage = lazy(() => import("./pages/petshop"));
const PetshopPrimoPage = lazy(() => import("./pages/petshop-primo"));
const PetshopMonPage = lazy(() => import("./pages/petshop-mon"));
const CasapetPage = lazy(() => import("./pages/casapet"));
const StarpetshopPage = lazy(() => import("./pages/starpetshop"));
const PortfolioPage = lazy(() => import("./pages/portfolio/[slug]"));
const ContractSignature = lazy(() => import("./pages/ContractSignature"));
const PromoPage = lazy(() => import("./pages/PromoPage"));
const DivulgacaoPage = lazy(() => import("./pages/DivulgacaoPage"));
const Inscricao = lazy(() => import("./pages/Inscricao"));
// Checkout Pages
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const PaymentCodePage = lazy(() => import("./pages/checkout/PaymentCodePage"));
const CheckoutSuccessPage = lazy(() => import("./pages/checkout/SuccessPage"));
const CheckoutPendingPage = lazy(() => import("./pages/checkout/PendingPage"));
const CheckoutErrorPage = lazy(() => import("./pages/checkout/ErrorPage"));
const CheckoutCompletePage = lazy(() => import("./pages/checkout/CompletePage"));
// Academia Genesis Pages
const GymLoginPage = lazy(() => import("./pages/academiapro/auth/GymLoginPage"));
const GymHomePage = lazy(() => import("./pages/academiapro/app/GymHomePage"));
const GymWorkoutsPage = lazy(() => import("./pages/academiapro/app/GymWorkoutsPage"));
const GymClassesPage = lazy(() => import("./pages/academiapro/app/GymClassesPage"));
const GymEvolutionPage = lazy(() => import("./pages/academiapro/app/GymEvolutionPage"));
const GymProfilePage = lazy(() => import("./pages/academiapro/app/GymProfilePage"));
const GymMyPlanPage = lazy(() => import("./pages/academiapro/app/GymMyPlanPage"));
const GymWorkoutExecution = lazy(() => import("./pages/academiapro/app/GymWorkoutExecution"));
const GymEditProfilePage = lazy(() => import("./pages/academiapro/app/GymEditProfilePage"));
const GymAdminDashboard = lazy(() => import("./pages/academiapro/admin/GymAdminDashboard"));
const GymAdminStudents = lazy(() => import("./pages/academiapro/admin/GymAdminStudents"));
const GymAdminWorkouts = lazy(() => import("./pages/academiapro/admin/GymAdminWorkouts"));
const GymAdminClasses = lazy(() => import("./pages/academiapro/admin/GymAdminClasses"));
const GymAdminFinance = lazy(() => import("./pages/academiapro/admin/GymAdminFinance"));
const GymAdminSettings = lazy(() => import("./pages/academiapro/admin/GymAdminSettings"));
const GymAdminAttendance = lazy(() => import("./pages/academiapro/admin/GymAdminAttendance"));
const GymAdminCheckIn = lazy(() => import("./pages/academiapro/admin/GymAdminCheckIn"));
const GymSettingsAppPage = lazy(() => import("./pages/academiapro/app/GymSettingsAppPage"));
// QueryClient com retry logic e cache otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Loading component para Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Loading component específico para Academia Genesis
const GymPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const GymThemeGate = () => (
  <>
    <GymThemeBootstrap />
    <Outlet />
  </>
);

// Register Service Worker for PWA
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content available, please refresh.');
              // Auto-activate new service worker
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log('SW Updated to version:', event.data.version);

          // Evita recarregamentos inesperados (especialmente no CRM)
          const isCrm = window.location.pathname.startsWith('/crmpainel');
          if (isCrm) {
            notify('Atualização disponível', {
              description: 'Clique para atualizar quando for conveniente.',
              action: {
                label: 'Atualizar',
                onClick: () => window.location.reload(),
              },
            });
            return;
          }

          // Para o restante do app, mantém atualização manual (sem auto reload)
          notify('Atualização disponível', {
            description: 'Clique para atualizar.',
            action: {
              label: 'Atualizar',
              onClick: () => window.location.reload(),
            },
          });
        }
      });

      // Check for updates (menos agressivo para evitar interrupções)
      setInterval(() => {
        registration.update();
      }, 10 * 60 * 1000);

    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
};

// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
  }
};

const AppContent = () => {
  useSecurityProtection();

  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
  }, []);

  // Check if accessing via docs subdomain
  const isDocsSubdomain = window.location.hostname === 'docs.genesishub.cloud';
  const isAffiliateSubdomain = window.location.hostname === 'parceiros.genesishub.cloud';

  // If on docs subdomain, show only the Docs page
  if (isDocsSubdomain) {
    return (
      <>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="*" element={<Docs />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </>
    );
  }

  // If on affiliate subdomain, show only affiliate pages
  if (isAffiliateSubdomain) {
    return (
      <>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<AffiliateLogin />} />
              <Route path="/login" element={<AffiliateLogin />} />
              <Route path="/painel" element={<AffiliatePanel />} />
              <Route path="*" element={<AffiliateLogin />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <UpgradeModal />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<GenesisCommercial />} />
            <Route path="/barbearia" element={<Index />} />
            <Route path="/agendar" element={<Booking />} />
            <Route path="/agendamento-direto" element={<BookingDirect />} />
            <Route path="/meus-agendamentos" element={<MyAppointments />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/avaliar" element={<FeedbackPage />} />
            <Route path="/owner" element={<OwnerPanel />} />
            <Route path="/proposta/:slug" element={<ProposalPage />} />
            <Route path="/email-confirmado" element={<EmailConfirmed />} />
            <Route path="/confirmar-email" element={<ConfirmarEmail />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/termos" element={<TermosDeUso />} />
            <Route path="/privacidade" element={<PoliticaDePrivacidade />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/whatsapp-api" element={<WADocsPage />} />
            <Route path="/afiliado/login" element={<AffiliateLogin />} />
            <Route path="/afiliado" element={<AffiliatePanel />} />
            {/* Genesis Hub Routes */}
            <Route path="/genesis/login" element={<GenesisLogin />} />
            <Route path="/genesis" element={<GenesisPanel />} />
            <Route path="/genesis/docs" element={<FlowBuilderDocs />} />
            <Route path="/instrucoes" element={<Instrucoes />} />
            <Route path="/venda-genesis" element={<GenesisVenda />} />
            <Route path="/venda-genesis/ferramentas" element={<VendaFerramentas />} />
            <Route path="/venda-genesis/empresas" element={<VendaEmpresas />} />
            <Route path="/venda-genesis/agentes-ia" element={<VendaAgentesIA />} />
            <Route path="/cof" element={<CofPage />} />
            <Route path="/script" element={<ScriptDownload />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/doc-prospeccao" element={<DocProspeccao />} />
            <Route path="/demo/:code" element={<DemoPage />} />
            <Route path="/demo/:code/agendar" element={<DemoBookingPage />} />
            <Route path="/academia" element={<AcademiaPage />} />
            <Route path="/academia/:code" element={<AcademiaPage />} />
            <Route path="/academia/matricula" element={<AcademiaMatriculaPage />} />
            <Route path="/academia/:code/matricula" element={<AcademiaMatriculaPage />} />
            <Route path="/clinica-estetica" element={<ClinicaEsteticaPage />} />
            <Route path="/clinica-estetica/:code" element={<ClinicaEsteticaPage />} />
            <Route path="/clinica-estetica/agendar" element={<ClinicaEsteticaAgendarPage />} />
            <Route path="/clinica-estetica/:code/agendar" element={<ClinicaEsteticaAgendarPage />} />
            {/* Genesis IA Routes - Nova rota /login */}
            <Route path="/login" element={<GenesisIALogin />} />
            <Route path="/login/dashboard" element={<GenesisIADashboard />} />
            {/* Redirect antigo genesis-ia para novo /login */}
            <Route path="/genesis-ia" element={<GenesisIALogin />} />
            <Route path="/genesis-ia/dashboard" element={<GenesisIADashboard />} />
            {/* Petshop Demo */}
            <Route path="/petshop" element={<PetshopPage />} />
            <Route path="/petshop-primo" element={<PetshopPrimoPage />} />
            <Route path="/petshop-mon" element={<PetshopMonPage />} />
            <Route path="/casapet" element={<CasapetPage />} />
            <Route path="/starpetshop" element={<StarpetshopPage />} />
            {/* Dynamic Portfolio Routes */}
            <Route path="/p/:slug" element={<PortfolioPage />} />
            {/* Contract Signature */}
            <Route path="/contratos/assinar/:hash" element={<ContractSignature />} />
            {/* Promo Page */}
            <Route path="/promo/:codigo" element={<PromoPage />} />
            {/* Divulgação Page */}
            <Route path="/divul" element={<DivulgacaoPage />} />
            {/* Inscrição Parceiros */}
            <Route path="/inscricao" element={<Inscricao />} />
            {/* Checkout Routes - Static routes first, dynamic last */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/pending" element={<CheckoutPendingPage />} />
            <Route path="/checkout/error" element={<CheckoutErrorPage />} />
            <Route path="/checkout/complete" element={<CheckoutCompletePage />} />
            <Route path="/checkout/:code" element={<PaymentCodePage />} />
            {/* Academia Genesis Routes - theme must apply globally to login/admin/aluno */}
            <Route path="/academiapro" element={<GymThemeGate />}>
              <Route index element={<Navigate to="auth/login" replace />} />
              <Route
                path="auth/login"
                element={
                  <Suspense fallback={<GymPageLoader />}>
                    <GymLoginPage />
                  </Suspense>
                }
              />

              <Route path="app" element={<GymAppLayout />}>
                <Route index element={<Suspense fallback={<GymPageLoader />}><GymHomePage /></Suspense>} />
                <Route path="treinos" element={<Suspense fallback={<GymPageLoader />}><GymWorkoutsPage /></Suspense>} />
                <Route path="treinos/:workoutId" element={<Suspense fallback={<GymPageLoader />}><GymWorkoutsPage /></Suspense>} />
                <Route path="treinos/:workoutId/executar" element={<Suspense fallback={<GymPageLoader />}><GymWorkoutExecution /></Suspense>} />
                <Route path="aulas" element={<Suspense fallback={<GymPageLoader />}><GymClassesPage /></Suspense>} />
                <Route path="evolucao" element={<Suspense fallback={<GymPageLoader />}><GymEvolutionPage /></Suspense>} />
                <Route path="meu-plano" element={<Suspense fallback={<GymPageLoader />}><GymMyPlanPage /></Suspense>} />
                <Route path="perfil" element={<Suspense fallback={<GymPageLoader />}><GymProfilePage /></Suspense>} />
                <Route path="perfil/editar" element={<Suspense fallback={<GymPageLoader />}><GymEditProfilePage /></Suspense>} />
                <Route path="configuracoes" element={<Suspense fallback={<GymPageLoader />}><GymSettingsAppPage /></Suspense>} />
              </Route>

              <Route path="admin" element={<GymAdminLayout />}>
                <Route index element={<Suspense fallback={<GymPageLoader />}><GymAdminDashboard /></Suspense>} />
                <Route path="alunos" element={<Suspense fallback={<GymPageLoader />}><GymAdminStudents /></Suspense>} />
                <Route path="treinos" element={<Suspense fallback={<GymPageLoader />}><GymAdminWorkouts /></Suspense>} />
                <Route path="aulas" element={<Suspense fallback={<GymPageLoader />}><GymAdminClasses /></Suspense>} />
                <Route path="checkin" element={<Suspense fallback={<GymPageLoader />}><GymAdminCheckIn /></Suspense>} />
                <Route path="presenca" element={<Suspense fallback={<GymPageLoader />}><GymAdminAttendance /></Suspense>} />
                <Route path="financeiro" element={<Suspense fallback={<GymPageLoader />}><GymAdminFinance /></Suspense>} />
                <Route path="configuracoes" element={<Suspense fallback={<GymPageLoader />}><GymAdminSettings /></Suspense>} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <MobileBottomNav />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GenesisAuthProvider>
          <GymAuthProvider>
            <SubscriptionProvider>
              <AppProvider>
                <GalleryProvider>
                  <FeedbackProvider>
                    <NotificationProvider>
                      <TooltipProvider>
                        <PresenceTracker />
                        <AppContent />
                      </TooltipProvider>
                    </NotificationProvider>
                  </FeedbackProvider>
                </GalleryProvider>
              </AppProvider>
            </SubscriptionProvider>
          </GymAuthProvider>
        </GenesisAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
