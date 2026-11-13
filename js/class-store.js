import { classes as demoClasses } from "./data.js";
const KEY = "dn-managed-classes-v1";
const safeRead = () => { try { const value = JSON.parse(localStorage.getItem(KEY) || "null"); return Array.isArray(value) ? value : null; } catch { return null; } };
export function getManagedClasses() {
  const overrides = safeRead();
  if (!overrides) return demoClasses.map(item => ({ ...item }));
  return overrides.map(item => ({ ...item }));
}
export function saveManagedClasses(items) { localStorage.setItem(KEY, JSON.stringify(items)); }
export function upsertManagedClass(item) {
  const all = getManagedClasses(); const index = all.findIndex(entry => entry.id === item.id);
  if (index >= 0) all[index] = { ...all[index], ...item }; else all.unshift(item);
  saveManagedClasses(all); return all;
}
export function deleteManagedClass(id) { const all = getManagedClasses().filter(item => item.id !== id); saveManagedClasses(all); return all; }
