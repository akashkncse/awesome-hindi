<script setup lang="ts">
import KeyCap from './KeyCap.vue'
import type { ViewMode, LearningModule } from '../types'

defineProps<{
  currentView: ViewMode
  currentModule?: LearningModule
  masteredCount: number
  totalCount: number
}>()

const emit = defineEmits<{
  (e: 'navigate', view: ViewMode, moduleId?: string): void
  (e: 'openShortcuts'): void
}>()
</script>

<template>
  <header class="navbar">
    <div class="nav-container">
      <div class="nav-left">
        <button
          class="nav-logo-btn"
          @click="emit('navigate', 'toc')"
          title="Back to Table of Contents (Esc)"
        >
          <span class="logo-accent">अ</span>
          <span class="logo-text">awesome-hindi</span>
        </button>

        <div v-if="currentModule && currentView !== 'toc'" class="nav-breadcrumbs">
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-module">{{ currentModule.title }}</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-view">{{ currentView === 'flashcard' ? 'Flashcards' : 'List' }}</span>
        </div>
      </div>

      <div class="nav-right">
        <!-- View Switcher (when in a module) -->
        <div v-if="currentView !== 'toc'" class="view-switch-group">
          <button
            class="view-btn"
            :class="{ active: currentView === 'flashcard' }"
            @click="emit('navigate', 'flashcard')"
            title="Switch to Flashcards (V)"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <line x1="7" y1="9" x2="17" y2="9"/>
              <line x1="7" y1="13" x2="13" y2="13"/>
            </svg>
            <span class="btn-label">Cards</span>
          </button>
          <button
            class="view-btn"
            :class="{ active: currentView === 'list' }"
            @click="emit('navigate', 'list')"
            title="Switch to List View (V)"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span class="btn-label">List</span>
          </button>
          <div class="keycap-hint">
            <KeyCap k="V" size="sm" />
          </div>
        </div>

        <!-- Shortcuts Pill Button -->
        <button
          class="shortcuts-btn"
          @click="emit('openShortcuts')"
          title="Keyboard shortcuts (?)"
        >
          <KeyCap k="?" size="sm" />
          <span class="shortcuts-text">Keys</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  width: 100%;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
}

.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-logo-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-primary);
  transition: opacity 0.15s ease;
}

.nav-logo-btn:hover {
  opacity: 0.8;
}

.logo-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: 4px;
  font-family: var(--font-hindi);
  font-size: 1rem;
  font-weight: 700;
}

.logo-text {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
}

.nav-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.breadcrumb-separator {
  color: var(--text-faint);
}

.breadcrumb-module {
  color: var(--text-muted);
}

.breadcrumb-view {
  color: var(--text-primary);
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.view-switch-group {
  display: flex;
  align-items: center;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  padding: 2px;
  border-radius: 8px;
  gap: 2px;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-btn:hover {
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}

.nav-icon {
  width: 14px;
  height: 14px;
}

.keycap-hint {
  padding-right: 0.35rem;
  display: flex;
  align-items: center;
}

.shortcuts-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.8rem;
  transition: border-color 0.15s;
}

.shortcuts-btn:hover {
  border-color: var(--border-color-strong);
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .btn-label,
  .shortcuts-text,
  .breadcrumb-module {
    display: none;
  }
}
</style>
