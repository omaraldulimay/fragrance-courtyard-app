import { describe, expect, it } from '@jest/globals';
import { formatMoney } from '@/lib/format';

describe('formatMoney', () => {
  it('formats amounts in German locale', () => {
    const text = formatMoney({ amount: 155, currencyCode: 'EUR' });
    expect(text).toContain('155,00');
    expect(text).toMatch(/€|EUR/);
  });

  it('uses the currency of the given money', () => {
    const text = formatMoney({ amount: 1234.5, currencyCode: 'USD' });
    expect(text).toContain('1.234,50');
    expect(text).toMatch(/\$|USD/);
  });
});
