import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const shell = await readFile(new URL('../app/components/admin/AdminShell.vue', import.meta.url), 'utf8')

test('place Statistiques en premier dans la navigation de l’administration', () => {
  const navigationStart = shell.indexOf('<nav class="admin-shell__nav"')
  const statisticsLink = shell.indexOf("linkIsActive('/admin/charts')", navigationStart)
  const groupedMenus = shell.indexOf('v-for="group in menuGroups"', navigationStart)

  assert.ok(navigationStart >= 0)
  assert.ok(statisticsLink > navigationStart)
  assert.ok(groupedMenus > statisticsLink)
})

test('active explicitement Statistiques sur la page des graphiques', () => {
  assert.match(
    shell,
    /:class="\{ 'router-link-exact-active': linkIsActive\('\/admin\/charts'\) \}"/u,
  )
  assert.match(shell, /:to="localePath\('\/admin\/charts'\)"/u)
})
