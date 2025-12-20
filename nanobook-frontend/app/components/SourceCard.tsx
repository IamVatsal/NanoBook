
import React from 'react';
import { Source } from '../Utils/types';

interface SourceCardProps {
  source: Source;
  onRemove: (id: string) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, onRemove }) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-4" title={source.name}>
              {source.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatSize(source.size)} • {source.type.split('/')[1]?.toUpperCase() || 'TXT'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => onRemove(source.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SourceCard;
