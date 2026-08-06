import { J as DEFAULT_COMPLEMENT_OPTIONS } from '../nitro/nitro.mjs';

const DEFAULT_SHARED_CHALLENGE_OPTIONS = {
  exerciseKind: "conjugation",
  identificationSource: "selected-verbs",
  literaryRegister: "all",
  pastSimplePronouns: "all",
  inclusivePronouns: false,
  includeOnPronoun: false,
  voiceMode: "active",
  includeComplements: true,
  complementPlacement: "after",
  complementOptions: [...DEFAULT_COMPLEMENT_OPTIONS]
};

export { DEFAULT_SHARED_CHALLENGE_OPTIONS as D };
//# sourceMappingURL=challenge-defaults.mjs.map
