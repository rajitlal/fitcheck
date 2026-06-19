import { useState, type SubmitEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp, signIn } = useAuth()

const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
  e.preventDefault() // stops the browser's default full-page reload on form submit
    setError(null)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) setError(error.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </button>
    </form>
  )
}