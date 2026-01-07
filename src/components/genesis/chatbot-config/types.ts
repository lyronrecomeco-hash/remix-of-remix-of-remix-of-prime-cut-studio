// Types for Enterprise Chatbot Configuration

export type ResponseType = 'text' | 'buttons' | 'list';

export type StepType = 'greeting' | 'menu' | 'text' | 'input' | 'confirmation' | 'transfer' | 'end';

export type InputDataType = 'name' | 'phone' | 'email' | 'cpf' | 'bank' | 'company_type' | 'service' | 'custom';

export type AIMode = 'disabled' | 'support' | 'full';

export type FailAction = 'end' | 'transfer' | 'restart';

export interface MenuOption {
  id: string | number;
  text: string;
  next: string;
  description?: string;
}

export interface FlowStep {
  id: string;
  type: StepType;
  message: string;
  next?: string;
  options?: MenuOption[];
  // Data collection
  input_type?: InputDataType;
  input_variable?: string;
  validation_regex?: string;
  // AI handling
  use_ai_for_response?: boolean;
  // Transfer
  transfer_message?: string;
}

export interface FlowConfig {
  version: string;
  startStep: string;
  steps: Record<string, FlowStep>;
  greetings?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
}

export interface AIConfig {
  mode: AIMode;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  rules: string[];
}

export interface ChatbotFormState {
  // Basic
  name: string;
  trigger_type: string;
  keywords: string;
  response_type: ResponseType;
  delay: number;
  instance_id: string;
  company_name: string;
  
  // Flow control
  max_attempts: number;
  fallback_message: string;
  fail_action: FailAction;
  
  // Greeting
  greeting_message: string;
  use_dynamic_greeting: boolean;
  morning_greeting: string;
  afternoon_greeting: string;
  evening_greeting: string;
  
  // Menu
  menu_title: string;
  menu_description: string;
  menu_options: MenuOptionForm[];
  
  // AI (optional)
  ai_mode: AIMode;
  ai_system_prompt: string;
  ai_temperature: number;
  ai_rules: string[];
  
  // Advanced
  use_flow_json: boolean;
  flow_config_json: string;
}

export interface MenuOptionForm {
  id: string;
  text: string;
  description: string;
  action: 'step' | 'message' | 'subflow' | 'transfer' | 'ai' | 'end';
  next_step_id: string;
  response_message: string;
  collect_data?: boolean;
  data_type?: InputDataType;
  data_variable?: string;
}

export interface Chatbot {
  id: string;
  instance_id: string | null;
  name: string;
  trigger_type: string;
  trigger_keywords: string[];
  response_type: string;
  response_content: string | null;
  response_buttons: any[];
  response_list: any;
  delay_seconds: number;
  is_active: boolean;
  priority: number;
  match_count: number;
  created_at: string;
  flow_config?: FlowConfig | null;
  max_attempts?: number | null;
  fallback_message?: string | null;
  company_name?: string | null;
  ai_enabled?: boolean;
  ai_model?: string | null;
  ai_temperature?: number | null;
  ai_system_prompt?: string | null;
}

export const DEFAULT_FORM_STATE: ChatbotFormState = {
  name: '',
  trigger_type: 'keyword',
  keywords: '',
  response_type: 'list',
  delay: 2,
  instance_id: '',
  company_name: '',
  
  max_attempts: 3,
  fallback_message: 'Não entendi sua resposta 😅\nPor favor, digite apenas o *número* da opção desejada.',
  fail_action: 'end',
  
  greeting_message: 'Olá! 👋 Seja bem-vindo(a)!\n\nComo posso ajudar você hoje?',
  use_dynamic_greeting: true,
  morning_greeting: 'Bom dia! ☀️ Seja bem-vindo(a)!\n\nComo posso ajudar você hoje?',
  afternoon_greeting: 'Boa tarde! 🌤️ Seja bem-vindo(a)!\n\nComo posso ajudar você hoje?',
  evening_greeting: 'Boa noite! 🌙 Seja bem-vindo(a)!\n\nComo posso ajudar você hoje?',
  
  menu_title: '📋 Menu Principal',
  menu_description: 'Escolha uma opção:',
  menu_options: [{ 
    id: '1', 
    text: '', 
    description: '',
    action: 'message',
    next_step_id: '',
    response_message: '',
    collect_data: false,
  }],
  
  ai_mode: 'disabled',
  ai_system_prompt: '',
  ai_temperature: 0.7,
  ai_rules: [
    'Não invente informações que não possui',
    'Siga o fluxo estruturado do chatbot',
    'Seja cordial e profissional',
  ],
  
  use_flow_json: false,
  flow_config_json: '',
};
