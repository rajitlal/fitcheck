import { useAuth } from './context/AuthContext'
import { AuthForm } from './components/AuthForm'
import { UploadForm } from './components/UploadForm'
import { MixAndMatch } from './components/MixAndMatch'

function App() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">FitCheck</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{user.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-muted hover:text-text transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-12">
        <UploadForm />
        <MixAndMatch />
      </main>
    </div>
  )
}

export default App