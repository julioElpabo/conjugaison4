import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const updates = []

async function updateForm(id, conjugaison1, conjugaison2 = '', conjugaison3 = '') {
  const [result] = await database.execute(
    'UPDATE verbesconjugues SET conjugaison1 = ?, conjugaison2 = ?, conjugaison3 = ? WHERE id = ?',
    [conjugaison1, conjugaison2, conjugaison3, id],
  )
  updates.push({ type: 'form', id, affected: result.affectedRows, conjugaison1, conjugaison2, conjugaison3 })
}

async function updateFormBy(verb, mode, tense, pronoun, conjugaison1, conjugaison2 = '', conjugaison3 = '') {
  const [result] = await database.execute(
    `UPDATE verbesconjugues vc
     INNER JOIN verbes v ON v.id = vc.verbe_id
     INNER JOIN temps t ON t.id = vc.temp_id
     INNER JOIN modes m ON m.id = t.mode_id
     INNER JOIN personnes p ON p.id = vc.personne_id
     SET vc.conjugaison1 = ?, vc.conjugaison2 = ?, vc.conjugaison3 = ?
     WHERE v.infinitif = ? AND m.name = ? AND t.name = ? AND p.pronom = ?`,
    [conjugaison1, conjugaison2, conjugaison3, verb, mode, tense, pronoun],
  )
  updates.push({ type: 'form-by-key', verb, mode, tense, pronoun, affected: result.affectedRows, conjugaison1, conjugaison2, conjugaison3 })
}

async function accentVerb(id, canonicalInfinitive, matcher, replacement) {
  const [verbs] = await database.execute(
    'SELECT infinitif, `participe_passé` AS participePasse, `participe_présent` AS participePresent, forme_canonique FROM verbes WHERE id = ?',
    [id],
  )
  const verb = verbs[0]
  if (!verb) throw new Error(`Verbe ${id} introuvable`)

  const apply = value => String(value || '').replace(matcher, replacement)
  const [verbResult] = await database.execute(
    'UPDATE verbes SET infinitif = ?, forme_canonique = ?, `participe_passé` = ?, `participe_présent` = ? WHERE id = ?',
    [canonicalInfinitive, canonicalInfinitive, apply(verb.participePasse), apply(verb.participePresent), id],
  )
  updates.push({ type: 'verb', id, affected: verbResult.affectedRows, infinitif: canonicalInfinitive })

  const [forms] = await database.execute(
    'SELECT id, conjugaison1, conjugaison2, conjugaison3 FROM verbesconjugues WHERE verbe_id = ?',
    [id],
  )
  for (const form of forms) {
    const conjugaison1 = apply(form.conjugaison1)
    const conjugaison2 = apply(form.conjugaison2)
    const conjugaison3 = apply(form.conjugaison3)
    const [formResult] = await database.execute(
      'UPDATE verbesconjugues SET conjugaison1 = ?, conjugaison2 = ?, conjugaison3 = ?, verbe_infinitif = ? WHERE id = ?',
      [conjugaison1, conjugaison2, conjugaison3, canonicalInfinitive, form.id],
    )
    if (formResult.affectedRows) updates.push({ type: 'accent-form', id: form.id, affected: formResult.affectedRows })
  }
}

await database.beginTransaction()

try {
  // naître · impératif passé : auxiliaire être, avec variantes d’accord.
  await updateForm(9414, 'sois né', 'sois née')
  await updateForm(9422, 'soyons nés', 'soyons nées')
  await updateForm(9426, 'soyez nés', 'soyez nées')

  // présenter · passé simple · il.
  await updateForm(43349, 'présenta')

  // Verbes pronominaux : pronom réfléchi complet dans les formes stockées.
  await updateForm(43658, "s'habille")
  await updateForm(43659, 'nous nous habillions')
  await updateForm(43660, 'vous vous habilliez')
  await updateForm(43661, "s'habillent")
  await updateForm(44496, 'nous nous endormions')
  await updateForm(44497, 'vous vous endormiez')

  // Accents manquants dans des entrées lexicales et leurs paradigmes.
  await accentVerb(545, 'dénicher', /denich/giu, 'dénich')
  await accentVerb(554, 'déverser', /devers/giu, 'dévers')
  await accentVerb(541, 'défier', /defi/giu, 'défi')
  await accentVerb(546, 'dénommer', /denomm/giu, 'dénomm')
  await accentVerb(534, 'déboucher', /debouch/giu, 'débouch')
  await accentVerb(536, 'décaler', /decal/giu, 'décal')
  await accentVerb(538, 'découper', /decoup/giu, 'découp')
  await accentVerb(523, 'considérer', /consider/giu, 'considér')
  await accentVerb(539, 'découpler', /decoupl/giu, 'découpl')
  await accentVerb(544, 'démarrer', /demarr/giu, 'démarr')
  await accentVerb(551, 'détacher', /detach/giu, 'détach')
  await accentVerb(543, 'déjeuner', /dejeun/giu, 'déjeun')
  await accentVerb(547, 'déposer', /depos/giu, 'dépos')
  await accentVerb(548, 'dériver', /deriv/giu, 'dériv')
  await accentVerb(549, 'désactiver', /desactiv/giu, 'désactiv')

  // Formes signalées par la revue IA pédagogique.
  await updateFormBy('forcer', 'indicatif', 'imparfait', 'il', 'forçait')
  await updateFormBy('pousser', 'indicatif', 'futur', 'ils', 'pousseront')
  await updateFormBy('pousser', 'subjonctif', 'présent', 'ils', 'poussent')

  await database.commit()
  console.log(JSON.stringify({ ok: true, updates }, null, 2))
} catch (error) {
  await database.rollback()
  console.error(error)
  process.exitCode = 1
} finally {
  await database.end()
}
