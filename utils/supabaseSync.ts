import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document } from '../types';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Supabase Cloud Sync Implementation
 * Free tier, no credit card required!
 */

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabase: SupabaseClient | null = null;
let currentUserId: string | null = null;

// Initialize Supabase
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    console.log('=== INITIALIZING SUPABASE ===');
    
    if (supabase) {
      console.log('Supabase already initialized');
      return true;
    }
    
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Generate anonymous user ID (stored locally)
    const storedUserId = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}scanview/user_id.txt`
    ).catch(() => null);
    
    if (storedUserId) {
      currentUserId = storedUserId;
    } else {
      currentUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}scanview/user_id.txt`,
        currentUserId
      );
    }
    
    console.log('Supabase initialized successfully');
    console.log('User ID:', currentUserId);
    
    return true;
  } catch (error) {
    console.error('Supabase initialization error:', error);
    return false;
  }
};

// Upload image to Supabase Storage
export const uploadImageToCloud = async (
  localUri: string,
  documentId: string,
  pageId: string
): Promise<string | null> => {
  try {
    if (!supabase || !currentUserId) {
      throw new Error('Supabase not initialized');
    }
    
    console.log('Uploading image to cloud...');
    
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to blob
    const response = await fetch(`data:image/jpeg;base64,${base64}`);
    const blob = await response.blob();
    
    // Create path
    const imagePath = `${currentUserId}/${documentId}/${pageId}.jpg`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(imagePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(imagePath);
    
    console.log('Image uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
};

// Sync document to cloud
export const syncDocumentToCloud = async (
  document: Document
): Promise<boolean> => {
  try {
    if (!supabase || !currentUserId) {
      throw new Error('Supabase not initialized');
    }
    
    console.log('=== SYNCING DOCUMENT TO CLOUD ===');
    console.log('Document:', document.name);
    
    // Upload all page images first
    const cloudPages = [];
    
    for (const page of document.pages) {
      const cloudUrl = await uploadImageToCloud(page.uri, document.id, page.id);
      
      if (cloudUrl) {
        cloudPages.push({
          ...page,
          cloudUri: cloudUrl,
        });
      }
    }
    
    // Create document data
    const cloudDocument = {
      id: document.id,
      user_id: currentUserId,
      name: document.name,
      pages: cloudPages,
      created_at: document.createdAt,
      updated_at: document.updatedAt,
      thumbnail: document.thumbnail,
      synced_at: new Date().toISOString(),
    };
    
    // Save to Supabase Database
    const { error } = await supabase
      .from('documents')
      .upsert(cloudDocument);
    
    if (error) throw error;
    
    console.log('Document synced successfully');
    return true;
  } catch (error) {
    console.error('Document sync error:', error);
    return false;
  }
};

// Download document from cloud
export const downloadDocumentFromCloud = async (
  documentId: string
): Promise<Document | null> => {
  try {
    if (!supabase || !currentUserId) {
      throw new Error('Supabase not initialized');
    }
    
    console.log('Downloading document from cloud:', documentId);
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', currentUserId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Download images to local storage
    const localPages = [];
    
    for (const page of data.pages) {
      const cloudUri = (page as any).cloudUri;
      
      if (cloudUri) {
        // Download image
        const response = await fetch(cloudUri);
        const base64 = await response.blob().then(blob => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
          });
        });
        
        // Save locally
        const filename = `cloud_${page.id}.jpg`;
        const localPath = `${FileSystem.documentDirectory}scanview/${filename}`;
        
        await FileSystem.writeAsStringAsync(localPath, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        localPages.push({
          ...page,
          uri: localPath,
        });
      }
    }
    
    const localDocument: Document = {
      id: data.id,
      name: data.name,
      pages: localPages,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      thumbnail: data.thumbnail,
    };
    
    console.log('Document downloaded successfully');
    return localDocument;
  } catch (error) {
    console.error('Document download error:', error);
    return null;
  }
};

// Get all cloud documents
export const getAllCloudDocuments = async (): Promise<Document[]> => {
  try {
    if (!supabase || !currentUserId) {
      throw new Error('Supabase not initialized');
    }
    
    console.log('Fetching all cloud documents...');
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const documents: Document[] = (data || []).map(doc => ({
      id: doc.id,
      name: doc.name,
      pages: doc.pages,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      thumbnail: doc.thumbnail,
    }));
    
    console.log('Found cloud documents:', documents.length);
    return documents;
  } catch (error) {
    console.error('Fetch documents error:', error);
    return [];
  }
};

// Delete document from cloud
export const deleteDocumentFromCloud = async (
  documentId: string
): Promise<boolean> => {
  try {
    if (!supabase || !currentUserId) {
      throw new Error('Supabase not initialized');
    }
    
    console.log('Deleting document from cloud:', documentId);
    
    // Delete images from storage
    const { data: files } = await supabase.storage
      .from('documents')
      .list(`${currentUserId}/${documentId}`);
    
    if (files && files.length > 0) {
      const filePaths = files.map(file => 
        `${currentUserId}/${documentId}/${file.name}`
      );
      
      await supabase.storage
        .from('documents')
        .remove(filePaths);
    }
    
    // Delete document from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', currentUserId);
    
    if (error) throw error;
    
    console.log('Document deleted from cloud');
    return true;
  } catch (error) {
    console.error('Delete document error:', error);
    return false;
  }
};

// Sync all local documents to cloud
export const syncAllToCloud = async (
  documents: Document[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> => {
  console.log('=== SYNCING ALL DOCUMENTS ===');
  console.log('Total documents:', documents.length);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    onProgress?.(i + 1, documents.length);
    
    const result = await syncDocumentToCloud(doc);
    
    if (result) {
      success++;
    } else {
      failed++;
    }
  }
  
  console.log('Sync complete - Success:', success, 'Failed:', failed);
  
  return { success, failed };
};

// Check sync status
export const checkSyncStatus = async (
  documentId: string
): Promise<{ synced: boolean; lastSync?: Date }> => {
  try {
    if (!supabase || !currentUserId) {
      return { synced: false };
    }
    
    const { data, error } = await supabase
      .from('documents')
      .select('synced_at')
      .eq('id', documentId)
      .eq('user_id', currentUserId)
      .single();
    
    if (error || !data) {
      return { synced: false };
    }
    
    return {
      synced: true,
      lastSync: new Date(data.synced_at),
    };
  } catch (error) {
    console.error('Check sync status error:', error);
    return { synced: false };
  }
};

/**
 * Usage Example:
 * 
 * // Initialize once at app start
 * await initializeSupabase();
 * 
 * // Sync single document
 * await syncDocumentToCloud(document);
 * 
 * // Sync all documents
 * await syncAllToCloud(documents, (current, total) => {
 *   console.log(`Syncing ${current}/${total}`);
 * });
 * 
 * // Download from cloud
 * const doc = await downloadDocumentFromCloud(documentId);
 * 
 * // Get all cloud documents
 * const cloudDocs = await getAllCloudDocuments();
 * 
 * // Delete from cloud
 * await deleteDocumentFromCloud(documentId);
 */