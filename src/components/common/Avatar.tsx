import clsx from 'clsx';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-[42px] h-[42px] text-sm',
  lg: 'w-[52px] h-[52px] text-base',
};

const colors = [
  '#f27a7a', '#7ac687', '#f2c27a', '#7abaf2',
  '#b27af2', '#f27ab8', '#7ac6c6', '#f2a27a',
];

const getColor = (name: string): string => {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name: string): string => {
  return name.slice(0, 2).toUpperCase();
};

export const Avatar = ({ name, imageUrl, size = 'md', className }: AvatarProps) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={clsx('rounded-full object-cover flex-shrink-0', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: getColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
};
