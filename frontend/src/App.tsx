import { useAuth } from './context/AuthContext'
import { AuthForm } from './components/AuthForm'

function App() {
  const { user, signOut } = useAuth()

  if (!user) {
    return <AuthForm />
  }

  return (
    <div>
      <p>Logged in as {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

export default App