#!/usr/bin/env bash

set -Eeuo pipefail

command_name='deploy-conjugaison'
main_branch='main'
release_branch='plesk-release'
github_remote='origin'
plesk_remote='plesk-production'
generated_report_paths=(
  'reports/verb-pilot-import-check.md'
  'reports/verb-pilot-pedagogy-part-01.json'
  'reports/verb-pilot-pedagogy-part-01.md'
  'reports/verb-pilot-pedagogy-part-02.json'
  'reports/verb-pilot-pedagogy-part-02.md'
  'reports/verb-pilot-pedagogy-part-03.json'
  'reports/verb-pilot-pedagogy-part-03.md'
  'reports/verb-pilot-pedagogy-part-04.json'
  'reports/verb-pilot-pedagogy-part-04.md'
  'reports/verb-pilot-pedagogy-part-05.json'
  'reports/verb-pilot-pedagogy-part-05.md'
)

print_usage() {
  printf 'Usage : %s\n' "$command_name"
  printf '\n'
  printf 'Enregistre les modifications sur main, construit le paquet Plesk,\n'
  printf 'puis pousse la branche %s vers GitHub et Plesk.\n' "$release_branch"
}

if [[ "${1:-}" == '--help' || "${1:-}" == '-h' ]]; then
  print_usage
  exit 0
fi

if (( $# > 0 )); then
  print_usage >&2
  exit 2
fi

# Retrouver le projet même lorsque ce script est appelé à travers un lien
# symbolique placé dans un dossier du PATH.
script_path="${BASH_SOURCE[0]}"
while [[ -L "$script_path" ]]; do
  script_dir="$(cd -P "$(dirname "$script_path")" && pwd)"
  link_target="$(readlink "$script_path")"
  if [[ "$link_target" == /* ]]; then
    script_path="$link_target"
  else
    script_path="$script_dir/$link_target"
  fi
done
script_dir="$(cd -P "$(dirname "$script_path")" && pwd)"
repository_root="$(cd "$script_dir/.." && pwd)"

fail() {
  printf 'Erreur : %s\n' "$1" >&2
  exit 1
}

for required_command in git npm; do
  command -v "$required_command" >/dev/null 2>&1 \
    || fail "la commande « $required_command » est introuvable."
done

git -C "$repository_root" rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || fail "le dossier du projet n’est pas un dépôt Git."

for remote_name in "$github_remote" "$plesk_remote"; do
  git -C "$repository_root" remote get-url "$remote_name" >/dev/null 2>&1 \
    || fail "le remote Git « $remote_name » est absent."
done

git -C "$repository_root" show-ref --verify --quiet "refs/heads/$main_branch" \
  || fail "la branche locale « $main_branch » est absente."
git -C "$repository_root" show-ref --verify --quiet "refs/heads/$release_branch" \
  || fail "la branche locale « $release_branch » est absente."

git_dir="$(git -C "$repository_root" rev-parse --git-dir)"
if [[ "$git_dir" != /* ]]; then
  git_dir="$repository_root/$git_dir"
fi

[[ ! -f "$git_dir/MERGE_HEAD" ]] \
  || fail 'une fusion Git est déjà en cours.'
[[ ! -d "$git_dir/rebase-merge" && ! -d "$git_dir/rebase-apply" ]] \
  || fail 'un rebase Git est déjà en cours.'

printf 'Projet : %s\n' "$repository_root"
printf 'Modifications qui seront enregistrées sur %s :\n' "$main_branch"
git -C "$repository_root" status --short
printf '\nDescription du commit : '
IFS= read -r commit_message

[[ -n "${commit_message//[[:space:]]/}" ]] \
  || fail 'la description du commit ne peut pas être vide.'

printf '\n[1/8] Passage sur %s\n' "$main_branch"
git -C "$repository_root" switch "$main_branch"

printf '\n[2/8] Création du commit\n'
git -C "$repository_root" add -A
if git -C "$repository_root" diff --cached --quiet; then
  fail 'aucune modification à enregistrer sur main.'
fi
git -C "$repository_root" commit -m "$commit_message"

printf '\n[3/8] Envoi de %s vers %s\n' "$main_branch" "$github_remote"
git -C "$repository_root" push "$github_remote" "$main_branch"

printf '\n[4/8] Préparation de %s\n' "$release_branch"
git -C "$repository_root" switch "$release_branch"
git -C "$repository_root" merge --no-edit "$main_branch"

printf '\n[5/8] Installation exacte des dépendances\n'
npm --prefix "$repository_root" ci

printf '\n[6/8] Construction du paquet Nuxt\n'
npm --prefix "$repository_root" run build

# Le bundlage de la migration du lot pilote régénère ces rapports avec un
# nouvel horodatage. Leur contenu validé est déjà dans Git : on annule
# uniquement cet effet de bord du build avant le contrôle de sécurité.
git -C "$repository_root" restore --worktree -- "${generated_report_paths[@]}"

unexpected_changes="$(
  git -C "$repository_root" status --porcelain --untracked-files=all \
    -- . ':(exclude).output'
)"
if [[ -n "$unexpected_changes" ]]; then
  printf '%s\n' "$unexpected_changes" >&2
  fail 'le build a créé ou modifié des fichiers inattendus en dehors de .output.'
fi

printf '\n[7/8] Enregistrement du paquet Plesk\n'
git -C "$repository_root" add -f -A .output
if git -C "$repository_root" diff --cached --quiet; then
  printf 'Le paquet .output est déjà à jour : aucun commit de build nécessaire.\n'
else
  git -C "$repository_root" commit -m 'build: actualiser le paquet Plesk'
fi

printf '\n[8/8] Envoi de %s vers GitHub et Plesk\n' "$release_branch"
git -C "$repository_root" push "$github_remote" "$release_branch"
git -C "$repository_root" push "$plesk_remote" "$release_branch"
git -C "$repository_root" switch "$main_branch"

printf '\nDéploiement Git terminé avec succès.\n'
printf 'Le déploiement Plesk est automatique. Il reste à effectuer « Restart App » dans Node.js.\n'
