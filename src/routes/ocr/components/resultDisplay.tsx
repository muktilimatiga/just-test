import React, { useState } from 'react';
import { Copy, Check, FileText, Loader2, RefreshCw } from 'lucide-react';

interface ResultDisplayProps {
    result: string;
    loading: boolean;
    progressStatus?: string;
    progressValue?: number;
    onCopy: () => void;
    onRetry?: () => void;
    error?: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
    result,
    loading,
    progressStatus = 'Processing...',
    progressValue = 0,
    onCopy,
    onRetry,
    error
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (error) {
        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-100 text-center">
                <div className="p-3 bg-red-100 rounded-full text-red-500 mb-4">
                    <FileText size={24} />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
                <p className="text-red-600 mb-6 max-w-sm">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm font-medium"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    if (loading) {
        const percentage = Math.round(progressValue * 100);

        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="animate-spin text-indigo-600 mb-6">
                    <Loader2 size={40} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{progressStatus}</h3>

                <div className="w-full max-w-xs bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <p className="text-slate-500 text-sm font-mono">{percentage}%</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-center">
                <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-4">
                    <FileText size={24} />
                </div>
                <p className="text-slate-500">Upload an image to see the extracted text here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500" />
                    Result
                </h3>
                <button
                    onClick={handleCopy}
                    className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all
            ${copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }
          `}
                >
                    {copied ? (
                        <>
                            <Check size={14} />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <div className="flex-1 p-6 overflow-auto max-h-[500px]">
                <div className="prose prose-slate prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-mono text-sm">
                    {result}
                </div>
            </div>
        </div>
    );
};