import {
  candidateIdParamSchema,
  listCandidatesQuerySchema,
} from '@interfaces/http/validation/candidate.validation';

describe('candidateIdParamSchema', () => {
  it('accepts a valid cohort candidate id', () => {
    const result = candidateIdParamSchema.safeParse({ id: 'CAND-001' });

    expect(result.success).toBe(true);
  });

  it('rejects an id that does not match the LETTERS-NUMBER pattern', () => {
    const result = candidateIdParamSchema.safeParse({ id: 'not-a-valid-id' });

    expect(result.success).toBe(false);
  });

  it('rejects a missing id', () => {
    const result = candidateIdParamSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe('listCandidatesQuerySchema', () => {
  it('applies default page and limit when omitted', () => {
    const result = listCandidatesQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.role).toBeUndefined();
  });

  it('coerces numeric strings from query params', () => {
    const result = listCandidatesQuerySchema.parse({ page: '3', limit: '5' });

    expect(result.page).toBe(3);
    expect(result.limit).toBe(5);
  });

  it('rejects a limit above the maximum', () => {
    const result = listCandidatesQuerySchema.safeParse({ limit: '500' });

    expect(result.success).toBe(false);
  });

  it('rejects a non-positive page', () => {
    const result = listCandidatesQuerySchema.safeParse({ page: '0' });

    expect(result.success).toBe(false);
  });

  it('rejects an empty role string', () => {
    const result = listCandidatesQuerySchema.safeParse({ role: '' });

    expect(result.success).toBe(false);
  });
});
