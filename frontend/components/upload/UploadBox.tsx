"use client";

import { useState, useRef, DragEvent } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle2 } from 'lucide-react';
import { uploadPolicy } from '@/lib/api';
import { toast } from '@/lib/toast';
import { uploadHistoryManager } from '@/lib/uploadHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      setTitle(
        selectedFile.name.split('.')[0].replace(/_/g, ' ')
      );
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      toast.error('Please select a file and provide a title.');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(10);

      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);

      const response = await uploadPolicy(file, title);
      clearInterval(interval);
      setUploadProgress(100);

      if (response.success) {
        toast.success(
          response.message || `Policy "${title}" uploaded successfully.`
        );
        uploadHistoryManager.addUpload({
          id: Date.now().toString(),
          title: title,
          filename: file.name,
          size: (file.size / 1024 / 1024).toFixed(2),
          timestamp: Date.now(),
          status: 'completed'
        });
        setTimeout(() => {
          setFile(null);
          setTitle('');
          setUploadProgress(0);
        }, 1500);
      } else {
        toast.error('Upload failed. Please try again.');
        setUploadProgress(0);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during upload.');
      setUploadProgress(0);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="w-full max-w-3xl flex-1 mx-auto flex flex-col justify-center h-full relative">
      <div className="relative flex flex-col h-full w-full justify-center">
        <AnimatePresence>
          {loading && uploadProgress > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${uploadProgress}%`, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 h-0.5 bg-blue-500 z-10"
            />
          )}
        </AnimatePresence>

        <div className="mb-6 relative z-10 flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Policy Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="e.g. National Telecom Draft 2026"
            className="w-full"
          />
        </div>

        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`
            relative z-10 rounded-xl border-2 border-dashed
            p-10 flex flex-col items-center justify-center text-center
            cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30'}
            ${loading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            disabled={loading}
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`p-4 rounded-xl mb-4 transition-colors duration-200 ${isDragActive
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : 'bg-white/5 border border-white/5'
                    }`}
                >
                  <UploadCloud
                    className={`h-8 w-8 ${isDragActive ? 'text-blue-400' : 'text-gray-400'
                      }`}
                  />
                </div>
                <h3 className="text-base font-medium text-white mb-1">
                  {isDragActive ? 'Drop to upload' : 'Drag & drop document'}
                </h3>
                <p className="text-xs text-gray-500">
                  PDF, DOCX, or text files up to 10MB
                </p>
              </motion.div>
            ) : uploadProgress === 100 ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 text-emerald-400"
              >
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="font-medium text-sm">Upload Complete</span>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-gray-300 font-medium px-4 py-2.5 bg-[#111827] rounded-lg border border-white/5"
              >
                <FileIcon className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center justify-end relative z-10 mt-4">
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || !title || loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                {uploadProgress < 100
                  ? `${uploadProgress}% Uploading...`
                  : 'Processing...'}
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload Policy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
