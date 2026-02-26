import clsx from 'clsx';
import type { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
  isOutgoing: boolean;
}

export const MessageBubble = ({ message, isOutgoing }: MessageProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <span className="text-[11px]">🕐</span>;
      case 'sent':
        return <span className="status-sent text-[12px]">✓</span>;
      case 'delivered':
        return <span className="status-delivered text-[12px]">✓✓</span>;
      case 'read':
        return <span className="status-read text-[12px]">✓✓</span>;
      default:
        return '';
    }
  };

  return (
    <div className={clsx('flex mb-1', isOutgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'message-bubble',
          isOutgoing ? 'message-bubble-out' : 'message-bubble-in'
        )}
      >
        <p 
          className="text-[14px] whitespace-pre-wrap break-words"
          style={{ color: 'var(--window-fg)' }}
        >
          {message.content}
        </p>
        
        <div 
          className="flex items-center justify-end gap-1 mt-1"
          style={{ color: 'var(--dialogs-date)' }}
        >
          <span className="text-[11px]">
            {formatTime(message.timestamp)}
          </span>
          
          {isOutgoing && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};
