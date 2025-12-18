import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import formatSize from 

interface FileUploaderProps{
    onFileSelect ? : (file : File | null) => void;
    
}

function FileUploader({onFileSelect} : FileUploaderProps) {
  const [file, setFile] = useState("");
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    onFileSelect?.(file);
  }, [onFileSelect]);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ onDrop,
        multiple : false,
        accept : {"application/pdf" : ['.pdf']},
        maxSize : 20 * 1024 * 1024
   });

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">

          {file ? (
            <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}> 
                <img src="/images/pdf.png" alt="pdf" className="size-10" />
                <div className="flex item-center space-x-3">
                <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                        {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                        {formatSize(file.size)}
                    </p>
                </div>
                <button className="p-2 cursor-pointer" onClick={(e) => {
                    onFileSelect?.(null)
                }}>
                    <img src="/icons/cross.svg" alt="remove" className="w-4 h-4"
                </button>
                </div>
            </div>
          ) : (
            <div>
                    <div className="max-auto w-16 h-16 flex items-center justify-center">
                        <img src="/icons/info.svg"></img>
                    </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click To Upload</span>Or Drag &
                Drop
              </p>
              <p className="text-lg text-gray-500">PDF (Max {formatSize(maxFileSize)})</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUploader;
