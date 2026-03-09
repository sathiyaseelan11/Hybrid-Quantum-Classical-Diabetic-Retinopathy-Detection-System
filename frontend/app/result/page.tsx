"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface Prediction {
  class_id: number;
  label: string;
  confidence: number;
  color: string;
  description: string;
  probabilities: number[];
}

const CLASS_LABELS = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Prediction | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Read from session storage
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('dr_prediction_result');
      if (saved) {
        setResult(JSON.parse(saved));
      } else {
        router.push('/upload'); // Redirect if no result
      }
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-medical-200 border-t-medical-600"></div>
      </div>
    );
  }

  // Determine status styles based on the returned color/severity
  const isHealthy = result.class_id === 0;
  const isWarning = result.class_id === 1 || result.class_id === 2;
  const isDanger = result.class_id === 3 || result.class_id === 4;

  const bgGradient = isHealthy ? 'from-green-50 to-emerald-50' : isWarning ? 'from-yellow-50 to-amber-50' : 'from-red-50 to-rose-50';
  const textColor = isHealthy ? 'text-green-700' : isWarning ? 'text-amber-600' : 'text-red-700';
  const Icon = isHealthy ? CheckCircle2 : isWarning ? AlertTriangle : ShieldAlert;

  const chartData = result.probabilities.map((prob, idx) => ({
    name: CLASS_LABELS[idx],
    value: prob * 100
  }));



  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const base64Image = sessionStorage.getItem('dr_original_image');
      if (!base64Image) {
        alert("Original image not found. Please scan again.");
        return;
      }
      
      // Convert base64 to Blob
      const res = await fetch(base64Image);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'scan.png');
      
      const response = await fetch('http://localhost:8000/report', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to generate report from backend");
      
      // Trigger download
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Clinical_DR_Report_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      alert("Error downloading report. Make sure backend is running.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 w-full animate-fade-in-up">
      <div className="mb-6 flex gap-4">
        <button 
          onClick={() => router.push('/upload')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Upload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Result Overview */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`bg-gradient-to-b ${bgGradient} rounded-3xl p-8 border ${isHealthy ? 'border-green-100' : isWarning ? 'border-amber-100' : 'border-red-100'} shadow-sm`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white shadow-sm ${textColor}`}>
              <Icon className="w-8 h-8" />
            </div>
            
            <div className="text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Diagnosis</span>
              <h2 className={`text-3xl font-bold mt-1 mb-2 ${textColor}`}>
                {result.label}
              </h2>
              <div className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-600 shadow-sm border border-gray-100">
                Class {result.class_id}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-black/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Confidence Score</span>
                <span className={`font-bold ${textColor}`}>{result.confidence}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 mb-2 shadow-inner">
                <div 
                  className={`h-3 rounded-full ${isHealthy ? 'bg-green-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Action Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Export Results</h3>
            <button 
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Full PDF Report
            </button>
          </div>
        </div>

        {/* Right Column: Details & Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Notes */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              Clinical Notes
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100">
              {result.description}
            </p>
          </div>

          {/* Chart View */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Probability Distribution</h3>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        index === 0 ? '#10B981' : 
                        (index === 1 || index === 2) ? '#F59E0B' : 
                        '#EF4444'
                      } fillOpacity={index === result.class_id ? 1 : 0.4} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              Probabilities output from the simulated Hybrid Quantum Classifier layer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
