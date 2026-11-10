import {
  PawPrint, Dog, Cat, Bird, Fish, Rabbit, Bone, Scissors, Stethoscope, Bed, Puzzle, Utensils, Sparkles, Shapes,
} from 'lucide-react';
import { API_URL } from './api';
import { BRAND } from '@/config/brand';

export const cx = (...a) => a.filter(Boolean).join(' ');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const money = (n) => {
  const v = Number(n || 0);
  const frac = Math.abs(v % 1) > 0.004 ? 2 : 0;
  return `${BRAND.currency}${v.toLocaleString('en-US', { minimumFractionDigits: frac, maximumFractionDigits: 2 })}`;
};

export const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(d)) : '—';

/**
 * Backend stores multer's `file.path` (e.g. "uploads\\123-cat.jpg" on Windows).
 * Normalise slashes and prefix the API origin.
 */
export function imageUrl(url) {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  const clean = String(url).replace(/\\/g, '/').replace(/^\.?\/+/, '');
  return `${API_URL}/${clean}`;
}

export function mainImage(product) {
  const imgs = product?.images || [];
  const m = imgs.find((i) => i.isMain) || imgs[0];
  return m ? imageUrl(m.url) : '';
}

/** Single source of truth for what a customer pays per unit. */
export function priceOf(product) {
  const price = Number(product?.price || 0);
  const type = product?.discountType;
  const d = Number(product?.discount || 0);
  const now = Date.now();
  const startOk = !product?.discountStartDate || new Date(product.discountStartDate).getTime() <= now;
  const endOk = !product?.discountEndDate || new Date(product.discountEndDate).getTime() + 86399000 >= now;
  let final = price;
  if ((type === 'percent' || type === 'flat') && d > 0 && startOk && endOk) {
    final = type === 'percent' ? price * (1 - Math.min(d, 100) / 100) : price - d;
    final = Math.max(0, Math.round(final * 100) / 100);
  }
  const has = final < price;
  return { price: final, original: price, hasDiscount: has, percentOff: has ? Math.round((1 - final / price) * 100) : 0 };
}

export const stockState = (stock) => {
  const s = Number(stock || 0);
  if (s <= 0) return { key: 'out', label: 'Out of stock', tone: 'danger' };
  if (s <= BRAND.lowStockAt) return { key: 'low', label: `Only ${s} left`, tone: 'accent' };
  return { key: 'in', label: 'In stock', tone: 'brand' };
};

/** Pick a fitting icon for any admin-created category name. */
export function categoryIcon(name = '') {
  const n = name.toLowerCase();
  const map = [
    [/dog|puppy|canine/, Dog], [/cat|kitten|feline/, Cat], [/bird|parrot|avian/, Bird],
    [/fish|aqua/, Fish], [/rabbit|small|hamster|guinea/, Rabbit], [/treat|snack|bone/, Bone],
    [/food|feed|meal|nutri/, Utensils], [/groom|brush|shampoo|bath/, Scissors],
    [/health|vet|medic|care|supplement/, Stethoscope], [/bed|sleep|house|crate|cage/, Bed],
    [/toy|play/, Puzzle], [/access|collar|leash|harness/, Sparkles],
  ];
  for (const [re, Icon] of map) if (re.test(n)) return Icon;
  return name ? PawPrint : Shapes;
}

export const store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(`pawvana:${key}`);
      return v == null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(`pawvana:${key}`, JSON.stringify(value)); } catch { /* storage blocked */ }
  },
  del(key) {
    try { localStorage.removeItem(`pawvana:${key}`); } catch { /* storage blocked */ }
  },
};

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
export const isPhone = (v) => /^\+?[0-9\s-]{7,16}$/.test(String(v || '').trim());
