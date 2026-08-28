<script setup lang="ts">
import { ref, computed } from 'vue'
import KeyCap from './KeyCap.vue'
import type { LearningModule, VocabItem } from '../types'
import { useProgress } from '../composables/useProgress'
import { useSpeech } from '../composables/useSpeech'

const props = defineProps<{
  module: LearningModule
  initialItemId?: number
}>()

const emit = defineEmits<{
  (e: 'switchToList'): void
  (e: 'backToToc'): void
}>()

const { isMastered, toggleMastered, isStarred, toggleStarred, setLastIndex } = useProgress(props.module.id)
const { speak, isSpeaking } = useSpeech()

const items = ref<VocabItem[]>([...props.module.items])
const currentIndex = ref(0)
const isFlipped = ref(false)
const slideDirection = ref<'next' | 'prev'>('next')

// Set initial index if provided
if (props.initialItemId) {
  const foundIdx = items.value.findIndex(i => i.id === props.initialItemId)
  if (foundIdx >= 0) {
    currentIndex.value = foundIdx
  }
}

const currentItem = computed<VocabItem>(() => {
  return items.value[currentIndex.value] || items.value[0]
})

const isCurrentMastered = computed(() => isMastered(currentItem.value.id))
const isCurrentStarred = computed(() => isStarred(currentItem.value.id))

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

function nextCard() {
  if (currentIndex.value < items.value.length - 1) {
    slideDirection.value = 'next'
    currentIndex.value++
    isFlipped.value = false
    setLastIndex(currentIndex.value)
  }
}

function prevCard() {
  if (currentIndex.value > 0) {
    slideDirection.value = 'prev'
    currentIndex.value--
    isFlipped.value = false
    setLastIndex(currentIndex.value)
  }
}

function shuffleDeck() {
  const shuffled = [...items.value]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  items.value = shuffled
  currentIndex.value = 0
  isFlipped.value = false
}

function playAudio() {
  speak(currentItem.value.hindi)
}

function handleToggleMastered() {
  toggleMastered(currentItem.value.id)
}

function handleToggleStarred() {
  toggleStarred(currentItem.value.id)
}

// Touch swipe gestures for mobile
let touchStartX = 0
let touchStartY = 0

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function handleTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const diffX = touchEndX - touchStartX
  const diffY = touchEndY - touchStartY

  // Horizontal swipe has to be larger than vertical drag
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
    if (diffX < 0) {
      nextCard()
    } else {
      prevCard()
    }
  }
}

// Expose actions for parent keyboard router
defineExpose({
  toggleFlip,
  nextCard,
  prevCard,
  playAudio,
  handleToggleMastered,
  handleToggleStarred,
  shuffleDeck
})
</script>

<template>
  <div
    class="flashcard-page"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Top Subbar: Index & Controls -->
    <div class="deck-controls-bar">
      <div class="deck-counter">
        <span class="curr-num">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
        <span class="divider">/</span>
        <span class="total-num">{{ String(items.length).padStart(2, '0') }}</span>
      </div>

      <div class="deck-actions-top">
        <button
          class="icon-toggle-btn"
          :class="{ active: isCurrentStarred }"
          @click="handleToggleStarred"
          title="Star / Bookmark (S)"
        >
          <svg class="icon-svg" viewBox="0 0 24 24" :fill="isCurrentStarred ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span class="btn-tooltip"><KeyCap k="S" size="sm" /></span>
        </button>

        <button
          class="icon-toggle-btn"
          :class="{ mastered: isCurrentMastered }"
          @click="handleToggleMastered"
          title="Mark as Mastered (M)"
        >
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span class="btn-tooltip"><KeyCap k="M" size="sm" /></span>
        </button>

        <button
          class="icon-toggle-btn"
          @click="shuffleDeck"
          title="Shuffle Deck (R)"
        >
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
          <span class="btn-tooltip"><KeyCap k="R" size="sm" /></span>
        </button>
      </div>
    </div>

    <!-- Progress Track -->
    <div class="deck-progress-track">
      <div
        class="deck-progress-fill"
        :style="{ width: `${((currentIndex + 1) / items.length) * 100}%` }"
      ></div>
    </div>

    <!-- Flashcard Stage -->
    <div class="card-stage" @click="toggleFlip">
      <div
        class="flashcard-box"
        :class="{ 'is-flipped': isFlipped, 'is-mastered': isCurrentMastered }"
      >
        <!-- Card Header Badge -->
        <div class="card-inner-top">
          <button
            class="audio-speaker-btn"
            :class="{ 'is-playing': isSpeaking }"
            @click.stop="playAudio"
            title="Listen to pronunciation (P)"
          >
            <svg class="audio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
            <span class="audio-label">Listen</span>
            <KeyCap k="P" size="sm" />
          </button>
        </div>

        <!-- Primary Hindi Word -->
        <div class="card-inner-center">
          <div class="hindi-word-display">
            {{ currentItem.hindi }}
          </div>

          <div v-if="currentItem.transliteration" class="transliteration-text">
            {{ currentItem.transliteration }}
          </div>

          <!-- English Meaning (Flip State) -->
          <div class="meaning-wrapper" :class="{ visible: isFlipped }">
            <div class="meaning-divider"></div>
            <div class="english-meaning">
              {{ currentItem.english }}
            </div>
          </div>
        </div>

        <!-- Card Footer Hint -->
        <div class="card-inner-bottom">
          <div class="flip-prompt">
            <KeyCap k="Space" size="sm" />
            <span>{{ isFlipped ? 'Hide meaning' : 'Reveal meaning' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Controls -->
    <div class="deck-bottom-nav">
      <button
        class="nav-step-btn"
        :disabled="currentIndex === 0"
        @click="prevCard"
        title="Previous (K or Left Arrow)"
      >
        <span class="arrow-symbol">←</span>
        <span>Previous</span>
        <KeyCap k="K" size="sm" />
      </button>

      <div class="center-helper-actions">
        <button
          class="pill-action-btn"
          @click="toggleFlip"
        >
          <span class="btn-text">{{ isFlipped ? 'Hide' : 'Reveal' }}</span>
          <KeyCap k="Space" size="sm" />
        </button>
      </div>

      <button
        class="nav-step-btn"
        :disabled="currentIndex === items.length - 1"
        @click="nextCard"
        title="Next (J or Right Arrow)"
      >
        <KeyCap k="J" size="sm" />
        <span>Next</span>
        <span class="arrow-symbol">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.flashcard-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - 120px);
  justify-content: space-between;
}

