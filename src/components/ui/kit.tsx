/* Gemeinsame, mobil-optimierte UI-Bausteine für die ganze App - in reinem React DOM
   (div/span/button) mit Inline-Styles. Ersetzt die frühere gluestack-ui/react-native-web
   Schicht komplett: gleiche Komponenten-API (Box/HStack/VStack/Text/Heading/Pressable +
   Design-Token-Props wie bg="$primary600", p="$4", size="sm"), aber ohne jede
   react-native-Abhängigkeit.

   Token-Konventionen (wie vorher):
   - Abstände: "$4" = 4 × 4px = 16px, "$auto" = auto, Zahlen = px
   - Farben:   "$primary600" usw. über die COLORS-Palette unten
   - Radius:   "$sm"/"$md"/"$lg"/"$xl"/"$full"
   - sx:       beliebige zusätzliche CSS-Properties (camelCase)

   Responsive Verhalten läuft über die .kit-*-Klassen in index.css (Media Queries)
   bzw. den useBreakpointValue-Hook (matchMedia, SSR-sicher mit base-Wert). */
import {
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type MouseEventHandler,
  type TouchEventHandler,
} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Collapsible, Progress, AlertDialog } from 'radix-ui'

/* ---------------------------------- Tokens ---------------------------------- */

const COLORS: Record<string, string> = {
  $white: '#FFFFFF',
  $backgroundLight0: '#FFFFFF',
  $backgroundLight50: '#F5F6F8',
  $borderLight200: '#DBDBDB',
  $borderLight900: '#404040',
  $textLight500: '#6B7280',
  $textLight600: '#525252',
  $primary50: '#E8F0F9',
  $primary600: '#1D4E89',
  $primary700: '#173D6C',
  $yellow50: '#FEFCE8',
  $yellow200: '#FDE68A',
  $yellow400: '#FACC15',
  $yellow900: '#713F12',
  $error50: '#FEF2F2',
  $error300: '#FCA5A5',
  $error400: '#F87171',
  $error600: '#DC2626',
  $error700: '#B91C1C',
  $error800: '#991B1B',
  $success50: '#F0FDF4',
  $success300: '#86EFAC',
  $success400: '#4ADE80',
  $success600: '#16A34A',
  $success700: '#15803D',
  $success800: '#166534',
}

const RADII: Record<string, number> = { $xs: 2, $sm: 4, $md: 6, $lg: 8, $xl: 12, $full: 9999 }

const FONT_SIZES: Record<string, number> = { '2xs': 10, xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24 }
const LINE_HEIGHTS: Record<string, string> = { '2xs': '1.4', xs: '1.45', sm: '1.5', md: '1.5', lg: '1.45', xl: '1.4', '2xl': '1.3' }
const HEADING_SIZES: Record<string, number> = { xs: 14, sm: 16, md: 18, lg: 20, xl: 24, '2xl': 30 }
const FONT_WEIGHTS: Record<string, number> = { $normal: 400, $medium: 500, $semibold: 600, $bold: 700, $extrabold: 800 }

type Tok = string | number | undefined

function space(v: Tok): string | number | undefined {
  if (v === undefined) return undefined
  if (typeof v === 'number') return v
  if (v === '$auto' || v === 'auto') return 'auto'
  if (v.startsWith('$')) return parseFloat(v.slice(1)) * 4
  return v
}

function color(v: Tok): string | undefined {
  if (v === undefined) return undefined
  if (typeof v === 'number') return String(v)
  return COLORS[v] ?? v // 'transparent', Hex-Werte usw. gehen unverändert durch
}

function radius(v: Tok): string | number | undefined {
  if (v === undefined) return undefined
  if (typeof v === 'number') return v
  return RADII[v] ?? v
}

function borderW(v: Tok): number | undefined {
  if (v === undefined) return undefined
  if (typeof v === 'number') return v
  return parseFloat(v.replace('$', ''))
}

/* ------------------------- Style-Props → CSSProperties ------------------------- */

