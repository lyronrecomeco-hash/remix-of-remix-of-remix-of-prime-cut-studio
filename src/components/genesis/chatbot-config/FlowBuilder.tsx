import { 
  ChatbotFormState, 
  FlowConfig, 
  FlowStep, 
  MenuOptionForm,
  AIMode 
} from './types';

/**
 * Build FlowConfig from form state
 */
export function buildFlowConfigFromForm(form: ChatbotFormState): FlowConfig {
  const steps: Record<string, FlowStep> = {};
  
  // Greeting step
  const greetingMessage = form.use_dynamic_greeting 
    ? '{{saudacao_dinamica}}'
    : form.greeting_message;
    
  steps.greeting = {
    id: 'greeting',
    type: 'greeting',
    message: greetingMessage,
    next: 'main_menu',
  };
  
  // Main menu step
  const menuOptions = form.menu_options
    .filter(opt => opt.text.trim())
    .map((opt, idx) => ({
      id: idx + 1,
      text: opt.text.trim(),
      description: opt.description?.trim() || undefined,
      next: `option_${idx + 1}`,
    }));
    
  steps.main_menu = {
    id: 'main_menu',
    type: 'menu',
    message: `${form.menu_title}\n\n${form.menu_description}`,
    options: menuOptions,
  };
  
  // Option steps
  form.menu_options
    .filter(opt => opt.text.trim())
    .forEach((opt, idx) => {
      const stepId = `option_${idx + 1}`;
      
      if (opt.action === 'end') {
        steps[stepId] = {
          id: stepId,
          type: 'end',
          message: opt.response_message || '✅ Atendimento finalizado!\n\nObrigado por entrar em contato. Volte sempre! 👋',
        };
      } else if (opt.action === 'transfer') {
        steps[stepId] = {
          id: stepId,
          type: 'transfer',
          message: opt.response_message || '🔄 Transferindo para um atendente...\n\nAguarde um momento, por favor.',
          transfer_message: 'Aguarde, um atendente irá atendê-lo em breve.',
        };
      } else if (opt.action === 'ai') {
        steps[stepId] = {
          id: stepId,
          type: 'text',
          message: opt.response_message || 'Como posso ajudar você com isso?',
          use_ai_for_response: true,
          next: `option_${idx + 1}_menu`,
        };
        // Add follow-up menu after AI
        steps[`option_${idx + 1}_menu`] = {
          id: `option_${idx + 1}_menu`,
          type: 'menu',
          message: 'Posso ajudar com mais alguma coisa?',
          options: [
            { id: 1, text: '📋 Voltar ao menu principal', next: 'main_menu' },
            { id: 2, text: '👋 Encerrar atendimento', next: 'goodbye' },
          ],
        };
      } else if (opt.collect_data && opt.data_type) {
        // Data collection step
        steps[stepId] = {
          id: stepId,
          type: 'input',
          message: opt.response_message || 'Por favor, informe o dado solicitado:',
          input_type: opt.data_type,
          input_variable: opt.data_variable || opt.data_type,
          next: `option_${idx + 1}_confirm`,
        };
        // Confirmation after data collection
        steps[`option_${idx + 1}_confirm`] = {
          id: `option_${idx + 1}_confirm`,
          type: 'menu',
          message: '✅ Dados recebidos!\n\nPosso ajudar com mais alguma coisa?',
          options: [
            { id: 1, text: '📋 Voltar ao menu principal', next: 'main_menu' },
            { id: 2, text: '👋 Encerrar atendimento', next: 'goodbye' },
          ],
        };
      } else if (opt.action === 'subflow' && opt.next_step_id) {
        // Link to subflow
        steps[stepId] = {
          id: stepId,
          type: 'text',
          message: opt.response_message || 'Vou te direcionar...',
          next: opt.next_step_id,
        };
      } else {
        // Default: message with back to menu
        steps[stepId] = {
          id: stepId,
          type: 'menu',
          message: opt.response_message || 'Entendi!',
          options: [
            { id: 1, text: '📋 Voltar ao menu principal', next: 'main_menu' },
            { id: 2, text: '👋 Encerrar atendimento', next: 'goodbye' },
          ],
        };
      }
    });
  
  // Goodbye step
  steps.goodbye = {
    id: 'goodbye',
    type: 'end',
    message: '✅ Atendimento finalizado!\n\nObrigado por falar com a {{empresa}}.\nVolte sempre! 👋',
  };
  
  // Fallback step (when max attempts exceeded)
  if (form.fail_action === 'transfer') {
    steps.fallback_transfer = {
      id: 'fallback_transfer',
      type: 'transfer',
      message: '🔄 Vou transferir você para um atendente humano.\nAguarde um momento.',
    };
  } else if (form.fail_action === 'restart') {
    steps.fallback_restart = {
      id: 'fallback_restart',
      type: 'text',
      message: 'Vamos recomeçar...',
      next: 'greeting',
    };
  }
  
  return {
    version: '2.0',
    startStep: 'greeting',
    steps,
    settings: form.use_dynamic_greeting ? {
      greeting_dynamic: true,
      morning_greeting: form.morning_greeting,
      afternoon_greeting: form.afternoon_greeting,
      evening_greeting: form.evening_greeting,
    } : undefined,
  };
}

