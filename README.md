# Organizze MCP

An MCP (Model Context Protocol) server that connects Claude to the [Organizze](https://www.organizze.com.br/) personal finance API. Ask Claude natural-language questions about your finances and it will fetch the right data automatically.

## Installation

Add the server to your Claude MCP configuration:

```json
{
  "mcpServers": {
    "organizze-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "organizze-mcp",
        "--organizze-username=YOUR_USERNAME",
        "--organizze-api-key=YOUR_API_KEY"
      ]
    }
  }
}
```

- `YOUR_USERNAME` — the email you use to log in to Organizze
- `YOUR_API_KEY` — found in [Organizze account settings](https://app.organizze.com.br/configuracoes/api-keys)

## Available Tools

### Accounts

| Tool | Description |
|------|-------------|
| `get-bank-accounts` | List all bank accounts or fetch one by ID |

### Transactions

| Tool | Description |
|------|-------------|
| `get-transactions` | List transactions for a date range, optionally filtered by account or recurring status. Defaults to the current month |
| `get-transaction` | Get full details of a single transaction by ID |
| `create-transaction` | Create a one-time expense or income transaction |

### Transfers

| Tool | Description |
|------|-------------|
| `get-transfers` | List transfers between bank accounts for a date range. Defaults to the current month |
| `get-transfer` | Get full details of a single transfer by ID |

### Credit Cards

| Tool | Description |
|------|-------------|
| `get-credit-cards` | List all credit cards or fetch one by ID |
| `get-credit-cards-invoices` | List invoices for a credit card. Defaults to the current year |
| `get-credit-cards-invoice-details` | Get full invoice details including line-item transactions and payment status |

### Budgets and Categories

| Tool | Description |
|------|-------------|
| `get-budgets` | Get monthly or annual budget targets by category |
| `get-categories` | List all categories or fetch one by ID |
| `get-spending-summary` | Get spending grouped by category with totals, percentages, and optional budget comparison |

## Example Prompts

```
What did I spend last month?
```
```
Show me all transactions from my Nubank account in March.
```
```
How close am I to my grocery budget this month?
```
```
List my credit card invoices for 2025.
```
```
I spent R$45 on lunch today — add it to my Food category.
```
```
How much did I transfer between accounts this year?
```

## Development

```bash
npm install
npm run build   # compile TypeScript
npm test        # run the test suite
npm run test:watch  # watch mode
```

A CI workflow runs the build and tests automatically on every pull request.

## License

MIT
