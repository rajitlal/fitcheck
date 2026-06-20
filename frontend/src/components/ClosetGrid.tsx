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

  if (loading) return <p>Loading your closet...</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      {items.map((item) => (
        <div key={item.id}>
          <img src={item.image_url} alt={item.name} style={{ width: '100%' }} />
          <p>{item.name} — {item.category}</p>
        </div>
      ))}
    </div>
  )
}