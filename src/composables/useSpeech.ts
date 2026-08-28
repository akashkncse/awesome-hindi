import { ref } from 'vue'

const isSpeaking = ref(false)
let currentAudio: HTMLAudioElement | null = null

// Preload voices if browser supports it
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices()
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
}

export function useSpeech() {
  function speakWithAudioFallback(text: string) {
    try {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
      }

      // High-quality native Hindi pronunciation stream
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encodeURIComponent(text)}`
      const audio = new Audio(audioUrl)
      currentAudio = audio

      isSpeaking.value = true

      audio.onended = () => {
        isSpeaking.value = false
      }
      audio.onerror = (err) => {
        console.warn('TTS Audio fallback error:', err)
        isSpeaking.value = false
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback error (requires user interaction first):', err)
          isSpeaking.value = false
        })
      }
    } catch (e) {
      console.warn('Fallback audio failed', e)
      isSpeaking.value = false
    }
  }

  function speak(text: string, lang = 'hi-IN') {
    if (!text) return

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices()
      const hindiVoice = voices.find(
        v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
      )

      // Only use speechSynthesis if an actual Hindi voice pack is installed on the OS
      if (hindiVoice) {
        try {
          window.speechSynthesis.cancel()

          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = lang
          utterance.rate = 0.9
          utterance.voice = hindiVoice

          utterance.onstart = () => {
            isSpeaking.value = true
          }
          utterance.onend = () => {
            isSpeaking.value = false
          }
          utterance.onerror = (e) => {
            console.warn('SpeechSynthesis error, falling back to native audio:', e)
            isSpeaking.value = false
            speakWithAudioFallback(text)
          }

          window.speechSynthesis.speak(utterance)
          return
        } catch (e) {
          console.warn('SpeechSynthesis exception:', e)
        }
      }
    }

    // High quality native fallback if no Hindi voice exists in OS
    speakWithAudioFallback(text)
  }

  return {
    speak,
    isSpeaking
  }
}
