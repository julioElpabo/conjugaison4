import { u as useLearnerAuth } from './useLearnerAuth-tqISusbB.mjs';

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
function compactQuestion(question) {
  return {
    titre: question.titre,
    instruction: question.instruction,
    consigne: question.consigne,
    reponses: [...question.reponses],
    reponsesPourCorrige: [...question.reponsesPourCorrige],
    futureSimpleAnswers: question.futureSimpleAnswers ? [...question.futureSimpleAnswers] : void 0,
    conjugationConfusions: question.conjugationConfusions ? question.conjugationConfusions.map((confusion) => ({
      tense: confusion.tense,
      mode: confusion.mode,
      answers: [...confusion.answers]
    })) : void 0,
    verbeId: question.verbeId,
    tenseId: question.tenseId,
    personId: question.personId,
    infinitif: question.infinitif,
    pronom: question.pronom,
    temps: question.temps,
    mode: question.mode,
    isCompound: question.isCompound,
    conjugaison1: question.conjugaison1,
    conjugaison2: question.conjugaison2,
    conjugaison3: question.conjugaison3,
    radicalReference: question.radicalReference?.paradigmForms?.length ? {
      kind: question.radicalReference.kind,
      label: question.radicalReference.label,
      form: question.radicalReference.form,
      removableEnding: question.radicalReference.removableEnding,
      radical: question.radicalReference.radical,
      paradigmForms: question.radicalReference.paradigmForms.map((form) => ({ ...form }))
    } : void 0,
    complement: question.complement,
    complementPosition: question.complementPosition,
    complementFunction: question.complementFunction,
    saisiePrefixe: question.saisiePrefixe,
    agreementReminder: question.agreementReminder ? { ...question.agreementReminder } : void 0,
    literaryCitation: question.literaryCitation ? { ...question.literaryCitation } : void 0
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
            questions: questions.map(compactQuestion)
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
            question: compactQuestion(attempt.question),
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

export { createLearnerTrackingContext as c, useLearnerProgress as u };
//# sourceMappingURL=main-CFD2ahR5.mjs.map
