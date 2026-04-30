import * as React from "react"
import { cn } from "../../lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  online?: boolean;
}

export function Avatar({ className, src, alt, fallback, size = 'md', online, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        {
          "h-6 w-6": size === 'xs',
          "h-8 w-8": size === 'sm',
          "h-10 w-10": size === 'md',
          "h-12 w-12": size === 'lg',
          "h-16 w-16": size === 'xl',
          "h-24 w-24": size === '2xl',
        },
        className
      )}
      style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border-accent)' }}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-semibold text-[var(--accent-cyan)]"
          style={{ fontSize: size === 'xs' ? 10 : size === 'sm' ? 12 : 14 }}
        >
          {fallback || alt?.charAt(0) || "?"}
        </span>
      )}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full pulse-online"
          style={{
            width: size === 'xs' || size === 'sm' ? 8 : 10,
            height: size === 'xs' || size === 'sm' ? 8 : 10,
            background: 'var(--accent-green)',
            border: '2px solid var(--bg-card)',
          }}
        />
      )}
    </div>
  );
}
