import React, { useState, useRef } from 'react';
import SimpleModal from './SimpleModal';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const DocumentUploadModal = ({ 
  isOpen, 
  onClose, 
  onDocumentProcessed,
  mode 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['doc', 'docx'].includes(fileExtension)) {
      toast.error('Please select a .doc or .docx file');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Processing document...');

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/blogs/upload-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process document');
      }



      toast.success('Document processed successfully!', {
        id: loadingToast,
      });

      // Pass the extracted data to parent component
      onDocumentProcessed(result.data);
      onClose();

    } catch (error) {
      console.error('Error processing document:', error);
      toast.error(error.message || 'Failed to process document', {
        id: loadingToast,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      mode={mode}
      width="max-w-lg"
    >
      <div className="py-6">
        <div className="text-center mb-6">
          <Icon
            icon="mdi:file-document-outline"
            className={`w-16 h-16 mx-auto mb-4 ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <h3 className={`text-lg font-semibold mb-2 ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Upload Word Document
          </h3>
          <p className={`text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Upload a .doc or .docx file to automatically create a blog post
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? mode === "dark"
                ? "border-blue-400 bg-blue-900/20"
                : "border-blue-500 bg-blue-50"
              : mode === "dark"
                ? "border-gray-600 hover:border-gray-500"
                : "border-gray-300 hover:border-gray-400"
          } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <Icon
                icon="mdi:loading"
                className="w-12 h-12 animate-spin text-blue-600 mb-4"
              />
              <p className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Processing document...
              </p>
              <p className={`text-xs mt-1 ${
                mode === "dark" ? "text-gray-500" : "text-gray-500"
              }`}>
                Extracting content and title
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Icon
                icon="mdi:cloud-upload"
                className={`w-12 h-12 mb-4 ${
                  dragActive
                    ? "text-blue-600"
                    : mode === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              />
              <p className={`text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                {dragActive ? 'Drop your document here' : 'Click to upload or drag and drop'}
              </p>
              <p className={`text-xs ${
                mode === "dark" ? "text-gray-500" : "text-gray-500"
              }`}>
                Supports .doc and .docx files (max 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className={`mt-6 p-4 rounded-lg ${
          mode === "dark" 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-gray-50 border border-gray-200"
        }`}>
          <h4 className={`text-sm font-medium mb-3 ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}>
            What happens when you upload:
          </h4>
          <ul className={`space-y-2 text-xs ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-500 flex-shrink-0" />
              Title extracted from filename and document content
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-500 flex-shrink-0" />
              Content converted to HTML format
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-500 flex-shrink-0" />
              Default author set to editor user
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-500 flex-shrink-0" />
              SEO-friendly slug generated automatically
            </li>
          </ul>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Cancel
          </button>
        </div>
      </div>
    </SimpleModal>
  );
};

export default DocumentUploadModal;