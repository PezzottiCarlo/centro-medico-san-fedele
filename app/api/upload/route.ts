import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebase/admin'
import { getStorage } from 'firebase-admin/storage'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${Date.now()}_${safeName}`

    const bucket = getStorage(getAdminApp()).bucket()
    const fileRef = bucket.file(`${folder}/${filename}`)

    await fileRef.save(buffer, { metadata: { contentType: file.type } })
    await fileRef.makePublic()

    const url = `https://storage.googleapis.com/${bucket.name}/${folder}/${filename}`
    console.log(`[Upload] Firebase: ${url}`)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[Upload] Failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
