import { useAuth } from './context/AuthContext'
import { AuthForm } from './components/AuthForm'
import { UploadForm } from './components/UploadForm'
import { MixAndMatch } from './components/MixAndMatch'
import { OutfitSuggester } from './components/OutfitSuggester'

function App() {
  const { user, signOut } = useAuth()

  if (!user) {
    return <AuthForm />
  }

  return (
    <div>
      <p>Logged in as {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
      <UploadForm />
      <MixAndMatch />
      <OutfitSuggester />
    </div>
  )
}

export default App