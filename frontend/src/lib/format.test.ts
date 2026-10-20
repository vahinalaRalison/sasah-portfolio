import { describe, expect, it } from 'vitest';
import { formatMonth, groupBy } from './format';

describe('formatMonth', () => {
  it('formate un mois ISO en français', () => {
    expect(formatMonth('2024-01')).toBe('janv. 2024');
  });
  it("renvoie aujourd'hui pour null", () => {
    expect(formatMonth(null)).toBe("aujourd'hui");
  });
});

describe('groupBy', () => {
  it('regroupe par clé en conservant l’ordre', () => {
    const grouped = groupBy([{ c: 'a', n: 1 }, { c: 'b', n: 2 }, { c: 'a', n: 3 }], (i) => i.c);
    expect(grouped.a?.map((i) => i.n)).toEqual([1, 3]);
    expect(grouped.b?.map((i) => i.n)).toEqual([2]);
  });
});
