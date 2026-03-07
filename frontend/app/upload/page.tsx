"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected?: File) => {
    setError(null);
    if (!selected) return;
    
    if (!selected.type.startsWith('image/')) {
      setError('Please upload a valid image file formats (JPEG/PNG/JPG).');
      return;
    }
    
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    validateAndSetFile(dropped);
  };

  const clearSelection = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview); // cleanup
      setPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Assuming FastAPI runs on 8000
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Convert file to base64 for report generation later
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        sessionStorage.setItem('dr_original_image', reader.result as string);
        sessionStorage.setItem('dr_prediction_result', JSON.stringify(data));
        router.push('/result');
      };
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the prediction server. Is FastAPI running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 w-full animate-fade-in-up">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Upload Retinal Scan</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Drag and drop a clear, high-resolution fundus image of the retina. Our hybrid model will classify the severity of Diabetic Retinopathy.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div 
              key="dropzone"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-2 flex justify-center rounded-2xl border border-dashed border-medical-300 px-6 py-16 transition-colors hover:border-medical-500 bg-medical-50 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <div className="mx-auto h-16 w-16 text-medical-500 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Upload className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="mt-6 flex text-sm leading-6 text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-medical-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-medical-600 focus-within:ring-offset-2 hover:text-medical-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl border border-gray-100"
            >
              <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Upload preview" className="object-cover w-full h-full" />
                <button 
                  onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                  className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-4 flex items-center text-sm font-medium text-gray-700">
                <FileImage className="w-5 h-5 mr-2 text-medical-500" />
                {file?.name} ({(file!.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex justify-end">
          <button
            onClick={clearSelection}
            disabled={!file || loading}
            className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 disabled:opacity-50 mr-4 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex flex-row items-center px-8 py-2.5 rounded-xl bg-medical-600 text-white font-medium hover:bg-medical-700 shadow-md hover:shadow-lg disabled:opacity-70 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Analyzing (Quantum Simulator)...
              </>
            ) : 'Analyze Retinal Image'}
          </button>
        </div>

      </div>
    </div>
  );
}
