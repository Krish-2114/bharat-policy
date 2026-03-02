import { User, Cpu } from 'lucide-react';
import { ChatMessage, Source } from '@/types/chat';
import SourcesList from './SourcesList';

interface MessageBubbleProps {
  message: ChatMessage;
  onSourceClick?: (source: Source) => void;
}

export default function MessageBubble({
  message,
  onSourceClick,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-[60%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5 ${
            isUser
              ? 'bg-blue-500'
              : 'bg-[#0F172A] border border-white/5'
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Cpu className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <div
          className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`
              px-4 py-2.5 text-sm leading-relaxed rounded-lg max-w-full
              ${isUser ? 'bg-blue-500 text-white' : 'bg-[#0F172A] border border-white/5 text-gray-200'}
            `}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.sources &&
              message.sources.length > 0 &&
              onSourceClick && (
                <SourcesList
                  sources={message.sources}
                  onSourceClick={onSourceClick}
                />
              )}
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide px-1">
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
