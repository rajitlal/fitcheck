import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

interface ClothingItem {
  id: string
  name: string
  category: string
  image_url: string
}

const CATEGORIES = ['top', 'bottom', 'shoes', 'outerwear', 'accessory']

export function MixAndMatch() {
  const { user } = useAuth()
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, ClothingItem[]>>({})
  const [selectedIndex, setSelectedIndex] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('id, name, category, image_url')

      if (!error && data) {
        const grouped: Record<string, ClothingItem[]> = {}
        data.forEach((item) => {
          if (!grouped[item.category]) grouped[item.category] = []
          grouped[item.category].push(item)
        })
        setItemsByCategory(grouped)
      }
      setLoading(false)
    }

    fetchItems()
  }, [])

  const cycle = (category: string, direction: 1 | -1) => {
    const items = itemsByCategory[category] || []
    if (items.length === 0) return

    setSelectedIndex((prev) => {
      const current = prev[category] ?? 0
      const next = (current + direction + items.length) % items.length
      return { ...prev, [category]: next }
    })
  }

  const saveOutfit = async () => {
    if (!user) return

    const { data: outfitData, error: outfitError } = await supabase
      .from('outfits')
      .insert({ user_id: user.id, name: `Outfit ${new Date().toLocaleDateString()}` })
      .select()
      .single()

    if (outfitError || !outfitData) {
      console.error(outfitError)
      return
    }

    const rows = Object.entries(itemsByCategory).map(([category, items]) => {
      const index = selectedIndex[category] ?? 0
      const item = items[index]
      return { outfit_id: outfitData.id, clothing_item_id: item.id }
    })

    const { error: itemsError } = await supabase
      .from('outfit_items')
      .insert(rows)

    if (itemsError) {
      console.error(itemsError)
    } else {
      alert('Outfit saved!')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      {CATEGORIES.map((category) => {
        const items = itemsByCategory[category] || []
        if (items.length === 0) return null

        const index = selectedIndex[category] ?? 0
        const currentItem = items[index]

        return (
          <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={() => cycle(category, -1)}>←</button>
            <div style={{ textAlign: 'center' }}>
              <img src={currentItem.image_url} alt={currentItem.name} style={{ height: 150 }} />
              <p>{currentItem.name}</p>
            </div>
            <button onClick={() => cycle(category, 1)}>→</button>
          </div>
        )
      })}
      <button onClick={saveOutfit}>Save Outfit</button>
    </div>
  )
}