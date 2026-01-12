// Types for Buttons & Lists feature

export type MessageType = 'buttons' | 'list' | 'url';

export interface ButtonItem {
  id: string;
  text: string;
  type: 'quick_reply' | 'url';
  url?: string;
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  id: string;
  title: string;
  rows: ListRow[];
}

export interface InteractiveMessage {
  type: MessageType;
  text: string;
  footer?: string;
  buttons: ButtonItem[];
  listSections: ListSection[];
  buttonText: string; // For list type - the button that opens the list
}

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
  orchestrated_status?: string;
  effective_status?: string;
  status?: string;
  last_heartbeat?: string;
}

// Limits defined by WhatsApp
export const WHATSAPP_LIMITS = {
  MAX_BUTTONS: 3,
  MAX_LIST_SECTIONS: 10,
  MAX_ROWS_PER_SECTION: 10,
  MAX_TOTAL_ROWS: 10,
  MAX_BUTTON_TEXT_LENGTH: 20,
  MAX_ROW_TITLE_LENGTH: 24,
  MAX_ROW_DESCRIPTION_LENGTH: 72,
  MAX_SECTION_TITLE_LENGTH: 24,
  MAX_MESSAGE_LENGTH: 1024,
  MAX_FOOTER_LENGTH: 60,
  MAX_BUTTON_TEXT_LIST_LENGTH: 20,
} as const;
