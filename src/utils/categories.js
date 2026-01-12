import { CATEGORY_STYLES } from "./CategoryStyles";

/**
 * Resolve category metadata safely
 */
export function resolveCategory(key) {
  return CATEGORY_STYLES[key] || CATEGORY_STYLES.other;
}

/**
 * Get translated category label
 */
export function getCategoryLabel(key, t) {
  const cat = resolveCategory(key);
  return t(cat.label);
}

/**
 * Get icon
 */
export function getCategoryIcon(key) {
  return resolveCategory(key).icon;
}
