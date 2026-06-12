/** 各時期 scene_1 共用檔名會互相覆蓋，插畫以 periodId_sceneId 區分。 */
export function buildIllustrationSceneId(
  sceneId: string | undefined,
  periodId?: string,
): string | undefined {
  if (!sceneId) return undefined
  if (!periodId?.trim()) return sceneId
  return `${periodId.trim()}_${sceneId}`
}
