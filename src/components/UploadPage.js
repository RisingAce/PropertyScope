import React, { useState, useRef } from 'react';
import { Upload, Image, ChevronRight, Home, ArrowRight } from 'lucide-react';

const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const fileInputRef = useRef(null);

  // Handle drag events
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
      // Handle the file here (in a full implementation)
      alert(`File selected: ${e.dataTransfer.files[0].name}`);
    }
  };

  // Handle file input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Handle the file here (in a full implementation)
      alert(`File selected: ${e.target.files[0].name}`);
    }
  };

  // Placeholder functions for demonstration
  const showGallery = () => {
    alert("Gallery would open here");
  };

  const showTutorial = () => {
    alert("Tutorial would open here");
  };

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
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            Save Project
          </button>
        </div>
      </header>
      
      {/* Main upload area */}
      <main className="flex-1 overflow-hidden">
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
              />
              <button
                onClick={showGallery}
                className="px-6 py-3 bg-indigo-800 bg-opacity-40 hover:bg-opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Image className="w-5 h-5" />
                Browse Gallery
              </button>
            </div>
            
            <div className="mt-10 border-t border-indigo-800 pt-6">
              <p className="text-indigo-300 text-sm mb-4">New to Lux Virtual Stager?</p>
              <button
                onClick={showTutorial}
                className="text-indigo-300 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                Watch Quick Tutorial
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Example of recent projects section (hidden initially) */}
          {recentProjects.length > 0 && (
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-indigo-900 bg-opacity-80 backdrop-blur-md rounded-lg p-4 border border-indigo-800">
                <h3 className="text-indigo-300 text-sm font-medium mb-3">Recent Projects</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recentProjects.map(project => (
                    <div 
                      key={project.id} 
                      className="flex-shrink-0 group cursor-pointer"
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
      </main>
    </div>
  );
};

export default UploadPage;