import { JiraWebhookEvent, UserStory } from '../types.js';

/**
 * Parses JIRA webhook event and extracts user story details
 */
export function parseJiraEvent(event: unknown): UserStory {
  try {
    const jiraEvent = event as JiraWebhookEvent;

    if (!jiraEvent.issue) {
      throw new Error('Missing issue field in webhook event');
    }

    const { key, fields } = jiraEvent.issue;

    if (!key) {
      throw new Error('Missing issue key');
    }

    if (!fields.summary) {
      throw new Error('Missing issue summary');
    }

    const description = fields.description || '';

    return {
      key,
      summary: fields.summary,
      description,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error parsing JIRA event:', message);
    throw new Error(`Failed to parse JIRA event: ${message}`);
  }
}

/**
 * Validates that a UserStory has required fields
 */
export function validateStory(story: UserStory): boolean {
  return !!(story.key && story.summary);
}

/**
 * Formats a user story into a prompt for Claude
 */
export function storyToPrompt(story: UserStory): string {
  return `
Convert the following user story into 3-5 BDD test scenarios using Gherkin format.

Story Key: ${story.key}
Summary: ${story.summary}
Description: ${story.description || '(No description provided)'}

Generate scenarios in this JSON format:
{
  "scenarios": [
    {
      "title": "Scenario title",
      "given": "Given condition",
      "when": "When action happens",
      "then": "Then expected result"
    }
  ]
}

Ensure each scenario:
- Has a clear, descriptive title
- Covers a distinct acceptance criterion
- Uses Given/When/Then structure
- Is testable and specific
`.trim();
}
