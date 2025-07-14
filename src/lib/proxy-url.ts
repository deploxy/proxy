export function buildProxyUrl({
  baseUrl,
  path,
  headers,
}: {
  baseUrl: string
  path: string
  headers: Record<string, any>
}) {
  const deploxyRegion = headers['x-deploxy-region']
  const deploxyPkgId = headers['x-deploxy-pkg-id']

  if (!deploxyRegion || !deploxyPkgId) {
    const proxyUrl = new URL(path, baseUrl).href
    return proxyUrl
  }

  // Ensure avoid double slash
  const proxyPath = path.startsWith('/') ? path.slice(1) : path
  const deploxyProxyUrl = new URL(
    `/${deploxyPkgId}/${deploxyRegion}/${proxyPath}`,
    baseUrl,
  ).href
  return deploxyProxyUrl
}
