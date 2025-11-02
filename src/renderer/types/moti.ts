export type Goal = {
  id: string
  text: string
  createdAt: number
  completedAt?: number
}

export type Task = {
  id: string
  goalId: string
  text: string
  estimatedMinutes: number
  attempts: number
  createdAt: number
  completedAt?: number
  skippedAt?: number
}

export type TaskResult = {
  completed: boolean
  actualMinutesSpent?: number
  notes?: string
}

export type MotiState = {
  goals: Goal[]
  currentGoalId: string | null
  tasks: Task[]
  currentTaskId: string | null
}
