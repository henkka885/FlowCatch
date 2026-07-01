export const KEYS = {
  files: "flowcatch_files",
  messages: "flowcatch_messages",
  currentFile: "flowcatch_currentFile",
};

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage täynnä — ei tehdä numeroa siitä
  }
}