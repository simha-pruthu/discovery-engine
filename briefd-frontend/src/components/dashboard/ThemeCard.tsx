import IntensityBar from "@/components/ui/IntensityBar";

export interface Quote {
  text: string;
  url?: string;
  source?: string;
  title?: string;
  date?: string;
}

export interface Theme {
  name: string;
  frequency: number;
  emotional_intensity: number;
  primary_segment: string;
  quotes?: Quote[];
  confidence?: string;
}

function getConfidenceStyles(level: string) {
  const normalized = level.toLowerCase();
  if (normalized === "high")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "medium")
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function deriveConfidence(intensity: number): string {
  if (intensity >= 70) return "High";
  if (intensity >= 45) return "Medium";
  return "Low";
}

function formatSource(source: string): string {
  const map: Record<string, string> = {
    reddit: "Reddit",
    playstore: "Google Play",
    google_play: "Google Play",
    appstore: "App Store",
    app_store: "App Store",
  };
  return map[source.toLowerCase()] ?? source;
}

export default function ThemeCard({ theme }: { theme: Theme }) {
  const confidence =
    theme.confidence ?? deriveConfidence(theme.emotional_intensity);
  const quotes = theme.quotes?.slice(0, 2) ?? [];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200">
      {/* Header row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">
            {theme.name}
          </h3>
          <p className="text-xs text-[#64748B] mt-1">{theme.primary_segment}</p>
        </div>
        <div className="text-right shrink-0 ml-6">
          <p className="text-3xl font-semibold tabular-nums text-[#0F172A] leading-none">
            {theme.frequency.toLocaleString()}
          </p>
          <p className="text-xs text-[#64748B] uppercase tracking-wide mt-1">
            Signals
          </p>
        </div>
      </div>

      {/* Intensity bar */}
      <IntensityBar value={theme.emotional_intensity} />
      <p className="text-xs text-[#64748B] mt-2 mb-5">
        Emotional intensity: {theme.emotional_intensity}%
      </p>

      {/* Citations */}
      {quotes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-[#64748B] font-medium mb-3">
            Citations
          </p>
          <div className="space-y-4">
            {quotes.map((q, i) => (
              <div
                key={i}
                className="border-l-2 border-[#E2E8F0] pl-3"
              >
                <p className="text-sm text-[#64748B] leading-relaxed mb-1.5">
                  &ldquo;{q.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {q.source && (
                    <span className="text-xs text-[#A0AEC0] font-medium">
                      {formatSource(q.source)}
                    </span>
                  )}
                  {q.url && (
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#64748B] underline underline-offset-2 hover:text-[#D14E17] transition"
                    >
                      View original →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 pt-5 border-t border-[#E2E8F0]">
        <p className="text-sm text-[#0F172A]">
          Impact: High friction among {theme.primary_segment.toLowerCase()}.
        </p>
        <span
          className={`shrink-0 ml-4 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${getConfidenceStyles(
            confidence
          )}`}
        >
          {confidence}
        </span>
      </div>
    </div>
  );
}
