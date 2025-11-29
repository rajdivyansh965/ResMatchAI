import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Components';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface ResumeUploadProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export const ResumeUpload = ({ onAnalyze, isAnalyzing }: ResumeUploadProps) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [isParsing, setIsParsing] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // Use 'any' to avoid strict type issues with the CDN import without local types
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setIsParsing(true);
    setText(''); // Clear previous text

    try {
      if (file.type === 'application/pdf') {
        const extractedText = await extractTextFromPDF(file);
        setText(extractedText);
        setIsParsing(false);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setText(result);
          setIsParsing(false);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Failed to parse file. Please try again or copy-paste the content.');
      setFileName(null);
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setMode('upload')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'paste' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Paste Text
        </button>
      </div>

      {mode === 'upload' ? (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept=".txt,.md,.json,.pdf"
          />
          <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
            <div className="p-3 bg-white rounded-full shadow-sm">
              {isParsing ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {isParsing ? 'Parsing document...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, TXT, MD supported</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <textarea 
            className="w-full h-64 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm font-mono text-slate-700"
            placeholder="Paste your resume content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      )}

      {fileName && mode === 'upload' && !isParsing && (
        <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>Ready to analyze: <strong>{fileName}</strong></span>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={() => onAnalyze(text)} 
          isLoading={isAnalyzing || isParsing}
          disabled={!text || text.length < 50}
          className="w-full sm:w-auto"
        >
          Analyze Resume
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Privacy Note</p>
          <p className="mt-1">
            This is a client-side demo. Your resume text is processed locally and sent directly to the Google Gemini API.
          </p>
        </div>
      </div>
    </div>
  );
};
