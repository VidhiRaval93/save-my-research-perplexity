console.log('Background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  console.log('From tab:', sender.tab?.id);
  
  if (message.action === 'extractedText') {
    handleExtractedText(message.data, sender.tab);
  }
  
  // Always send a response to acknowledge receipt
  sendResponse({ received: true });
});

// Handle extracted text data
function handleExtractedText(data, tab) {
  console.log('Processing extracted text data:', data);
  console.log('Number of answer containers found:', data.length);
  
  // Log each extracted text
  data.forEach((item, index) => {
    console.log(`Answer Container ${index + 1}:`, {
      index: item.index,
      text: item.text.substring(0, 100) + (item.text.length > 100 ? '...' : ''),
      timestamp: item.timestamp,
      fullLength: item.text.length
    });
  });
  
  // Store data in chrome.storage for persistence
  chrome.storage.local.get(['extractedData'], (result) => {
    const existingData = result.extractedData || [];
    const newData = {
      tabId: tab?.id,
      url: tab?.url,
      timestamp: new Date().toISOString(),
      data: data
    };
    
    const updatedData = [...existingData, newData];
    
    // Keep only the last 50 entries to prevent storage bloat
    if (updatedData.length > 50) {
      updatedData.splice(0, updatedData.length - 50);
    }
    
    chrome.storage.local.set({ extractedData: updatedData }, () => {
      console.log('Data stored successfully. Total entries:', updatedData.length);
    });
  });
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation - initializing storage');
    chrome.storage.local.set({ extractedData: [] }, () => {
      console.log('Storage initialized');
    });
  }
});

// Handle extension action click (optional)
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension action clicked on tab:', tab.id);
  
  // You can add functionality here, such as:
  // - Opening a popup with extracted data
  // - Triggering a manual extraction
  // - Showing statistics
});

console.log('Background script setup complete'); 