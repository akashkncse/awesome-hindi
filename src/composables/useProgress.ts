import { ref, watch } from 'vue'

const STORAGE_KEY = 'awesome_hindi_progress_v1'

interface ProgressData {
  [moduleId: string]: {
    mastered: number[]
    starred: number[]
    lastIndex: number
  }
}

const progressState = ref<ProgressData>({})

// Initialize from localStorage
try {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    progressState.value = JSON.parse(saved)
  }
} catch (e) {
  console.warn('Could not read progress from localStorage', e)
}

watch(
  progressState,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      console.warn('Could not persist progress to localStorage', e)
    }
  },
  { deep: true }
)

export function useProgress(moduleId: string) {
  if (!progressState.value[moduleId]) {
    progressState.value[moduleId] = {
      mastered: [],
      starred: [],
      lastIndex: 0
    }
  }

  const moduleProgress = progressState.value[moduleId]

  function isMastered(id: number): boolean {
    return moduleProgress.mastered.includes(id)
  }

  function toggleMastered(id: number) {
    const idx = moduleProgress.mastered.indexOf(id)
    if (idx >= 0) {
      moduleProgress.mastered.splice(idx, 1)
    } else {
      moduleProgress.mastered.push(id)
    }
  }

  function isStarred(id: number): boolean {
    return moduleProgress.starred.includes(id)
  }

  function toggleStarred(id: number) {
    const idx = moduleProgress.starred.indexOf(id)
    if (idx >= 0) {
      moduleProgress.starred.splice(idx, 1)
    } else {
      moduleProgress.starred.push(id)
    }
  }

  function setLastIndex(index: number) {
    moduleProgress.lastIndex = index
  }

  function getStats(totalItems: number) {
    const masteredCount = moduleProgress.mastered.length
    const starredCount = moduleProgress.starred.length
    const percentage = totalItems > 0 ? Math.round((masteredCount / totalItems) * 100) : 0
    return {
      masteredCount,
      starredCount,
      percentage
    }
  }

  function resetProgress() {
    moduleProgress.mastered = []
    moduleProgress.starred = []
    moduleProgress.lastIndex = 0
  }

  return {
    progress: moduleProgress,
    isMastered,
    toggleMastered,
    isStarred,
    toggleStarred,
    setLastIndex,
    getStats,
    resetProgress
  }
}
