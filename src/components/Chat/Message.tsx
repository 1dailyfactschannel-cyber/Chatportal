import clsx from 'clsx';
import type { Message } from '../../types';

interface MessageProps {
  message: Message;
  isOutgoing: boolean;
}

export const Message = ({ message, isOutgoing }: MessageProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return '🕐';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return <span className="text-[#6ab3f3]">✓✓</span>;
      default:
        return '';
    }
  };

  return (
    <div className={clsx('flex mb-2', isOutgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[70%] px-3 py-1.5 rounded-[18px] relative shadow-sm',
          isOutgoing
            ? 'bg-[#e5ffc8] dark:bg-[#2b5278]'
            : 'bg-[#ffffff] dark:bg-[#182533]',
        )}
      >
        <p className="text-[14px] text-[#000000] dark:text-[#ffffff] whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        <div className={clsx(
          'flex items-center justify-end gap-1 mt-1',
          isOutgoing ? 'text-[#a0a0a0]' : 'text-[#a0a0a0] dark:text-[#5e6c7e]'
        )}>
          <span className="text-[11px]">
            {formatTime(message.timestamp)}
          </span>
          
          {isOutgoing && (
            <span className="text-[12px]">
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
