// Types for Advanced Messaging Features - Phase 1

// ═══════════════════════════════════════════════════════════════════════════════
// POLL SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PollOption {
  id: string;
  text: string;
}

export interface PollMessage {
  name: string;
  options: PollOption[];
  selectableCount: number; // 0 = unlimited, 1 = single choice, 2+ = multiple
}

export interface PollVote {
  id: string;
  pollId: string;
  instanceId: string;
  voterPhone: string;
  voterName?: string;
  selectedOptions: string[]; // Option IDs
  votedAt: Date;
}

export interface PollResult {
  pollId: string;
  pollName: string;
  totalVotes: number;
  options: {
    id: string;
    text: string;
    votes: number;
    percentage: number;
    voters: string[];
  }[];
  createdAt: Date;
  lastVoteAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REACTIONS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Reaction {
  id: string;
  messageId: string;
  instanceId: string;
  reactorPhone: string;
  reactorName?: string;
  emoji: string;
  reactedAt: Date;
}

export interface ReactionSummary {
  messageId: string;
  reactions: {
    emoji: string;
    count: number;
    reactors: string[];
  }[];
  totalReactions: number;
}

// Common emojis for reactions
export const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;
export type CommonReaction = typeof COMMON_REACTIONS[number];

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO PTT (PUSH TO TALK) TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AudioMessage {
  id: string;
  instanceId: string;
  recipientPhone: string;
  audioUrl?: string;
  audioBase64?: string;
  durationSeconds: number;
  isPtt: boolean; // Push to talk (voice message style)
  waveform?: number[]; // Audio waveform for display
  sentAt: Date;
}

export interface AudioRecording {
  blob: Blob;
  durationSeconds: number;
  waveform: number[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPING/RECORDING INDICATOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PresenceType = 'available' | 'unavailable' | 'composing' | 'recording' | 'paused';

export interface PresenceUpdate {
  instanceId: string;
  recipientPhone: string;
  presence: PresenceType;
  duration?: number; // Auto-clear after X ms
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SendLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export interface InstanceOption {
  id: string;
  name: string;
  phone_number?: string;
  status?: string;
}

// API Response types
export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  type?: string;
}

export interface VoteResponse {
  success: boolean;
  votes?: PollVote[];
  error?: string;
}

export interface ReactionResponse {
  success: boolean;
  reactions?: Reaction[];
  error?: string;
}
