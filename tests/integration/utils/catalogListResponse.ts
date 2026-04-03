/**
 * Catalog GET responses may be legacy `{ success, data }` or v1 `{ data, meta, errors }`.
 */
export function expectOkCatalogList(res: { status: number; body: Record<string, unknown> }): void {
  expect(res.status).toBe(200);
  expect((res.body.errors as unknown[] | undefined) ?? []).toEqual([]);
  expect(res.body.success).not.toBe(false);
  expect(Array.isArray(res.body.data)).toBe(true);
}
