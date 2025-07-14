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
    return new URL(path, baseUrl).href
  }

  // Ensure remove double slash
  const proxyPath = path.startsWith('/') ? path.slice(1) : path
  return new URL(`/${deploxyPkgId}/${deploxyRegion}/${proxyPath}`, baseUrl).href
}