export interface StyleProps {
  bg?: string
  p?: Tok; px?: Tok; py?: Tok; pt?: Tok; pb?: Tok; pl?: Tok; pr?: Tok
  m?: Tok; mx?: Tok; my?: Tok; mt?: Tok; mb?: Tok; ml?: Tok; mr?: Tok
  w?: Tok; h?: Tok
  minWidth?: Tok; minHeight?: Tok; maxWidth?: Tok; maxHeight?: Tok
  flex?: number | string
  flexWrap?: CSSProperties['flexWrap']
  gap?: Tok
  alignItems?: CSSProperties['alignItems']
  justifyContent?: CSSProperties['justifyContent']
  alignSelf?: CSSProperties['alignSelf']
  opacity?: number
  borderWidth?: Tok; borderColor?: string
  borderTopWidth?: Tok; borderTopColor?: string
  borderBottomWidth?: Tok; borderBottomColor?: string
  borderLeftWidth?: Tok; borderLeftColor?: string
  borderRightWidth?: Tok; borderRightColor?: string
  borderRadius?: Tok
  sx?: CSSProperties
  style?: CSSProperties
}

function toStyle(p: StyleProps): CSSProperties {
  const s: CSSProperties = {}
  if (p.bg !== undefined) s.backgroundColor = color(p.bg)
  if (p.p !== undefined) s.padding = space(p.p)
  if (p.px !== undefined) { s.paddingLeft = space(p.px); s.paddingRight = space(p.px) }
  if (p.py !== undefined) { s.paddingTop = space(p.py); s.paddingBottom = space(p.py) }
  if (p.pt !== undefined) s.paddingTop = space(p.pt)
  if (p.pb !== undefined) s.paddingBottom = space(p.pb)
  if (p.pl !== undefined) s.paddingLeft = space(p.pl)
  if (p.pr !== undefined) s.paddingRight = space(p.pr)
  if (p.m !== undefined) s.margin = space(p.m)
  if (p.mx !== undefined) { s.marginLeft = space(p.mx); s.marginRight = space(p.mx) }
  if (p.my !== undefined) { s.marginTop = space(p.my); s.marginBottom = space(p.my) }
  if (p.mt !== undefined) s.marginTop = space(p.mt)
  if (p.mb !== undefined) s.marginBottom = space(p.mb)
  if (p.ml !== undefined) s.marginLeft = space(p.ml)
  if (p.mr !== undefined) s.marginRight = space(p.mr)
  if (p.w !== undefined) s.width = p.w === '$full' ? '100%' : space(p.w)
  if (p.h !== undefined) s.height = p.h === '$full' ? '100%' : space(p.h)
  if (p.minWidth !== undefined) s.minWidth = space(p.minWidth)
  if (p.minHeight !== undefined) s.minHeight = p.minHeight === '$full' ? '100%' : space(p.minHeight)
  if (p.maxWidth !== undefined) s.maxWidth = space(p.maxWidth)
  if (p.maxHeight !== undefined) s.maxHeight = space(p.maxHeight)
  if (p.flex !== undefined) s.flex = p.flex
  if (p.flexWrap !== undefined) s.flexWrap = p.flexWrap
  if (p.gap !== undefined) s.gap = space(p.gap)
  if (p.alignItems !== undefined) s.alignItems = p.alignItems
  if (p.justifyContent !== undefined) s.justifyContent = p.justifyContent
  if (p.alignSelf !== undefined) s.alignSelf = p.alignSelf
  if (p.opacity !== undefined) s.opacity = p.opacity
  if (p.borderWidth !== undefined) { s.borderWidth = borderW(p.borderWidth); s.borderStyle = 'solid' }
  if (p.borderColor !== undefined) s.borderColor = color(p.borderColor)
  if (p.borderTopWidth !== undefined) { s.borderTopWidth = borderW(p.borderTopWidth); s.borderTopStyle = 'solid' }
  if (p.borderTopColor !== undefined) s.borderTopColor = color(p.borderTopColor)
  if (p.borderBottomWidth !== undefined) { s.borderBottomWidth = borderW(p.borderBottomWidth); s.borderBottomStyle = 'solid' }
  if (p.borderBottomColor !== undefined) s.borderBottomColor = color(p.borderBottomColor)
  if (p.borderLeftWidth !== undefined) { s.borderLeftWidth = borderW(p.borderLeftWidth); s.borderLeftStyle = 'solid' }
  if (p.borderLeftColor !== undefined) s.borderLeftColor = color(p.borderLeftColor)
  if (p.borderRightWidth !== undefined) { s.borderRightWidth = borderW(p.borderRightWidth); s.borderRightStyle = 'solid' }
  if (p.borderRightColor !== undefined) s.borderRightColor = color(p.borderRightColor)
  if (p.borderRadius !== undefined) s.borderRadius = radius(p.borderRadius)
  return { ...s, ...p.sx, ...p.style }
}

