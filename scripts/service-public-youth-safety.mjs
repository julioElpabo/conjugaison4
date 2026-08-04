const RULES = [
  ['violence ou maltraitance', /(?:agress(?:ion|é|ée|ions)|attestation d[’']honorabilité|enfant\w* (?:est |serait )?en danger|homicide\w*|maltraitance\w*|protection des jeunes|violences?)/iu],
  ['accident corporel', /(?:accident\w*|fractures?)/iu],
  ['sexualité ou contenu adulte', /(?:contracept\w*|grossesse\w*|interruption volontaire de grossesse|maternité\w*|pornograph\w*|prostitu\w*|relation\w* sexuelle\w*|viol sexuel|viols?\b)/iu],
  ['naissance et parentalité adulte', /(?:carnet de maternité|congé\w* (?:supplémentaire\w* )?de naissance)/iu],
  ['décès ou funérailles', /(?:cimetières?|concession\w* funéraire\w*|décès|défunt\w*|funéra\w*|héritier\w*|mort\w*|successions?|testament\w*)/iu],
  ['alcool, tabac ou drogue', /(?:alcool\w*|cannabis|cigarette\w*|drogue\w*|stupéfiant\w*|tabac\w*)/iu],
  ['arme', /(?:armes?\b|couteau\w*|fusil\w*|pistolet\w*)/iu],
  ['jeux d’argent', /(?:casino\w*|jeu\w* d[’']argent|paris? sportif\w*)/iu],
]

export function servicePublicYouthSafety(articleTitle, sentence) {
  const context = `${articleTitle} ${sentence}`
  const reasons = RULES.filter(([, pattern]) => pattern.test(context)).map(([reason]) => reason)
  return { suitable: reasons.length === 0, reasons }
}
