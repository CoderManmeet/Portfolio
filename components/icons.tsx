type IconProps = { className?: string }

export function ArrowUpRight({ className = 'icon-arrow' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" aria-hidden="true" focusable="false">
      <path d="M4 12 12 4" />
      <path d="M5.5 4H12v6.5" />
    </svg>
  )
}

export function ArrowUp({ className = 'icon-arrow' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" aria-hidden="true" focusable="false">
      <path d="M8 14V3" />
      <path d="M3.5 7.5 8 3l4.5 4.5" />
    </svg>
  )
}
