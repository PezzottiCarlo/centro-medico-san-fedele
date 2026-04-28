import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const isProduction = process.env.NODE_ENV === 'production'

async function uploadLocal(buffer: Buffer, folder: string, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)
  return `/uploads/${folder}/${filename}`
}

async function uploadFirebase(buffer: Buffer, folder: string, filename: string, contentType: string): Promise<string> {
  const { getAdminApp } = await import('@/lib/firebase/admin')
  const { getStorage } = await import('firebase-admin/storage')

  const bucket = getStorage(getAdminApp()).bucket()
  const fileRef = bucket.file(`${folder}/${filename}`)

  await fileRef.save(buffer, { metadata: { contentType } })
  await fileRef.makePublic()

  return `https://storage.googleapis.com/${bucket.name}/${folder}/${filename}`
}

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

    const url = isProduction
      ? await uploadFirebase(buffer, folder, filename, file.type)
      : await uploadLocal(buffer, folder, filename)

    console.log(`[Upload] ${isProduction ? 'Firebase' : 'Local'}: ${url}`)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[Upload] Failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
