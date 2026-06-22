import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface ClothingItem {
  id: string
  name: string
  category: string
  image_url: string
}

export function ClosetGrid() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('id, name, category, image_url')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setItems(data)
      }
      setLoading(false)
    }

    fetchItems()
  }, [])

  if (loading) return <p className="text-sm text-muted">Loading your closet...</p>

  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-base font-semibold tracking-tight">Your Closet</h2>
        <p className="mt-2 text-sm text-muted">Nothing uploaded yet — add your first item above.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-base font-semibold tracking-tight">Your Closet</h2>
      <p className="mt-1 text-sm text-muted">{items.length} item{items.length !== 1 ? 's' : ''} saved.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-border bg-bg p-3">
            <img src={item.image_url} alt={item.name} className="mx-auto h-24 w-auto" />
            <p className="mt-2 truncate text-sm text-text">{item.name}</p>
            <p className="text-xs uppercase tracking-wide text-muted">{item.category}</p>
          </div>
        ))}
      </div>
    </section>
  )
}