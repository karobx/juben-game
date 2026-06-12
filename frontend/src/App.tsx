import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ChineseLandscape } from './components/ChineseLandscape'
import { LoadingOverlay } from './components/LoadingOverlay'
import type { AnalysisResult, Character, StoryGraph, UploadResult } from './models/story'
import { analyzeDemo, analyzeUpload } from './services/analyzeService'
import { fetchChistoryPeriod } from './services/chistoryService'
import {
  loadChistoryProgress,
  saveChistoryProgress,
} from './utils/chistoryProgress'
import { AnalysisResultView } from './views/AnalysisResultView'
import { GamePlayView } from './views/GamePlayView'
import { UploadView } from './views/UploadView'

type Screen = 'upload' | 'analysis' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('upload')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [storyGraph, setStoryGraph] = useState<StoryGraph | null>(null)
  const [playerCharacter, setPlayerCharacter] = useState<Character | null>(null)
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null)
  const [resumeSceneId, setResumeSceneId] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('展卷中…')
  const [error, setError] = useState('')

  async function runAnalysis(fileId: string, storagePath: string) {
    setLoading(true)
    setLoadingMessage('正在析文，編排劇本…')
    setError('')
    try {
      const result = await analyzeUpload(fileId, storagePath)
      setAnalysis(result.analysis)
      setStoryGraph(result.storyGraph)
      setActivePeriodId(null)
      setResumeSceneId(undefined)
      setScreen('analysis')
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失敗')
    } finally {
      setLoading(false)
    }
  }

  async function handleUploaded(result: UploadResult) {
    await runAnalysis(result.fileId, result.storagePath)
  }

  async function handleDemo() {
    setLoading(true)
    setLoadingMessage('載入秦漢示範劇本…')
    setError('')
    try {
      const result = await analyzeDemo()
      setAnalysis(result.analysis)
      setStoryGraph(result.storyGraph)
      setActivePeriodId(null)
      setResumeSceneId(undefined)
      setScreen('analysis')
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法載入示範')
    } finally {
      setLoading(false)
    }
  }

  async function handlePlayPeriod(periodId: string, options?: { resume?: boolean }) {
    setLoading(true)
    setLoadingMessage(options?.resume ? '恢復上次旅程…' : '展開課程內容，編排互動劇本…')
    setError('')
    try {
      const result = await fetchChistoryPeriod(periodId)
      setAnalysis(result.analysis)
      setStoryGraph(result.storyGraph)
      setActivePeriodId(periodId)

      const saved = loadChistoryProgress()
      const canResume =
        options?.resume &&
        saved?.periodId === periodId &&
        saved.lastSceneId &&
        result.storyGraph.scenes[saved.lastSceneId]

      if (canResume) {
        const defaultCharacter = result.analysis.characters[0] ?? { name: '旅人', mentions: 0 }
        setPlayerCharacter(defaultCharacter)
        setResumeSceneId(saved!.lastSceneId)
        setScreen('game')
      } else {
        setResumeSceneId(undefined)
        setPlayerCharacter(null)
        setScreen('analysis')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法載入中國歷史劇本')
    } finally {
      setLoading(false)
    }
  }

  function handleSceneChange(sceneId: string) {
    if (activePeriodId) {
      saveChistoryProgress({ periodId: activePeriodId, lastSceneId: sceneId })
    }
  }

  function handleExitGame() {
    setPlayerCharacter(null)
    setResumeSceneId(undefined)
    setScreen('upload')
  }

  const isGame = screen === 'game'

  return (
    <>
      {!isGame && screen !== 'upload' && <ChineseLandscape />}
      <main
        className={`app-shell ${screen === 'upload' ? 'app-shell-upload' : ''} ${isGame ? 'app-shell-game' : ''}`}
      >
        <AppHeader
          screen={screen}
          storyTitle={analysis?.title ?? storyGraph?.title}
          compact={isGame}
        />

        {loading && <LoadingOverlay message={loadingMessage} />}

        {error && (
          <div className="global-error" role="alert">
            {error}
          </div>
        )}

        {screen === 'upload' && (
          <UploadView
            onUploaded={handleUploaded}
            onDemo={handleDemo}
            onPlayPeriod={handlePlayPeriod}
          />
        )}

        {screen === 'analysis' && analysis && storyGraph && (
          <AnalysisResultView
            analysis={analysis}
            storyGraph={storyGraph}
            onStartGame={(character) => {
              setPlayerCharacter(character)
              if (activePeriodId) {
                saveChistoryProgress({
                  periodId: activePeriodId,
                  lastSceneId: storyGraph.startSceneId,
                })
              }
              setResumeSceneId(undefined)
              setScreen('game')
            }}
            onBack={() => {
              setActivePeriodId(null)
              setScreen('upload')
            }}
          />
        )}

        {screen === 'game' && storyGraph && (
          <GamePlayView
            storyGraph={storyGraph}
            playerCharacter={playerCharacter?.name}
            initialSceneId={resumeSceneId}
            onSceneChange={handleSceneChange}
            onExit={handleExitGame}
          />
        )}
      </main>
    </>
  )
}

export default App
