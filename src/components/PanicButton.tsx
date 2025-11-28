import { AlertTriangle } from 'lucide-react';

export function PanicButton() {
  const handlePanic = () => {
    window.location.href = 'https://www.google.com/search?q=weather';
  };

  return (
    <button
      onClick={handlePanic}
      className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
      aria-label="Quick Escape"
    >
      <AlertTriangle size={10} />
      <span className="font-semibold">Quick Escape</span>
    </button>
  );
}
