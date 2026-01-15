/**
 * PROSPECT AUTOMATION - Types
 */

export interface AutomationConfig {
  // Instância WhatsApp
  genesisInstanceId: string;
  
  // Agendamento
  scheduleType: 'immediate' | 'scheduled';
  scheduledAt?: string;
  sendStartHour: number;
  sendEndHour: number;
  sendDays: number[];
  
  // Anti-Ban
  dailyLimit: number;
  messagesPerHour: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  
  // Proteções avançadas
  typingSimulation: boolean;
  typingDurationMin: number;
  typingDurationMax: number;
  adaptiveDelay: boolean;
  randomPause: boolean;
  pauseEveryMessages: number;
  pauseDurationMinutes: number;
  jitterPercent: number;
  
  // Warm-up
  warmupEnabled: boolean;
  warmupDay: number;
  warmupIncrementPercent: number;
  
  // Detecção
  stopOnErrors: boolean;
  maxConsecutiveErrors: number;
  detectBlacklist: boolean;
}

export interface AutomationJob {
  id: string;
  affiliate_id: string;
  genesis_instance_id: string | null;
  prospect_ids: string[];
  status: 'pending' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  config: AutomationConfig;
  scheduled_at: string | null;
  started_at: string | null;
  paused_at: string | null;
  completed_at: string | null;
  total_prospects: number;
  sent_count: number;
  failed_count: number;
  current_index: number;
  current_prospect_id: string | null;
  last_error: string | null;
  execution_log: ExecutionLogEntry[];
  created_at: string;
  updated_at: string;
}

export interface ExecutionLogEntry {
  timestamp: string;
  prospectId: string;
  prospectName: string;
  status: 'sent' | 'failed' | 'skipped';
  message?: string;
  error?: string;
  delayUsed?: number;
}

export const DEFAULT_AUTOMATION_CONFIG: AutomationConfig = {
  genesisInstanceId: '',
  scheduleType: 'immediate',
  sendStartHour: 8,
  sendEndHour: 20,
  sendDays: [1, 2, 3, 4, 5],
  dailyLimit: 50,
  messagesPerHour: 10,
  minDelaySeconds: 45,
  maxDelaySeconds: 180,
  typingSimulation: true,
  typingDurationMin: 2,
  typingDurationMax: 5,
  adaptiveDelay: true,
  randomPause: true,
  pauseEveryMessages: 10,
  pauseDurationMinutes: 5,
  jitterPercent: 30,
  warmupEnabled: true,
  warmupDay: 1,
  warmupIncrementPercent: 20,
  stopOnErrors: true,
  maxConsecutiveErrors: 3,
  detectBlacklist: true,
};

export interface GenesisInstance {
  id: string;
  name: string;
  phone_number: string | null;
  status: string;
}
