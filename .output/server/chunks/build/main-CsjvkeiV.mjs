import { c as compactLearnerQuestion } from '../_/learner-question-snapshot.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-tqISusbB.mjs';

const AUDIO_READING_ENABLED = false;
const PERSON_SELECTION_ENABLED = true;

let recordingQueue = Promise.resolve(true);
function progressIdentifier(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}-${uuid || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`}`;
}
function createLearnerTrackingContext(input) {
  return {
    ...input,
    runId: progressIdentifier("run")
  };
}
function useLearnerProgress() {
  const { user, clearUser } = useLearnerAuth();
  function recordQuestionPlan(context, questions) {
    if (!context || !user.value || !questions.length) return Promise.resolve(false);
    const task = async () => {
      try {
        await $fetch("/api/learner/activity/plan", {
          method: "POST",
          credentials: "same-origin",
          body: {
            ...context,
            questions: questions.map(compactLearnerQuestion)
          }
        });
        return true;
      } catch (error) {
        const status = error?.statusCode ?? error?.response?.status;
        if (status === 401) clearUser();
        console.error("[learner] Plan de questions non enregistré.", error);
        return false;
      }
    };
    recordingQueue = recordingQueue.then(task, task);
    return recordingQueue;
  }
  function recordAttempt(context, attempt, questionIndex) {
    if (!context || !user.value) return Promise.resolve(false);
    const task = async () => {
      try {
        await $fetch("/api/learner/activity/attempt", {
          method: "POST",
          credentials: "same-origin",
          body: {
            attemptId: progressIdentifier("attempt"),
            ...context,
            questionIndex: questionIndex + (context.questionIndexOffset || 0),
            attemptNumber: attempt.attemptNumber || 1,
            question: compactLearnerQuestion(attempt.question),
            answer: attempt.answer,
            correct: attempt.status === "correct" && !attempt.answerWasHeard
          }
        });
        return true;
      } catch (error) {
        const status = error?.statusCode ?? error?.response?.status;
        if (status === 401) clearUser();
        console.error("[learner] Tentative non enregistrée.", error);
        return false;
      }
    };
    recordingQueue = recordingQueue.then(task, task);
    return recordingQueue;
  }
  return {
    recordQuestionPlan,
    recordAttempt,
    flushProgress: () => recordingQueue
  };
}

export { AUDIO_READING_ENABLED as A, PERSON_SELECTION_ENABLED as P, createLearnerTrackingContext as c, useLearnerProgress as u };
//# sourceMappingURL=main-CsjvkeiV.mjs.map
