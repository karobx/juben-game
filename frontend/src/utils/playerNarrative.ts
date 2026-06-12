/** Replace {playerName} in scene copy; falls back to 「我」 when no role selected. */
export function applyPlayerName(text: string, playerName?: string): string {
  const name = playerName?.trim() || '我'
  return text.replace(/\{playerName\}/g, name)
}
