import { useState } from 'react';
import { Flag, X } from 'lucide-react';

const REASONS = [
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'misleading', label: 'Not a real Tesla light show' },
  { value: 'other', label: 'Other' },
];

interface ReportVideoModalProps {
  videoId: string;
  onClose: () => void;
  onSubmit: (videoId: string, reason: string, details: string) => Promise<void>;
}

export default function ReportVideoModal({ videoId, onClose, onSubmit }: ReportVideoModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { setError('Please select a reason'); return; }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(videoId, reason, details);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-charcoal border border-border rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-accent-red" />
            <h3 className="text-text-primary font-semibold text-sm">Report Video</h3>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <p className="text-emerald-400 text-sm">Thank you. Your report has been submitted.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-text-secondary text-xs font-medium">Reason</legend>
              {REASONS.map(r => (
                <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={e => setReason(e.target.value)}
                    className="accent-electric-cyan"
                  />
                  <span className="text-text-primary text-sm">{r.label}</span>
                </label>
              ))}
            </fieldset>
            <div className="space-y-1">
              <label className="text-text-secondary text-xs">Details (optional)</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors resize-none"
                placeholder="Any additional context..."
              />
            </div>
            {error && <p className="text-accent-red text-xs">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent-red hover:bg-accent-red/90 disabled:bg-steel disabled:text-text-secondary/30 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
