import { useState, type SubmitEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function UploadForm() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('top')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || !user) return

    setLoading(true)

    // FormData is the browser's native way to build a multipart/form-data
    // request — the same format Swagger was sending under the hood
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', user.id)
    formData.append('name', name)
    formData.append('category', category)

    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload-clothing-item`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setImageUrl(data.image_url)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
      />
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
        <option value="shoes">Shoes</option>
        <option value="outerwear">Outerwear</option>
        <option value="accessory">Accessory</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Add to Closet'}
      </button>
      {imageUrl && <img src={imageUrl} alt={name} style={{ maxWidth: 200 }} />}
    </form>
  )
}