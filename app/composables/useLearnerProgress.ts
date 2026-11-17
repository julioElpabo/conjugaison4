import { compactLearnerQuestion } from '~~/shared/utils/learner-question-snapshot'
import type {
  ExerciseAttempt,
  ExerciseQuestion,
  LearnerChallengeSnapshot,
  LearnerExerciseTrackingContext,
} from '~~/shared/types/conjugation'

let recordingQueue: Promise<boolean> = Promise.resolve(true)

function progressIdentifier(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.()
  return `${prefix}-${uuid || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`}`
}

export function createLearnerTrackingContext(input: {
  challengeLabel: string
  challenge: LearnerChallengeSnapshot
  presentation: 'classic' | 'chat'
  challengeFingerprint?: string
  isReview?: boolean
}): LearnerExerciseTrackingContext {
  return {
    ...input,
    runId: progressIdentifier('run'),
  }
}

export function useLearnerProgress() {
  const { user, clearUser } = useLearnerAuth()

  function recordQuestionPlan(
    context: LearnerExerciseTrackingContext | undefined,
    questions: ExerciseQuestion[],
  ) {
    if (!context || !user.value || !questions.length) return Promise.resolve(false)
    const task = async () => {
      try {
        await $fetch('/api/learner/activity/plan', {
          method: 'POST',
          credentials: 'same-origin',
          body: {
            ...context,
            questions: questions.map(compactLearnerQuestion),
          },
        })
        return true
      }
      catch (error) {
        const status = (error as { statusCode?: number, response?: { status?: number } })?.statusCode
          ?? (error as { response?: { status?: number } })?.response?.status
        if (status === 401) clearUser()
        console.error('[learner] Plan de questions non enregistré.', error)
        return false
      }
    }
    recordingQueue = recordingQueue.then(task, task)
    return recordingQueue
  }

  function recordAttempt(
    context: LearnerExerciseTrackingContext | undefined,
    attempt: ExerciseAttempt,
    questionIndex: number,
  ) {
    if (!context || !user.value) return Promise.resolve(false)
    const task = async () => {
      try {
        await $fetch('/api/learner/activity/attempt', {
          method: 'POST',
          credentials: 'same-origin',
          body: {
            attemptId: progressIdentifier('attempt'),
            ...context,
            questionIndex: questionIndex + (context.questionIndexOffset || 0),
            attemptNumber: attempt.attemptNumber || 1,
            question: compactLearnerQuestion(attempt.question),
            answer: attempt.answer,
            correct: attempt.status === 'correct' && !attempt.answerWasHeard,
          },
        })
        return true
      }
      catch (error) {
        const status = (error as { statusCode?: number, response?: { status?: number } })?.statusCode
          ?? (error as { response?: { status?: number } })?.response?.status
        if (status === 401) clearUser()
        console.error('[learner] Tentative non enregistrée.', error)
        return false
      }
    }
    recordingQueue = recordingQueue.then(task, task)
    return recordingQueue
  }

  return {
    recordQuestionPlan,
    recordAttempt,
    flushProgress: () => recordingQueue,
  }
}
