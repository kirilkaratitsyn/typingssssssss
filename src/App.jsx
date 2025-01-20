import { useState, useEffect, useCallback, useMemo } from 'react'
import { vocabularies } from './data/vocabularies'
import './App.css'

function App() {
  const [theme, setTheme] = useState('it')
  const [words, setWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [input, setInput] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isFinished, setIsFinished] = useState(false)
  const [correctChars, setCorrectChars] = useState(0)
  const [totalChars, setTotalChars] = useState(0)

  const initializeGame = useCallback(() => {
    const shuffled = [...vocabularies[theme]]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20)
    setWords(shuffled)
    setCurrentWordIndex(0)
    setInput('')
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    setIsFinished(false)
    setCorrectChars(0)
    setTotalChars(0)
  }, [theme])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const calculateWPM = useCallback(() => {
    if (!startTime) return 0
    const timeElapsed = (Date.now() - startTime) / 1000 / 60 // in minutes
    return Math.round((correctChars / 5) / timeElapsed)
  }, [startTime, correctChars])

  const handleInput = (e) => {
    const value = e.target.value
    if (!startTime && value) {
      setStartTime(Date.now())
    }

    setInput(value)

    if (value.endsWith(' ')) {
      // Word completed
      const word = value.trim()
      const correctWord = words[currentWordIndex]
      
      // Count correct characters
      let correct = 0
      for (let i = 0; i < word.length; i++) {
        if (i < correctWord.length && word[i] === correctWord[i]) {
          correct++
        }
      }
      
      setCorrectChars(prev => prev + correct)
      setTotalChars(prev => prev + correctWord.length)
      
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1)
        setInput('')
        setAccuracy(Math.round((correctChars / totalChars) * 100))
        setWpm(calculateWPM())
      } else {
        setIsFinished(true)
        setWpm(calculateWPM())
      }
    }
  }

  const timeElapsed = useMemo(() => {
    if (!startTime) return 0
    return Math.round((Date.now() - startTime) / 1000 / 60 * 100) / 100 // in minutes, rounded to 2 decimal places
  }, [startTime])

  const currentWord = words[currentWordIndex]
  
  const renderWord = () => {
    if (!currentWord) return null
    
    return currentWord.split('').map((letter, index) => {
      let className = 'letter'
      if (index < input.length) {
        className += input[index] === letter ? ' correct' : ' incorrect'
      }
      return (
        <span key={index} className={className}>
          {letter}
        </span>
      )
    })
  }

  return (
    <div className="app-container">
      <div className="theme-selector">
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="it">IT</option>
          <option value="web">Web Development</option>
          <option value="programming">Programming</option>
          <option value="english">English</option>
          <option value="deutsch">Deutsch</option>
          <option value="music">Music</option>
          <option value="sports">Sports</option>
          <option value="art">Art</option>
          <option value="science">Science</option>
          <option value="business">Business</option>
        </select>
        <button onClick={initializeGame}>
          New Test
        </button>
      </div>

      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">WPM</span>
          <span className="stat-value">{wpm}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{accuracy}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Remaining</span>
          <span className="stat-value">{words.length - currentWordIndex}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Timer</span>
          <span className="stat-value">{timeElapsed}</span>
        </div>
      </div>

      <div className="typing-area">
        <div className="word-display">
          <div className="current-word">
            {renderWord()}
          </div>
        </div>
        
        <input
          type="text"
          value={input}
          onChange={handleInput}
          disabled={isFinished}
          placeholder={isFinished ? 'Test completed! Click New Test to try again' : 'Start typing...'}
          className="input-field"
          autoFocus
        />
      </div>
    </div>
  )
}

export default App