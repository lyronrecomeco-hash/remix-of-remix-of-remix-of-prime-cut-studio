import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Zap, Brain, BarChart3, Shield, Clock, 
  Users, TrendingUp, Check, ChevronDown, ArrowRight,
  Bot, Workflow, Bell, Globe, Smartphone, Star,
  Play, Sparkles, MousePointer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import VendaHero from '@/components/venda/VendaHero';
import VendaProblems from '@/components/venda/VendaProblems';
import VendaSolution from '@/components/venda/VendaSolution';
import VendaFeatures from '@/components/venda/VendaFeatures';
import VendaLiveDemo from '@/components/venda/VendaLiveDemo';
import VendaSocialProof from '@/components/venda/VendaSocialProof';
import VendaPricing from '@/components/venda/VendaPricing';
import VendaFAQ from '@/components/venda/VendaFAQ';
import VendaFinalCTA from '@/components/venda/VendaFinalCTA';
import VendaFooter from '@/components/venda/VendaFooter';

const GenesisVenda = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <VendaHero />
      <VendaProblems />
      <VendaSolution />
      <VendaFeatures />
      <VendaLiveDemo />
      <VendaSocialProof />
      <VendaPricing />
      <VendaFAQ />
      <VendaFinalCTA />
      <VendaFooter />
    </div>
  );
};

export default GenesisVenda;
