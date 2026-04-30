import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

const MELA_IMAGES = {
  welcome: { src: '/mela-welcome.png', width: 1024, height: 1024 },
  indica: { src: '/mela-indica.png', width: 500, height: 500 },
  chiama: { src: '/mela-chiama.png', width: 713, height: 1035 },
} as const

export type MelaType = keyof typeof MELA_IMAGES
export type MelaSize = 'sm' | 'md' | 'lg' | 'xl'

interface SizeConfig {
  mela: string
  padLeft: string
  padRight: string
  padY: string
  text: string
  arrow: number
  offsetLeft: string
  offsetRight: string
}

const SIZE_CONFIG: Record<MelaSize, SizeConfig> = {
  sm: {
    mela: 'w-14',
    padLeft: 'pl-14 pr-4',
    padRight: 'pr-14 pl-4',
    padY: 'py-2',
    text: 'text-xs',
    arrow: 12,
    offsetLeft: 'left-0 -translate-x-3',
    offsetRight: 'right-0 translate-x-3',
  },
  md: {
    mela: 'w-28',
    padLeft: 'pl-32 pr-6',
    padRight: 'pr-32 pl-6',
    padY: 'py-3',
    text: 'text-sm',
    arrow: 14,
    offsetLeft: 'left-0 -translate-x-6',
    offsetRight: 'right-0 translate-x-6',
  },
  lg: {
    mela: 'w-36',
    padLeft: 'pl-40 pr-7',
    padRight: 'pr-40 pl-7',
    padY: 'py-4',
    text: 'text-base',
    arrow: 16,
    offsetLeft: 'left-0 -translate-x-7',
    offsetRight: 'right-0 translate-x-7',
  },
  xl: {
    mela: 'w-44',
    padLeft: 'pl-48 pr-8',
    padRight: 'pr-48 pl-8',
    padY: 'py-5',
    text: 'text-lg',
    arrow: 18,
    offsetLeft: 'left-0 -translate-x-8',
    offsetRight: 'right-0 translate-x-8',
  },
}

interface MelaButtonBaseProps {
  children: ReactNode
  mela: MelaType
  melaPosition?: 'left' | 'right'
  melaFlip?: boolean
  melaSize?: MelaSize
  variant?: 'gradient' | 'primary'
  showArrow?: boolean
  fullWidth?: boolean
  className?: string
}

interface MelaButtonLinkProps extends MelaButtonBaseProps {
  href: string
  target?: string
  rel?: string
  type?: never
  onClick?: never
  disabled?: never
}

interface MelaButtonButtonProps extends MelaButtonBaseProps {
  href?: never
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
  target?: never
  rel?: never
}

type MelaButtonProps = MelaButtonLinkProps | MelaButtonButtonProps

export function MelaButton(props: MelaButtonProps) {
  const {
    children,
    mela,
    melaPosition = 'left',
    melaFlip = false,
    melaSize = 'md',
    variant = 'gradient',
    showArrow = true,
    fullWidth = false,
    className = '',
  } = props

  const img = MELA_IMAGES[mela]
  const cfg = SIZE_CONFIG[melaSize]
  const isLeft = melaPosition === 'left'

  const bgClasses =
    variant === 'gradient'
      ? 'bg-gradient-to-r from-primary/70 via-primary to-primary-dark'
      : 'bg-primary hover:bg-primary-dark'

  const padding = isLeft ? cfg.padLeft : cfg.padRight
  const justify = fullWidth
    ? 'justify-center'
    : isLeft
      ? 'justify-end'
      : 'justify-start'
  const melaPositionClasses = isLeft ? cfg.offsetLeft : cfg.offsetRight
  const melaHoverRotate = isLeft
    ? 'group-hover:-rotate-6'
    : 'group-hover:rotate-6'
  const display = fullWidth ? 'flex w-full' : 'inline-flex'
  const disabledClasses =
    'href' in props
      ? ''
      : 'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-card'

  const rootClassName = `group relative ${display} items-center ${justify} overflow-visible rounded-full ${bgClasses} ${padding} ${cfg.padY} shadow-card hover:shadow-card-hover transition-all ${disabledClasses} ${className}`

  const inner = (
    <>
      <div
        className={`absolute ${melaPositionClasses} top-1/2 -translate-y-1/2 pointer-events-none`}
      >
        <Image
          src={img.src}
          alt=""
          width={img.width}
          height={img.height}
          className={`${cfg.mela} h-auto drop-shadow-xl group-hover:scale-110 ${melaHoverRotate} transition-transform duration-300 ${melaFlip ? 'scale-x-[-1]' : ''}`}
        />
      </div>
      <span
        className={`text-white ${cfg.text} font-semibold inline-flex items-center gap-1.5 group-hover:gap-2 transition-all whitespace-nowrap`}
      >
        {children}
        {showArrow && <ArrowRight size={cfg.arrow} />}
      </span>
    </>
  )

  if ('href' in props && props.href) {
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={rootClassName}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={rootClassName}
    >
      {inner}
    </button>
  )
}
