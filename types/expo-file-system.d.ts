declare module 'expo-file-system' {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  
  export interface FileInfo {
    exists: boolean;
    uri: string;
    size?: number;
    isDirectory?: boolean;
    modificationTime?: number;
  }
  
  export interface ReadingOptions {
    encoding?: string;
    position?: number;
    length?: number;
  }
  
  export interface WritingOptions {
    encoding?: string;
  }
  
  export interface DeletingOptions {
    idempotent?: boolean;
  }
  
  export interface MakeDirectoryOptions {
    intermediates?: boolean;
  }
  
  export function getInfoAsync(fileUri: string): Promise<FileInfo>;
  export function readAsStringAsync(fileUri: string, options?: ReadingOptions): Promise<string>;
  export function writeAsStringAsync(fileUri: string, contents: string, options?: WritingOptions): Promise<void>;
  export function deleteAsync(fileUri: string, options?: DeletingOptions): Promise<void>;
  export function makeDirectoryAsync(fileUri: string, options?: MakeDirectoryOptions): Promise<void>;
  export function copyAsync(options: { from: string; to: string }): Promise<void>;
  export function moveAsync(options: { from: string; to: string }): Promise<void>;
}