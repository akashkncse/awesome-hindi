import type { LearningModule } from '../types'
import { verbsData } from './verbs'
import { pronounsData } from './pronouns'
import { commandingVerbsData } from './commandingVerbs'
import { adverbsData } from './adverbs'
import { prepositionsData } from './prepositions'
import { conjunctionsData } from './conjunctions'

export const modulesRegistry: LearningModule[] = [
  {
    id: 'verbs',
    title: 'Essential Verbs',
    devanagariTitle: 'मुख्य क्रियाएँ',
    description: 'The backbone of Hindi sentences: 62 essential action words for everyday communication.',
    icon: '⚡',
    category: 'Actions',
    itemCount: verbsData.length,
    items: verbsData
  },
  {
    id: 'pronouns',
    title: 'Pronouns',
    devanagariTitle: 'सर्वनाम',
    description: 'Master first, second, and third-person pronouns including formal vs. informal distinctions.',
    icon: '👤',
    category: 'Grammar',
    itemCount: pronounsData.length,
    items: pronounsData
  },
  {
    id: 'commanding_verbs',
    title: 'Commands & Imperatives',
    devanagariTitle: 'आज्ञा व निर्देश',
    description: 'Essential directive verbs and immediate phrases for common daily instructions.',
    icon: '🎯',
    category: 'Conversation',
    itemCount: commandingVerbsData.length,
    items: commandingVerbsData
  },
  {
    id: 'adverbs',
    title: 'Adverbs',
    devanagariTitle: 'क्रिया विशेषण',
    description: 'Modifiers of time, place, manner, and intensity (now, here, slowly, always, more).',
    icon: '⏱️',
    category: 'Modifiers',
    itemCount: adverbsData.length,
    items: adverbsData
  },
  {
    id: 'prepositions',
    title: 'Prepositions & Postpositions',
    devanagariTitle: 'संबंधबोधक',
    description: 'Crucial relational markers: in, on, above, behind, between, with, after, and before.',
    icon: '🧭',
    category: 'Grammar',
    itemCount: prepositionsData.length,
    items: prepositionsData
  },
  {
    id: 'conjunctions',
    title: 'Conjunctions & Connectors',
    devanagariTitle: 'समुच्चयबोधक',
    description: 'Sentence linkers and logical connectors: and, but, because, therefore, if, and while.',
    icon: '🔗',
    category: 'Syntax',
    itemCount: conjunctionsData.length,
    items: conjunctionsData
  }
]

export function getModuleById(id: string): LearningModule | undefined {
  return modulesRegistry.find(m => m.id === id)
}
