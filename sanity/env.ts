export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-05'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || ''

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

export const hasSanityEnv = Boolean(dataset && projectId)

export function getSanityEnvError(): string {
  if (!projectId && !dataset) {
    return 'Missing environment variables: NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET'
  }

  if (!projectId) {
    return 'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
  }

  return 'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
}

export function assertSanityEnv() {
  if (!hasSanityEnv) {
    throw new Error(getSanityEnvError())
  }
}

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