/* --------------------------------- Primitives --------------------------------- */

export interface BoxProps extends StyleProps {
  children?: ReactNode
  ref?: Ref<HTMLDivElement>
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onTouchStart?: TouchEventHandler<HTMLDivElement>
  onTouchEnd?: TouchEventHandler<HTMLDivElement>
  onTouchMove?: TouchEventHandler<HTMLDivElement>
  className?: string
}

/** View-Ersatz: display:flex, flex-direction:column (wie React Native). */
export function Box({ children, ref, onDoubleClick, onTouchStart, onTouchEnd, onTouchMove, className, ...rest }: BoxProps) {
  return (
    <div
      ref={ref}
      className={className ? `kit-box ${className}` : 'kit-box'}
      style={toStyle(rest)}
      onDoubleClick={onDoubleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {children}
    </div>
  )
}

export function HStack({ children, ...rest }: BoxProps) {
  return (
    <Box {...rest} sx={{ flexDirection: 'row', ...rest.sx }}>
      {children}
    </Box>
  )
}

export function VStack({ children, ...rest }: BoxProps) {
  return <Box {...rest}>{children}</Box>
}

export interface TextProps extends StyleProps {
  children?: ReactNode
  size?: keyof typeof FONT_SIZES | string
  fontSize?: number
  fontWeight?: string
  color?: string
  onPress?: () => void
}

/** Text-Ersatz: block-level, aber inline wenn in anderem Text verschachtelt
    (via .kit-text-Regeln in index.css). {'\n'} erzeugt Zeilenumbrüche (pre-line). */
export function Text({ children, size, fontSize, fontWeight, color: c, onPress, ...rest }: TextProps) {
  const s: CSSProperties = toStyle(rest)
  if (size !== undefined) {
    s.fontSize = FONT_SIZES[size] ?? 16
    s.lineHeight = LINE_HEIGHTS[size] ?? '1.5'
  }
  if (fontSize !== undefined) s.fontSize = fontSize
  if (fontWeight !== undefined) s.fontWeight = FONT_WEIGHTS[fontWeight] ?? fontWeight
  if (c !== undefined) s.color = color(c)
  if (onPress) s.cursor = 'pointer'
  return (
    <span className="kit-text" style={s} onClick={onPress}>
      {children}
    </span>
  )
}

export interface HeadingProps extends StyleProps {
  children?: ReactNode
  size?: keyof typeof HEADING_SIZES | string
  color?: string
}

export function Heading({ children, size = 'md', color: c, ...rest }: HeadingProps) {
  const s: CSSProperties = {
    margin: 0,
    fontSize: HEADING_SIZES[size] ?? 18,
    lineHeight: 1.3,
    fontWeight: 700,
    ...toStyle(rest),
  }
  if (c !== undefined) s.color = color(c)
  return (
    <h2 className="kit-text" style={s}>
      {children}
    </h2>
  )
}

export interface PressableProps extends StyleProps {
  children?: ReactNode
  onPress?: () => void
  disabled?: boolean
  className?: string
}

/** Pressable-Ersatz: bewusst ein <div role="button"> statt <button>, weil Browser
    (v. a. mobil) Textauswahl innerhalb von <button> unterbinden - das würde das
    Antippen-und-Halten-Wörterbuch (TranslateZone) in ChoiceCards etc. blockieren.
    Tastatur-Bedienung (Enter/Leertaste) bleibt über onKeyDown erhalten. */
export function Pressable({ children, onPress, disabled, className, ...rest }: PressableProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={className ? `kit-pressable ${className}` : 'kit-pressable'}
      style={toStyle(rest)}
      onClick={disabled ? undefined : onPress}
      onKeyDown={(e) => {
        if (disabled || !onPress) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPress()
        }
      }}
    >
      {children}
    </div>
  )
}

/* Schlanke Kompatibilitäts-Exporte (früher gluestack Button/ButtonText/Card/Spinner). */
export function Button({ children, onPress, isDisabled, ...rest }: PressableProps & { isDisabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={isDisabled} {...rest}>
      {children}
    </Pressable>
  )
}

export function ButtonText({ children, ...rest }: TextProps) {
  return <Text {...rest}>{children}</Text>
}

export function Card({ children, ...rest }: BoxProps) {
  return <Box {...rest}>{children}</Box>
}

export function Spinner({ size: _size }: { size?: string }) {
  return <span className="kit-spinner" aria-label="Lädt" />
}

/* ------------------------------ useBreakpointValue ------------------------------ */

// gluestack-Breakpoints: sm 480px, md 768px, lg 992px
const BP_QUERIES = { sm: '(min-width: 480px)', md: '(min-width: 768px)', lg: '(min-width: 992px)' } as const

function subscribeMq(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }
}

function useMinWidth(query: string): boolean {
  return useSyncExternalStore(
    subscribeMq(query),
    () => window.matchMedia(query).matches,
    () => false // SSR: base-Wert, Client korrigiert nach der Hydration
  )
}

export function useBreakpointValue<T>(values: { base: T; sm?: T; md?: T; lg?: T }): T {
  const sm = useMinWidth(BP_QUERIES.sm)
  const md = useMinWidth(BP_QUERIES.md)
  const lg = useMinWidth(BP_QUERIES.lg)
  if (lg && values.lg !== undefined) return values.lg
  if (md && values.md !== undefined) return values.md
  if (sm && values.sm !== undefined) return values.sm
  return values.base
}

/* ------------------------------ Zusammengesetzte Bausteine ------------------------------ */

/** Zentrierte Seitenspalte mit max. Breite (responsive Paddings via .kit-page). */
export function Page({ children }: { children: ReactNode }) {
  return <div className="kit-box kit-page">{children}</div>
}

/** Karte mit Rahmen (responsive Padding via .kit-card), gleitet beim Erscheinen ein. */
export function AppCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="kit-box kit-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <Heading size="lg" color="$primary600" mb="$2.5">
      {children}
    </Heading>
  )
}

export function Muted({ children, mt }: { children: ReactNode; mt?: string }) {
  return (
    <Text size="sm" color="$textLight500" mt={mt}>
      {children}
    </Text>
  )
}

/** Kleine Pille über einer Aufgabe. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <Box alignSelf="flex-start" bg="$primary50" borderRadius="$full" px="$3" py="$0.5" mb="$2">
      <Text size="xs" fontWeight="$bold" color="$primary700">
        {children}
      </Text>
    </Box>
  )
}

/** Klickbare Kachel im Hauptmenü/Auswahlbildschirm. Responsive: volle Breite auf dem
    Handy, Mehrspalten-Grid ab Tablet-Breite (via .kit-tile). */
export function Tile({ onPress, disabled, children }: { onPress?: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <motion.div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className="kit-pressable kit-tile"
      style={{ opacity: disabled ? 0.6 : 1 }}
      onClick={disabled ? undefined : onPress}
      onKeyDown={(e) => {
        if (disabled || !onPress) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPress()
        }
      }}
      whileHover={disabled ? undefined : { y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Box bg="$backgroundLight0" borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" flex={1}>
        {children}
      </Box>
    </motion.div>
  )
}

/** Container für ein Raster aus <Tile>s. Der gap regelt die Abstände zwischen den
    Kacheln; mb sorgt für Luft zu dem, was nach dem Raster kommt. */
export function TileGrid({ children }: { children: ReactNode }) {
  return (
    <HStack flexWrap="wrap" gap="$3" alignItems="stretch" mb="$4">
      {children}
    </HStack>
  )
}

export function TileEmoji({ children }: { children: ReactNode }) {
  return <Text fontSize={28}>{children}</Text>
}

export function TileTitle({ children }: { children: ReactNode }) {
  return (
    <Heading size="sm" color="$primary600" mt="$1.5" mb="$1">
      {children}
    </Heading>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'gold' | 'danger'

const BTN_STYLES: Record<BtnVariant, CSSProperties> = {
  primary: { backgroundColor: COLORS.$primary600, color: COLORS.$white },
  secondary: { backgroundColor: COLORS.$backgroundLight0, color: COLORS.$primary600, border: `2px solid ${COLORS.$primary600}` },
  gold: { backgroundColor: COLORS.$yellow400, color: COLORS.$yellow900 },
  danger: { backgroundColor: COLORS.$error600, color: COLORS.$white },
}

/** Haupt-Button (primary/secondary/gold/danger, optional klein / mobil volle Breite). */
export function Btn({
  children, onPress, variant = 'primary', small = false, disabled = false, fullWidthOnMobile = false,
}: {
  children: ReactNode
  onPress?: () => void
  variant?: BtnVariant
  small?: boolean
  disabled?: boolean
  fullWidthOnMobile?: boolean
}) {
  return (
    <motion.button
      type="button"
      className={`kit-btn${fullWidthOnMobile ? ' kit-btn-fullmobile' : ''}`}
      style={{
        ...BTN_STYLES[variant],
        padding: small ? '7px 14px' : '10px 20px',
        fontSize: small ? 14 : 16,
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={onPress}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.button>
  )
}

/** Zurück-Link über einer Ansicht. */
export function BackLink({ onPress, children = '← zurück' }: { onPress: () => void; children?: ReactNode }) {
  return (
    <Pressable onPress={onPress} mb="$3.5">
      <Text color="$primary600" fontWeight="$semibold" size="sm">
        {children}
      </Text>
    </Pressable>
  )
}

export function FootActions({ children }: { children: ReactNode }) {
  return (
    <HStack flexWrap="wrap" gap="$2.5" mt="$4.5" alignItems="center">
      {children}
    </HStack>
  )
}

export function SituationBox({ children }: { children: ReactNode }) {
  return (
    <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3.5" my="$3">
      <Text fontWeight="$medium">{children}</Text>
    </Box>
  )
}

/** Lesetext-Block. */
export function ReadingBox({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Box
      bg="$backgroundLight50"
      borderWidth="$1"
      borderColor="$borderLight200"
      borderLeftWidth="$4"
      borderLeftColor="$primary600"
      borderRadius="$md"
      p="$4"
      my="$3"
    >
      {title ? (
        <Heading size="sm" mb="$1.5">
          {title}
        </Heading>
      ) : null}
      <Text size="md" sx={{ whiteSpace: 'pre-line' }}>
        {children}
      </Text>
    </Box>
  )
}

/** Feedback nach einer Antwort (ok/falsch/nicht beantwortet), federt beim Erscheinen ein. */
export function Feedback({ ok, unanswered, text }: { ok: boolean; unanswered: boolean; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <FeedbackBox ok={ok} unanswered={unanswered} text={text} />
    </motion.div>
  )
}

function FeedbackBox({ ok, unanswered, text }: { ok: boolean; unanswered: boolean; text: string }) {
  return (
    <Box
      bg={unanswered ? '$backgroundLight50' : ok ? '$success50' : '$error50'}
      borderWidth="$1"
      borderColor={unanswered ? '$borderLight200' : ok ? '$success300' : '$error300'}
      borderRadius="$md"
      p="$3.5"
      mt="$3"
    >
      <Text color={unanswered ? '$textLight600' : ok ? '$success800' : '$error800'} size="sm">
        {unanswered ? '⚪ Nicht beantwortet. ' : ok ? '✅ Richtig! ' : '❌ Leider falsch. '}
        {text}
      </Text>
    </Box>
  )
}

/** Auswahlkarte für Anzeigen/Überschriften (a/b/c). */
export function ChoiceCard({
  letter, selected, state, disabled, onPress, children,
}: {
  letter: string
  selected: boolean
  state: 'none' | 'correct' | 'wrong'
  disabled: boolean
  onPress: () => void
  children: ReactNode
}) {
  const bg = state === 'correct' ? '$success50' : state === 'wrong' ? '$error50' : selected ? '$primary50' : '$backgroundLight50'
  const border = state === 'correct' ? '$success400' : state === 'wrong' ? '$error400' : selected ? '$primary600' : '$borderLight200'
  return (
    <Pressable onPress={disabled ? undefined : onPress} mb="$2.5" w="$full">
      <HStack bg={bg} borderWidth="$2" borderColor={border} borderRadius="$lg" p="$3.5" gap="$3" alignItems="flex-start">
        <Box
          bg="$backgroundLight0"
          borderWidth="$1"
          borderColor="$borderLight900"
          borderRadius="$sm"
          minWidth={30}
          h={30}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontWeight="$bold">{letter}</Text>
        </Box>
        <VStack flex={1}>{children}</VStack>
      </HStack>
    </Pressable>
  )
}

export function ScoreBox({ n, label }: { n: number | string; label: string }) {
  return (
    <Box flex={1} minWidth={130} bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$lg" p="$3.5" alignItems="center">
      <Text size="2xl" fontWeight="$extrabold" color="$primary600">
        {n}
      </Text>
      <Muted>{label}</Muted>
    </Box>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <Box bg="$primary50" borderRadius="$full" px="$3" py="$1" mr="$1.5" mb="$1.5" sx={{ display: 'inline-flex' }}>
      <Text size="sm" color="$primary700">
        {children}
      </Text>
    </Box>
  )
}

export function PillInfo({ children }: { children: ReactNode }) {
  return <Muted mt="$0">{children}</Muted>
}

/** Aufklappbarer Bereich (z. B. Musterlösungen): Radix Collapsible für die
    Zugänglichkeit, Motion für die sanfte Höhen-Animation. */
export function Reveal({ label, children }: { label: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="kit-reveal-trigger">
        <motion.span
          className="kit-reveal-arrow"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18 }}
        >
          ▶
        </motion.span>
        {label}
      </Collapsible.Trigger>
      <AnimatePresence initial={false}>
        {open && (
          <Collapsible.Content asChild forceMount>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              {children}
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible.Root>
  )
}

/** Fortschrittsbalken (0-100), animiert die Breite. */
export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <Progress.Root className="kit-progress-root" value={clamped}>
      <Progress.Indicator asChild>
        <motion.div
          className="kit-progress-bar"
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
        />
      </Progress.Indicator>
    </Progress.Root>
  )
}

/** Bestätigungs-Dialog (ersetzt window.confirm) auf Radix AlertDialog-Basis. */
export function ConfirmDialog({
  open, onOpenChange, title, description, cancelLabel, confirmLabel, onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  cancelLabel: string
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="kit-dialog-overlay" />
        <AlertDialog.Content className="kit-dialog-content">
          <AlertDialog.Title className="kit-dialog-title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="kit-dialog-desc">{description}</AlertDialog.Description>
          <div className="kit-dialog-actions">
            <AlertDialog.Cancel className="kit-btn kit-btn--secondary">{cancelLabel}</AlertDialog.Cancel>
            <AlertDialog.Action className="kit-btn kit-btn--danger" onClick={onConfirm}>
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
