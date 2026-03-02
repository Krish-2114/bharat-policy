"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useDropzone, type Accept } from "react-dropzone";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export interface FileUploadProps {
  onChange?: (files: File[]) => void;
  accept?: Accept | string[];
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  onChange,
  accept = { "application/pdf": [".pdf"], "text/plain": [".txt"] },
  multiple = false,
  maxFiles = 1,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const updated = multiple ? [...files, ...newFiles].slice(0, maxFiles) : newFiles.slice(0, 1);
    setFiles(updated);
    onChange?.(updated);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    maxFiles,
    noClick: true,
    accept: Array.isArray(accept) ? undefined : accept,
    onDrop: handleFileChange,
    onDropRejected: (errors) => {
      console.warn("Drop rejected:", errors);
    },
  });

  return (
    <div className={cn("w-full", className)} {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className={cn(
          "p-10 group/file block rounded-xl cursor-pointer w-full relative overflow-hidden",
          "bg-[#0c0414]/80 border-2 border-dashed border-white/10 hover:border-blue-500/40 transition-colors",
          isDragActive && "border-blue-500/50 bg-blue-500/10"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={Array.isArray(accept) ? accept.join(",") : Object.values(accept).flat().join(",")}
          multiple={multiple}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center relative z-10">
          <p className="font-sans font-semibold text-white text-base">
            Upload file
          </p>
          <p className="font-sans font-normal text-gray-400 text-base mt-2">
            Drag or drop your files here or click to upload
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file-" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 flex flex-col items-start justify-start md:min-h-[5rem] p-4 mt-4 w-full mx-auto rounded-xl",
                    "bg-white/5 border border-white/10 shadow-sm"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-sm text-gray-200 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-xs text-gray-400 bg-white/5 border border-white/10"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>
                  <div className="flex text-xs md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-gray-500 gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                      {file.type || "application/octet-stream"}
                    </span>
                    <span>
                      modified {new Date(file.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative group-hover/file:shadow-xl z-40 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-xl",
                  "bg-white/5 border border-white/10"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-blue-400 flex flex-col items-center gap-1"
                  >
                    Drop it
                    <UploadCloud className="h-6 w-6" />
                  </motion.p>
                ) : (
                  <UploadCloud className="h-8 w-8 text-gray-500 group-hover/file:text-blue-400 transition-colors" />
                )}
              </motion.div>
            )}
            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-blue-500/40 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-xl"
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-[#0c0414]/50 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={cn(
                "w-10 h-10 flex flex-shrink-0 rounded-[2px]",
                index % 2 === 0
                  ? "bg-white/[0.02]"
                  : "bg-white/[0.03]"
              )}
            />
          );
        })
      )}
    </div>
  );
}
