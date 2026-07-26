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

function compactQuestion(question: ExerciseQuestion): ExerciseQuestion {
  return {
    titre: question.titre,
    instruction: question.instruction,
    consigne: question.consigne,
    reponses: [...question.reponses],
    reponsesPourCorrige: [...question.reponsesPourCorrige],
    futureSimpleAnswers: question.futureSimpleAnswers
      ? [...question.futureSimpleAnswers]
      : undefined,
    conjugationConfusions: question.conjugationConfusions
      ? question.conjugationConfusions.map(confusion => ({
          tense: confusion.tense,
          mode: confusion.mode,
          answers: [...confusion.answers],
        }))
      : undefined,
    verbeId: question.verbeId,
    tenseId: question.tenseId,
    personId: question.personId,
    infinitif: question.infinitif,
    pronom: question.pronom,
    temps: question.temps,
    mode: question.mode,
    isCompound: question.isCompound,
    radicalReference: question.radicalReference?.paradigmForms?.length
      ? {
          kind: question.radicalReference.kind,
          label: question.radicalReference.label,
          form: question.radicalReference.form,
          removableEnding: question.radicalReference.removableEnding,
          radical: question.radicalReference.radical,
          paradigmForms: question.radicalReference.paradigmForms.map(form => ({ ...form })),
        }
      : undefined,
    complement: question.complement,
    complementPosition: question.complementPosition,
    complementFunction: question.complementFunction,
    saisiePrefixe: question.saisiePrefixe,
    agreementReminder: question.agreementReminder
      ? { ...question.agreementReminder }
      : undefined,
  }
}

export function useLearnerProgress() {
  const { user, clearUser } = useLearnerAuth()

  function recordAttempt(
    context: LearnerExerciseTrackingContext | undefined,
    attempt: ExerciseAttempt,
    questionIndex: number,
    completed: boolean,
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
            questionIndex,
            attemptNumber: attempt.attemptNumber || 1,
            question: compactQuestion(attempt.question),
            answer: attempt.answer,
            correct: attempt.status === 'correct',
            completed,
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
    recordAttempt,
    flushProgress: () => recordingQueue,
  }
}
