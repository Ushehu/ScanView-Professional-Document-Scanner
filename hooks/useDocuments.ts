import { useState, useEffect } from 'react';
import { Document, Page } from '../types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const getDocsDir = () => `${FileSystem.documentDirectory}scanview/`;
const getDocsFile = () => `${getDocsDir()}documents.json`;

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStorage();
    loadDocuments();
  }, []);

  const initStorage = async () => {
    try {
      console.log('Initializing storage at:', getDocsDir());
      const dirInfo = await FileSystem.getInfoAsync(getDocsDir());
      console.log('Directory exists:', dirInfo.exists);
      
      if (!dirInfo.exists) {
        console.log('Creating directory...');
        await FileSystem.makeDirectoryAsync(getDocsDir(), { intermediates: true });
        console.log('Directory created successfully');
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      console.log('📂 Loading documents from:', getDocsFile());
      const fileInfo = await FileSystem.getInfoAsync(getDocsFile());
      console.log('📁 Documents file exists:', fileInfo.exists);
      
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(getDocsFile());
        console.log('📝 File content length:', content.length, 'characters');
        
        const docs = JSON.parse(content);
        console.log('✅ Loaded documents:', docs.length);
        console.log('📄 Document IDs:', docs.map((d: Document) => d.id));
        
        setDocuments(docs);
      } else {
        console.log('ℹ️ No documents file found, starting fresh');
        setDocuments([]);
      }
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      setDocuments([]);
    } finally {
      setLoading(false);
      console.log('✅ Load documents complete');
    }
  };

  const saveDocuments = async (docs: Document[]) => {
    try {
      console.log('💾 saveDocuments called');
      console.log('📂 Target file:', getDocsFile());
      console.log('📊 Number of documents:', docs.length);
      
      const jsonString = JSON.stringify(docs, null, 2);
      console.log('📝 JSON size:', jsonString.length, 'characters');
      
      await FileSystem.writeAsStringAsync(getDocsFile(), jsonString);
      console.log('✅ Documents saved to file successfully');
      
      // Verify the file was written
      const fileInfo = await FileSystem.getInfoAsync(getDocsFile());
      console.log('📁 File exists after save:', fileInfo.exists);
      if (fileInfo.exists && 'size' in fileInfo) {
        console.log('📏 File size:', fileInfo.size, 'bytes');
      }
    } catch (error) {
      console.error('❌ Error saving documents:', error);
      throw error;
    }
  };

  const createDocument = async (name: string, pages: Page[], extractedText?: string) => {
    console.log('🔷 createDocument called');
    console.log('📝 Name:', name);
    console.log('📄 Pages:', pages.length);
    if (extractedText) {
      console.log('📝 Including extracted text:', extractedText.length, 'characters');
    }
    
    try {
      const newDoc: Document = {
        id: Date.now().toString(),
        name,
        pages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        thumbnail: pages[0]?.uri,
        extractedText: extractedText || undefined,
      };
      
      console.log('📦 New document object created:', newDoc.id);
      
      const updatedDocs = [newDoc, ...documents];
      console.log('💾 Saving to storage... Total docs:', updatedDocs.length);
      
      setDocuments(updatedDocs);
      await saveDocuments(updatedDocs);
      
      console.log('✅ Document saved successfully!');
      console.log('📊 Total documents now:', updatedDocs.length);
      
      return newDoc;
    } catch (error) {
      console.error('❌ Error in createDocument:', error);
      throw error;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    console.log('Updating document:', id, updates);
    
    const updatedDocs = documents.map(doc =>
      doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc
    );
    setDocuments(updatedDocs);
    await saveDocuments(updatedDocs);
    
    console.log('Document updated successfully');
  };

  const deleteDocument = async (id: string) => {
    console.log('Deleting document:', id);
    
    const updatedDocs = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocs);
    await saveDocuments(updatedDocs);
    
    console.log('Document deleted, remaining:', updatedDocs.length);
  };

  const exportToPDF = async (document: Document) => {
    try {
      console.log('Exporting document:', document.name);
      
      // For now, we'll just share the first image
      // In a real app, you'd use a PDF library to combine images
      if (document.pages.length > 0) {
        const canShare = await Sharing.isAvailableAsync();
        console.log('Sharing available:', canShare);
        
        if (canShare) {
          console.log('Sharing file:', document.pages[0].uri);
          await Sharing.shareAsync(document.pages[0].uri, {
            mimeType: 'image/jpeg',
            dialogTitle: `Share ${document.name}`,
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      return false;
    }
  };

  // Search documents by name or extracted text
  const searchDocuments = (query: string): Document[] => {
    if (!query.trim()) return documents;
    
    const lowerQuery = query.toLowerCase();
    return documents.filter((doc) => {
      const nameMatch = doc.name.toLowerCase().includes(lowerQuery);
      const textMatch = doc.extractedText?.toLowerCase().includes(lowerQuery);
      return nameMatch || textMatch;
    });
  };

  return {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    exportToPDF,
    searchDocuments,
    refreshDocuments: loadDocuments,
  };
}