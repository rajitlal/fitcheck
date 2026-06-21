import { useState, type SubmitEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function OutfitSuggester() {
  const { user } = useAuth()
  const [occasion, setOccasion] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setSuggestion('')

    const formData = new FormData()
    formData.append('user_id', user.id)
    formData.append('occasion', occasion)

    const response = await fetch('http://localhost:8000/suggest-outfit', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setSuggestion(data.suggestion)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What's the occasion? (e.g. casual coffee date)"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Suggest an Outfit'}
        </button>
      </form>
      {suggestion && <p style={{ whiteSpace: 'pre-wrap' }}>{suggestion}</p>}
    </div>
  )
}