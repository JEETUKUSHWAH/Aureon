import { HTMLAttributes } from 'react'

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ size = 'md', className = '', ...props }: LogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  return (
    <div 
      className={`relative flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 bg-transparent ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <img src="/logo-new.png" alt="Aureon Logo" className="w-full h-full object-contain brightness-110" />
    </div>
  )
}
