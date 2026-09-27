/* Kompakte Auswahl in der Kopfzeile, mit welchem KI-Anbieter neue Aufgaben und
   Übungen erstellt und evolviert werden (siehe ai/aiProvider.ts). Betrifft nur
   Fragenerstellung/-evolution ("Neue Aufgabe generieren", "Schwierigere Variante
   erzeugen") - Bewertung, Übersetzung, Rollenspiel usw. laufen unverändert über
   Gemini. Die Wahl bleibt in localStorage, gilt also nur für diesen Browser. */
import { useState } from 'react'
import { HStack, Pressable, Text } from './kit'
import { AI_PROVIDERS, getAiProvider, setAiProvider, type AiProvider } from '../../ai/aiProvider'

export function ModelPicker() {
  const [provider, setProvider] = useState<AiProvider>(() => getAiProvider())

  const choose = (p: AiProvider) => {
    setProvider(p)
    setAiProvider(p)
  }

  return (
    <HStack bg="rgba(255,255,255,.15)" borderRadius="$full" p="$0.5" gap="$0.5" alignItems="center">
      {AI_PROVIDERS.map((p) => {
        const active = p.id === provider
        return (
          <Pressable
            key={p.id}
            onPress={() => choose(p.id)}
            bg={active ? '$white' : undefined}
            borderRadius="$full"
            px="$2.5"
            py="$1"
          >
            <Text size="2xs" fontWeight="$semibold" color={active ? '$primary700' : '$white'}>
              {p.label}
            </Text>
          </Pressable>
        )
      })}
    </HStack>
  )
}
