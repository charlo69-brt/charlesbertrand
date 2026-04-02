import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
}

export default function Badge({ children, variant = 'blue' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': variant === 'blue',
          'bg-green-100 text-green-800': variant === 'green',
          'bg-red-100 text-red-800': variant === 'red',
          'bg-yellow-100 text-yellow-800': variant === 'yellow',
          'bg-gray-100 text-gray-800': variant === 'gray',
        }
      )}
    >
      {children}
    </span>
  );
}
