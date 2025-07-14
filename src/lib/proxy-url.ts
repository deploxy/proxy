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
  try {
    const deploxyRegion = headers['x-deploxy-region']
    const deploxyPkgId = headers['x-deploxy-pkg-id']

    logger.info(`Building proxy URL with deploxyRegion: ${deploxyRegion}`)
    logger.info(`Building proxy URL with deploxyPkgId: ${deploxyPkgId}`)

    if (!deploxyRegion || !deploxyPkgId) {
      const proxyUrl = new URL(path, baseUrl).href
      logger.info(`proxyHref: ${proxyUrl}`)
      return proxyUrl
    }

    // Ensure remove double slash
    const proxyPath = path.startsWith('/') ? path.slice(1) : path
    logger.info(`Building proxy URL with proxyPath: ${proxyPath}`)
    const deploxyProxyUrl = new URL(
      `/${deploxyPkgId}/${deploxyRegion}/${proxyPath}`,
      baseUrl,
    ).href
    logger.info(`deploxyHref: ${deploxyProxyUrl}`)
    return deploxyProxyUrl
  } catch (err) {
    logger.error(`Error building proxy URL`)
    logger.error(JSON.stringify(err, null, 2))
    throw err
  }
}
