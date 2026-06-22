import { useState, type SubmitEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function UploadForm() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('top')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || !user) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', user.id)
      formData.append('name', name)
      formData.append('category', category)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload-clothing-item`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setImageUrl(data.image_url)
      // Reset form fields after successful upload
      setFile(null)
      setName('')
      setCategory('top')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setImageUrl(null)
      }, 3000)
    } catch {
      setError('Upload failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-base font-semibold tracking-tight">Add to Closet</h2>
      <p className="mt-1 text-sm text-muted">Upload a photo — the background gets removed automatically.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <input
          type="file"
          accept="image/*"
          key={file ? 'file-filled' : 'file-empty'}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
          className="w-full text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-text file:px-4 file:py-2 file:text-sm file:font-medium file:text-bg cursor-pointer"
        />

        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:border-text transition-colors"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:border-text transition-colors"
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="shoes">Shoes</option>
          <option value="outerwear">Outerwear</option>
          <option value="accessory">Accessory</option>
        </select>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-text py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Uploading...' : 'Add to Closet'}
        </button>

        {imageUrl && (
          <div className="pt-2">
            <img src={imageUrl} alt={name} className="h-40 w-auto rounded-md border border-border" />
          </div>
        )}
      </form>
    </section>
  )
}