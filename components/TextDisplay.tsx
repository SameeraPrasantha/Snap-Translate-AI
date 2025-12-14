import React, { useState } from 'react';
import { Copy, Check, Download, Languages, FileText } from 'lucide-react';
import { Button } from './Button';

interface TextDisplayProps {
  title: string;
  text: string;
  placeholder?: string;
  isLoading?: boolean;
  type: 'original' | 'translated';
  language?: string;
}

export const TextDisplay: React.FC<TextDisplayProps> = ({ 
  title, 
  text, 
  placeholder, 
  isLoading, 
  type,
  language 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          {type === 'original' ? (
            <FileText className="w-4 h-4 text-indigo-600" />
          ) : (
            <Languages className="w-4 h-4 text-emerald-600" />
          )}
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
            {title} {language && <span className="text-slate-400 font-normal normal-case">({language})</span>}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            onClick={handleCopy} 
            disabled={!text || isLoading}
            className="!p-1.5 h-8 w-8 text-slate-500 hover:text-indigo-600"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleDownload} 
            disabled={!text || isLoading}
            className="!p-1.5 h-8 w-8 text-slate-500 hover:text-indigo-600"
            title="Download as .txt"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white min-h-[300px] md:min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
            <p className="text-sm text-slate-500 animate-pulse">
              {type === 'original' ? 'Extracting text...' : 'Translating text...'}
            </p>
          </div>
        ) : null}

        <textarea
          readOnly
          value={text}
          placeholder={placeholder || "Text will appear here..."}
          className="w-full h-full p-4 resize-none focus:outline-none text-slate-700 leading-relaxed custom-scrollbar bg-transparent"
        />
      </div>
    </div>
  );
};
