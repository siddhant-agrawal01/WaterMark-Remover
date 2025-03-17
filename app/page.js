'use client'

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Compare from "react-compare-image";

export default function Home() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImageUrl(reader.result);
        console.log("Original image URL set");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle watermark removal
  const handleRemoveWatermark = async () => {
    if (!originalFile) {
      console.log("No original file to process");
      return;
    }
    setLoading(true);
    setError(null);
    console.log("Sending request to remove watermark");
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
        console.log("Processed image URL set:", imageUrl);
      } else {
        const errorText = await response.text();
        setError("Error removing watermark: " + errorText);
        console.log("API error:", errorText);
      }
    } catch (error) {
      setError("Error removing watermark. Please try again.");
      console.error("Error in handleRemoveWatermark:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 tracking-tight"
      >
        Watermark Remover
      </motion.h1>

      {/* Main Content */}
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-6 md:p-8">
        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-6 cursor-pointer"
        />

        {/* Original Image */}
        {originalImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-3">
              Original Image
            </h2>
            <Image
              src={originalImageUrl}
              alt="Original Image"
              width={600}
              height={400}
              className="object-contain rounded-lg shadow-md w-full max-h-96"
            />
          </motion.div>
        )}

        {/* Remove Watermark Button */}
        <button
          onClick={handleRemoveWatermark}
          disabled={loading || !originalFile}
          className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
              Processing...
            </span>
          ) : (
            "Remove Watermark"
          )}
        </button>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mt-4 text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Processed Image Comparison */}
        {processedImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              Before & After
            </h2>
            <div className="w-full max-w-4xl mx-auto">
              <Compare
                leftImage={originalImageUrl}
                rightImage={processedImageUrl}
                leftImageAlt="Original"
                rightImageAlt="Processed"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-gray-600 text-sm"
      >
        Powered by{" "}
        <Link href="https://ai.google.dev/gemini-api" className="text-indigo-600 hover:underline">
          Google Gemini AI
        </Link>
      </motion.footer>
    </div>
  );
}