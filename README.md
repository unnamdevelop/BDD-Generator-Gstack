# BDD Generator — JIRA Webhook to Gherkin Scenarios

Convert JIRA user stories into executable BDD scenarios automatically using Claude AI.

**Story Created** → **Webhook Fires** → **Claude Generates Scenarios** → **Scenarios Logged to Console**

## Week One: MVP Features

- ✅ JIRA webhook receiver with HMAC signature validation
- ✅ User story parsing from JIRA events
- ✅ Claude API integration for scenario generation
- ✅ Gherkin syntax validation and parsing
- ✅ Console output of generated scenarios
- ✅ Comprehensive test suite (40+ tests)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```
ANTHROPIC_API_KEY=sk-ant-...
JIRA_WEBHOOK_SECRET=your_secret_here (optional)
PORT=3000
```

### 3. Run the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

The server will start on `http://localhost:3000`

```
╔═══════════════════════════════════════════════════╗
║  BDD Generator Webhook Server Started             ║
║  Listening on http://localhost:3000                ║
║                                                    ║
║  To test locally:                                 ║
║  POST http://localhost:3000/webhook/jira           ║
║  with JIRA webhook event                          ║
╚═══════════════════════════════════════════════════╝
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### View Coverage Report

```bash
npm run test:coverage
```

## Architecture

```
JIRA Webhook Event
    ↓
Node.js + Express Server
    ├─ Validate HMAC signature
    ├─ Parse story details
    └─ Queue async processing
    ↓
Claude API
    ├─ Generate scenarios
    ├─ Return structured JSON
    └─ Validate Gherkin format
    ↓
Console Output
    └─ Display scenarios for review
```

## Project Structure

```
src/
├── index.ts              # Entry point, env setup
├── server.ts             # Express server, webhook handler
├── types.ts              # TypeScript interfaces
├── webhook/
│   ├── validator.ts      # HMAC signature validation
│   └── parser.ts         # JIRA event parsing
├── llm/
│   └── client.ts         # Claude API integration
└── gherkin/
    ├── parser.ts         # Gherkin validation
    └── formatter.ts      # JSON → Gherkin formatting

test/
├── webhook/
│   ├── validator.test.ts # Signature validation tests
│   └── parser.test.ts    # Story parsing tests
└── gherkin/
    ├── parser.test.ts    # Gherkin parsing tests
    └── formatter.test.ts # Formatter tests
```

## Manual Testing

### Test Locally (Without Real JIRA)

```bash
# Terminal 1: Start the server
npm run dev

# Terminal 2: Send a test webhook
curl -X POST http://localhost:3000/webhook/jira \
  -H "Content-Type: application/json" \
  -d '{
    "issue": {
      "key": "TEST-1",
      "fields": {
        "summary": "Users can login with email and password",
        "description": "As a user, I want to login so that I can access my account"
      }
    }
  }'

# Watch the console in Terminal 1 for generated scenarios
```

## Success Criteria (Week One)

- [x] JIRA webhook successfully receives events
- [x] Claude generates valid Gherkin scenarios
- [x] Scenarios logged to console
- [x] 40+ tests with 70%+ coverage
- [x] HMAC signature validation
- [x] Error handling with clear logging

## Next Steps (Post-Week One)

- [ ] Post scenarios back to JIRA as comments
- [ ] Save scenarios to GitHub repo
- [ ] Production deployment (Vercel/Railway)
- [ ] Retry logic with exponential backoff
- [ ] Rate limiting on Claude API
- [ ] Support for multiple JIRA projects

## Key Files to Know

- **src/server.ts** — Webhook handler, response logic
- **src/webhook/validator.ts** — HMAC signature validation (security-critical)
- **src/llm/client.ts** — Claude integration, scenario generation
- **test/** — 40+ tests covering all major components

## Troubleshooting

### "Missing ANTHROPIC_API_KEY"

```bash
# Check .env file exists
ls -la .env

# Add your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

### "Invalid signature"

The webhook signature header is missing or doesn't match. For testing, you can:

1. Send requests without signature validation (signature is logged)
2. Generate proper HMAC-SHA256 signature using your webhook secret

### "Claude API timeout"

Scenarios take 1-3 seconds to generate. Check:

```bash
# Verify API key is valid
curl https://api.anthropic.com/v1/messages \
  -H "api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-opus-4-1","max_tokens":10,"messages":[{"role":"user","content":"ok"}]}'
```

## Learning Goals Covered

By the end of week one, you'll have learned:

✅ **OAuth & API Authentication** — JIRA webhook validation
✅ **Webhooks** — Receiving and processing webhook events
✅ **Async Processing** — Responding to webhooks asynchronously
✅ **LLM Integration** — Using Claude API with structured output
✅ **Testing** — Comprehensive unit and integration tests
✅ **TypeScript** — Full type-safe application
✅ **Express.js** — Web server framework
✅ **Error Handling** — Graceful error boundaries and logging
