import assert from 'node:assert/strict'
import test from 'node:test'
import { analyticsUsageDiagnostic } from '../shared/utils/analytics-usage.ts'

function row(overrides = {}) {
  return {
    key: 'test',
    label: 'Test',
    category: 'feature',
    exposures: 500,
    selections: 50,
    starts: 50,
    completions: 40,
    failures: 0,
    uniqueSessions: 45,
    repeatSessions: 5,
    adoptionRate: 10,
    completionRate: 80,
    repeatRate: 11.1,
    lastUsedAt: null,
    ...overrides,
  }
}

test('attend assez de données avant de recommander une suppression', () => {
  assert.equal(analyticsUsageDiagnostic(row({
    exposures: 99,
    selections: 0,
    starts: 0,
    completions: 0,
    adoptionRate: 0,
    completionRate: null,
    repeatRate: null,
  })).diagnostic, 'insufficient')
})

test('signale uniquement un candidat à retirer avec exposition forte et usage quasi nul', () => {
  assert.equal(analyticsUsageDiagnostic(row({
    exposures: 500,
    selections: 2,
    starts: 1,
    completions: 1,
    adoptionRate: 0.4,
    completionRate: 100,
    repeatRate: 0,
  })).diagnostic, 'remove-candidate')
})

test('distingue une fonction à promouvoir d’une fonction à améliorer', () => {
  assert.equal(analyticsUsageDiagnostic(row({
    adoptionRate: 3,
    completionRate: 85,
  })).diagnostic, 'promote')
  assert.equal(analyticsUsageDiagnostic(row({
    adoptionRate: 12,
    starts: 20,
    completions: 5,
    completionRate: 25,
  })).diagnostic, 'improve')
})
