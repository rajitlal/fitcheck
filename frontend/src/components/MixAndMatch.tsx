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

  if (loading) return <p className="text-sm text-muted">Loading your closet...</p>

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-base font-semibold tracking-tight">Mix &amp; Match</h2>
      <p className="mt-1 text-sm text-muted">Cycle through your closet to build an outfit.</p>

      <div className="mt-6 divide-y divide-border">
        {CATEGORIES.map((category) => {
          const items = itemsByCategory[category] || []
          if (items.length === 0) return null

          const index = selectedIndex[category] ?? 0
          const currentItem = items[index]

          return (
            <div key={category} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
              <button
                onClick={() => cycle(category, -1)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border text-muted hover:border-text hover:text-text transition-colors"
                aria-label={`Previous ${category}`}
              >
                ←
              </button>

              <div className="flex-1 text-center">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted">{category}</p>
                <img
                  src={currentItem.image_url}
                  alt={currentItem.name}
                  className="mx-auto h-36 w-auto"
                />
                <p className="mt-2 text-sm text-text">{currentItem.name}</p>
                {items.length > 1 && (
                  <p className="mt-0.5 text-xs text-muted">{index + 1} / {items.length}</p>
                )}
              </div>

              <button
                onClick={() => cycle(category, 1)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border text-muted hover:border-text hover:text-text transition-colors"
                aria-label={`Next ${category}`}
              >
                →
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={saveOutfit}
        className="mt-6 w-full rounded-md bg-text py-2 text-sm font-medium text-bg hover:opacity-90 transition-opacity"
      >
        Save Outfit
      </button>
    </section>
  )
}