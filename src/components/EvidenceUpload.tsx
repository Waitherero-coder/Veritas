import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Image, FileText, Mic, Video, Loader } from 'lucide-react';

type Props = {
  caseId: string;
  onComplete: () => void;
  onCancel: () => void;
};

export function EvidenceUpload({ caseId, onComplete, onCancel }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const detectFileType = (file: File): 'image' | 'audio' | 'document' | 'video' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const analyzeContent = (text: string) => {
    const harmfulPatterns = [
      /kill|murder|die|death/i,
      /threat|harm|hurt/i,
      /rape|assault|abuse/i,
      /blackmail|extort/i,
      /leak|expose|share/i,
      /destroy|ruin/i,
    ];

    const foundThreats = harmfulPatterns.filter((pattern) => pattern.test(text));
    const harmDetected = foundThreats.length > 0;

    let threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    if (foundThreats.length >= 3) threatLevel = 'critical';
    else if (foundThreats.length === 2) threatLevel = 'high';
    else if (foundThreats.length === 1) threatLevel = 'medium';

    return { harmDetected, threatLevel };
  };

  const simulateOCR = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `Extracted text from ${file.name}:\n\n"I know where you live. You better do what I say or I'll share those photos with everyone. This is not a joke. Reply now."\n\nTimestamp: ${new Date().toISOString()}`
        );
      }, 2000);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setAnalyzing(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${caseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(filePath, file);

      if (uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(filePath);

        const fileUrl = publicUrl;
        const fileType = detectFileType(file);

        let text = '';
        if (fileType === 'image') {
          text = await simulateOCR(file);
          setExtractedText(text);
        }

        const { harmDetected, threatLevel } = analyzeContent(text);

        const { error: dbError } = await supabase.from('evidence_items').insert({
          case_id: caseId,
          file_url: fileUrl,
          file_type: fileType,
          extracted_text: text,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          },
          harm_detected: harmDetected,
          threat_level: threatLevel,
        });

        if (dbError) throw dbError;

        setTimeout(() => {
          setAnalyzing(false);
          onComplete();
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file. Please try again.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload size={48} className="text-slate-400" />;

    const type = detectFileType(file);
    switch (type) {
      case 'image':
        return <Image size={48} className="text-emerald-600" />;
      case 'audio':
        return <Mic size={48} className="text-blue-600" />;
      case 'video':
        return <Video size={48} className="text-purple-600" />;
      default:
        return <FileText size={48} className="text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Upload Evidence</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          >
            <div className="flex justify-center mb-4">{getFileIcon()}</div>

            {file ? (
              <div>
                <p className="text-lg font-semibold text-slate-900 mb-2">{file.name}</p>
                <p className="text-sm text-slate-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-slate-900 mb-2">
                  Click to select a file
                </p>
                <p className="text-sm text-slate-600">
                  Images, audio, video, or documents
                </p>
              </div>
            )}
          </div>

          {analyzing && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader className="animate-spin text-blue-600" size={20} />
                <p className="font-semibold text-blue-900">Analyzing content...</p>
              </div>
              {extractedText && (
                <div className="bg-white rounded p-3 text-sm text-slate-700">
                  <p className="font-medium mb-2">Extracted Text:</p>
                  <p className="whitespace-pre-wrap">{extractedText}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload & Analyze
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
