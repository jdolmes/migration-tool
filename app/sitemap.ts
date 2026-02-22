import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://migration-tool-eight.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all unique occupation codes
  const { data: occupations, error } = await supabase
    .from('occupations')
    .select('code')
    .order('code')

  if (error) {
    console.error('Error fetching occupations for sitemap:', error)
    return []
  }

  // Get unique codes (occupations may exist in multiple catalogue versions)
  const uniqueCodes = [...new Set(occupations?.map(o => o.code) || [])]

  // Generate occupation page entries
  const occupationEntries: MetadataRoute.Sitemap = uniqueCodes.map(code => ({
    url: `${BASE_URL}/occupation/${code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  return [...staticPages, ...occupationEntries]
}
