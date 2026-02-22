import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import OccupationDetailClient from './OccupationDetailClient'

interface PageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params

  // Fetch occupation data for metadata
  const { data: occupations, error } = await supabase
    .from('occupations')
    .select('code, principal_title, skill_level, description')
    .eq('code', code)
    .order('catalogue_version', { ascending: false })
    .limit(1)

  if (error || !occupations || occupations.length === 0) {
    return {
      title: `Occupation ${code} - Visa Eligibility`,
      description: `Check Australian visa eligibility for occupation code ${code}. Find eligible visa pathways including skilled migration options.`,
    }
  }

  const occupation = occupations[0]

  // Fetch visa eligibility count for richer description
  const { count: eligibleVisaCount } = await supabase
    .from('visa_eligibility')
    .select('*', { count: 'exact', head: true })
    .eq('anzsco_code', code)
    .eq('is_eligible', true)

  const visaInfo = eligibleVisaCount && eligibleVisaCount > 0
    ? `Eligible for ${eligibleVisaCount} visa pathway${eligibleVisaCount > 1 ? 's' : ''}.`
    : 'Check visa eligibility options.'

  const title = `${occupation.principal_title} (${code}) - Australian Visa Eligibility`

  const description = occupation.description
    ? `${occupation.principal_title} - ${occupation.description.substring(0, 120)}${occupation.description.length > 120 ? '...' : ''} ${visaInfo}`
    : `Check Australian visa eligibility for ${occupation.principal_title} (ANZSCO ${code}). Skill Level ${occupation.skill_level || 'N/A'}. ${visaInfo}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/occupation/${code}`,
    },
  }
}

export default async function OccupationDetailPage() {
  return <OccupationDetailClient />
}
