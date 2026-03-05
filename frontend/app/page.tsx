"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UploadCloud, Activity, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-100 text-medical-800 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse"></span>
            Research Grade Platform
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            Diabetic Retinopathy <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-500 to-medical-800">
              Detection System
            </span>
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-600 lg:text-xl sm:px-16 xl:px-48">
            Advanced diagnostic assistance utilizing a Hybrid Quantum-Inspired Dense Layer combined with ResNet50 for high-precision retinal classification.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/upload" className="inline-flex justify-center items-center py-3 px-6 text-base font-medium text-center text-white rounded-xl bg-medical-600 hover:bg-medical-700 focus:ring-4 focus:ring-medical-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Start Assessment
              <UploadCloud className="w-5 h-5 ml-2" />
            </Link>
            <a href="#how-it-works" className="inline-flex justify-center items-center py-3 px-6 text-base font-medium text-center text-gray-900 rounded-xl border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 transition-all">
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features / How it works */}
      <section id="how-it-works" className="mt-32 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Powered by Hybrid Technology</h2>
        
        <div className="grid md:grid-cols-3 gap-8 px-4">
          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">ResNet50 Extraction</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We leverage an advanced ResNet50 convolutional neural network to extract deep anatomical features from your retinal fundus images, compressing them into an 8-dimensional bottleneck.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Quantum-Inspired Layer</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To improve decision boundaries for complex class imbalances, the system simulates a Variational Quantum Classifier with non-linear phase transformations.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">5-Class Softmax</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Provides robust predictions categorizing images from Class 0 (No DR) to Class 4 (Proliferative DR), delivering clinical confidence values alongside detailed PDF reports.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
