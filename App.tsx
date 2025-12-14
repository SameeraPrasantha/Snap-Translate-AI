import React, { useState, useCallback } from 'react';
import { Sparkles, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { TextDisplay } from './components/TextDisplay';
import { Button } from './components/Button';
import { extractTextFromImage, translateText } from './services/geminiService';
import { AppStatus, AlertMessage } from './types';
import { SUPPORTED_LANGUAGES } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('es');
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleImageSelected = useCallback((base64: string) => {
    setImage(base64);
    setExtractedText('');
    setTranslatedText('');
    setStatus(AppStatus.IDLE);
    setAlert(null);
  }, []);

  const handleClearImage = useCallback(() => {
    setImage(null);
    setExtractedText('');
    setTranslatedText('');
    setStatus(AppStatus.IDLE);
    setAlert(null);
  }, []);

  const handleExtractText = async () => {
    if (!image) return;

    setStatus(AppStatus.EXTRACTING);
    try {
      const text = await extractTextFromImage(image);
      setExtractedText(text);
      if (text === 'NO_TEXT_FOUND') {
        showAlert('info', 'No text could be found in the image.');
        setStatus(AppStatus.IDLE); // Revert to idle so they can try again or change image
      } else {
        setStatus(AppStatus.EXTRACTED);
      }
    } catch (error) {
      showAlert('error', 'Failed to extract text. Please try another image.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleTranslateText = async () => {
    if (!extractedText) return;

    setStatus(AppStatus.TRANSLATING);
    try {
      // Find language name for better context in prompt (optional, but good practice)
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      const translated = await translateText(extractedText, langName);
      setTranslatedText(translated);
      setStatus(AppStatus.COMPLETED);
    } catch (error) {
      showAlert('error', 'Translation failed. Please try again.');
      setStatus(AppStatus.EXTRACTED); // Go back to extracted state
    }
  };

  // One-click combined flow
  const handleExtractAndTranslate = async () => {
     if (!image) return;
     
     // Step 1: Extract
     setStatus(AppStatus.EXTRACTING);
     try {
       const text = await extractTextFromImage(image);
       setExtractedText(text);
       
       if (text === 'NO_TEXT_FOUND') {
          showAlert('info', 'No text found in image.');
          setStatus(AppStatus.IDLE);
          return;
       }

       // Step 2: Translate immediately
       setStatus(AppStatus.TRANSLATING);
       const langName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
       const translated = await translateText(text, langName);
       setTranslatedText(translated);
       setStatus(AppStatus.COMPLETED);

     } catch (error) {
       console.error(error);
       showAlert('error', 'Processing failed. Please check your connection and API Key.');
       // Try to salvage state
       if (extractedText) setStatus(AppStatus.EXTRACTED);
       else setStatus(AppStatus.ERROR);
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Alert Banner */}
      {alert && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in-down ${
          alert.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          alert.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          <AlertCircle className="w-4 h-4" />
          {alert.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Snap<span className="text-indigo-600">Translate</span> AI
            </h1>
          </div>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">
            Powered by Gemini
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Section: Upload & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left: Image Upload */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Upload Image</h2>
              <ImageUploader 
                onImageSelected={handleImageSelected} 
                selectedImage={image} 
                onClear={handleClearImage}
              />
            </div>

             {/* Controls Card - Mobile/Tablet placement often better below image */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">2. Settings & Action</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Target Language
                    </label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border bg-white p-2.5 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-3 mt-2">
                    {/* Intelligent Action Button Logic */}
                    {!extractedText ? (
                       <Button 
                         onClick={handleExtractAndTranslate} 
                         disabled={!image}
                         className="flex-1"
                         isLoading={status === AppStatus.EXTRACTING || status === AppStatus.TRANSLATING}
                         icon={<Sparkles className="w-4 h-4" />}
                       >
                         Extract & Translate
                       </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => { setExtractedText(''); setTranslatedText(''); setStatus(AppStatus.IDLE); }}
                          icon={<RefreshCw className="w-4 h-4" />}
                        >
                          Reset
                        </Button>
                        <Button 
                          onClick={handleTranslateText} 
                          className="flex-1"
                          isLoading={status === AppStatus.TRANSLATING}
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Translate Again
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Step-by-step option for advanced users */}
                  {!extractedText && image && status !== AppStatus.EXTRACTING && status !== AppStatus.TRANSLATING && (
                    <div className="text-center">
                       <button 
                         onClick={handleExtractText}
                         className="text-xs text-slate-400 hover:text-indigo-600 underline"
                       >
                         Only extract text first
                       </button>
                    </div>
                  )}

                </div>
            </div>
          </div>

          {/* Right: Results Display */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 h-full">
            {/* Original Text */}
            <div className="h-full min-h-[400px]">
              <TextDisplay
                title="Extracted Text"
                text={extractedText}
                type="original"
                isLoading={status === AppStatus.EXTRACTING}
                placeholder="Text extracted from your image will appear here."
              />
            </div>

            {/* Translated Text */}
            <div className="h-full min-h-[400px]">
              <TextDisplay
                title="Translation"
                text={translatedText}
                type="translated"
                language={SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name}
                isLoading={status === AppStatus.TRANSLATING}
                placeholder="Translation will appear here."
              />
            </div>
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} SnapTranslate AI. Built with Gemini 2.5 Flash.
        </div>
      </footer>
    </div>
  );
};

export default App;
