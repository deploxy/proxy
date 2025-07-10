# Deploxy

[Deploxy](https://deploxy.com) is a serverless platform designed to host and manage your Stdio-based MCP servers. With Deploxy, you can focus on implementing your core business logic within a standard Stdio MCP server. Once deployed, your code is hosted in a serverless environment and exposed via a secure Streamable HTTP URL. Your distributed package is then transformed into a lightweight client that proxies requests to your hosted server.

## Example

### Your Stdio MCP code

```typescript
// (Before Deploxy)
// This is your original Stdio MCP server code,
// which runs directly on the user's local machine.
// e.g., `npx -y @your-org/mcp-server --apiKey=user-api-key`

// Let's say we want to charge credits for each tool call.
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name
  const apiKey = request.params.arguments.apiKey

  switch (toolName) {
    case 'awesome-stdio-mcp-tool':
      // Ideally, we would implement the tool logic and credit
      // deduction directly in this file.
      // const toolResult = await awesomeTool();
      // await deductCredit(apiKey);

      // However, with a public Stdio MCP server, users can
      // download the package, modify the source to remove the
      // credit deduction logic, and run it locally.
      // e.g., `node /path/to/mcp-server/modified.js`

      // This makes it impossible to protect your business logic,
      // enforce usage limits, or implement secure billing.
      // Your intellectual property is exposed, and there's no
      // reliable way to monetize your service.

      // To securely implement a credit system, you must move the
      // core logic to a private backend API. This is the problem
      // Deploxy solves. We host your sensitive MCP server code
      // in a secure, serverless environment, exposing it via a proxy.
      const toolResult = await yourApiClient({ toolName, apiKey })
      return toolResult

    default: // handle error
  }
})

async function yourApiClient({ toolName, apiKey }) {
  const toolCallResponse = await fetch(
    `https://api.your-server.com/${toolName}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  )
  return toolCallResponse.json()
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main()
```

### Your Distributed NPM Package

```typescript
// (After Deploxy)
// After deploying to Deploxy, your distributed package
// becomes a simple proxy. This is the code that now
// runs on the user's local machine.
// e.g., `npx -y @your-org/mcp-server --apiKey=user-api-key`

// Your business logic and credit deduction code now run
// securely on the server-side. Users run this lightweight
// proxy client, which forwards all requests to your hosted server.
function main() {
  const proxyUrl = getProxyUrl(configs)
  const headers = getHeaders(configs)
  const stdioArgs = parseStdioArgs(configs)
  const mcp = spawn(
    'npx',
    [
      '-y',
      '@deploxy/proxy',
      proxyUrl,
      '--header',
      ...headers,
      '--stdio-args',
      ...stdioArgs,
    ],
    { stdio: 'inherit' },
  )

  mcp.stdout.on('data', (data) => {
    console.log(data)
  })

  mcp.stderr.on('data', (data) => {
    console.error(data)
  })

  mcp.on('error', (error) => {
    console.error(error)
    process.exit(1)
  })

  mcp.on('exit', process.exit)
}

main()
```

## Usage

You can run `@deploxy/proxy` directly using `npx`. Here is the basic command structure for connecting to a remote MCP server:

```bash
npx -y @deploxy/proxy "https://your-proxy-url.com" --headers "Content-Type: application/json" --stdio-args "example-api-key" "example-args"
```

- `<url>`: The endpoint URL of the remote Streamable HTTP MCP server you want to connect to.
- `--headers`: Specifies HTTP headers to include in requests sent to the remote server. This is useful for passing authentication tokens or other metadata.
- `--stdio-args`: Arguments that will be passed to the stdio-based command running through the proxy.

## MCP Client Configs

`@deploxy/proxy` can be easily integrated with any MCP-compliant client, such as Claude Desktop or Cursor IDE.

### Claude Desktop

You can register the remote MCP server by adding the following configuration to your Claude Desktop settings file:

```json
{
  "mcpServers": {
    "deploxy-proxy": {
      "command": "npx",
      "args": [
        "-y",
        "@deploxy/proxy",
        "https://your-mcp-server.example.com",
        "--headers",
        "Authorization: Bearer YOUR_ACCESS_TOKEN",
        "--stdio-args",
        "Custosm stdio args1",
        "Custosm stdio args2",
        "..."
      ]
    }
  }
}
```

### Cursor IDE

Cursor IDE can be configured in a similar way. Add the following to your mcp configs file:

```json
{
  "mcpServers": {
    "deploxy-proxy": {
      "command": "npx",
      "args": [
        "-y",
        "@deploxy/proxy",
        "https://your-mcp-server.example.com",
        "--headers",
        "Authorization: Bearer YOUR_ACCESS_TOKEN",
        "--stdio-args",
        "Custosm stdio args1",
        "Custosm stdio args2",
        "..."
      ]
    }
  }
}
```
