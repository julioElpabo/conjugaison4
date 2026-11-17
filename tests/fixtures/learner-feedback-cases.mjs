const simple = {
  titre: 'raccrocher', infinitif: 'raccrocher', consigne: 'il | raccrocher | présent',
  mode: 'indicatif', temps: 'présent', pronom: 'il', personId: 6,
  reponses: ['il raccroche'], reponsesPourCorrige: ['il raccroche'],
}
export const learnerFeedbackCases = [
  { name: 'lettre manquante', question: simple, answer: 'il racroche', codes: ['input.close_form'] },
  { name: 'pronom mal recopié', question: simple, answer: 'i raccroche', codes: ['person.other_form'] },
  { name: 'mauvais pronom, bon verbe', question: simple, answer: 'nous raccroche', codes: ['person.other_form'] },
  { name: 'vraie terminaison', question: simple, answer: 'il raccroch', codes: ['morphology.ending'] },
  { name: 'participe, pas accord', question: { ...simple, isCompound: true, temps: 'passé composé', pastParticiple: 'pris', reponses: ['il a pris'], reponsesPourCorrige: ['il a pris'] }, answer: 'il a prie', codes: ['compound.participle_form'] },
  { name: 'vrai accord', question: { ...simple, isCompound: true, temps: 'passé composé', pastParticiple: 'pris', reponses: ['il a pris'], reponsesPourCorrige: ['il a pris'] }, answer: 'il a prises', codes: ['agreement.avoir_unwarranted'] },
  { name: 'complément, pas personne', question: { ...simple, infinitif: 'manger', complement: 'les marrons', complementPosition: 'after', complementFunction: 'cod', reponses: ['il mange les marrons'], reponsesPourCorrige: ['il mange les marrons'] }, answer: 'il mange les marront', codes: ['orthography.copied_complement'] },
  { name: 'deux diagnostics', question: { ...simple, infinitif: 'entrer', pronom: 'je', personId: 4, isCompound: true, temps: 'passé composé', pastParticiple: 'entré', reponses: ['je suis entré'], reponsesPourCorrige: ['je suis entré'], conjugationConfusions: [{ mode: 'indicatif', tense: 'futur antérieur', answers: ['je serai entré', 'je serai entrée'] }] }, answer: 'je serai entrée', codes: ['task.wrong_tense', 'agreement.subject'] },
  { name: 'Moser : élision', question: { ...simple, infinitif: 'croire', pronom: 'je', personId: 4, isCompound: true, temps: 'passé composé', reponses: ['j’ai cru'], reponsesPourCorrige: ['j’ai cru'] }, answer: 'je ai cru', codes: ['orthography.punctuation'], orthographyIssueKind: 'elision' },
  { name: 'Moser : auxiliaire et participe collés', question: { ...simple, infinitif: 'courir', isCompound: true, temps: 'passé composé', reponses: ['il a couru'], reponsesPourCorrige: ['il a couru'] }, answer: 'il acouru', codes: ['orthography.punctuation'], orthographyIssueKind: 'word-spacing' },
  { name: 'Moser : on a parlé', question: { ...simple, infinitif: 'parler', pronom: 'on', isCompound: true, temps: 'passé composé', reponses: ['on a parlé'], reponsesPourCorrige: ['on a parlé'] }, answer: 'on aparlé', codes: ['orthography.punctuation'], orthographyIssueKind: 'word-spacing' },
]
