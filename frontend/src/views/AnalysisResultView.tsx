import { useState } from 'react'
import type { AnalysisResult, Character, StoryGraph } from '../models/story'
import { CharacterPortrait } from '../components/CharacterPortrait'
import { SceneIllustrationCard } from '../components/SceneIllustrationCard'
import { buildIllustrationSceneId } from '../utils/illustrationSceneId'

interface Props {
  analysis: AnalysisResult
  storyGraph: StoryGraph
  onStartGame: (character: Character) => void
  onBack: () => void
}

type PrepStep = 'identity' | 'world'

function characterRoleHint(name: string): string {
  if (/帝|皇|王/.test(name)) return '以君王視角，親歷王朝興替'
  if (/將|侯|將軍/.test(name)) return '以將領視角，馳騁沙場風雲'
  if (/臣|相|丞/.test(name)) return '以謀臣視角，在朝堂中抉擇'
  return '以當事人視角，走進歷史關鍵時刻'
}

export function AnalysisResultView({ analysis, storyGraph, onStartGame, onBack }: Props) {
  const [step, setStep] = useState<PrepStep>('identity')
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const previewScenes = Object.values(storyGraph.scenes)
    .filter((scene) => scene.route === 'mainline' && scene.choices.length > 0)
    .slice(0, 3)

  function handleSelectCharacter(character: Character) {
    setSelectedCharacter(character)
    setStep('world')
  }

  function handleBackStep() {
    if (step === 'world') {
      setStep('identity')
      return
    }
    onBack()
  }

  return (
    <section className="analysis-view">
      <div className="analysis-hero">
        <p className="analysis-tag">{step === 'identity' ? '選擇身分' : '踏入舞台'}</p>
        <h1>{analysis.title}</h1>
        <p className="meta analysis-hero-lead">
          {step === 'identity'
            ? '選擇你特別關注的歷史人物。秦漢等跨朝代劇本會按章節切換「研讀視角」，不會讓不同年代的人物同場出現。'
            : selectedCharacter
              ? `你將以「${selectedCharacter.name}」為關注人物，翻開課本走進以下歷史舞台。`
              : '確認故事舞台與情節脈絡後，即可開始演繹。'}
        </p>
      </div>

      {step === 'identity' && analysis.characters.length > 0 && (
        <div className="character-roster">
          <h2 className="section-title">
            <span className="section-num">壹</span>
            我是誰？
          </h2>
          <p className="section-lead">點選一個人物；合適的章節會以第一人稱代入，其餘章節改以課本研讀呈現。</p>
          <div className="character-select-grid">
            {analysis.characters.slice(0, 6).map((c, i) => {
              const isSelected = selectedCharacter?.name === c.name
              return (
                <button
                  key={c.name}
                  type="button"
                  className={`character-select-card ${isSelected ? 'character-select-card-active' : ''}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                  onClick={() => handleSelectCharacter(c)}
                  aria-pressed={isSelected}
                >
                  <CharacterPortrait name={c.name} selected={isSelected} />
                  <div className="character-select-info">
                    <h3>我是{c.name}</h3>
                    <p>{characterRoleHint(c.name)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 'world' && selectedCharacter && (
        <>
          <div className="identity-banner" role="status">
            <CharacterPortrait name={selectedCharacter.name} selected />
            <div>
              <p className="identity-banner-label">你的身分</p>
              <p className="identity-banner-name">我是{selectedCharacter.name}</p>
            </div>
            <button type="button" className="btn btn-text identity-change" onClick={() => setStep('identity')}>
              換角色
            </button>
          </div>

          {analysis.settings.length > 0 && (
            <div className="settings-row settings-visual">
              <h2 className="section-title">
                <span className="section-num">貳</span>
                故事舞台
              </h2>
              <div className="stage-cards">
                {analysis.settings.map((setting) => (
                  <article key={setting} className="stage-card">
                    <div className="stage-card-art" aria-hidden="true">
                      <span className="stage-card-glyph">{setting.charAt(0)}</span>
                    </div>
                    <h3>{setting}</h3>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="beats-panel beats-visual">
            <h2 className="section-title">
              <span className="section-num">叁</span>
              情節脈絡
            </h2>
            <ol className="beats-timeline">
              {analysis.plotBeats.map((beat, index) => (
                <li key={beat.order}>
                  <span className="beat-marker" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="beat-text">{beat.summary}</span>
                </li>
              ))}
            </ol>
          </div>

          {previewScenes.length > 0 && (
            <div className="scene-preview-panel">
              <h2 className="section-title">
                <span className="section-num">肆</span>
                即將踏入的場景
              </h2>
              <p className="section-lead">以繪卷預覽關鍵時刻，進入遊戲後將隨你的抉擇推進。</p>
              <div className="scene-preview-grid">
                {previewScenes.map((scene) => (
                  <article key={scene.id} className="scene-preview-card">
                    <SceneIllustrationCard
                      sceneId={buildIllustrationSceneId(scene.id, storyGraph.periodId)}
                      imagePrompt={scene.imagePrompt}
                      narrative={scene.narrative}
                      illustrationUrl={scene.illustrationUrl}
                      variant="mainline"
                    />
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="enter-game-card">
            <div className="enter-game-content">
              <p className="enter-game-label">準備就緒</p>
              <h2 className="enter-game-title">{storyGraph.title}</h2>
              <p className="enter-game-desc">
                以「{selectedCharacter.name}」的身分，在關鍵抉擇中親歷歷史。選完後才會揭曉是否符合史實。
              </p>
            </div>
            <div className="enter-game-actions">
              <button type="button" className="btn btn-secondary" onClick={handleBackStep}>
                返回
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg btn-enter-game"
                onClick={() => onStartGame(selectedCharacter)}
              >
                以{selectedCharacter.name}開始演繹
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'identity' && (
        <div className="analysis-footer-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            返回
          </button>
        </div>
      )}
    </section>
  )
}
