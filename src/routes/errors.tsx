import React, { useState, useMemo } from 'react';
import { Settings, RefreshCw, Wand2, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';
// --- Types ---
export enum ErrorType {
  CLIENT = 'CLIENT', // 4xx
  SERVER = 'SERVER', // 5xx
  CONNECTION = 'CONNECTION' // Network/DNS
}

export interface ErrorConfig {
  code: string;
  title: string;
  message: string;
  whatHappened: string;
  whatToDo: string;
  rayId: string;
  clientIp: string;
  host: string;
  timestamp: string;
}

// --- Component: NetworkDiagram ---
interface NetworkDiagramProps {
  errorType: ErrorType;
  host: string;
}

const NetworkDiagram: React.FC<NetworkDiagramProps> = ({ errorType, host }) => {
  const isConnectionError = errorType === ErrorType.CONNECTION;
  const isServerError = errorType === ErrorType.SERVER;

  // Cloudflare Logic:
  // 4xx: Browser (Green) -> Cloud (Green) -> Host (Green, but technically serving error)
  // 5xx: Browser (Green) -> Cloud (Green) -> Host (Red)
  // Connection: Browser (Green) -> Cloud (Red) -> Host (Red)
  
  const clientStatus = 'success';
  const cloudStatus = isConnectionError ? 'error' : 'success';
  const hostStatus = (isServerError || isConnectionError) ? 'error' : 'success';

  // --- Custom SVGs for Flat "Cloudflare" Style ---
  
  const BrowserIcon = ({ color }: { color: string }) => (
    <svg viewBox="0 0 64 64" className="w-[84px] h-[84px]" fill={color}>
       <path d="M4 12h56v36H4z" />
       <path d="M0 12h60v40H0z" fill="none" stroke={color} strokeWidth="3"/>
       <path d="M8 56h44l4 8H4z" />
    </svg>
  );

  const CloudIcon = ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" className="w-[100px] h-[100px]" fill={color}>
      <path d="M18.42 9.22A7 7 0 0 0 5.06 10.8A5 5 0 0 0 6 20h12a6 6 0 0 0 .42-11.78z" />
    </svg>
  );

  const ServerIcon = ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" className="w-[80px] h-[80px]" fill={color}>
      <path d="M2 5v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2zm16 11h-2v-2h2v2zm0-4h-2V9h2v3zm0-4h-2V5h2v3z"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const renderNode = (
    type: 'browser' | 'cloud' | 'host',
    status: 'success' | 'error',
    label1: string,
    label2: string,
    label3: string
  ) => {
    const isSuccess = status === 'success';
    const statusColor = isSuccess ? '#28a745' : '#bd2426'; 
    const iconColor = '#999';

    return (
      <div className="flex flex-col items-center relative z-10 px-4 bg-[#f2f2f2]">
        {/* Icon */}
        <div className="relative mb-6 h-28 flex items-center justify-center">
           {type === 'browser' && <BrowserIcon color={iconColor} />}
           {type === 'cloud' && <CloudIcon color={iconColor} />}
           {type === 'host' && <ServerIcon color={iconColor} />}
           
           {/* Status Badge */}
           <div 
             className="absolute bottom-0 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-[5px] border-[#f2f2f2]"
             style={{ backgroundColor: statusColor }}
           >
              {isSuccess ? <CheckIcon /> : <XIcon />}
           </div>
        </div>

        {/* Labels */}
        <div className="flex flex-col items-center space-y-1">
            <span className="text-[#333] text-base font-normal">{label1}</span>
            <span className="text-[#999] text-2xl font-light">{label2}</span>
            <span className="text-lg font-normal" style={{ color: statusColor }}>{label3}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[960px] mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-center relative gap-8 md:gap-0">
        
        {/* Connection Lines */}
        <div className="hidden md:block absolute top-[3.5rem] left-[15%] right-[15%] -z-0">
             <div className="w-full border-t-2 border-dashed border-[#d8d8d8]"></div>
        </div>

        <div className="w-full md:w-1/3">
            {renderNode('browser', clientStatus, 'You', 'Browser', 'Working')}
        </div>
        <div className="w-full md:w-1/3">
             {renderNode('cloud', cloudStatus, 'London', 'Cloudflare', cloudStatus === 'success' ? 'Working' : 'Error')}
        </div>
        <div className="w-full md:w-1/3">
             {renderNode('host', hostStatus, host, 'Host', hostStatus === 'success' ? 'Working' : 'Error')}
        </div>
      </div>
    </div>
  );
};

// --- Component: ControlPanel ---
interface ControlPanelProps {
  config: ErrorConfig;
  setConfig: React.Dispatch<React.SetStateAction<ErrorConfig>>;
  onGenerateAI: (code: string) => void;
  isGenerating: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onGenerateAI, isGenerating }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-gray-900 text-white rounded-full shadow-xl hover:bg-black transition-all duration-300 ${isOpen ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        <Settings className="w-6 h-6" />
      </button>

      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-gray-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Page Config
            </h2>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">AI Generation</h3>
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text" 
                        value={config.code}
                        onChange={(e) => setConfig(prev => ({...prev, code: e.target.value}))}
                        className="w-20 px-3 py-2 border border-blue-200 rounded-lg text-center font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="522"
                    />
                    <button
                        onClick={() => onGenerateAI(config.code)}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {isGenerating ? 'Thinking...' : 'Generate Text'}
                    </button>
                </div>
            </div>
            <hr className="border-gray-100" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What Happened?</label>
                <textarea
                  name="whatHappened"
                  value={config.whatHappened}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What To Do?</label>
                <textarea
                  name="whatToDo"
                  value={config.whatToDo}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                <input
                  type="text"
                  name="host"
                  value={config.host}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Main App Component ---
const INITIAL_CONFIG: ErrorConfig = {
  code: "522", 
  title: "Connection Timed Out",
  message: "",
  whatHappened: "The initial connection between Cloudflare's network and the origin web server timed out. As a result, the web page can not be displayed.",
  whatToDo: "If you're a visitor of this website:\nPlease try again in a few minutes.\n\nIf you're the owner of this website:\nContact your hosting provider to let them know your web server is not completing requests. An Error 522 means that the request was able to connect to your web server, but that the request didn't finish. The most likely cause is that something on your server is hogging resources.",
  rayId: "8c3b1a29d9e41234",
  clientIp: "203.0.113.195",
  host: "example.com",
  timestamp: new Date().toUTCString()
};

export const ErrorPage: React.FC = () => {
  const [config, setConfig] = useState<ErrorConfig>(INITIAL_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async (code: string) => {
    setIsGenerating(true);
    setConfig(prev => ({
      ...prev,
      code 
    }));
    setIsGenerating(false);
  };

  const errorType = useMemo(() => {
    const numCode = parseInt(config.code);
    if (numCode >= 500) return ErrorType.SERVER;
    if (numCode >= 400) return ErrorType.CLIENT;
    return ErrorType.CONNECTION;
  }, [config.code]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#333]">
      
      {/* Top Section: Gray Background with Diagram */}
      <div className="bg-[#f2f2f2] w-full pt-16 pb-24 relative">
          <NetworkDiagram errorType={errorType} host={config.host} />
          
          {/* Cloudflare Triangle Notch */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-8 h-8 bg-[#f2f2f2]"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[960px] mx-auto px-6 pt-20 pb-12">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            {/* Left Col */}
            <div>
                <h2 className="text-[28px] font-normal text-[#333] mb-4 tracking-tight">What happened?</h2>
                <p className="text-[#333] leading-7 text-[15px]">
                    {config.whatHappened || config.message}
                </p>
            </div>

            {/* Right Col */}
            <div>
                <h2 className="text-[28px] font-normal text-[#333] mb-4 tracking-tight">What can I do?</h2>
                <div className="text-[#333] leading-7 text-[15px] whitespace-pre-wrap">
                    {config.whatToDo}
                </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 py-8 px-6 text-center text-[13px] antialiased">
        <div className="max-w-[960px] mx-auto flex flex-col md:flex-row justify-between items-center text-[#666] gap-2">
             <div className="flex gap-1 md:gap-4 flex-col md:flex-row">
                <span>Cloudflare Ray ID: <strong className="text-[#333] font-mono font-normal">{config.rayId}</strong></span>
                <span className="hidden md:inline">&bull;</span>
                <span>Your IP: <strong className="text-[#333] font-mono font-normal">{config.clientIp}</strong></span>
             </div>
             <div>
                Performance &amp; security by <a href="#" className="text-[#2f7bbf] hover:underline">Cloudflare</a>
             </div>
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                      <Link 
                        to="/" 
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#f48120] hover:bg-[#d9731c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f48120] transition-colors"
                      >
                        Go Home
                      </Link>
                      </div>
        </div>

      </footer>

      {/* Settings Overlay */}
      <ControlPanel 
        config={config} 
        setConfig={setConfig} 
        onGenerateAI={handleGenerateAI} 
        isGenerating={isGenerating} 
      />

    </div>
  );
};
