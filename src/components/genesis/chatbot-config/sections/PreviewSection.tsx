import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bot, Send, RotateCcw, ChevronRight } from 'lucide-react';
import { ChatbotFormState, FlowConfig, FlowStep } from '../types';
import { buildFlowConfigFromForm } from '../FlowBuilder';

interface PreviewSectionProps {
  form: ChatbotFormState;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export function PreviewSection({ form }: PreviewSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const flow = useMemo(() => {
    return buildFlowConfigFromForm(form);
  }, [form]);

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return form.morning_greeting;
    if (hour >= 12 && hour < 18) return form.afternoon_greeting;
    return form.evening_greeting;
  };

  const processMessage = (message: string) => {
    const step = currentStepId ? flow.steps[currentStepId] : null;
    
    if (!step) return;
    
    // Check if user input matches any option
    if (step.type === 'menu' && step.options) {
      const inputNum = parseInt(message.trim());
      const matchedOption = step.options.find((opt, idx) => 
        opt.id === inputNum || idx + 1 === inputNum || 
        opt.text.toLowerCase().includes(message.toLowerCase())
      );
      
      if (matchedOption) {
        setAttempts(0);
        const nextStep = flow.steps[matchedOption.next];
        if (nextStep) {
          setTimeout(() => {
            addBotMessage(nextStep.message.replace('{{empresa}}', form.company_name || 'Empresa'));
            setCurrentStepId(nextStep.id);
          }, 500);
        }
      } else {
        // Invalid input
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= form.max_attempts) {
          // Max attempts exceeded
          setTimeout(() => {
            if (form.fail_action === 'transfer') {
              addBotMessage('🔄 Transferindo para um atendente humano...');
            } else if (form.fail_action === 'restart') {
              addBotMessage('Vamos recomeçar...');
              startSimulation();
            } else {
              addBotMessage('❌ Atendimento encerrado por limite de tentativas.\n\nDigite algo para iniciar novamente.');
              setCurrentStepId(null);
            }
            setAttempts(0);
          }, 500);
        } else {
          setTimeout(() => {
            addBotMessage(form.fallback_message);
          }, 500);
        }
      }
    } else if (step.type === 'end') {
      setCurrentStepId(null);
    } else if (step.next) {
      const nextStep = flow.steps[step.next];
      if (nextStep) {
        setTimeout(() => {
          addBotMessage(nextStep.message.replace('{{empresa}}', form.company_name || 'Empresa'));
          setCurrentStepId(nextStep.id);
        }, 500);
      }
    }
  };

  const addBotMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'bot',
      content,
      timestamp: getTimeString(),
    }]);
  };

  const startSimulation = () => {
    setMessages([]);
    setAttempts(0);
    setIsSimulating(true);
    
    // Get greeting message
    let greetingMsg = form.use_dynamic_greeting ? getDynamicGreeting() : form.greeting_message;
    greetingMsg = greetingMsg.replace('{{empresa}}', form.company_name || 'Empresa');
    
    // Add greeting
    setTimeout(() => {
      addBotMessage(greetingMsg);
      
      // Add menu after greeting
      setTimeout(() => {
        const mainMenu = flow.steps.main_menu;
        if (mainMenu) {
          const menuText = mainMenu.message + '\n\n' + 
            (mainMenu.options || [])
              .map((opt: any, idx: number) => `${idx + 1}️⃣ ${opt.text}`)
              .join('\n') +
            '\n\n_Digite o número da opção:_';
          addBotMessage(menuText);
          setCurrentStepId('main_menu');
        }
      }, 800);
    }, 300);
  };

  const handleSend = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: getTimeString(),
    }]);
    
    if (!isSimulating || !currentStepId) {
      // Start simulation if not running
      setUserInput('');
      startSimulation();
      return;
    }
    
    const input = userInput;
    setUserInput('');
    processMessage(input);
  };

  const resetSimulation = () => {
    setMessages([]);
    setCurrentStepId(null);
    setAttempts(0);
    setIsSimulating(false);
    setUserInput('');
  };

  return (
    <div className="flex flex-col items-center p-4 h-full">
      <div className="w-full max-w-sm flex flex-col h-full">
        {/* WhatsApp Header */}
        <div className="bg-[#075e54] text-white p-3 rounded-t-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{form.name || 'Seu Chatbot'}</p>
            <p className="text-xs opacity-80">
              {isSimulating ? 'digitando...' : 'online'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetSimulation}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <div className="bg-[#ece5dd] dark:bg-zinc-800 flex-1 p-4 space-y-3 overflow-y-auto min-h-[350px] max-h-[400px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Clique em "Iniciar" ou envie uma mensagem para simular o fluxo
              </p>
              <Button 
                size="sm" 
                className="mt-3 gap-2"
                onClick={startSimulation}
              >
                <ChevronRight className="w-4 h-4" />
                Iniciar Simulação
              </Button>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[85%] shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#dcf8c6] dark:bg-green-800 text-black dark:text-white'
                      : 'bg-white dark:bg-zinc-700 text-black dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] text-right opacity-60 mt-1 flex items-center justify-end gap-1">
                    {msg.timestamp}
                    {msg.role === 'user' && <span className="text-blue-500">✓✓</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Input */}
        <div className="bg-[#f0f0f0] dark:bg-zinc-900 p-2 rounded-b-2xl flex items-center gap-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-white dark:bg-zinc-800 rounded-full border-0"
          />
          <Button
            size="icon"
            className="rounded-full bg-[#075e54] hover:bg-[#064e47]"
            onClick={handleSend}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {currentStepId && (
            <Badge variant="outline" className="text-xs">
              Etapa: {currentStepId}
            </Badge>
          )}
          {attempts > 0 && (
            <Badge variant="destructive" className="text-xs">
              Tentativas: {attempts}/{form.max_attempts}
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4 max-w-sm">
        Simulação real do fluxo. Teste todas as opções, fallback e transições.
      </p>
    </div>
  );
}
