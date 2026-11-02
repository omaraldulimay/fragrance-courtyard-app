import type { Money } from '@/lib/shopify/products';

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(money: Money): string {
  let formatter = formatters.get(money.currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: money.currencyCode });
    formatters.set(money.currencyCode, formatter);
  }
  return formatter.format(money.amount);
}