/**
 * Extract form state from existing FlowConfig
 */
export function extractFormFromFlow(flow: FlowConfig | null, chatbot: any): Partial<ChatbotFormState> {
  if (!flow || !flow.steps) {
    return {};
  }
  
  const greetingStep = flow.steps.greeting;
  const mainMenu = flow.steps.main_menu;
  const settings = flow.settings;
  
  // Extract menu options
  const menuOptions: MenuOptionForm[] = (mainMenu?.options || []).map((opt: any, idx: number) => {
    const nextStep = flow.steps[opt.next];
    
    let action: MenuOptionForm['action'] = 'message';
    let responseMessage = '';
    let collectData = false;
    let dataType = undefined;
    
    if (nextStep) {
      if (nextStep.type === 'end') action = 'end';
      else if (nextStep.type === 'transfer') action = 'transfer';
      else if (nextStep.use_ai_for_response) action = 'ai';
      else if (nextStep.type === 'input') {
        collectData = true;
        dataType = nextStep.input_type;
      }
      responseMessage = nextStep.message || '';
    }
    
    return {
      id: String(idx + 1),
      text: opt.text || '',
      description: opt.description || '',
      action,
      next_step_id: opt.next || '',
      response_message: responseMessage,
      collect_data: collectData,
      data_type: dataType,
    };
  });
  
  // Parse menu message
  const menuMessage = mainMenu?.message || '';
  const menuParts = menuMessage.split('\n\n');
  const menuTitle = menuParts[0] || '📋 Menu Principal';
  const menuDescription = menuParts.slice(1).join('\n\n') || 'Escolha uma opção:';
  
  return {
    greeting_message: settings?.greeting_dynamic ? '' : (greetingStep?.message || ''),
    use_dynamic_greeting: settings?.greeting_dynamic || false,
    morning_greeting: settings?.morning_greeting || '',
    afternoon_greeting: settings?.afternoon_greeting || '',
    evening_greeting: settings?.evening_greeting || '',
    menu_title: menuTitle,
    menu_description: menuDescription,
    menu_options: menuOptions.length ? menuOptions : undefined,
    ai_mode: chatbot?.ai_enabled ? (chatbot.ai_system_prompt ? 'support' : 'full') : 'disabled',
    ai_system_prompt: chatbot?.ai_system_prompt || '',
    ai_temperature: chatbot?.ai_temperature || 0.7,
  };
}

/**
 * Validate flow configuration
 */
export function validateFlowConfig(flow: FlowConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!flow.startStep) {
    errors.push('Etapa inicial não definida');
  }
  
  if (!flow.steps || Object.keys(flow.steps).length === 0) {
    errors.push('Nenhuma etapa configurada');
  }
  
  if (flow.startStep && !flow.steps[flow.startStep]) {
    errors.push(`Etapa inicial "${flow.startStep}" não encontrada`);
  }
  
  // Check for orphan steps
  const referencedSteps = new Set<string>();
  referencedSteps.add(flow.startStep);
  
  Object.values(flow.steps).forEach(step => {
    if (step.next) referencedSteps.add(step.next);
    step.options?.forEach(opt => {
      if (opt.next) referencedSteps.add(opt.next);
    });
  });
  
  // Check all referenced steps exist
  referencedSteps.forEach(stepId => {
    if (!flow.steps[stepId]) {
      errors.push(`Etapa referenciada "${stepId}" não existe`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

/**
 * Safe JSON parse
 */
export function safeParseFlowJson(json: string): { ok: true; data: FlowConfig } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.version || !parsed.startStep || !parsed.steps) {
      return { ok: false, error: 'JSON inválido: faltam campos obrigatórios (version, startStep, steps)' };
    }
    return { ok: true, data: parsed as FlowConfig };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'JSON inválido' };
  }
}
