import type { Scene } from '../models/story'

/** 章節所屬時代，用於判斷玩家角色能否以第一人稱代入 */
export type PerspectiveEra = 'qin' | 'chu_han' | 'han_west' | 'han_east'

const QIN_HAN_CHARACTER_ERAS: Record<string, PerspectiveEra[]> = {
  秦始皇: ['qin'],
  秦始皇帝: ['qin'],
  李斯: ['qin'],
  趙高: ['qin'],
  項羽: ['chu_han'],
  劉邦: ['chu_han', 'han_west'],
  漢武帝: ['han_west'],
  張騫: ['han_west', 'han_east'],
}

const QIN_HAN_SCENE_ERA: Record<string, PerspectiveEra> = {
  scene_1: 'qin',
  scene_2: 'chu_han',
  scene_3: 'han_west',
  scene_4: 'han_west',
  scene_5: 'han_west',
  scene_6: 'han_west',
  scene_7: 'han_east',
  scene_8: 'han_east',
}

export function getScenePerspectiveEra(scene?: Scene | null): PerspectiveEra | undefined {
  if (!scene) return undefined
  if (scene.perspectiveEra) return scene.perspectiveEra
  const baseId = scene.id.replace(/_end$/, '').replace(/^deviation_/, 'scene_')
  return QIN_HAN_SCENE_ERA[baseId]
}

export function canUseFirstPersonPerspective(
  playerName: string | undefined,
  sceneEra: PerspectiveEra | undefined,
): boolean {
  if (!playerName?.trim() || !sceneEra) return false
  const eras = QIN_HAN_CHARACTER_ERAS[playerName.trim()]
  return eras?.includes(sceneEra) ?? false
}

export function isReaderPerspectiveMode(
  scene: Scene | undefined,
  playerCharacter?: string,
): boolean {
  if (!scene) return true
  const era = getScenePerspectiveEra(scene)
  if (!playerCharacter?.trim()) return true
  if (scene.narrativeAsReader) {
    return !canUseFirstPersonPerspective(playerCharacter, era)
  }
  return !canUseFirstPersonPerspective(playerCharacter, era)
}

/** 依章節時代選擇研讀旁白或第一人稱敘事 */
export function resolveSceneNarrative(
  scene: Scene | undefined,
  playerCharacter?: string,
): string {
  if (!scene) return ''
  const era = getScenePerspectiveEra(scene)
  const useFirstPerson =
    playerCharacter?.trim() &&
    scene.narrativeFirstPerson &&
    canUseFirstPersonPerspective(playerCharacter, era)

  if (useFirstPerson) {
    return applyPlayerNameInText(scene.narrativeFirstPerson!, playerCharacter)
  }
  if (scene.narrativeAsReader) {
    return applyPlayerNameInText(scene.narrativeAsReader, playerCharacter, {
      readerMode: true,
    })
  }
  return scene.narrativeFirstPerson ?? scene.narrative ?? ''
}

export function resolveDecisionPrompt(
  scene: Scene | undefined,
  playerCharacter?: string,
): string | undefined {
  if (!scene) return undefined
  const reader = isReaderPerspectiveMode(scene, playerCharacter)
  if (reader && scene.decisionPromptAsReader) return scene.decisionPromptAsReader
  return scene.decisionPrompt
}

export function resolvePlayerBadge(
  playerCharacter: string | undefined,
  scene: Scene | undefined,
): { label: string; mode: 'identity' | 'reader' } | null {
  if (!playerCharacter?.trim()) return null
  if (isReaderPerspectiveMode(scene, playerCharacter)) {
    return { label: `研讀視角 · 關注${playerCharacter}`, mode: 'reader' }
  }
  return { label: `我是${playerCharacter}`, mode: 'identity' }
}

function applyPlayerNameInText(
  text: string,
  playerName?: string,
  options?: { readerMode?: boolean },
): string {
  const name = playerName?.trim() || '我'
  let result = text.replace(/\{playerName\}/g, name)
  if (options?.readerMode && name !== '我') {
    result = result.replace(/\{focusName\}/g, name)
  } else {
    result = result.replace(/\{focusName\}/g, name)
  }
  return result
}
