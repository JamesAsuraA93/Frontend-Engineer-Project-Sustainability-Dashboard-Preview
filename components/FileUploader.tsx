import React, { useState } from "react";

interface FileUploaderProps {
  onFileSelected: (filePath: string) => void;
}

export default function FileUploader({ onFileSelected }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }

    setError(null);

    // Create a new FileReader instance
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        try {
          // Create a blob URL from the file content
          const blob = new Blob([event.target.result as string], { type: 'text/csv' });
          const filePath = URL.createObjectURL(blob);
          onFileSelected(filePath);
        } catch (err) {
          setError("Error processing file");
          console.error("Error processing file:", err);
        }
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    // Read the file as text
    reader.readAsText(file);
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col items-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Choose CSV File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}