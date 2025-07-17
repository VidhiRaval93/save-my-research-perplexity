console.log('=== PERPLEXITY CONTENT SCRIPT LOADED ===');
console.log("✅ Extension loaded and running on Perplexity.ai");

// Track processed content to avoid duplicates
const processedContent = new Set();

// Function to extract text from Perplexity.ai answer containers
function extractAnswerText() {
  console.log('🔍 [DEBUG] Searching for Perplexity.ai answer elements...');
  
  // Use combined selector for efficiency
  const selector = 'div.prose, div[id^="markdown-content-"]';
  const allElements = document.querySelectorAll(selector);
  
  console.log(`🔍 [DEBUG] Using selector: ${selector}`);
  console.log(`🔍 [DEBUG] Total elements found: ${allElements.length}`);
  
  // Debug: Log all found elements
  allElements.forEach((ans, index) => {
    console.log(`🕵️ Found element ${index + 1}:`, {
      element: ans,
      textContent: ans.textContent?.substring(0, 100) + '...',
      className: ans.className,
      id: ans.id
    });
  });
  
  const extractedTexts = [];
  
  allElements.forEach((element, index) => {
    const textContent = element.textContent.trim();
    
    if (textContent && textContent.length > 50) { // Only process substantial content
      console.log(`📝 [DEBUG] Element ${index + 1}:`, {
        element: element,
        textLength: textContent.length,
        textPreview: textContent.substring(0, 100) + '...',
        classes: element.className,
        id: element.id
      });
      
      extractedTexts.push(textContent);
    }
  });
  
  return extractedTexts;
}

// Function to process new content
async function processNewContent() {
  console.log('🔄 [DEBUG] Processing new content...');
  
  const extractedTexts = extractAnswerText();
  
  for (const text of extractedTexts) {
    // Create a hash of the content to check for duplicates
    const contentHash = text.substring(0, 200); // Use first 200 chars as hash
    
    if (!processedContent.has(contentHash)) {
      console.log('🆕 [DEBUG] New content detected, processing...');
      processedContent.add(contentHash);
      
      const result = await sendToSummarizerAPI(text);
      if (result) {
        console.log('✅ [DEBUG] Successfully processed new content');
      }
    } else {
      console.log('🔄 [DEBUG] Content already processed, skipping...');
    }
  }
}

// Function to send data to backend API
async function sendToSummarizerAPI(content) {
  console.log('🚀 [DEBUG] Preparing to send data to API...');
  console.log(`🚀 [DEBUG] Content length: ${content.length} characters`);
  console.log(`🚀 [DEBUG] Content preview: ${content.substring(0, 200)}...`);
  
  const payload = {
    source: "perplexity",
    content: content
  };
  
  console.log('🚀 [DEBUG] Payload prepared:', payload);
  console.log('🚀 [DEBUG] Sending POST request to http://localhost:8001/summarize');
  
  try {
    const response = await fetch('http://localhost:8001/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`🚀 [DEBUG] Response received - Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [DEBUG] API call successful!');
    console.log('✅ [DEBUG] Response data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ [DEBUG] API call failed:', error);
    console.error('❌ [DEBUG] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

// Initial extraction when page loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌐 [DEBUG] DOM loaded, performing initial extraction');
  await processNewContent();
});

// Listen for DOM changes using MutationObserver
const observer = new MutationObserver(async (mutations) => {
  console.log(`👀 [DEBUG] DOM mutation detected - ${mutations.length} mutations`);
  
  let shouldProcess = false;
  
  mutations.forEach((mutation, index) => {
    console.log(`👀 [DEBUG] Mutation ${index + 1}:`, {
      type: mutation.type,
      target: mutation.target,
      addedNodes: mutation.addedNodes.length,
      removedNodes: mutation.removedNodes.length
    });
    
    // Check added nodes
    mutation.addedNodes.forEach((node, nodeIndex) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        console.log(`👀 [DEBUG] Added node ${nodeIndex + 1}:`, {
          tagName: node.tagName,
          className: node.className,
          id: node.id
        });
        
        // Check if the added node is a target element
        if (node.classList && node.classList.contains('prose')) {
          console.log('👀 [DEBUG] Found div.prose element in added nodes!');
          shouldProcess = true;
        }
        
        if (node.id && node.id.startsWith('markdown-content-')) {
          console.log('👀 [DEBUG] Found markdown-content element in added nodes!');
          shouldProcess = true;
        }
        
        // Check if the added node contains target elements
        if (node.querySelector) {
          if (node.querySelector('div.prose')) {
            console.log('👀 [DEBUG] Found div.prose element via querySelector!');
            shouldProcess = true;
          }
          
          if (node.querySelector('div[id^="markdown-content-"]')) {
            console.log('👀 [DEBUG] Found markdown-content element via querySelector!');
            shouldProcess = true;
          }
        }
      }
    });
    
    // Check if the mutation target itself is a target element
    if (mutation.target.classList && mutation.target.classList.contains('prose')) {
      console.log('👀 [DEBUG] Mutation target has prose class!');
      shouldProcess = true;
    }
    
    if (mutation.target.id && mutation.target.id.startsWith('markdown-content-')) {
      console.log('👀 [DEBUG] Mutation target is markdown-content element!');
      shouldProcess = true;
    }
  });
  
  if (shouldProcess) {
    console.log('👀 [DEBUG] Should process - new Perplexity.ai content detected');
    // Add a small delay to ensure content is fully loaded
    setTimeout(async () => {
      await processNewContent();
    }, 1000);
  } else {
    console.log('👀 [DEBUG] No target elements in this mutation');
  }
});

// Start observing DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'id']
});

console.log('✅ [DEBUG] Content script setup complete - observing DOM changes');
console.log('✅ [DEBUG] MutationObserver configured to watch for Perplexity.ai elements');
console.log('✅ [DEBUG] Ready to extract content from Perplexity.ai');

// Test function to manually trigger extraction
window.testPerplexityExtraction = () => {
  console.log("🧪 [TEST] Manual extraction triggered");
  processNewContent();
};

console.log("🧪 [TEST] Test function available: window.testPerplexityExtraction()");
console.log("✅ content.js loaded and test function injected"); 