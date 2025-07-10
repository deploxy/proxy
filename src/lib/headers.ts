import express from 'express'
import { Logger } from '../types.js'

const parseHeaders = ({
  argvHeader,
  logger,
}: {
  argvHeader: (string | number)[]
  logger: Logger
}): Record<string, string> => {
  return argvHeader.reduce<Record<string, string>>((acc, rawHeader) => {
    const header = `${rawHeader}`

    const colonIndex = header.indexOf(':')
    if (colonIndex === -1) {
      logger.error(`Invalid header format: ${header}, ignoring`)
      return acc
    }

    const key = header.slice(0, colonIndex).trim()
    const value = header.slice(colonIndex + 1).trim()

    if (!key || !value) {
      logger.error(`Invalid header format: ${header}, ignoring`)
      return acc
    }

    acc[key] = value
    return acc
  }, {})
}

export const headers = ({
  argv,
  logger,
}: {
  argv: {
    header: (string | number)[]
    'stdio-args': (string | number)[]
    oauth2Bearer: string | undefined
  }
  logger: Logger
}): Record<string, string> => {
  let headers = parseHeaders({
    argvHeader: argv.header,
    logger,
  })

  const stdioArgs = argv['stdio-args']
  if (stdioArgs && stdioArgs.length > 0) {
    headers['stdio-args'] = stdioArgs.join(' ')
  }

  if ('oauth2Bearer' in argv) {
    return {
      ...headers,
      Authorization: `Bearer ${argv.oauth2Bearer}`,
    }
  }

  return headers
}

export const setResponseHeaders = ({
  res,
  headers,
}: {
  res: express.Response
  headers: Record<string, string>
}) =>
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
