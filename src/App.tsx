import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FeedbackProvider } from "@/contexts/FeedbackContext";
import { GalleryProvider } from "@/contexts/GalleryContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { GenesisAuthProvider } from "@/contexts/GenesisAuthContext";
import { useSecurityProtection } from "@/hooks/useSecurityProtection";
import MobileBottomNav from "@/components/MobileBottomNav";
import UpgradeModal from "@/components/subscription/UpgradeModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PresenceTracker from "@/components/PresenceTracker";
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast as notify } from "sonner";

// Lazy loading de páginas
const GenesisCommercial = lazy(() => import("./pages/GenesisCommercial"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GenesisIALogin = lazy(() => import("./pages/GenesisIALogin"));
const GenesisIADashboard = lazy(() => import("./pages/GenesisIADashboard"));
const BaixarGenesis = lazy(() => import("./pages/BaixarGenesis"));
const CaktoReturn = lazy(() => import("./pages/CaktoReturn"));
const PetshopPage = lazy(() => import("./pages/petshop"));
const PetshopPrimoPage = lazy(() => import("./pages/petshop-primo"));
const PetshopMonPage = lazy(() => import("./pages/petshop-mon"));
const CasapetPage = lazy(() => import("./pages/casapet"));
const StarpetshopPage = lazy(() => import("./pages/starpetshop"));
const PromoPage = lazy(() => import("./pages/PromoPage"));

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

// Register Service Worker for PWA
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration.scope);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content available, please refresh.');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log('SW Updated to version:', event.data.version);
          notify('Atualização disponível', {
            description: 'Clique para atualizar.',
            action: {
              label: 'Atualizar',
              onClick: () => window.location.reload(),
            },
          });
        }
      });

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

  return (
    <>
      <Toaster />
      <Sonner />
      <UpgradeModal />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Site Comercial */}
            <Route path="/" element={<GenesisCommercial />} />

            {/* Genesis IA - Login e Dashboard */}
            <Route path="/login" element={<GenesisIALogin />} />
            <Route path="/login/dashboard" element={<GenesisIADashboard />} />
            {/* Redirects antigos */}
            <Route path="/genesis-ia" element={<GenesisIALogin />} />
            <Route path="/genesis-ia/dashboard" element={<GenesisIADashboard />} />

            {/* Download */}
            <Route path="/baixar-genesis" element={<BaixarGenesis />} />

            {/* Cakto Return - post-payment */}
            <Route path="/cakto-return" element={<CaktoReturn />} />

            {/* Petshop */}
            <Route path="/petshop" element={<PetshopPage />} />
            <Route path="/petshop-primo" element={<PetshopPrimoPage />} />
            <Route path="/petshop-mon" element={<PetshopMonPage />} />
            <Route path="/casapet" element={<CasapetPage />} />
            <Route path="/starpetshop" element={<StarpetshopPage />} />

            {/* Promo - partner links */}
            <Route path="/promo/:codigo" element={<PromoPage />} />

            {/* 404 */}
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
        </GenesisAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
