"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Compare from "react-compare-image";

export default function Home() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processUploadedFile(file);
  };

  const processUploadedFile = (file) => {
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Handle watermark removal
  const handleRemoveWatermark = async () => {
    if (!originalFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", originalFile);
      const response = await fetch("/api/remove-watermark", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setProcessedImageUrl(imageUrl);
      } else {
        const errorText = await response.text();
        setError("Error removing watermark: " + errorText);
      }
    } catch (error) {
      setError("Error removing watermark. Please try again.");
      console.error("Error in handleRemoveWatermark:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      if (originalImageUrl && originalImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(originalImageUrl);
      }
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [originalImageUrl, processedImageUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col items-center justify-center p-4 md:p-8 text-gray-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 blur-3xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
            }}
            animate={{
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: Math.random() * 10 + 15,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 mb-12 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          className="inline-block"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight mb-3">
            Watermark Remover
          </h1>
        </motion.div>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Clean, professional images in seconds. Powered by advanced AI.
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="w-full max-w-5xl backdrop-blur-lg bg-slate-800/60 border border-slate-700/50 shadow-2xl rounded-2xl p-6 md:p-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* File Upload Area */}
        <div
          className={`relative mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 
            ${
              dragActive
                ? "border-indigo-400 bg-indigo-900/20"
                : "border-gray-600 bg-gray-800/20"
            } 
            ${
              originalImageUrl
                ? "border-opacity-0 bg-opacity-0"
                : "border-opacity-100"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <AnimatePresence mode="wait">
            {!originalImageUrl ? (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center"
              >
                <div className="mb-4">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-gray-200 mb-2">
                  Drop your image here
                </h3>
                <p className="text-gray-400 mb-4">
                  or click to browse files (JPEG, PNG)
                </p>
                <label className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-full cursor-pointer hover:from-indigo-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25">
                  Select Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Original Image */}
        <AnimatePresence>
          {originalImageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-100">
                  Original Image
                </h2>
                <button
                  onClick={() => {
                    setOriginalFile(null);
                    setOriginalImageUrl(null);
                    setProcessedImageUrl(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-700/50"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={originalImageUrl}
                  alt="Original Image"
                  width={800}
                  height={600}
                  className="object-contain w-full max-h-[500px]"
                />
              </motion.div>

              {/* Remove Watermark Button */}
              <motion.div
                className="mt-6 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <button
                  onClick={handleRemoveWatermark}
                  disabled={loading || !originalFile}
                  className="group relative bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/25 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-3 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          />
                        </svg>
                        Processing Image...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Remove Watermark
                      </>
                    )}
                  </span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 z-0"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg"
            >
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400 mr-2 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processed Image Comparison */}
        <AnimatePresence>
          {processedImageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="mt-12"
            >
              <div className="flex items-center mb-6">
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                <h2 className="text-2xl font-bold mx-4 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Before & After
                </h2>
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>

              <motion.div
                className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl"
                whileInView={{ scale: [0.95, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Compare
                  leftImage={originalImageUrl}
                  rightImage={processedImageUrl}
                  leftImageAlt="Original"
                  rightImageAlt="Processed"
                  sliderLineWidth={2}
                  sliderLineColor="#6366f1"
                  handle={
                    <div className="w-1 h-[40px] bg-indigo-500 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      </div>
                    </div>
                  }
                />
              </motion.div>

              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <a
                  href={processedImageUrl}
                  download="watermark-removed.jpg"
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download Image
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Features */}
      <motion.div
        className="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[
          {
            icon: "🔍",
            title: "Precise Detection",
            desc: "Advanced AI precisely identifies various watermark types",
          },
          {
            icon: "⚡",
            title: "Lightning Fast",
            desc: "Process images in seconds with our optimized algorithms",
          },
          {
            icon: "🔐",
            title: "Secure & Private",
            desc: "Your images are processed securely and never stored",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 p-6 rounded-xl"
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            // transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-16 text-center text-gray-400 text-sm pb-8"
      >
        <p className="mb-2">
          Powered by{" "}
          <Link
            href="https://ai.google.dev/gemini-api"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Google Gemini AI
          </Link>
        </p>
        <p>
          © {new Date().getFullYear()} Watermark Remover. Professional image
          editing made simple.
        </p>
      </motion.footer>
    </div>
  );
}
