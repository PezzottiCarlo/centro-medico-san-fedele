'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { SearchResult } from '@/types'

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function useSearch() {
  const [query_, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const qLower = q.toLowerCase()

        // Search medici
        const mediciSnap = await getDocs(
          query(
            collection(db, 'medici'),
            where('pubblicato', '==', true),
            limit(5)
          )
        )
        const medici: SearchResult[] = mediciSnap.docs
          .filter((d) => d.data().nome?.toLowerCase().includes(qLower))
          .map((d) => ({
            id: d.id,
            type: 'medico',
            nome: d.data().nome,
            slug: d.data().slug,
            descrizione: d.data().bio?.substring(0, 80) + '...',
          }))

        // Search specialistiche
        const specSnap = await getDocs(
          query(collection(db, 'specialistiche'), limit(20))
        )
        const spec: SearchResult[] = specSnap.docs
          .filter((d) => d.data().nome?.toLowerCase().includes(qLower))
          .map((d) => ({
            id: d.id,
            type: 'specialistica',
            nome: d.data().nome,
            slug: d.data().slug,
            descrizione: d.data().descrizioneBreve,
          }))

        // Search patologie
        const patSnap = await getDocs(
          query(collection(db, 'patologie'), limit(20))
        )
        const pat: SearchResult[] = patSnap.docs
          .filter((d) => d.data().nome?.toLowerCase().includes(qLower))
          .map((d) => ({
            id: d.id,
            type: 'patologia',
            nome: d.data().nome,
            slug: d.data().slug,
          }))

        setResults([...medici, ...spec, ...pat].slice(0, 8))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    search(query_)
  }, [query_, search])

  return { query: query_, setQuery, results, loading }
}
