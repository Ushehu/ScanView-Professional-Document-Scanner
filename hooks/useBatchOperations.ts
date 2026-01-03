import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Document } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Batch operations hook for multi-select and bulk actions
 */

const BATCH_STORAGE_KEY = '@scanview:batch_selection';

export function useBatchOperations() {
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Enter batch mode
  const enterBatchMode = useCallback(() => {
    console.log('=== ENTERING BATCH MODE ===');
    setBatchMode(true);
    setSelectedIds(new Set());
  }, []);

  // Exit batch mode
  const exitBatchMode = useCallback(() => {
    console.log('=== EXITING BATCH MODE ===');
    setBatchMode(false);
    setSelectedIds(new Set());
  }, []);

  // Toggle selection for a document
  const toggleSelection = useCallback((documentId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
        console.log('Deselected:', documentId);
      } else {
        newSet.add(documentId);
        console.log('Selected:', documentId);
      }
      return newSet;
    });
  }, []);

  // Select all documents
  const selectAll = useCallback((documents: Document[]) => {
    console.log('Selecting all documents:', documents.length);
    setSelectedIds(new Set(documents.map(d => d.id)));
  }, []);

  // Deselect all
  const deselectAll = useCallback(() => {
    console.log('Deselecting all documents');
    setSelectedIds(new Set());
  }, []);

  // Check if document is selected
  const isSelected = useCallback((documentId: string) => {
    return selectedIds.has(documentId);
  }, [selectedIds]);

  // Get selected count
  const getSelectedCount = useCallback(() => {
    return selectedIds.size;
  }, [selectedIds]);

  // Get selected document IDs
  const getSelectedIds = useCallback(() => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  // Save selection to storage (for persistence)
  const saveSelection = useCallback(async () => {
    try {
      const ids = Array.from(selectedIds);
      await AsyncStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(ids));
      console.log('Selection saved');
    } catch (error) {
      console.error('Error saving selection:', error);
    }
  }, [selectedIds]);

  // Load selection from storage
  const loadSelection = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(BATCH_STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        setSelectedIds(new Set(ids));
        console.log('Selection loaded:', ids.length);
      }
    } catch (error) {
      console.error('Error loading selection:', error);
    }
  }, []);

  // Batch delete confirmation
  const confirmBatchDelete = useCallback((
    count: number,
    onConfirm: () => void
  ) => {
    Alert.alert(
      'Delete Documents',
      `Are you sure you want to delete ${count} document${count !== 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: onConfirm,
        }
      ]
    );
  }, []);

  // Batch export confirmation
  const confirmBatchExport = useCallback((
    count: number,
    onConfirm: () => void
  ) => {
    Alert.alert(
      'Export Documents',
      `Export ${count} document${count !== 1 ? 's' : ''} as PDF?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: onConfirm,
        }
      ]
    );
  }, []);

  return {
    // State
    batchMode,
    selectedIds,
    selectedCount: getSelectedCount(),
    
    // Actions
    enterBatchMode,
    exitBatchMode,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedIds,
    
    // Persistence
    saveSelection,
    loadSelection,
    
    // Confirmations
    confirmBatchDelete,
    confirmBatchExport,
  };
}

/**
 * Usage Example:
 * 
 * const {
 *   batchMode,
 *   selectedCount,
 *   enterBatchMode,
 *   exitBatchMode,
 *   toggleSelection,
 *   isSelected,
 *   getSelectedIds,
 * } = useBatchOperations();
 * 
 * // Enter batch mode
 * <TouchableOpacity onPress={enterBatchMode}>
 *   <Text>Select Multiple</Text>
 * </TouchableOpacity>
 * 
 * // In document card
 * <TouchableOpacity 
 *   onPress={() => batchMode ? toggleSelection(doc.id) : openDocument(doc.id)}
 * >
 *   {batchMode && isSelected(doc.id) && <CheckIcon />}
 * </TouchableOpacity>
 * 
 * // Batch actions
 * if (batchMode) {
 *   <Button onPress={() => {
 *     const ids = getSelectedIds();
 *     // Perform batch operation
 *   }}>
 *     Delete {selectedCount} items
 *   </Button>
 * }
 */