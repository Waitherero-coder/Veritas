import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Tesseract from 'tesseract.js';
import { Upload, Loader, X } from 'lucide-react';
import jsPDF from 'jspdf';

type Props = {
  caseId: string;
  onComplete: () => void;
  onCancel: () => void;
};

export function EvidenceUpload({ caseId, onComplete, onCancel }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOcrText('');
      setProgress(0);
    }
  };

  const detectFileType = (file: File) =>
    file.type.startsWith('image/') ? 'image' : 'document';

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

  const handleUpload = async () => {
    if (!file) return alert('No file selected');
    if (!caseId) return alert('Case ID missing');

    setUploading(true);
    setProgress(0);

    try {
      const bucketName = 'evidence';

      // --- Removed the problematic bucket existence check (lines 64-65) ---
      // This check frequently failed due to missing SELECT permissions for the 'anon' role, 
      // even when the bucket existed. The upload call below will now handle the error 
      // if the bucket is truly missing or inaccessible.
      
      // const { data: bucketData, error: bucketErr } = await supabase.storage.getBucket(bucketName);
      // if (bucketErr) throw new Error(`Bucket "${bucketName}" not found: ${bucketErr.message}`);

      // --- Generate unique filename ---
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${caseId}/${fileName}`.replace(/\\/g, '/');

      // --- Upload file ---
      // This is now the first Supabase Storage operation. It requires a correct 
      // INSERT policy for the 'anon' role to succeed.
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      // --- Get public URL ---
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) throw new Error('Failed to generate public URL');
      const fileUrl = publicUrlData.publicUrl;

      // --- OCR for images ---
      let extractedText = '';
      if (detectFileType(file) === 'image') {
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => m.status === 'recognizing text' && setProgress(m.progress),
        });
        extractedText = result.data.text;
        setOcrText(extractedText);
      }

      // --- Analyze text ---
      const { harmDetected, threatLevel } = analyzeContent(extractedText);

      // --- Insert into DB ---
      const { error: dbError } = await supabase.from('evidence_items').insert({
        case_id: caseId,
        file_url: fileUrl,
        file_type: detectFileType(file),
        extracted_text: extractedText,
        metadata: { fileName: file.name, fileSize: file.size, mimeType: file.type },
        harm_detected: harmDetected,
        threat_level: threatLevel,
        uploaded_at: new Date().toISOString(),
      });
      if (dbError) throw dbError;

      onComplete();
      setFile(null);
      setOcrText('');
      setProgress(0);
    } catch (err: any) {
      console.error(err);
      alert(`Error uploading file: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!file) return;

    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text(`File Name: ${file.name}`, 10, 10);
    pdf.text(`File Type: ${file.type}`, 10, 20);
    pdf.text(`File Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 10, 30);
    pdf.text('--- Extracted Text ---', 10, 40);
    pdf.text(ocrText || 'No text extracted', 10, 50);
    pdf.save(`${file.name}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Upload Evidence</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div
          className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <>
              <p className="text-lg font-semibold text-slate-900 mb-2">{file.name}</p>
              <p className="text-sm text-slate-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <Upload size={48} className="mx-auto text-slate-400 mb-2" />
              <p className="text-lg font-semibold text-slate-900 mb-2">Click to select a file</p>
              <p className="text-sm text-slate-600">Images or documents</p>
            </>
          )}
        </div>

        {file && ocrText && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-slate-700">
            <p className="font-medium mb-1">Extracted Text:</p>
            <pre className="whitespace-pre-wrap">{ocrText}</pre>
          </div>
        )}

        {uploading && (
          <div className="mt-4 text-slate-700">
            <Loader className="animate-spin mr-2 inline-block" />
            OCR Progress: {(progress * 100).toFixed(0)}%
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
            disabled={uploading}
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!file || uploading}
          >
            {uploading ? 'Processing...' : 'Upload & Analyze'}
          </button>

          {file && !uploading && (
            <button
              onClick={handleDownloadPDF}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}