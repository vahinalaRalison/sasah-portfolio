import { describe, expect, it } from 'vitest';
import { COMBO_WINDOW, NO_COMBO, comboExpired, nextCombo, rankFor } from './score';

describe('nextCombo', () => {
  it('démarre à 1 sur la première étoile', () => {
    expect(nextCombo(NO_COMBO, 1000)).toEqual({ count: 1, at: 1000 });
  });

  it('enchaîne dans la fenêtre', () => {
    const c1 = nextCombo(NO_COMBO, 1000);
    const c2 = nextCombo(c1, 1000 + COMBO_WINDOW);
    expect(c2.count).toBe(2);
  });

  it('repart à 1 hors de la fenêtre', () => {
    const c1 = nextCombo(NO_COMBO, 1000);
    const c2 = nextCombo(c1, 1000 + COMBO_WINDOW + 1);
    expect(c2.count).toBe(1);
  });

  it('compte plusieurs étoiles ramassées dans la même frame', () => {
    const c = nextCombo(nextCombo(NO_COMBO, 0), 100, 3);
    expect(c.count).toBe(4);
  });

  it('sait quand le combo est expiré', () => {
    expect(comboExpired(NO_COMBO, 0)).toBe(true);
    const c = nextCombo(NO_COMBO, 500);
    expect(comboExpired(c, 500 + COMBO_WINDOW)).toBe(false);
    expect(comboExpired(c, 500 + COMBO_WINDOW + 1)).toBe(true);
  });
});

describe('rankFor', () => {
  it('donne le plein titre à 100 %', () => {
    expect(rankFor(79, 79).title).toBe('Reine du Royaume');
  });
  it('donne le premier titre sans étoile', () => {
    expect(rankFor(0, 79).title).toBe('Apprentie Princesse');
  });
  it('monte par paliers', () => {
    expect(rankFor(20, 79).title).toBe('Princesse Exploratrice');
    expect(rankFor(40, 79).title).toBe('Princesse Aventurière');
    expect(rankFor(60, 79).title).toBe('Grande-Duchesse des Étoiles');
  });
  it('reste sain sans étoile dans le monde', () => {
    expect(rankFor(0, 0).title).toBe('Reine du Royaume');
  });
});
