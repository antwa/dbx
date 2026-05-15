export interface ShortcutLikeEvent {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  isComposing?: boolean;
}

export function isExecuteSqlShortcut(event: ShortcutLikeEvent): boolean {
  if (event.isComposing) return false;
  if (event.altKey) return false;
  if (!event.metaKey && !event.ctrlKey) return false;
  return event.key === "Enter";
}

export function isCloseTabShortcut(event: ShortcutLikeEvent): boolean {
  if (event.isComposing) return false;
  if (!event.metaKey) return false;
  return event.key.toLowerCase() === "w";
}

export function isFocusSearchShortcut(event: ShortcutLikeEvent): boolean {
  if (event.isComposing) return false;
  if (event.altKey) return false;
  if (!event.metaKey && !event.ctrlKey) return false;
  return event.key.toLowerCase() === "f";
}

export function isSaveShortcut(event: ShortcutLikeEvent): boolean {
  if (event.isComposing) return false;
  if (event.altKey) return false;
  if (!event.metaKey && !event.ctrlKey) return false;
  return event.key.toLowerCase() === "s";
}

export function isCancelSearchShortcut(event: ShortcutLikeEvent): boolean {
  if (event.isComposing) return false;
  return event.key === "Escape";
}
