<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ViewMode, LearningModule } from './types'
import { modulesRegistry, getModuleById } from './data/modules'
import { useProgress } from './composables/useProgress'
import { useKeyboard, type KeyBinding } from './composables/useKeyboard'
import Navbar from './components/Navbar.vue'
import TableOfContents from './components/TableOfContents.vue'
import FlashcardView from './components/FlashcardView.vue'
import ListView from './components/ListView.vue'
import ShortcutsModal from './components/ShortcutsModal.vue'

// State
const currentView = ref<ViewMode>('toc')
const currentModuleId = ref<string>('verbs')
const selectedItemId = ref<number | undefined>(undefined)
const isShortcutsOpen = ref(false)

// Template references for invoking child component methods from global keyboard shortcuts
const flashcardRef = ref<InstanceType<typeof FlashcardView> | null>(null)
const listViewRef = ref<InstanceType<typeof ListView> | null>(null)

const activeModule = computed<LearningModule>(() => {
  return getModuleById(currentModuleId.value) || modulesRegistry[0]
})

const activeModuleProgress = computed(() => {
  const { getStats } = useProgress(activeModule.value.id)
  return getStats(activeModule.value.itemCount)
})

// Hash-based zero-dependency router
function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const parts = hash.split('/').filter(Boolean)

  if (parts.length === 0) {
    currentView.value = 'toc'
    return
  }

  const [modId, viewOrId, specificId] = parts
  const foundModule = getModuleById(modId)

  if (foundModule) {
    currentModuleId.value = foundModule.id
    if (viewOrId === 'list') {
      currentView.value = 'list'
    } else if (viewOrId === 'card' || !viewOrId) {
      currentView.value = 'flashcard'
      if (specificId) {
        selectedItemId.value = parseInt(specificId, 10) || undefined
      }
    } else {
      currentView.value = 'flashcard'
      selectedItemId.value = parseInt(viewOrId, 10) || undefined
    }
  } else {
    currentView.value = 'toc'
  }
}

function updateHash(view: ViewMode, modId?: string, itemId?: number) {
  if (view === 'toc') {
    window.location.hash = ''
    currentView.value = 'toc'
  } else {
    const mId = modId || currentModuleId.value
    if (view === 'list') {
      window.location.hash = `/${mId}/list`
    } else {
      if (itemId) {
        window.location.hash = `/${mId}/${itemId}`
      } else {
        window.location.hash = `/${mId}`
      }
    }
  }
}

function handleNavigate(view: ViewMode, moduleId?: string) {
  if (moduleId) {
    currentModuleId.value = moduleId
  }
  updateHash(view, moduleId)
}

function handleSelectModule(moduleId: string, view: 'flashcard' | 'list') {
  currentModuleId.value = moduleId
  selectedItemId.value = undefined
  updateHash(view, moduleId)
}

function handleSelectWordFromList(itemId: number) {
  selectedItemId.value = itemId
  updateHash('flashcard', currentModuleId.value, itemId)
}

const tocSelectedIndex = ref(0)

