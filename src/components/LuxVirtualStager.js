import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Loader2, Download, Share2, RefreshCw, ChevronRight, Settings, Trash2, Copy, Heart, Save, Undo, Redo, Maximize, Image, Plus, Check, X, ArrowRight, Globe, AlertCircle, Home } from 'lucide-react';
import apiClient from '../services/apiClient'; // Import the API client we created earlier

// AI Virtual Stager Pro application
export default function LuxVirtualStager() {
  // State
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'configure', 'processing', 'results'
  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null); // Store the actual file for API upload
  const [resultImage, setResultImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [activePreset, setActivePreset] = useState('modern-luxury');
  const [customSettings, setCustomSettings] = useState({
    roomType: 'living-room',
    style: 'luxury',
    mood: 'bright',
    furnishingLevel: 'full',
    colorScheme: 'neutral',
    accessories: true,
    plants: true,
    artwork: true,
    lightingAdjustment: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side', 'split', 'before-after'
  const [splitPosition, setSplitPosition] = useState(50);
  const [dragActive, setDragActive] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);
  const [scaleValue, setScaleValue] = useState(100);
  const [error, setError] = useState(null);
  const [resultId, setResultId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareStatus, setShareStatus] = useState('idle'); // 'idle', 'copying', 'copied', 'error'
  
  // Refs
  const fileInputRef = useRef(null);
  const splitDivRef = useRef(null);
  const canvasRef = useRef(null);
  const shareLinkRef = useRef(null);
  
  // Presets
  const stylePresets = [
    {
      id: 'modern-luxury',
      name: 'Modern Luxury',
      description: 'High-end contemporary design with premium furnishings',
      settings: {
        roomType: 'living-room',
        style: 'luxury',
        mood: 'bright',
        furnishingLevel: 'full',
        colorScheme: 'neutral',
        accessories: true,
        plants: true,
        artwork: true,
        lightingAdjustment: true
      }
    },
    {
      id: 'scandinavian-minimal',
      name: 'Scandinavian Minimal',
      description: 'Clean lines with light woods and muted colors',
      settings: {
        roomType: 'living-room',
        style: 'scandinavian',
        mood: 'bright',
        furnishingLevel: 'medium',
        colorScheme: 'neutral',
        accessories: false,
        plants: true,
        artwork: true,
        lightingAdjustment: true
      }
    },
    {
      id: 'urban-industrial',
      name: 'Urban Industrial',
      description: 'Raw materials with vintage accents and metal finishes',
      settings: {
        roomType: 'living-room',
        style: 'industrial',
        mood: 'dramatic',
        furnishingLevel: 'medium',
        colorScheme: 'dark',
        accessories: true,
        plants: false,
        artwork: true,
        lightingAdjustment: true
      }
    },
    {
      id: 'coastal-retreat',
      name: 'Coastal Retreat',
      description: 'Relaxed beach-inspired style with natural textures',
      settings: {
        roomType: 'living-room',
        style: 'coastal',
        mood: 'airy',
        furnishingLevel: 'medium',
        colorScheme: 'blue',
        accessories: true,
        plants: true,
        artwork: true,
        lightingAdjustment: true
      }
    },
    {
      id: 'mid-century-modern',
      name: 'Mid-Century Modern',
      description: 'Iconic 50s and 60s inspired furniture with bold colors',
      settings: {
        roomType: 'living-room',
        style: 'mid-century',
        mood: 'warm',
        furnishingLevel: 'full',
        colorScheme: 'warm',
        accessories: true,
        plants: true,
        artwork: true,
        lightingAdjustment: true
      }
    }
  ];
  
  // Mock gallery images
  const galleryImages = [
    { id: 1, thumbnail: "/api/placeholder/400/300", result: "/api/placeholder/800/600", style: "Modern Luxury" },
    { id: 2, thumbnail: "/api/placeholder/400/300", result: "/api/placeholder/800/600", style: "Scandinavian Minimal" },
    { id: 3, thumbnail: "/api/placeholder/400/300", result: "/api/placeholder/800/600", style: "Urban Industrial" },
    { id: 4, thumbnail: "/api/placeholder/400/300", result: "/api/placeholder/800/600", style: "Coastal Retreat" },
    { id: 5, thumbnail: "/api/placeholder/400/300", result: "/api/placeholder/800/600", style: "Mid-Century Modern" },
    { id: 6, thumbnail: "/api/placeholder/400/300", result: "/api/placeholder/800/600", style: "Modern Luxury" }
  ];
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Lux Virtual Stager",
      description: "Transform empty properties into beautifully staged spaces with our AI-powered tool."
    },
    {
      title: "Upload Your Image",
      description: "Start by uploading a photo of an empty room you want to stage."
    },
    {
      title: "Choose Your Style",
      description: "Select from our curated design presets or customize your own style."
    },
    {
      title: "Processing Magic",
      description: "Our AI analyzes your space and generates a photorealistic staged image."
    },
    {
      title: "Compare and Export",
      description: "Compare before and after, then download or share your results."
    }
  ];
  
  // Load recent projects on mount
  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const results = await apiClient.getRecentResults();
        if (results && results.length > 0) {
          const formattedProjects = results.map(result => ({
            id: result.id,
            name: `${result.parameters.roomType.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')} - ${new Date(result.timestamp).toLocaleDateString()}`,
            date: new Date(result.timestamp).toLocaleDateString(),
            thumbnail: apiClient.getResultImageUrl(result.id),
            result: apiClient.getResultImageUrl(result.id),
            originalImage: result.originalImage
          }));
          setRecentProjects(formattedProjects.slice(0, 5));
        }
      } catch (error) {
        console.error("Error loading recent projects:", error);
      }
    };
    
    loadRecentProjects();
  }, []);
  
  // File upload handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleSelectedFile(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  
  const handleDragLeave = () => {
    setDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleSelectedFile(file);
    }
  };
  
  const handleSelectedFile = (file) => {
    // Validate file type
    if (!file.type.match('image.*')) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }
    
    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB limit. Please upload a smaller image.");
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setOriginalFile(file); // Save the file for API upload
      setCurrentStep('configure');
    };
    
    reader.onerror = () => {
      setError("Failed to read the selected file. Please try again.");
    };
    
    reader.readAsDataURL(file);
  };
  
  // Process image with real API integration
  const processImage = async () => {
    if (!originalFile) {
      setError("No image to process. Please upload an image first.");
      return;
    }
    
    setCurrentStep('processing');
    setIsProcessing(true);
    setProgressStage(0);
    setProgressPercent(0);
    setError(null);
    
    // Progress simulation
    const simulateProgress = () => {
      const stages = [
        "Analyzing room dimensions",
        "Identifying architectural features",
        "Determining optimal furniture layout",
        "Generating furnishings based on style",
        "Applying lighting and shadows",
        "Refining details and textures",
        "Finalizing image"
      ];
      
      let currentStage = 0;
      let percent = 0;
      
      const interval = setInterval(() => {
        percent += Math.random() * 3 + 1;
        
        if (percent >= 100) {
          clearInterval(interval);
          percent = 100;
          currentStage = stages.length - 1;
        }
        
        if (percent >= (currentStage + 1) * (100 / stages.length) && currentStage < stages.length - 1) {
          currentStage = Math.min(currentStage + 1, stages.length - 1);
        }
        
        setProgressStage(currentStage);
        setProgressPercent(percent);
      }, 120);
      
      return interval;
    };
    
    const progressInterval = simulateProgress();
    
    try {
      // Prepare the API request
      const response = await apiClient.stageImage(originalFile, customSettings);
      
      // Clear the progress simulation
      clearInterval(progressInterval);
      setProgressPercent(100);
      
      // Handle the API response
      if (response && response.success) {
        setResultId(response.id);
        setResultImage(apiClient.getResultImageUrl(response.id));
        
        // Add to history
        const newHistoryItem = {
          id: response.id,
          original: originalImage,
          result: apiClient.getResultImageUrl(response.id),
          settings: { ...customSettings },
          preset: activePreset
        };
        
        setHistory([newHistoryItem, ...history]);
        
        // Add to recent projects
        const newProject = {
          id: response.id,
          name: `${customSettings.roomType.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')} - ${new Date().toLocaleDateString()}`,
          date: new Date().toLocaleDateString(),
          thumbnail: apiClient.getResultImageUrl(response.id),
          result: apiClient.getResultImageUrl(response.id)
        };
        
        setRecentProjects([newProject, ...recentProjects.slice(0, 4)]);
        
        // Generate share link
        const shareableLink = `${window.location.origin}/share/${response.id}`;
        setShareLink(shareableLink);
        
        // Move to results screen
        setIsProcessing(false);
        setCurrentStep('results');
      } else {
        throw new Error("Processing failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      clearInterval(progressInterval);
      setError(error.message || "Failed to process image. Please try again.");
      setIsProcessing(false);
      setCurrentStep('configure');
    }
  };
  
  // Handle split view slider
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (splitDivRef.current && splitDivRef.current.dataset.dragging === 'true') {
        const container = splitDivRef.current.parentElement;
        const rect = container.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        setSplitPosition(x);
      }
    };
    
    const handleMouseUp = () => {
      if (splitDivRef.current) {
        splitDivRef.current.dataset.dragging = 'false';
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Touch events for mobile split view
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (splitDivRef.current && splitDivRef.current.dataset.dragging === 'true' && e.touches && e.touches[0]) {
        const container = splitDivRef.current.parentElement;
        const rect = container.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
        setSplitPosition(x);
        e.preventDefault(); // Prevent scrolling while dragging
      }
    };
    
    const handleTouchEnd = () => {
      if (splitDivRef.current) {
        splitDivRef.current.dataset.dragging = 'false';
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  const handleMouseDown = () => {
    if (splitDivRef.current) {
      splitDivRef.current.dataset.dragging = 'true';
    }
  };

  const handleTouchStart = () => {
    if (splitDivRef.current) {
      splitDivRef.current.dataset.dragging = 'true';
    }
  };
  
  const handleScaleChange = (e) => {
    setScaleValue(e.target.value);
  };
  
  const applyPreset = (presetId) => {
    const preset = stylePresets.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      setCustomSettings(preset.settings);
    }
  };
  
  const resetToUpload = () => {
    setCurrentStep('upload');
    setOriginalImage(null);
    setOriginalFile(null);
    setResultImage(null);
    setResultId(null);
    setError(null);
    setShareLink('');
  };
  
  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `staged-room-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareResult = () => {
    setShareModalOpen(true);
  };

  const copyShareLink = async () => {
    if (!shareLink) return;
    
    setShareStatus('copying');
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareStatus('copied');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setShareStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setShareStatus('error');
    }
  };

  const saveProject = async () => {
    try {
      // In a real implementation, this would save the project to user's account
      // For now, we'll just show a success message
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    }
  };

  // Memoized error message component for better performance
  const ErrorMessage = useCallback(({ message }) => {
    if (!message) return null;
    
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50 animate-fadeIn">
        <AlertCircle className="w-5 h-5 mr-2 text-red-300" />
        <span>{message}</span>
        <button 
          onClick={() => setError(null)}
          className="ml-4 text-red-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }, []);
  
  // Render components
  const renderUploadScreen = () => (
    <div 
      className={`h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 to-violet-900 text-white rounded-xl overflow-hidden 
      ${dragActive ? 'ring-4 ring-indigo-400' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-md text-center p-6">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-indigo-500 bg-opacity-20 rounded-full flex items-center justify-center">
            <Upload className="w-12 h-12 text-indigo-300" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3">Upload a Room Photo</h2>
        <p className="text-indigo-200 mb-8">
          Start by uploading a photo of an empty room to transform it with our AI-powered staging.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Select a Photo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            aria-label="Upload photo"
          />
          <button
            onClick={() => setShowGallery(true)}
            className="px-6 py-3 bg-indigo-800 bg-opacity-40 hover:bg-opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Image className="w-5 h-5" />
            Browse Gallery
          </button>
        </div>
        
        <div className="mt-10 border-t border-indigo-800 pt-6">
          <p className="text-indigo-300 text-sm mb-4">New to Lux Virtual Stager?</p>
          <button
            onClick={() => {
              setShowTutorial(true);
              setTutorialStep(0);
            }}
            className="text-indigo-300 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            Watch Quick Tutorial
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Floating recent projects */}
      {recentProjects.length > 0 && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-indigo-900 bg-opacity-80 backdrop-blur-md rounded-lg p-4 border border-indigo-800">
            <h3 className="text-indigo-300 text-sm font-medium mb-3">Recent Projects</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentProjects.map(project => (
                <div 
                  key={project.id} 
                  className="flex-shrink-0 group cursor-pointer"
                  onClick={() => {
                    setOriginalImage(project.thumbnail);
                    setResultImage(project.result);
                    setResultId(project.id);
                    setCurrentStep('results');
                  }}
                >
                  <div className="w-32 h-24 rounded-lg overflow-hidden relative">
                    <img 
                      src={project.thumbnail} 
                      alt={project.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-950 bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1 truncate">{project.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderConfigureScreen = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Preview */}
        <div className="flex-1 relative h-1/2 md:h-auto">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <img 
              src={originalImage} 
              alt="Original room" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm text-white rounded-md py-1 px-3 text-xs">
            Original
          </div>
        </div>
        
        {/* Settings */}
        <div className="w-full md:w-80 bg-gray-900 border-t md:border-t-0 md:border-l border-gray-800 overflow-auto">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-1">Style Configuration</h2>
            <p className="text-gray-400 text-sm">Customize how your staged room will look</p>
          </div>
          
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Choose a Style Preset</h3>
            <div className="space-y-2">
              {stylePresets.map(preset => (
                <button
                  key={preset.id}
                  className={`w-full flex items-start p-3 rounded-lg transition-all ${
                    activePreset === preset.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  }`}
                  onClick={() => applyPreset(preset.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{preset.name}</div>
                    <div className={`text-xs mt-1 ${
                      activePreset === preset.id ? 'text-indigo-200' : 'text-gray-400'
                    }`}>
                      {preset.description}
                    </div>
                  </div>
                  {activePreset === preset.id && (
                    <Check className="w-5 h-5 text-indigo-200 mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Custom Settings</h3>
              <button 
                className="text-xs text-indigo-400 hover:text-indigo-300"
                onClick={() => applyPreset(activePreset)}
              >
                Reset to Preset
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Room Type */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1" id="room-type-label">
                  Room Type
                </label>
                <select
                  value={customSettings.roomType}
                  onChange={(e) => setCustomSettings({...customSettings, roomType: e.target.value})}
                  className="block w-full bg-gray-800 border border-gray-700 rounded-md text-gray-200 text-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-labelledby="room-type-label"
                >
                  <option value="living-room">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="dining-room">Dining Room</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="office">Home Office</option>
                  <option value="bathroom">Bathroom</option>
                </select>
              </div>
              
              {/* Style */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1" id="style-label">
                  Design Style
                </label>
                <select
                  value={customSettings.style}
                  onChange={(e) => setCustomSettings({...customSettings, style: e.target.value})}
                  className="block w-full bg-gray-800 border border-gray-700 rounded-md text-gray-200 text-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-labelledby="style-label"
                >
                  <option value="modern">Modern</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="industrial">Industrial</option>
                  <option value="mid-century">Mid-Century</option>
                  <option value="traditional">Traditional</option>
                  <option value="scandinavian">Scandinavian</option>
                  <option value="luxury">Luxury</option>
                  <option value="coastal">Coastal</option>
                  <option value="bohemian">Bohemian</option>
                </select>
              </div>
              
              {/* Mood */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1" id="mood-label">
                  Mood
                </label>
                <select
                  value={customSettings.mood}
                  onChange={(e) => setCustomSettings({...customSettings, mood: e.target.value})}
                  className="block w-full bg-gray-800 border border-gray-700 rounded-md text-gray-200 text-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-labelledby="mood-label"
                >
                  <option value="bright">Bright & Airy</option>
                  <option value="warm">Warm & Cozy</option>
                  <option value="dramatic">Dramatic & Bold</option>
                  <option value="serene">Serene & Calm</option>
                  <option value="energetic">Energetic & Vibrant</option>
                </select>
              </div>
              
              {/* Furnishing Level */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1" id="furnishing-label">
                  Furnishing Level
                </label>
                <select
                  value={customSettings.furnishingLevel}
                  onChange={(e) => setCustomSettings({...customSettings, furnishingLevel: e.target.value})}
                  className="block w-full bg-gray-800 border border-gray-700 rounded-md text-gray-200 text-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-labelledby="furnishing-label"
                >
                  <option value="minimal">Minimal</option>
                  <option value="medium">Medium</option>
                  <option value="full">Full</option>
                </select>
              </div>
              
              {/* Toggle options */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-400" id="accessories-label">Include Accessories</label>
                  <div 
                    className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${
                      customSettings.accessories ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setCustomSettings({...customSettings, accessories: !customSettings.accessories})}
                    role="switch"
                    aria-checked={customSettings.accessories}
                    aria-labelledby="accessories-label"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCustomSettings({...customSettings, accessories: !customSettings.accessories});
                      }
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        customSettings.accessories ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-400" id="plants-label">Include Plants</label>
                  <div 
                    className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${
                      customSettings.plants ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setCustomSettings({...customSettings, plants: !customSettings.plants})}
                    role="switch"
                    aria-checked={customSettings.plants}
                    aria-labelledby="plants-label"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCustomSettings({...customSettings, plants: !customSettings.plants});
                      }
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        customSettings.plants ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-400" id="artwork-label">Include Artwork</label>
                  <div 
                    className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${
                      customSettings.artwork ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setCustomSettings({...customSettings, artwork: !customSettings.artwork})}
                    role="switch"
                    aria-checked={customSettings.artwork}
                    aria-labelledby="artwork-label"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCustomSettings({...customSettings, artwork: !customSettings.artwork});
                      }
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        customSettings.artwork ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 pt-6 border-t border-gray-800">
            <button
              onClick={processImage}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Generate Staged Room
            </button>
            
            <button
              onClick={resetToUpload}
              className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg py-2 text-sm transition-colors"
            >
              Cancel & Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderProcessingScreen = () => (
    <div className="h-full flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="h-20 w-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Generating Your Staged Room</h2>
        <p className="text-gray-400 mb-8">
          Our AI is working its magic to transform your empty space into a beautifully designed room.
        </p>
        
        <div className="bg-gray-800 rounded-lg p-5 text-left">
          <div className="flex items-center justify-between mb-1">
            <p className="text-indigo-300 font-medium text-sm">
              {progressStage === 0 && "Analyzing room dimensions"}
              {progressStage === 1 && "Identifying architectural features"}
              {progressStage === 2 && "Determining optimal furniture layout"}
              {progressStage === 3 && "Generating furnishings based on style"}
              {progressStage === 4 && "Applying lighting and shadows"}
              {progressStage === 5 && "Refining details and textures"}
              {progressStage === 6 && "Finalizing image"}
            </p>
            <span className="text-xs text-gray-400">{Math.round(progressPercent)}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 bg-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            This typically takes 15-30 seconds depending on image complexity
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderResultsScreen = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Main content area */}
        <div className="flex-1 bg-gray-900 relative overflow-hidden">
          {viewMode === 'side-by-side' && (
            <div className="h-full flex flex-col md:flex-row">
              <div className="flex-1 p-4 flex items-center justify-center">
                <div className="relative group">
                  <img 
                    src={originalImage} 
                    alt="Original room" 
                    className="max-h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded-md">
                    Before
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setZoomedImageUrl(originalImage)}
                      className="bg-black bg-opacity-60 text-white p-2 rounded-full"
                      aria-label="Zoom original image"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center">
                <div className="relative group">
                  <img 
                    src={resultImage} 
                    alt="Staged room" 
                    className="max-h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-indigo-600 bg-opacity-90 text-white text-xs py-1 px-2 rounded-md">
                    After
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setZoomedImageUrl(resultImage)}
                      className="bg-black bg-opacity-60 text-white p-2 rounded-full"
                      aria-label="Zoom staged image"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {viewMode === 'before-after' && (
            <div className="h-full flex items-center justify-center">
              <div className="relative group">
                <img 
                  src={resultImage} 
                  alt="Staged room" 
                  className="max-h-full object-contain"
                />
                <div className="absolute top-2 left-2 bg-indigo-600 bg-opacity-90 text-white text-xs py-1 px-2 rounded-md">
                  After
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setZoomedImageUrl(resultImage)}
                    className="bg-black bg-opacity-60 text-white p-2 rounded-full"
                    aria-label="Zoom staged image"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {viewMode === 'split' && (
            <div className="h-full flex items-center justify-center relative overflow-hidden">
              <div className="relative max-h-full">
                <img 
                  src={resultImage} 
                  alt="Staged room" 
                  className="max-h-full object-contain"
                />
                <div 
                  className="absolute top-0 left-0 h-full overflow-hidden"
                  style={{ width: `${splitPosition}%` }}
                >
                  <img 
                    src={originalImage} 
                    alt="Original room" 
                    className="max-h-full object-contain"
                    style={{ width: '100%' }}
                  />
                </div>
                
                {/* Slider handle */}
                <div 
                  ref={splitDivRef}
                  className="absolute top-0 h-full w-1 bg-white cursor-ew-resize"
                  style={{ left: `${splitPosition}%` }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  data-dragging="false"
                  role="slider"
                  aria-label="Comparison slider"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={splitPosition}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      setSplitPosition(Math.max(0, splitPosition - 5));
                    } else if (e.key === 'ArrowRight') {
                      setSplitPosition(Math.min(100, splitPosition + 5));
                    }
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <div className="w-4 h-1 bg-indigo-600 rounded-full"></div>
                  </div>
                </div>
                
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded-md">
                  Before
                </div>
                <div className="absolute top-2 right-2 bg-indigo-600 bg-opacity-90 text-white text-xs py-1 px-2 rounded-md">
                  After
                </div>
              </div>
            </div>
          )}
          
          {/* View mode selector */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-full p-1 flex">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                viewMode === 'side-by-side' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
              aria-pressed={viewMode === 'side-by-side'}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                viewMode === 'split' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
              aria-pressed={viewMode === 'split'}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('before-after')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                viewMode === 'before-after' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
              aria-pressed={viewMode === 'before-after'}
            >
              After Only
            </button>
          </div>
        </div>
        
        {/* Side panel */}
        {sidebarOpen && (
          <div className="w-full md:w-80 bg-gray-900 border-t md:border-t-0 md:border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Your Staged Room</h2>
            </div>
            
            <div className="p-4 flex-1 overflow-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Room Type</h3>
                  <div className="bg-gray-800 px-3 py-2 rounded-md text-gray-200 text-sm">
                    {customSettings.roomType.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Style</h3>
                  <div className="bg-gray-800 px-3 py-2 rounded-md text-gray-200 text-sm">
                    {stylePresets.find(p => p.id === activePreset)?.name || 'Custom Style'}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Design Elements</h3>
                  <div className="flex flex-wrap gap-2">
                    {customSettings.accessories && (
                      <span className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-md">
                        Accessories
                      </span>
                    )}
                    {customSettings.plants && (
                      <span className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-md">
                        Plants
                      </span>
                    )}
                    {customSettings.artwork && (
                      <span className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-md">
                        Artwork
                      </span>
                    )}
                    <span className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-md">
                      {customSettings.mood === 'bright' ? 'Bright & Airy' : 
                       customSettings.mood === 'warm' ? 'Warm & Cozy' :
                       customSettings.mood === 'dramatic' ? 'Dramatic & Bold' :
                       customSettings.mood === 'serene' ? 'Serene & Calm' : 'Energetic & Vibrant'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Download Options</h3>
                  <div className="space-y-3">
                    <button
                      onClick={downloadImage}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </button>
                    <button
                      onClick={handleShareResult}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md py-2 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Result
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setCurrentStep('configure');
                      }}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md py-2 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Adjust Settings & Regenerate
                    </button>
                    <button
                      onClick={resetToUpload}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md py-2 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload New Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Gallery modal
  const galleryModal = (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center transition-opacity duration-300 ${showGallery ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
    >
      <div className="w-full max-w-5xl bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 id="gallery-title" className="text-xl font-semibold text-white">Example Gallery</h2>
          <button 
            onClick={() => setShowGallery(false)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map(image => (
              <div 
                key={image.id} 
                className="relative group cursor-pointer rounded-lg overflow-hidden"
                onClick={() => {
                  setOriginalImage(image.thumbnail);
                  setResultImage(image.result);
                  setShowGallery(false);
                  setCurrentStep('results');
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${image.style} example`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setOriginalImage(image.thumbnail);
                    setResultImage(image.result);
                    setShowGallery(false);
                    setCurrentStep('results');
                  }
                }}
              >
                <img 
                  src={image.result} 
                  alt={`Gallery image ${image.id}`} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    Use This Example
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <div className="text-white text-sm font-medium">{image.style}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            Select any example to see the transformation
          </div>
          <button 
            onClick={() => setShowGallery(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
  
  // Tutorial modal
  const tutorialModal = (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center transition-opacity duration-300 ${showTutorial ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-indigo-600 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 id="tutorial-title" className="text-2xl font-bold text-white">{tutorialSteps[tutorialStep].title}</h2>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
              {tutorialSteps[tutorialStep].description}
            </p>
          </div>
          
          <div className="h-64 bg-gray-800 rounded-lg mb-6 flex items-center justify-center">
            {/* Placeholder for tutorial images/animations */}
            <img 
              src="/api/placeholder/600/300" 
              alt={`Tutorial step ${tutorialStep + 1}`}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1" role="navigation" aria-label="Tutorial steps">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === tutorialStep ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                  aria-current={index === tutorialStep ? "step" : "false"}
                />
              ))}
            </div>
            
            <div className="flex space-x-3">
              {tutorialStep > 0 && (
                <button
                  onClick={() => setTutorialStep(tutorialStep - 1)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Previous
                </button>
              )}
              
              {tutorialStep < tutorialSteps.length - 1 ? (
                <button
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowTutorial(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Image zoom modal
  const zoomModal = (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center transition-opacity duration-300 ${zoomedImageUrl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => setZoomedImageUrl(null)}
      role="dialog"
      aria-modal="true"
      aria-label="Image zoom view"
    >
      <div className="relative w-full h-full p-8 flex items-center justify-center">
        <button 
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
          onClick={() => setZoomedImageUrl(null)}
          aria-label="Close zoom view"
        >
          <X className="w-6 h-6" />
        </button>
        
        {zoomedImageUrl && (
          <div className="relative">
            <img 
              src={zoomedImageUrl} 
              alt="Zoomed image" 
              className="max-w-full max-h-[85vh] object-contain transform transition-transform duration-300"
              style={{ transform: `scale(${scaleValue / 100})` }}
            />
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-black bg-opacity-70 rounded-full p-1 flex items-center">
              <input
                type="range"
                min="50"
                max="300"
                value={scaleValue}
                onChange={handleScaleChange}
                className="w-48"
                aria-label="Zoom level"
              />
              <span className="text-white text-xs px-2">{scaleValue}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Share modal
  const shareModal = (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center transition-opacity duration-300 ${shareModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 id="share-title" className="text-xl font-semibold text-white">Share Your Result</h2>
          <button 
            onClick={() => setShareModalOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            Share your virtual staging result with others using this link:
          </p>
          
          <div className="flex">
            <input
              ref={shareLinkRef}
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 bg-gray-800 border border-gray-700 rounded-l-md text-gray-200 text-sm py-2 px-3 focus:outline-none"
              aria-label="Share link"
            />
            <button
              onClick={copyShareLink}
              className={`px-4 py-2 rounded-r-md flex items-center ${
                shareStatus === 'copied' 
                  ? 'bg-green-600 text-white' 
                  : shareStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              disabled={shareStatus === 'copying'}
            >
              {shareStatus === 'idle' && (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
              {shareStatus === 'copying' && (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Copying...
                </>
              )}
              {shareStatus === 'copied' && (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              )}
              {shareStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Error
                </>
              )}
            </button>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShareModalOpen(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 backdrop-blur-lg px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
            Lux Virtual Stager
          </h1>
          <div className="ml-3 px-2 py-0.5 bg-indigo-900 text-indigo-300 text-xs font-medium rounded">PRO</div>
        </div>
        
        <div className="flex items-center space-x-3">
          {currentStep === 'results' && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={saveProject}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Save Project
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {currentStep === 'upload' && renderUploadScreen()}
        {currentStep === 'configure' && renderConfigureScreen()}
        {currentStep === 'processing' && renderProcessingScreen()}
        {currentStep === 'results' && renderResultsScreen()}
      </main>
      
      {/* Modals */}
      {galleryModal}
      {tutorialModal}
      {zoomModal}
      {shareModal}
      
      {/* Error notifications */}
      <ErrorMessage message={error} />
      
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-indigo-900 focus:text-white focus:z-50">
        Skip to content
      </a>
    </div>
  );
}