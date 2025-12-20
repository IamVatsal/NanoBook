
export enum Role {
  USER = 'user',
  model = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Source {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadDate: number;
}

export interface AppState {
  messages: Message[];
  sources: Source[];
  darkMode: boolean;
}

export interface ChatRequest {
  user_query: string;
  history: MessageHistoryItem[];
}

export interface MessageHistoryItem {
  role: 'user' | 'model';
  parts: string[];
}

export interface ChatResponse {
  response: string;
}

export interface UploadResponse {
  message: string;
  filename?: string;
}