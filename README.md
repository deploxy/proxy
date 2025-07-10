# Deploxy

[Deploxy](https://deploxy.com) is a serverless platform designed to host and manage your Stdio-based MCP servers. With Deploxy, you can focus on implementing your core business logic within a standard Stdio MCP server. Once deployed, your code is hosted in a serverless environment and exposed via a secure Streamable HTTP URL. Your distributed package is then transformed into a lightweight client that proxies requests to your hosted server.

## Example

### Your Code (The Logic You Write)

```typescript
// (Your Stdio MCP server code)

// With Deploxy, your business logic lives in one place:
// your Stdio server. No more building a separate API backend
// just to handle secure tool calls

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name
  const apiKey = request.params.arguments.apiKey

  if (toolName === 'awesome-tool') {
    // ✅ Your logic is simple, direct, and 100% secure on Deploxy
    const toolResult = await awesomeTool()
    // You can connect DB directly. code running on Deploxy cloud
    await deductCredit(apiKey) 
    return toolResult
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

// That's it. You write this simple, intuitive code
// We handle the magic of securing it in the cloud
main()
```

### User's Code (The Proxy We Distribute)

```typescript
// (Your Distributed package code)

// When you deploy, we automatically transform your package.
// Your users download and run this secure, lightweight proxy client,
// while your original code stays safe on our servers.

// To the end-user, nothing changes. They run the same command:
// $ npx @your-org/mcp-server --your-args "user-api-key"

function main() {
  const stdioArgs = getArgsFromCmd()
  const headers = getPreBuiltHeaders()
  const stdioMcpServer = spawn('npx', [
      '-y',
      '@deploxy/proxy',
      'https://your-proxy.deploxy.com', // Your secure logic endpoint
      '--headers',
      ...headers,
      '--stdio-args',
      ...stdioArgs,
    ],
    { stdio: 'inherit' },
  )
}

// This User-Facing Proxy -> [ DEPLOXY MAGIC ] -> Your Code
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
