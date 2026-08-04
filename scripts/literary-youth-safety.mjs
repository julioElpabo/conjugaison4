const RULES = [
  ['violence', /\b(?:assassin\w*|battre|bless\w*|cadavre\w*|combat\w*|coup de fusil|duel\w*|fusil\w*|guillotin\w*|meurtr\w*|pendre|pendu\w*|pistolet\w*|poignard\w*|sang\w*|tortur\w*|tu(?:er|é|ée|és|ées)|violence\w*)\b/iu],
  ['mort ou détresse grave', /\b(?:bourreau\w*|exécut\w*|mourir|meure\w*|mort\w*|remords?|suicid\w*|supplice\w*)\b/iu],
  ['crime ou enfermement', /\b(?:arrestation|arrêté\w*|crime\w*|criminel\w*|prison\w*|tribunal|tribunaux)\b/iu],
  ['sexualité ou relation adulte', /\b(?:adultère\w*|amant\w*|baiser\w*|courtisane\w*|débauch\w*|maîtresse\w*|prostitu\w*)\b/iu],
  ['alcool ou drogue', /\b(?:alcool\w*|cigare\w*|ivre\w*|ivresse|punch|tabac\w*|vin\w*)\b/iu],
  ['insulte forte ou dénigrement', /\b(?:abominable\w*|aveugle\w*|coquin\w*|imbécile\w*|lâche\w*|laid\w*|polisson\w*)\b/iu],
  ['arme ou menace explicite', /\b(?:brûlerait la cervelle|coup fatal|de faim|inondé de plomb)\b/iu],
]

export function literaryYouthSafety(sentence) {
  const reasons = RULES.filter(([, pattern]) => pattern.test(sentence)).map(([reason]) => reason)
  return { suitable: reasons.length === 0, reasons }
}
