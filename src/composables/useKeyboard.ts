import { onMounted, onUnmounted } from 'vue'

export interface KeyBinding {
  keys: string[]
  description: string
  action: (e: KeyboardEvent) => void
  preventDefault?: boolean
  category?: 'Navigation' | 'Actions' | 'Views' | 'General'
}

export function useKeyboard(bindings: () => KeyBinding[]) {
  function handleKeyDown(event: KeyboardEvent) {
    // Skip if user is typing in an input, textarea, or contentEditable element
    const target = event.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      if (event.key === 'Escape') {
        target.blur()
      }
      return
    }

    const currentBindings = bindings()
    const pressedKey = event.key

    for (const binding of currentBindings) {
      const match = binding.keys.some(
        k => k.toLowerCase() === pressedKey.toLowerCase() || k === pressedKey
      )

      if (match) {
        if (binding.preventDefault !== false) {
          event.preventDefault()
        }
        binding.action(event)
        return
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
