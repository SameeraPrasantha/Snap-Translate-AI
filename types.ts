export enum AppStatus {
  IDLE = 'IDLE',
  EXTRACTING = 'EXTRACTING',
  EXTRACTED = 'EXTRACTED',
  TRANSLATING = 'TRANSLATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ExtractedData {
  originalText: string;
  detectedLanguage?: string;
}

export interface TranslationData {
  translatedText: string;
  targetLanguage: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export type AlertType = 'success' | 'error' | 'info';

export interface AlertMessage {
  type: AlertType;
  message: string;
}
