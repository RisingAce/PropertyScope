// src/services/apiClient.js
const apiClient = {
    // Get recent results (mock function for now)
    getRecentResults: async () => {
      // In a real implementation, this would call your backend
      return []; // Return empty array for now
    },
    
    // Get image URL for a result
    getResultImageUrl: (id) => {
      // For development, return a placeholder
      return `/api/placeholder/800/600`;
    },
    
    // Process an image
    stageImage: async (file, settings) => {
      // For development, simulate API call
      console.log("Processing image with settings:", settings);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Return mock response
      return {
        success: true,
        id: "mock-id-" + Date.now()
      };
    }
  };
  
  export default apiClient;