import express, { Request, Response, NextFunction } from 'express';
import { validateWebhookSignature } from './webhook/validator.js';
import { parseJiraEvent, validateStory } from './webhook/parser.js';
import { generateScenarios } from './llm/client.js';
import { parseGherkinText, validateScenario } from './gherkin/parser.js';
import { formatScenariosForConsole } from './gherkin/formatter.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parse raw body for signature validation
app.use(express.raw({ type: 'application/json' }));

// Middleware: convert raw body (Buffer or string) to JSON for normal routes
app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      (req as any).body = JSON.parse(req.body.toString('utf8'));
    } else if (typeof req.body === 'string') {
      (req as any).body = JSON.parse(req.body);
    }
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// JIRA webhook endpoint
app.post(
  '/webhook/jira',
  validateWebhookSignature,
  async (req: Request, res: Response) => {
    const startTime = Date.now();
    const MAX_RESPONSE_TIME = 2000; // 2 seconds

    try {
      // Webhook handler must respond quickly (JIRA times out at 5s)
      // We'll respond immediately, process asynchronously

      // Parse the JIRA event
      const event = (req as any).body;
      const story = parseJiraEvent(event);

      if (!validateStory(story)) {
        console.warn('Invalid story:', story);
        res.status(200).json({ message: 'Webhook received, story invalid' });
        return;
      }

      // Respond immediately (don't wait for Claude)
      res.status(202).json({
        message: 'Webhook received, processing scenarios',
        story_key: story.key,
      });

      // Process asynchronously
      processStoryAsync(story, startTime);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Webhook handler error:', message);
      res.status(400).json({ error: message });
    }
  },
);

/**
 * Process story asynchronously (after webhook response)
 */
async function processStoryAsync(
  story: any,
  startTime: number,
): Promise<void> {
  try {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Processing Story: ${story.key}`);
    console.log(`Summary: ${story.summary}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Generate scenarios from Claude
    const scenarios = await generateScenarios(story);

    // Validate each scenario
    const validScenarios = scenarios.filter(validateScenario);

    if (validScenarios.length === 0) {
      console.error('No valid scenarios generated');
      return;
    }

    // Format for console output
    const output = formatScenariosForConsole(validScenarios);
    console.log(output);

    // Log processing time
    const elapsed = Date.now() - startTime;
    console.log(`\n✓ Complete in ${elapsed}ms`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`\n✗ Processing failed for story: ${message}`);
  }
}

// Error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Start the server
 */
export function startServer(): void {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║  BDD Generator Webhook Server Started             ║
║  Listening on http://localhost:${PORT}                ║
║                                                    ║
║  To test locally:                                 ║
║  POST http://localhost:${PORT}/webhook/jira          ║
║  with JIRA webhook event                          ║
╚═══════════════════════════════════════════════════╝
    `);
  });
}

export default app;
