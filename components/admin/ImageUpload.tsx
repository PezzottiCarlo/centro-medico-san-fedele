'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
}

export function ImageUpload({ value, onChange, folder = 'uploads', label = 'Immagine' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [errore, setErrore] = useState('')
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    setErrore('')

    // Avanzamento simulato: fetch non espone il progresso dell'upload
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90))
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const dati = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      // Il server spiega il motivo (troppo grande, formato non ammesso…)
      if (!res.ok || !dati.url) throw new Error(dati.error || 'Caricamento non riuscito')

      setProgress(100)
      onChange(dati.url)
    } catch (err) {
      setErrore(
        err instanceof Error && err.message !== 'Failed to fetch'
          ? `${err.message}. Riprova.`
          : 'Errore di connessione durante il caricamento. Riprova.'
      )
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
      setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full bg-slate-700 border border-slate-600 border-dashed text-slate-400 rounded px-4 py-4 hover:border-primary hover:text-primary transition-colors text-sm flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>Caricamento... {progress}%</>
        ) : (
          <>
            <Upload size={16} /> Scegli immagine
          </>
        )}
      </button>
      {uploading && (
        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Anteprima"
            className="h-20 rounded border border-slate-600 object-contain bg-slate-700"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400"
          >
            <X size={12} />
          </button>
        </div>
      )}
      {errore && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {errore}
        </p>
      )}
    </div>
  )
}
