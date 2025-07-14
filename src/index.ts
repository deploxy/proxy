#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { stdioToSse } from './gateways/stdioToSse.js'
import { sseToStdio } from './gateways/sseToStdio.js'
import { stdioToWs } from './gateways/stdioToWs.js'
import { streamableHttpToStdio } from './gateways/streamableHttpToStdio.js'
import { headers } from './lib/headers.js'
import { corsOrigin } from './lib/corsOrigin.js'
import { getLogger } from './lib/getLogger.js'
import { buildProxyUrl } from './lib/proxy-url.js'

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('stdio', {
      type: 'string',
      description:
        'Command to run an MCP server over Stdio, e.g. "npx -y @modelcontextprotocol/server-filesystem"',
    })
    .option('stdio-args', {
      type: 'array',
      default: [],
      description:
        'Arguments to be passed to the stdio command, e.g. --stdio-args "arg1" "arg2"',
    })
    .option('sse', {
      type: 'string',
      description: 'SSE URL to connect to',
    })
    .option('mcp-path', {
      type: 'string',
      description: 'MCP path to connect to',
    })
    .option('base-url', {
      type: 'string',
      description: 'Base URL to connect to',
    })
    .option('output-transport', {
      type: 'string',
      choices: ['stdio', 'sse', 'ws'],
      default: () => {
        const args = hideBin(process.argv)

        if (args.includes('--stdio')) return 'sse'
        if (args.includes('--sse')) return 'stdio'
        if (args.includes('--mcp-path')) return 'stdio'
        if (args.includes('--base-url')) return 'stdio'

        return 'stdio'
      },
      description:
        'Transport for output. Default is "sse" when using --stdio and "stdio" when using --sse or --mcp-path.',
    })
    .option('port', {
      type: 'number',
      default: 8000,
      description: '(stdio→SSE, stdio→WS) Port for output MCP server',
    })
    .option('base-url', {
      type: 'string',
      default: '',
      description: '(stdio→SSE) Base URL for output MCP server',
    })
    .option('sse-path', {
      type: 'string',
      default: '/sse',
      description: '(stdio→SSE) Path for SSE subscriptions',
    })
    .option('message-path', {
      type: 'string',
      default: '/message',
      description: '(stdio→SSE, stdio→WS) Path for messages',
    })
    .option('log-level', {
      choices: ['debug', 'info', 'none'] as const,
      default: 'info',
      description: 'Logging level',
    })
    .option('cors', {
      type: 'array',
      description:
        'Enable CORS. Use --cors with no values to allow all origins, or supply one or more allowed origins (e.g. --cors "http://example.com" or --cors "/example\\.com$/" for regex matching).',
    })
    .option('health-endpoint', {
      type: 'array',
      default: [],
      description:
        'One or more endpoints returning "ok", e.g. --healthEndpoint /health',
    })
    .option('header', {
      type: 'array',
      default: [],
      description:
        'Headers to be added to the request headers, e.g. --header "x-user-id: 123"',
    })
    .option('oauth2Bearer', {
      type: 'string',
      description:
        'Authorization header to be added, e.g. --oauth2Bearer "some-access-token" adds "Authorization: Bearer some-access-token"',
    })
    .help()
    .parseSync()

  const hasStdio = Boolean(argv.stdio)
  const hasSse = Boolean(argv.sse)
  let hasMcpPath = Boolean(argv.mcpPath) // @deprecated
  let hasBaseUrl = Boolean(argv.baseUrl) // default

  const activeCount = [hasStdio, hasSse, hasMcpPath, hasBaseUrl].filter(
    Boolean,
  ).length

  const logger = getLogger({
    logLevel: argv.logLevel,
    outputTransport: argv.outputTransport as string,
  })

  // if no input transport is specified, default to streamableHttp
  if (activeCount === 0) {
    hasBaseUrl = true
    argv.outputTransport = 'stdio'
  } else if (activeCount > 1) {
    logger.error(
      'Error: Specify only one of --stdio, --sse, or --base-url, not multiple',
    )
    process.exit(1)
  }

  logger.info('Starting MCP Proxy...')
  logger.info(`  - outputTransport: ${argv.outputTransport}`)
  logger.info(`  - stdioArgs: ${argv.stdioArgs}`)
  logger.info(`--------------------------------`)
  logger.info(`  - RAW-ARGV: ${JSON.stringify(argv, null, 2)}`)
  const parsedHeaders = headers({
    argv,
    logger,
  })

  try {
    if (hasStdio) {
      if (argv.outputTransport === 'sse') {
        await stdioToSse({
          stdioCmd: argv.stdio!,
          port: argv.port,
          baseUrl: argv.baseUrl!,
          ssePath: argv.ssePath,
          messagePath: argv.messagePath,
          logger,
          corsOrigin: corsOrigin({ argv }),
          healthEndpoints: argv.healthEndpoint as string[],
          headers: parsedHeaders,
        })
      } else if (argv.outputTransport === 'ws') {
        await stdioToWs({
          stdioCmd: argv.stdio!,
          port: argv.port,
          messagePath: argv.messagePath,
          logger,
          corsOrigin: corsOrigin({ argv }),
          healthEndpoints: argv.healthEndpoint as string[],
        })
      } else {
        logger.error(`Error: stdio→${argv.outputTransport} not supported`)
        process.exit(1)
      }
    } else if (hasSse) {
      if (argv.outputTransport === 'stdio') {
        await sseToStdio({
          sseUrl: argv.sse!,
          logger,
          headers: parsedHeaders,
        })
      } else {
        logger.error(`Error: sse→${argv.outputTransport} not supported`)
        process.exit(1)
      }
    } else if (hasBaseUrl) {
      if (argv.outputTransport === 'stdio') {
        await streamableHttpToStdio({
          streamableHttpUrl: buildProxyUrl({
            baseUrl: argv.baseUrl!,
            path: argv.mcpPath!,
            headers: parsedHeaders,
          }),
          logger,
          headers: parsedHeaders,
        })
      } else {
        logger.error(
          `Error: streamableHttp→${argv.outputTransport} not supported`,
        )
        process.exit(1)
      }
    } else {
      logger.error('Error: Invalid input transport')
      process.exit(1)
    }
  } catch (err) {
    logger.error('Fatal error:', err)
    process.exit(1)
  }
}

main()
