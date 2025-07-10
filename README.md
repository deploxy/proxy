# @deploxy/proxy

`@deploxy/proxy` is a command-line tool that exposes a remote Streamable HTTP-based MCP server as a local stdio interface. This allows you to seamlessly integrate and interact with remote MCP servers from your local development tools, such as Claude Desktop or Cursor IDE.

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
