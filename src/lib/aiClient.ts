// src/lib/aiClient.ts

export type EvidenceInput = {
  evidenceId?: string;
  caseId: string;
  fileUrl?: string;
  text?: string;
  type: 'image' | 'text' | 'audio' | 'video' | 'other';
};

export type EvidenceAnalysis = {
  extractedText?: string;
  abuseLabels?: string[];
  severityScore?: number;
  summary?: string;
  participants?: Array<{ type?: string; value?: string }>;
  analysisMeta?: Record<string, any>;
};

const API_BASE = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8001';

export async function analyzeEvidence(input: EvidenceInput): Promise<EvidenceAnalysis> {
  const res = await fetch(`${API_BASE}/analyze-evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI analyze failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getSupportRecommendations(caseId: string, severity = 0.0) {
  const url = new URL(`${API_BASE}/support-recommendations`);
  url.searchParams.append('caseId', caseId);
  url.searchParams.append('severity', String(severity));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to get support recommendations');
  return res.json();
}
