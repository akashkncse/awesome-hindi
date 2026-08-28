export interface VocabItem {
  id: number
  hindi: string
  english: string
  transliteration?: string
  tags?: string[]
}

export interface LearningModule {
  id: string
  title: string
  devanagariTitle: string
  description: string
  icon: string
  category: string
  itemCount: number
  items: VocabItem[]
}

export type ViewMode = 'toc' | 'flashcard' | 'list'

export interface StudyProgress {
  masteredIds: number[]
  starredIds: number[]
  lastViewedId?: number
}
