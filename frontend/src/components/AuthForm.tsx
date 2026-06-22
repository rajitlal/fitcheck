import { useState, type SubmitEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp, signIn } = useAuth()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) setError(error.message)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 space-y-5"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {isSignUp ? 'Start building your closet.' : 'Log in to your closet.'}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:border-text transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:border-text transition-colors"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-text py-2 text-sm font-medium text-bg hover:opacity-90 transition-opacity"
      >
        {isSignUp ? 'Sign Up' : 'Log In'}
      </button>

      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full text-center text-sm text-muted underline decoration-dotted hover:text-text hover:decoration-solid transition-colors"
      >
        {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </button>
    </form>
  )
}