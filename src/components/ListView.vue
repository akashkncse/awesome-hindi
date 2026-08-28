<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import KeyCap from './KeyCap.vue'
import type { LearningModule, VocabItem } from '../types'
import { useProgress } from '../composables/useProgress'
import { useSpeech } from '../composables/useSpeech'

const props = defineProps<{
  module: LearningModule
}>()

const emit = defineEmits<{
  (e: 'selectWord', itemId: number): void
  (e: 'switchToCards'): void
}>()

const { isMastered, toggleMastered, isStarred, toggleStarred } = useProgress(props.module.id)
const { speak, isSpeaking } = useSpeech()

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const selectedRowIndex = ref(0)
const filterMode = ref<'all' | 'learning' | 'mastered' | 'starred'>('all')

const filteredItems = computed<VocabItem[]>(() => {
  let list = props.module.items

  if (filterMode.value === 'mastered') {
    list = list.filter(item => isMastered(item.id))
  } else if (filterMode.value === 'learning') {
    list = list.filter(item => !isMastered(item.id))
  } else if (filterMode.value === 'starred') {
    list = list.filter(item => isStarred(item.id))
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return list

  return list.filter(
    item =>
      item.english.toLowerCase().includes(query) ||
      item.hindi.toLowerCase().includes(query) ||
      (item.transliteration && item.transliteration.toLowerCase().includes(query)) ||
      String(item.id) === query
  )
})

function focusSearch() {
  searchInputRef.value?.focus()
  searchInputRef.value?.select()
}

function handleRowClick(item: VocabItem) {
  emit('selectWord', item.id)
}

function playRowAudio(item: VocabItem, e?: Event) {
  e?.stopPropagation()
  speak(item.hindi)
}

function toggleRowMastered(item: VocabItem, e?: Event) {
  e?.stopPropagation()
  toggleMastered(item.id)
}

function toggleRowStarred(item: VocabItem, e?: Event) {
  e?.stopPropagation()
  toggleStarred(item.id)
}

function nextRow() {
  if (selectedRowIndex.value < filteredItems.value.length - 1) {
    selectedRowIndex.value++
    scrollToSelected()
  }
}

function prevRow() {
  if (selectedRowIndex.value > 0) {
    selectedRowIndex.value--
    scrollToSelected()
  }
}

function selectCurrentRow() {
  const item = filteredItems.value[selectedRowIndex.value]
  if (item) {
    emit('selectWord', item.id)
  }
}

function playCurrentSelectedAudio() {
  const item = filteredItems.value[selectedRowIndex.value]
  if (item) {
    speak(item.hindi)
  }
}

function scrollToSelected() {
  nextTick(() => {
    const el = document.querySelector('.list-row.is-selected')
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

defineExpose({
  focusSearch,
  nextRow,
  prevRow,
  selectCurrentRow,
  playCurrentSelectedAudio
})
</script>

<template>
  <div class="list-page">
    <!-- List Header & Search Bar -->
    <div class="list-controls-bar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="`Filter ${module.title.toLowerCase()} in English, Hindi, or transliteration...`"
          @keydown.esc="$event.currentTarget && ($event.currentTarget as HTMLInputElement).blur()"
        />
        <div class="search-key-hint">
          <KeyCap k="/" size="sm" />
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: filterMode === 'all' }"
          @click="filterMode = 'all'"
        >
          All ({{ module.items.length }})
        </button>
        <button
          class="filter-tab"
          :class="{ active: filterMode === 'learning' }"
          @click="filterMode = 'learning'"
        >
          Learning
        </button>
        <button
          class="filter-tab"
          :class="{ active: filterMode === 'mastered' }"
          @click="filterMode = 'mastered'"
        >
          Mastered
        </button>
        <button
          class="filter-tab"
          :class="{ active: filterMode === 'starred' }"
          @click="filterMode = 'starred'"
        >
          Starred
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-card">
      <div class="table-header-row">
        <div class="th th-num">#</div>
        <div class="th th-hindi">Hindi</div>
        <div class="th th-trans">Transliteration</div>
        <div class="th th-eng">English Meaning</div>
        <div class="th th-actions">Actions</div>
      </div>

      <div v-if="filteredItems.length === 0" class="empty-state">
        <p>No words found matching "{{ searchQuery }}"</p>
        <button class="clear-search-btn" @click="searchQuery = ''; filterMode = 'all'">
          Clear filters
        </button>
      </div>

      <div class="table-body">
        <div
          v-for="(item, idx) in filteredItems"
          :key="item.id"
          class="list-row"
          :class="{
            'is-selected': selectedRowIndex === idx,
            'is-mastered': isMastered(item.id)
          }"
          @click="handleRowClick(item)"
          @mouseenter="selectedRowIndex = idx"
        >
          <div class="td td-num">
            <span class="row-num">{{ String(item.id).padStart(2, '0') }}</span>
          </div>

          <div class="td td-hindi">
            <span class="hindi-text">{{ item.hindi }}</span>
          </div>

          <div class="td td-trans">
            <span class="trans-text">{{ item.transliteration || '-' }}</span>
          </div>

          <div class="td td-eng">
            <span class="eng-text">{{ item.english }}</span>
          </div>

          <div class="td td-actions" @click.stop>
            <button
              class="row-action-btn"
              :class="{ 'is-speaking': isSpeaking }"
              @click="playRowAudio(item, $event)"
              title="Play pronunciation (P)"
            >
              <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>

            <button
              class="row-action-btn"
              :class="{ 'is-starred': isStarred(item.id) }"
              @click="toggleRowStarred(item, $event)"
              title="Bookmark"
            >
              <svg class="row-icon" viewBox="0 0 24 24" :fill="isStarred(item.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>

            <button
              class="row-action-btn"
              :class="{ 'is-mastered': isMastered(item.id) }"
              @click="toggleRowMastered(item, $event)"
              title="Toggle Mastered"
            >
              <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>

            <button
              class="row-action-btn study-btn"
              @click="handleRowClick(item)"
              title="Study flashcard (Enter)"
            >
              <span>Study</span>
              <span class="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Footer Navigation info -->
    <div class="list-footer-bar">
      <span class="count-summary">Showing {{ filteredItems.length }} of {{ module.items.length }} verbs</span>
      <div class="keyboard-hints">
        <span class="hint-group"><KeyCap k="J" size="sm" /><KeyCap k="K" size="sm" /> <span>navigate</span></span>
        <span class="hint-group"><KeyCap k="Enter" size="sm" /> <span>open flashcard</span></span>
        <span class="hint-group"><KeyCap k="P" size="sm" /> <span>pronounce</span></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.list-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  transition: border-color 0.15s;
}

.search-box:focus-within {
  border-color: var(--border-color-strong);
  box-shadow: var(--shadow-sm);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-faint);
}