.deck-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deck-counter {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.curr-num {
  font-weight: 700;
  color: var(--text-primary);
}

.divider {
  color: var(--text-faint);
}

.deck-actions-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-toggle-btn:hover {
  border-color: var(--border-color-strong);
  color: var(--text-primary);
}

.icon-toggle-btn.active {
  color: #eab308;
  border-color: #eab308;
  background: rgba(234, 179, 8, 0.08);
}

.icon-toggle-btn.mastered {
  color: #10b981;
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.icon-svg {
  width: 16px;
  height: 16px;
}

.deck-progress-track {
  width: 100%;
  height: 3px;
  background: var(--bg-surface-2);
  border-radius: 999px;
  overflow: hidden;
}

.deck-progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.25s ease-out;
}

/* Card Stage */
.card-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 380px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.flashcard-box {
  width: 100%;
  min-height: 380px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  position: relative;
}

@media (hover: hover) {
  .flashcard-box:hover {
    border-color: var(--border-color-strong);
  }
}

.flashcard-box.is-mastered {
  border-left: 4px solid #10b981;
}

.card-inner-top {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.audio-speaker-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .audio-speaker-btn:hover {
    border-color: var(--border-color-strong);
    background: var(--bg-surface);
  }
}

.audio-speaker-btn.is-playing {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.audio-icon {
  width: 14px;
  height: 14px;
}

.card-inner-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 0;
  gap: 0.85rem;
}

.hindi-word-display {
  font-family: var(--font-hindi);
  font-size: clamp(3.25rem, 9vw, 6.5rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  text-rendering: optimizeLegibility;
}

.transliteration-text {
  font-family: var(--font-mono);
  font-size: clamp(1.1rem, 2.5vw, 1.45rem);
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.meaning-wrapper {
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
}

.meaning-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.meaning-divider {
  width: 48px;
  height: 1px;
  background: var(--border-color);
  margin-top: 0.5rem;
}

.english-meaning {
  font-size: clamp(1.35rem, 3.2vw, 2.25rem);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.card-inner-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-prompt {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Bottom Nav */
.deck-bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.nav-step-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-step-btn:hover:not(:disabled) {
  border-color: var(--border-color-strong);
  background: var(--bg-surface-2);
}

.nav-step-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pill-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.65rem 1.15rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.pill-action-btn:hover {
  border-color: var(--border-color-strong);
}

@media (max-width: 640px) {
  .flashcard-page {
    padding: 1rem 0.75rem 2.5rem;
    gap: 1rem;
  }
  .flashcard-box {
    padding: 1.5rem 1rem;
    min-height: 320px;
  }
  .card-inner-center {
    padding: 1.5rem 0;
  }
  .btn-tooltip {
    display: none;
  }
  .center-helper-actions {
    display: none;
  }
  .nav-step-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
