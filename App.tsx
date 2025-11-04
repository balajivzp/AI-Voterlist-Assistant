
import React, { useState, useCallback, useEffect } from 'react';
import type { ExtractedData, ChatMessage } from './types';
import { extractVoterInfo, answerVoterQuestion } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Header from './components/Header';
import Spinner from './components/Spinner';
import Welcome from './components/Welcome';
import ErrorDisplay from './components/ErrorDisplay';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(() => localStorage.getItem('fileDataUrl'));
  const [fileName, setFileName] = useState<string | null>(() => localStorage.getItem('fileName'));
  const [mimeType, setMimeType] = useState<string | null>(() => localStorage.getItem('mimeType'));
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(() => {
    const saved = localStorage.getItem('extractedData');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse extracted data from localStorage", e);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
     const saved = localStorage.getItem('chatHistory');
     try {
       return saved ? JSON.parse(saved) : [];
     } catch(e) {
        console.error("Failed to parse chat history from localStorage", e);
        return [];
     }
  });
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'data' | 'chat'>(() => (localStorage.getItem('activeTab') as 'data' | 'chat') || 'data');

  useEffect(() => {
    if (fileDataUrl) localStorage.setItem('fileDataUrl', fileDataUrl);
    else localStorage.removeItem('fileDataUrl');
  }, [fileDataUrl]);

  useEffect(() => {
    if (fileName) localStorage.setItem('fileName', fileName);
    else localStorage.removeItem('fileName');
  }, [fileName]);
  
  useEffect(() => {
    if (mimeType) localStorage.setItem('mimeType', mimeType);
    else localStorage.removeItem('mimeType');
  }, [mimeType]);

  useEffect(() => {
    if (extractedData) localStorage.setItem('extractedData', JSON.stringify(extractedData));
    else localStorage.removeItem('extractedData');
  }, [extractedData]);

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    else localStorage.removeItem('chatHistory');
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);


  const handleFileSelect = (file: File) => {
    handleClear(true); // Clear previous state but keep it quiet
    setSelectedFile(file);
    setFileName(file.name);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = (silent = false) => {
    if (!silent) {
        setSelectedFile(null);
        setFileDataUrl(null);
        setFileName(null);
        setMimeType(null);
    }
    setExtractedData(null);
    setError(null);
    setIsLoading(false);
    setChatHistory([]);
    setActiveTab('data');
  };
  
  const handleExtract = useCallback(async () => {
    if (!fileDataUrl) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setChatHistory([]);
    setActiveTab('data');

    try {
      const base64Data = (fileDataUrl as string).split(',')[1];
      const resultJson = await extractVoterInfo(base64Data, mimeType || 'image/jpeg');
      const parsedData: ExtractedData = JSON.parse(resultJson);
      setExtractedData(parsedData);
      setChatHistory([{ role: 'model', text: 'Data extracted successfully. You can now ask me questions about the voter list.' }]);
    } catch (err) {
      console.error("Extraction failed:", err);
      setError("Failed to extract data. The AI model could not process the document. Please ensure it's a clear voter list document and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fileDataUrl, mimeType]);

  const handleSendMessage = async (message: string) => {
    if (!extractedData) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: message }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const modelResponse = await answerVoterQuestion(message, extractedData);
      setChatHistory([...newHistory, { role: 'model', ...modelResponse }]);
    } catch (err) {
      console.error("Chat failed:", err);
      const errorMessage = "Sorry, I encountered an error while processing your request. Please try again.";
      setChatHistory([...newHistory, { role: 'model', text: errorMessage }]);
    } finally {
      setIsChatLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-full lg:w-[400px] lg:flex-shrink-0">
             <FileUpload 
                onFileSelect={handleFileSelect} 
                filePreviewUrl={fileDataUrl} 
                fileName={fileName}
                onClear={() => handleClear(false)} 
             />
             {(selectedFile || fileDataUrl) && (
                <button
                    onClick={handleExtract}
                    disabled={isLoading}
                    className="w-full mt-4 flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            Processing...
                        </>
                    ) : 'Extract Details'}
                </button>
             )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 min-h-[60vh] flex flex-col w-full flex-grow">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Results</h2>
            {isLoading && (
                 <div className="flex flex-col items-center justify-center flex-grow">
                    <Spinner size="lg" color="blue"/>
                    <p className="mt-4 text-slate-600 text-lg">Analyzing document with AI...</p>
                    <p className="text-sm text-slate-500">This may take a moment.</p>
                </div>
            )}
            {error && <ErrorDisplay message={error} />}
            {extractedData && !isLoading && (
              <div className="flex-grow flex flex-col overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('data')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'data'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Extracted Details
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'chat'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Chat Assistant
                        </button>
                    </nav>
                </div>
                 <div className="flex-grow pt-5 overflow-y-auto">
                    {activeTab === 'data' && <ResultsDisplay data={extractedData} />}
                    {activeTab === 'chat' && (
                        <ChatInterface 
                          history={chatHistory} 
                          isLoading={isChatLoading} 
                          onSendMessage={handleSendMessage} 
                        />
                    )}
                </div>
              </div>
            )}
            {!isLoading && !error && !extractedData && <Welcome />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
