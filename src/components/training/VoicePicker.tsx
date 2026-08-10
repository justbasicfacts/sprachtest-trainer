/* Zeigt an, welche deutsche Stimme gerade benutzt wird, und lässt sie wechseln.

   Der Grund: Chrome führt neben den lokalen macOS-/Windows-Stimmen auch
   Online-Stimmen von Google. Klingt eine Stimme falsch oder bleibt stumm, ist
   der Wechsel die schnellste Lösung - und man sieht sofort, ob überhaupt eine
   deutsche Stimme gefunden wurde. */
import type { useSpeech } from '../../hooks/useSpeech'
import { Box, HStack, Text, Muted } from '../ui/kit'

export function VoicePicker({ speech }: { speech: ReturnType<typeof useSpeech> }) {
  if (speech.germanVoices.length === 0) return null

  return (
    <HStack gap="$2" alignItems="center" flexWrap="wrap" mt="$2">
      <Muted>Stimme:</Muted>
      {speech.germanVoices.length === 1 ? (
        <Text size="sm">{speech.voiceName}</Text>
      ) : (
        <select
          value={speech.voice?.voiceURI ?? ''}
          onChange={(e) => speech.selectVoice(e.target.value)}
          style={{
            border: '1.5px solid #DBDBDB', borderRadius: 8, padding: '5px 8px',
            fontSize: 14, fontFamily: 'inherit', maxWidth: '100%',
          }}
        >
          {speech.germanVoices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang}){v.localService ? '' : ' · online'}
            </option>
          ))}
        </select>
      )}
      <Box>
        <Text size="2xs" color="$primary600" onPress={() => void speech.speak('Guten Tag! So klingt diese Stimme.')}>
          🔊 testen
        </Text>
      </Box>
    </HStack>
  )
}
