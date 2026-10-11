/**
 * Origin IDs by key, so other data can list origins by name. Part of the URL format. Kept apart
 * from `origins.ts`, which imports the characteristics, so the characteristics can import these.
 */
export const ORIGIN = {
  astraMilitarumCommander: 1,
  commissar: 2,
  crimeLord: 3,
  ministorumPriest: 4,
  navyOfficer: 5,
  noble: 6,
  sanctionedPsykerBiomancer: 7,
  sanctionedPsykerDiviner: 8,
  sanctionedPsykerPyromancer: 9,
  sanctionedPsykerSanctic: 10,
  sanctionedPsykerTelepath: 11,
  arbitratorVigilant: 12,
  arbitratorCastigator: 13,
  arbitratorSubductor: 14,
} as const