// Global Keyboard bindings
useKeyboard(() => {
  const bindings: KeyBinding[] = [
    {
      keys: ['?'],
      description: 'Toggle shortcuts cheatsheet',
      action: () => {
        isShortcutsOpen.value = !isShortcutsOpen.value
      }
    },
    {
      keys: ['Escape'],
      description: 'Close modal or return to Table of Contents',
      action: () => {
        if (isShortcutsOpen.value) {
          isShortcutsOpen.value = false
        } else if (currentView.value !== 'toc') {
          handleNavigate('toc')
        }
      }
    },
    {
      keys: ['t', 'T'],
      description: 'Return to Table of Contents',
      action: () => {
        handleNavigate('toc')
      }
    }
  ]

  // View specific shortcuts
  if (currentView.value === 'toc') {
    // Number keys 1-9 to jump directly to corresponding module
    for (let i = 0; i < modulesRegistry.length; i++) {
      const numKey = String(i + 1)
      const targetModule = modulesRegistry[i]
      bindings.push({
        keys: [numKey],
        description: `Open ${targetModule.title}`,
        action: () => {
          tocSelectedIndex.value = i
          handleSelectModule(targetModule.id, 'flashcard')
        }
      })
    }

    bindings.push(
      {
        keys: ['j', 'J', 'ArrowDown'],
        description: 'Next module card',
        action: () => {
          if (tocSelectedIndex.value < modulesRegistry.length - 1) {
            tocSelectedIndex.value++
          }
        }
      },
      {
        keys: ['k', 'K', 'ArrowUp'],
        description: 'Previous module card',
        action: () => {
          if (tocSelectedIndex.value > 0) {
            tocSelectedIndex.value--
          }
        }
      },
      {
        keys: ['Enter', ' '],
        description: 'Start highlighted module in Flashcards',
        action: () => {
          const mod = modulesRegistry[tocSelectedIndex.value] || modulesRegistry[0]
          handleSelectModule(mod.id, 'flashcard')
        }
      },
      {
        keys: ['l', 'L'],
        description: 'Open highlighted module in List view',
        action: () => {
          const mod = modulesRegistry[tocSelectedIndex.value] || modulesRegistry[0]
          handleSelectModule(mod.id, 'list')
        }
      }
    )
  } else if (currentView.value === 'flashcard') {
    bindings.push(
      {
        keys: ['v', 'V'],
        description: 'Switch to List view',
        action: () => {
          handleNavigate('list')
        }
      },
      {
        keys: [' ', 'Enter'],
        description: 'Flip flashcard',
        action: () => {
          flashcardRef.value?.toggleFlip()
        }
      },
      {
        keys: ['j', 'J', 'ArrowRight', 'l', 'L'],
        description: 'Next card',
        action: () => {
          flashcardRef.value?.nextCard()
        }
      },
      {
        keys: ['k', 'K', 'ArrowLeft', 'h', 'H'],
        description: 'Previous card',
        action: () => {
          flashcardRef.value?.prevCard()
        }
      },
      {
        keys: ['p', 'P', 'a', 'A'],
        description: 'Play pronunciation',
        action: () => {
          flashcardRef.value?.playAudio()
        }
      },
      {
        keys: ['m', 'M'],
        description: 'Mark as mastered',
        action: () => {
          flashcardRef.value?.handleToggleMastered()
        }
      },
      {
        keys: ['s', 'S'],
        description: 'Bookmark / Star',
        action: () => {
          flashcardRef.value?.handleToggleStarred()
        }
      },
      {
        keys: ['r', 'R'],
        description: 'Shuffle deck',
        action: () => {
          flashcardRef.value?.shuffleDeck()
        }
      }
    )
  } else if (currentView.value === 'list') {
    bindings.push(
      {
        keys: ['v', 'V'],
        description: 'Switch to Flashcards',
        action: () => {
          handleNavigate('flashcard')
        }
      },
      {
        keys: ['/', 'f', 'F'],
        description: 'Focus search',
        action: () => {
          listViewRef.value?.focusSearch()
        }
      },
      {
        keys: ['j', 'J', 'ArrowDown'],
        description: 'Next row',
        action: () => {
          listViewRef.value?.nextRow()
        }
      },
      {
        keys: ['k', 'K', 'ArrowUp'],
        description: 'Previous row',
        action: () => {
          listViewRef.value?.prevRow()
        }
      },
      {
        keys: ['Enter'],
        description: 'Study selected row in flashcard',
        action: () => {
          listViewRef.value?.selectCurrentRow()
        }
      },
      {
        keys: ['p', 'P'],
        description: 'Play pronunciation for selected row',
        action: () => {
          listViewRef.value?.playCurrentSelectedAudio()
        }
      }
    )
  }

  return bindings
})

onMounted(() => {
  parseHash()
  window.addEventListener('hashchange', parseHash)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', parseHash)
})
</script>

<template>
  <div class="app-layout">
    <Navbar
      :current-view="currentView"
      :current-module="activeModule"
      :mastered-count="activeModuleProgress.masteredCount"
      :total-count="activeModule.itemCount"
      @navigate="handleNavigate"
      @open-shortcuts="isShortcutsOpen = true"
    />

    <main class="main-content">
      <Transition name="page-fade" mode="out-in">
        <!-- Table of Contents Landing Page -->
        <TableOfContents
          v-if="currentView === 'toc'"
          :modules="modulesRegistry"
          :selected-index="tocSelectedIndex"
          @select-module="handleSelectModule"
          @update-index="tocSelectedIndex = $event"
        />

        <!-- Flashcard Learning Interface -->
        <FlashcardView
          v-else-if="currentView === 'flashcard'"
          ref="flashcardRef"
          :module="activeModule"
          :initial-item-id="selectedItemId"
          @switch-to-list="handleNavigate('list')"
          @back-to-toc="handleNavigate('toc')"
        />

        <!-- List Browser Interface -->
        <ListView
          v-else-if="currentView === 'list'"
          ref="listViewRef"
          :module="activeModule"
          @select-word="handleSelectWordFromList"
          @switch-to-cards="handleNavigate('flashcard')"
        />
      </Transition>
    </main>

    <ShortcutsModal
      :is-open="isShortcutsOpen"
      @close="isShortcutsOpen = false"
    />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
