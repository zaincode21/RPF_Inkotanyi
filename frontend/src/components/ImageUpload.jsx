import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

import { toast } from "sonner";

export function ImageUpload({ value, onChange, className = '', placeholder = "Upload Image", token }) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(value);
    const fileInputRef = useRef(null);
    // const { token } = useAuth(); // Removed local hook usage

    React.useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setIsUploading(true);

        try {
            if (!token) throw new Error("Authentication required");

            const response = await api.uploadFile(token, file);

            // Backend returns full URL or relative path? 
            // Based on uploadRoutes, it just saves file. Controller likely returns filename.
            // We'll assume the controller returns { url: "..." } or similar.
            // Let's check UploadController later or adjust. 
            // For now, assuming standard response structure: { success: true, data: { url: "..." } }

            console.log("Upload response:", response);

            if (response.success === false) {
                throw new Error(response.message || "Upload failed on server");
            }

            if (response.success && response.data?.url) {
                const fullUrl = `http://localhost:5000${response.data.url}`;
                onChange(fullUrl);
            } else if (response.filename) {
                // Fallback if it returns just filename
                onChange(`http://localhost:5000/uploads/${response.filename}`);
            } else {
                // Fallback for raw file path return
                onChange(response.url || response.data);
            }
        } catch (error) {
            console.error("Upload failed", error);
            toast.error(`Failed to upload image: ${error.message}`);
            setPreview(value); // Revert to original
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {preview ? (
                <div className="relative group w-full h-full min-h-[200px] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Change Image"
                        >
                            <Upload className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                            title="Remove Image"
                        >
                            <X className="w-5 h-5 text-red-600" />
                        </button>
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col text-white">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span className="text-sm font-medium">Uploading...</span>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 hover:border-red-300 transition-all group p-4"
                >
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">
                        {placeholder}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                        Click to select file
                    </span>
                </button>
            )}
        </div>
    );
}
