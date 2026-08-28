<script setup lang="ts">
import KeyCap from './KeyCap.vue'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const shortcuts = [
  {
    category: 'Flashcard Navigation',
    items: [
      { key: 'Space / Enter', desc: 'Flip card / Reveal English translation' },
      { key: 'J / → / L', desc: 'Next verb' },
      { key: 'K / ← / H', desc: 'Previous verb' },
      { key: 'P / A', desc: 'Play Hindi audio pronunciation' },
      { key: 'M', desc: 'Toggle Mastered status' },
      { key: 'S', desc: 'Toggle Star / Bookmark' },
      { key: 'R', desc: 'Shuffle verbs randomly' }
    ]
  },
  {
    category: 'List View Navigation',
    items: [
      { key: '/ or F', desc: 'Focus instant search bar' },
      { key: 'J / ↓', desc: 'Highlight next item' },
      { key: 'K / ↑', desc: 'Highlight previous item' },
      { key: 'Enter', desc: 'Study highlighted word in flashcard mode' },
      { key: 'P', desc: 'Play audio for highlighted word' }
    ]
  },
  {
    category: 'Global & Views',
    items: [
      { key: 'V', desc: 'Toggle Flashcard ↔ List view' },
      { key: 'T / Esc', desc: 'Return to Table of Contents' },
      { key: '?', desc: 'Toggle this keyboard shortcut guide' }
    ]
  }
]
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-backdrop" @click="$emit('close')">
        <div class="modal-window" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <span class="mono-badge">COMMANDS</span>
              <h2>Keyboard Shortcuts</h2>
            </div>
            <button class="close-btn" @click="$emit('close')" title="Close (Esc)">
              <KeyCap k="Esc" size="sm" />
            </button>
          </div>

          <div class="modal-body">
            <div
              v-for="section in shortcuts"
              :key="section.category"
              class="shortcut-section"
            >
              <h3 class="section-title">{{ section.category }}</h3>
              <div class="shortcut-grid">
                <div
                  v-for="item in section.items"
                  :key="item.key"
                  class="shortcut-row"
                >
                  <span class="shortcut-desc">{{ item.desc }}</span>
                  <div class="shortcut-keys">
                    <span class="key-combo">{{ item.key }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <span>Power-user keyboard navigation is active everywhere.</span>
            <button class="modal-action-btn" @click="$emit('close')">
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-window {
  background: var(--bg-surface);
  border: 1px solid var(--border-color-strong);
  border-radius: 12px;
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.mono-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-accent);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin: 0 0 0.75rem 0;
}

.shortcut-grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.6rem;
  background-color: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.88rem;
}

.shortcut-desc {
  color: var(--text-primary);
  font-size: 0.85rem;
}

.key-combo {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.45rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg-surface-2);
}

.modal-action-btn {
  padding: 0.4rem 0.9rem;
  background: var(--text-primary);
  color: var(--bg-primary);
  font-size: 0.82rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
