export interface Student {
  id: string
  name: string
  examCode: string
  section: string
  studyType: string
  birthYear: string
  birthDate: string
  imageUrl: string
  submissionDate: string
  submissionTime: string
  imageAnalysis: {
    headPosition: boolean
    eyesOpen: boolean
    glasses: boolean
    whiteBackground: boolean
    goodLighting: boolean
  }
}

export interface StudentFilters {
  searchTerm: string
  section: string
  studyType: string
  sortBy: 'name' | 'section' | 'studyType' | 'submissionDate'
  sortOrder: 'asc' | 'desc'
}