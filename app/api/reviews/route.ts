import { NextResponse } from 'next/server'
import { getReviews } from '@/lib/reviews'

export const revalidate = 3600

export async function GET() {
  const reviews = await getReviews({ limit: 10 })
  return NextResponse.json(reviews)
}
