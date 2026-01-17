import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PetshopHome = lazy(() => import("@/components/petshop-demo/PetshopHome"));
const PetshopAgendar = lazy(() => import("@/components/petshop-demo/PetshopAgendar"));
const PetshopMeusAgendamentos = lazy(() => import("@/components/petshop-demo/PetshopMeusAgendamentos"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <Loader2 className="w-8 h-8 animate-spin text-[#7DD3C0]" />
  </div>
);

function PetshopDemo() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route index element={<PetshopHome />} />
        <Route path="agendar" element={<PetshopAgendar />} />
        <Route path="meus-agendamentos" element={<PetshopMeusAgendamentos />} />
      </Routes>
    </Suspense>
  );
}

export default PetshopDemo;
