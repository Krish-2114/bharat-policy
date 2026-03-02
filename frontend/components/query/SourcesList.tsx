import { Source } from '@/types/chat';
import { ExternalLink, Percent } from 'lucide-react';

interface SourcesListProps {
  sources: Source[];
  onSourceClick: (source: Source) => void;
}

export default function SourcesList({
  sources,
  onSourceClick,
}: SourcesListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2 w-full">
      <h4 className="text-xs text-gray-500 uppercase tracking-wide font-medium flex items-center gap-2 mb-1">
        <span className="h-px w-4 bg-white/10" />
        Sources & Citations
        <span className="h-px flex-1 bg-white/10" />
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sources.map((source, idx) => (
          <button
            type="button"
            key={`${source.policy_id}-${source.clause_id}-${idx}`}
            onClick={() => onSourceClick(source)}
            className="flex flex-col gap-2 p-4 rounded-lg bg-[#111827]/80 border border-white/5 hover:border-white/10 hover:bg-white/5 text-left transition-all duration-150 group"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Policy ID {source.policy_id}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  <Percent className="w-3 h-3 mr-0.5" />
                  {Math.round(source.score * 100)}% Match
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-400 whitespace-nowrap pt-0.5">
                § {source.clause_number}:
              </span>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                {source.text}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
