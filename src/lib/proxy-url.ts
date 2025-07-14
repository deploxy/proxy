const DEFAULT_REGION = 'us-east-1'

export function buildProxyUrl({
  baseUrl,
  path,
  headers,
}: {
  baseUrl: string
  path: string
  headers: Record<string, any>
}) {
  const deploxyPkgId = headers['x-deploxy-pkg-id']
  if (!deploxyPkgId) {
    const proxyUrl = new URL(path, baseUrl).href
    return proxyUrl
  }

  const deploxyRegion = headers['x-deploxy-region'] || DEFAULT_REGION
  // Ensure avoid double slash
  const proxyPath = path.startsWith('/') ? path.slice(1) : path
  const deploxyProxyUrl = new URL(
    `/${deploxyPkgId}/${deploxyRegion}/${proxyPath}`,
    baseUrl,
  ).href
  return deploxyProxyUrl
}
