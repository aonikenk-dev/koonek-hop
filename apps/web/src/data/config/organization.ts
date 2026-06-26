// Mock active organization (tenant) for the Phase 2 visual prototype.
// Once apps/api is wired in, this comes from the authenticated session instead.
export const organization = {
  id: 'demo-org',
  name: 'Consultorio Demo',
  specialty: 'Medicina General',
  logoUrl: undefined as string | undefined,
};
