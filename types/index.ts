export interface Page {
  id: string;
  uri: string;
  filter?: 'original' | 'blackWhite' | 'grayscale' | 'highContrast' | 'magic';
  timestamp?: number;
  extractedText?: string;
}

export interface Document {
  id: string;
  name: string;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  extractedText?: string; // Combined extracted text from all pages
  tags?: string[];
}

export interface ScanSettings {
  autoCapture: boolean;
  flashMode: 'auto' | 'on' | 'off';
  defaultFilter: Page['filter'];
  saveToCloud: boolean;
}

export interface CloudSyncStatus {
  lastSyncTime?: number;
  isSyncing: boolean;
  pendingUploads: number;
  syncEnabled: boolean;
}