import React from 'react';
import { AnalysisResponse } from '../lib/aiClient';

interface Evidence {
  id: string;
  file_name: string;
  file_type: string;
  file_url?: string;
  text_content?: string;
  created_at: string;
  ai_processed: boolean;
  threat_level?: 'none' | 'low' | 'medium' | 'high';
  abuse_categories?: string[];
  emotion_tags?: string[];
  ocr_text?: string;
}

interface EvidenceCardProps {
  evidence: Evidence;
  onViewDetails?: (id: string) => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onViewDetails }) => {
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            {getFileIcon(evidence.file_type)}
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {evidence.file_name}
              </h3>
              <p className="text-xs text-gray-500">
                {formatDate(evidence.created_at)}
              </p>
            </div>
          </div>
          
          {evidence.ai_processed && evidence.threat_level && (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getThreatLevelColor(evidence.threat_level)}`}>
              {evidence.threat_level.toUpperCase()}
            </span>
          )}
        </div>
        
        {evidence.ai_processed && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {evidence.abuse_categories && evidence.abuse_categories.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {evidence.abuse_categories.map((category, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {evidence.emotion_tags && evidence.emotion_tags.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {evidence.emotion_tags.map((emotion, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {evidence.ocr_text && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 line-clamp-2">
                  {evidence.ocr_text}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => onViewDetails && onViewDetails(evidence.id)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceCard;