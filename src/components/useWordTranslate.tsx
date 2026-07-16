/* Wörterbuch: Doppelklick (Desktop) oder Antippen-und-Halten (Handy) auf ein Wort in
   einem Lesetext holt per Gemini eine EN/TR-Übersetzung und zeigt sie in einer kleinen,
   schwebenden Karte an. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { translateWord } from '../ai/translateWord'
import { Box, HStack, Pressable, Text, Muted } from './ui/kit'

interface PopupState {
  word: string
  x: number
  y: number
  status: 'loading' | 'done' | 'error'
  base?: string
  en?: string
  tr?: string
  error?: string
}

// Satzzeichen/Anführungszeichen am Rand des markierten Worts entfernen (Unicode-Buchstaben behalten)
const STRIP_PUNCTUATION_RE = /^[^\p{L}]+|[^\p{L}]+$/gu
const LONG_PRESS_MS = 500

export function useWordTranslate() {
  const [popup, setPopup] = useState<PopupState | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!popup) return
    const onDocClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setPopup(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopup(null)
    }
    document.addEventListener('click', onDocClick, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [popup])

  const lookUp = useCallback((word: string, context: string, x: number, y: number) => {
    const px = Math.min(Math.max(x, 8), window.innerWidth - 260)
    const py = Math.min(Math.max(y, 8), window.innerHeight - 140)
    setPopup({ word, x: px, y: py, status: 'loading' })
    translateWord({ data: { word, context } })
      .then((res) => {
        setPopup((p) => (p && p.word === word ? { ...p, status: 'done', ...res } : p))
      })
      .catch((err: unknown) => {
        setPopup((p) =>
          p && p.word === word
            ? { ...p, status: 'error', error: err instanceof Error ? err.message : 'Übersetzung fehlgeschlagen.' }
            : p
        )
      })
  }, [])

  const wordFromSelection = (target: EventTarget | null): { word: string; context: string } | null => {
    const selection = window.getSelection()
    const raw = selection ? selection.toString() : ''
    if (!raw || /\s/.test(raw)) return null // nur ein einzelnes Wort übersetzen
    const word = raw.replace(STRIP_PUNCTUATION_RE, '')
    if (!word) return null
    const el = target as HTMLElement | null
    const context = (el?.innerText || el?.textContent || '').slice(0, 1500)
    return { word, context }
  }

  // Desktop: Doppelklick markiert automatisch ein Wort (Browser-Standardverhalten).
  const onDoubleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const found = wordFromSelection(e.currentTarget)
    if (!found) return
    lookUp(found.word, found.context, e.clientX, e.clientY)
  }, [lookUp])

  // Handy: Antippen-und-Halten löst `window.getSelection()`-basierte Worterkennung aus,
  // nachdem der Browser die native Wortauswahl (Loupe) gesetzt hat.
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const target = e.currentTarget
    const touch = e.touches[0]
    if (!touch) return
    const x = touch.clientX
    const y = touch.clientY
    longPressTimer.current = setTimeout(() => {
      const found = wordFromSelection(target)
      if (found) lookUp(found.word, found.context, x, y)
    }, LONG_PRESS_MS)
  }, [lookUp])

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const popupNode: ReactNode = popup ? (
    <Box
      ref={popupRef}
      bg="$backgroundLight0"
      borderWidth="$1"
      borderColor="$borderLight200"
      borderRadius="$xl"
      p="$3.5"
      sx={{
        position: 'fixed', top: popup.y, left: popup.x, zIndex: 200, minWidth: 180, maxWidth: 260,
        boxShadow: '0 10px 30px rgba(0,0,0,.18)',
      }}
    >
      <HStack justifyContent="space-between" alignItems="center" mb="$1.5" gap="$2.5">
        <Text fontWeight="$bold" color="$primary600">
          {popup.base ?? popup.word}
        </Text>
        <Pressable onPress={() => setPopup(null)}>
          <Text color="$textLight500">✕</Text>
        </Pressable>
      </HStack>
      {popup.status === 'loading' && <Muted>Übersetze …</Muted>}
      {popup.status === 'error' && <Text color="$error600" size="sm">⚠️ {popup.error}</Text>}
      {popup.status === 'done' && (
        <>
          <Text size="sm" my="$0.5">
            <Text size="xs" fontWeight="$bold" color="$textLight500">EN </Text>
            {popup.en}
          </Text>
          <Text size="sm" my="$0.5">
            <Text size="xs" fontWeight="$bold" color="$textLight500">TR </Text>
            {popup.tr}
          </Text>
        </>
      )}
    </Box>
  ) : null

  return { onDoubleClick, onTouchStart, onTouchEnd: clearLongPress, onTouchMove: clearLongPress, popup: popupNode }
}

/** Wrappt Lesetext-Bereiche: Doppelklick (Desktop) oder Antippen-und-Halten (Handy) auf
    ein Wort zeigt EN/TR-Übersetzung. */
export function TranslateZone({ children }: { children: ReactNode }) {
  const { onDoubleClick, onTouchStart, onTouchEnd, onTouchMove, popup } = useWordTranslate()
  return (
    <Box onDoubleClick={onDoubleClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchMove={onTouchMove}>
      {children}
      {popup}
    </Box>
  )
}
