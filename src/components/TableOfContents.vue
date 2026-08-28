<script setup lang="ts">
import KeyCap from './KeyCap.vue'
import type { LearningModule } from '../types'
import { useProgress } from '../composables/useProgress'

const props = defineProps<{
  modules: LearningModule[]
  selectedIndex?: number
}>()

const emit = defineEmits<{
  (e: 'selectModule', moduleId: string, view: 'flashcard' | 'list'): void
  (e: 'updateIndex', index: number): void
}>()

function getModuleStats(moduleId: string, count: number) {
  const { getStats } = useProgress(moduleId)
  return getStats(count)
}
</script>

<template>
  <div class="toc-container">
    <header class="toc-header">
      <h1 class="toc-title">Table of Contents</h1>
      <div class="toc-meta">
        <a
          href="https://github.com/akashkncse"
          target="_blank"
          rel="noopener noreferrer"
          class="github-author-link"
          title="GitHub @akashkncse"
        >
          <svg class="github-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
          </svg>
          <span class="github-handle">akashkncse</span>
          <span class="external-arrow">↗</span>
        </a>
      </div>
    </header>

    <div class="toc-section">
      <div class="section-header">
        <span class="section-tag">Modules ({{ modules.length }})</span>
        <div class="section-hint">
          <span>Press</span>
          <KeyCap k="1" size="sm" />
          <span>-</span>
          <KeyCap :k="String(modules.length)" size="sm" />
          <span>or</span>
          <KeyCap k="Enter" size="sm" />
          <span>to study</span>
        </div>
      </div>

      <div class="modules-grid">
        <div
          v-for="(mod, idx) in modules"
          :key="mod.id"
          class="module-card"
          :class="{ 'is-selected': selectedIndex === idx }"
          @click="emit('selectModule', mod.id, 'flashcard')"
          @mouseenter="emit('updateIndex', idx)"
        >
          <div class="card-top">
            <div class="module-number-pill">
              <span class="mod-idx">0{{ idx + 1 }}</span>
              <KeyCap :k="String(idx + 1)" size="sm" />
            </div>
            <div class="module-chips">
              <span class="category-pill">{{ mod.category }}</span>
              <span class="count-pill">{{ mod.itemCount }} words</span>
            </div>
          </div>

          <div class="card-main">
            <h2 class="module-title">{{ mod.title }}</h2>
          </div>

          <!-- Module Progress -->
          <div class="card-progress">
            <div class="progress-info">
              <span class="progress-label">Mastery</span>
              <span class="progress-stat">
                {{ getModuleStats(mod.id, mod.itemCount).masteredCount }} / {{ mod.itemCount }}
                ({{ getModuleStats(mod.id, mod.itemCount).percentage }}%)
              </span>
            </div>
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                :style="{ width: `${getModuleStats(mod.id, mod.itemCount).percentage}%` }"
              ></div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card-actions" @click.stop>
            <button
              class="card-action-primary"
              @click="emit('selectModule', mod.id, 'flashcard')"
            >
              <span>Flashcards</span>
              <KeyCap k="Space" size="sm" />
            </button>
            <button
              class="card-action-secondary"
              @click="emit('selectModule', mod.id, 'list')"
              title="Browse list view"
            >
              <span>List</span>
              <KeyCap k="L" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Minimalist Footer Tip -->
    <footer class="toc-footer">
      <div class="keyboard-guide-bar">
        <div class="guide-item">
          <KeyCap k="1-6" size="sm" />
          <span>Quick Launch</span>
        </div>
        <div class="guide-item">
          <KeyCap k="J" size="sm" />
          <KeyCap k="K" size="sm" />
          <span>Select Module</span>
        </div>
        <div class="guide-item">
          <KeyCap k="Space" size="sm" />
          <span>Flip Card</span>
        </div>
        <div class="guide-item">
          <KeyCap k="P" size="sm" />
          <span>Hindi Audio</span>
        </div>
        <div class="guide-item">
          <KeyCap k="?" size="sm" />
          <span>All Shortcuts</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.toc-container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.toc-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toc-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0;
}

.toc-meta {
  display: flex;
  align-items: center;
}

.github-author-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: none;
  padding: 0.3rem 0.65rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.15s ease;
  width: fit-content;
}

.github-author-link:hover {
  color: var(--text-primary);
  border-color: var(--border-color-strong);
  background: var(--bg-surface-2);
}

.github-icon {
  width: 14px;
  height: 14px;
}

.github-handle {
  font-weight: 500;
}

.external-arrow {
  font-size: 0.75rem;
  color: var(--text-faint);
}

.toc-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.section-tag {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

.section-hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 1.25rem;
}

.module-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.module-card:hover,
.module-card.is-selected {
  border-color: var(--border-color-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.module-number-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mod-idx {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-faint);
}

.module-chips {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.category-pill,
.count-pill {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-2);
  color: var(--text-muted);
}

.card-main {
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0;
}

.module-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.card-progress {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.progress-label {
  color: var(--text-muted);
}

.progress-stat {
  color: var(--text-primary);
  font-weight: 500;
}

.progress-bar-track {
  width: 100%;
  height: 4px;
  background: var(--bg-surface-2);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.card-action-primary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  background: var(--text-primary);
  color: var(--bg-primary);
  border: 1px solid var(--text-primary);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.card-action-primary:hover {
  opacity: 0.9;
}

.card-action-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
  background: var(--bg-surface-2);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s;
}

.card-action-secondary:hover {
  border-color: var(--border-color-strong);
}

.toc-footer {
  padding: 1.5rem;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.keyboard-guide-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

@media (max-width: 640px) {
  .toc-container {
    padding: 1.5rem 1rem 3rem;
    gap: 2rem;
  }
  .modules-grid {
    grid-template-columns: 1fr;
  }
  .card-actions {
    flex-direction: column;
  }
  .card-action-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