.filter-tabs {
  display: flex;
  align-items: center;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  padding: 2px;
  border-radius: 8px;
  gap: 2px;
}

.filter-tab {
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-tab:hover {
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}

.table-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-header-row {
  display: grid;
  grid-template-columns: 48px minmax(130px, 1.3fr) minmax(140px, 1.3fr) minmax(180px, 2fr) 180px;
  gap: 1.5rem;
  padding: 0.85rem 1.5rem;
  background: var(--bg-surface-2);
  border-bottom: 1px solid var(--border-color);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.list-row {
  display: grid;
  grid-template-columns: 48px minmax(130px, 1.3fr) minmax(140px, 1.3fr) minmax(180px, 2fr) 180px;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.list-row:last-child {
  border-bottom: none;
}

.list-row:hover,
.list-row.is-selected {
  background-color: var(--bg-surface-2);
}

.list-row.is-mastered {
  border-left: 3px solid #10b981;
}

.td-num {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-faint);
}

.td-hindi .hindi-text {
  font-family: var(--font-hindi);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-primary);
}

.td-trans .trans-text {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.td-eng .eng-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

.td-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  justify-content: flex-end;
}

.row-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.row-action-btn:hover {
  background: var(--bg-surface);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.row-action-btn.is-starred {
  color: #eab308;
}

.row-action-btn.is-mastered {
  color: #10b981;
}

.study-btn {
  width: auto;
  padding: 0 0.55rem;
  font-size: 0.78rem;
  gap: 0.25rem;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  font-weight: 500;
}

.study-btn:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.row-icon {
  width: 14px;
  height: 14px;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.clear-search-btn {
  padding: 0.4rem 0.85rem;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.8rem;
  cursor: pointer;
}

.list-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.count-summary {
  font-family: var(--font-mono);
}

.keyboard-hints {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.hint-group {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

@media (max-width: 768px) {
  .table-header-row {
    display: none;
  }
  .list-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "hindi actions"
      "trans actions"
      "eng actions";
    gap: 0.35rem;
    padding: 1rem 1.15rem;
  }
  .td-num {
    display: none;
  }
  .td-hindi {
    grid-area: hindi;
    margin-bottom: 0.15rem;
  }
  .td-trans {
    grid-area: trans;
    margin-bottom: 0.25rem;
  }
  .td-eng {
    grid-area: eng;
  }
  .td-actions {
    grid-area: actions;
  }
  .keyboard-hints {
    display: none;
  }
}
</style>
