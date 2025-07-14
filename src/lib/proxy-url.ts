import { Logger } from '../types.js'

export function buildProxyUrl({
  baseUrl,
  path,
  headers,
  logger,
}: {
  baseUrl: string
  path: string
  headers: Record<string, any>
  logger: Logger
}) {
  const deploxyRegion = headers['x-deploxy-region']
  const deploxyPkgId = headers['x-deploxy-pkg-id']

  if (!deploxyRegion || !deploxyPkgId) {
    const proxyUrl = new URL(path, baseUrl).href
    logger.info(`proxyHref: ${proxyUrl}`)
    return proxyUrl
  }

  // Ensure remove double slash
  const proxyPath = path.startsWith('/') ? path.slice(1) : path
  const deploxyProxyUrl = new URL(
    `/${deploxyPkgId}/${deploxyRegion}/${proxyPath}`,
    baseUrl,
  ).href
  logger.info(`deploxyHref: ${deploxyProxyUrl}`)
  return deploxyProxyUrl
}
