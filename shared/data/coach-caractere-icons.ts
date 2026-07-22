export interface CoachCaractereIcon {
  value: string
  label: string
}

export interface CoachCaractereIconGroup {
  label: string
  icons: readonly CoachCaractereIcon[]
}

export const COACH_CARACTERE_ICON_GROUPS: readonly CoachCaractereIconGroup[] = [
  {
    label: 'Attitude',
    icons: [
      { value: '🙂', label: 'Souriant' },
      { value: '😊', label: 'Bienveillant' },
      { value: '🤗', label: 'Chaleureux' },
      { value: '😌', label: 'Serein' },
      { value: '🧘', label: 'Calme' },
      { value: '🌿', label: 'Apaisant' },
      { value: '☀️', label: 'Positif' },
      { value: '🌈', label: 'Optimiste' },
      { value: '🦉', label: 'Sage' },
      { value: '🤝', label: 'Collaboratif' },
      { value: '💙', label: 'Rassurant' },
      { value: '🫶', label: 'Soutenant' },
    ],
  },
  {
    label: 'Méthode',
    icons: [
      { value: '🧭', label: 'Méthodique' },
      { value: '🎯', label: 'Précis' },
      { value: '💡', label: 'Explicatif' },
      { value: '🧠', label: 'Analytique' },
      { value: '🔎', label: 'Observateur' },
      { value: '🧩', label: 'Progressif' },
      { value: '📚', label: 'Scolaire' },
      { value: '✏️', label: 'Pratique' },
      { value: '📐', label: 'Structuré' },
      { value: '🛠️', label: 'Concret' },
      { value: '🧪', label: 'Expérimental' },
      { value: '📝', label: 'Organisé' },
    ],
  },
  {
    label: 'Encouragement',
    icons: [
      { value: '⭐', label: 'Encourageant' },
      { value: '🌟', label: 'Valorisant' },
      { value: '✨', label: 'Inspirant' },
      { value: '💪', label: 'Motivant' },
      { value: '👏', label: 'Félicitant' },
      { value: '🙌', label: 'Enthousiaste' },
      { value: '🏆', label: 'Ambitieux' },
      { value: '🌱', label: 'Encourage la progression' },
      { value: '🌻', label: 'Lumineux' },
      { value: '🎉', label: 'Festif' },
      { value: '✅', label: 'Validant' },
      { value: '❤️', label: 'Attentionné' },
    ],
  },
  {
    label: 'Rythme et style',
    icons: [
      { value: '⚡', label: 'Dynamique' },
      { value: '🚀', label: 'Rapide' },
      { value: '🔥', label: 'Énergique' },
      { value: '🎵', label: 'Rythmé' },
      { value: '🎈', label: 'Léger' },
      { value: '🐢', label: 'Patient' },
      { value: '🐝', label: 'Actif' },
      { value: '🦊', label: 'Astucieux' },
      { value: '🐼', label: 'Doux' },
      { value: '🐬', label: 'Joueur' },
      { value: '🦋', label: 'Créatif' },
      { value: '🎨', label: 'Imaginatif' },
    ],
  },
]
