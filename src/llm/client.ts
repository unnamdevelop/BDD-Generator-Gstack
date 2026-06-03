import Anthropic from '@anthropic-ai/sdk';
import { Scenario, ScenariosResponse } from '../types.js';
import { storyToPrompt } from '../webhook/parser.js';
import { UserStory } from '../types.js';

// Lazy initialization to ensure environment variables are loaded
function getClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

const SYSTEM_PROMPT = `You are an expert QA engineer specializing in Behavior Driven Development (BDD).
Your task is to convert user stories into clear, testable Gherkin scenarios.
Each scenario should follow the Given-When-Then format and be specific enough to automate.
Return your response as valid JSON matching the provided schema.`;

/**
 * Generates BDD scenarios from a user story using Claude
 */
export async function generateScenarios(story: UserStory): Promise<Scenario[]> {
  try {
    console.log(`\n→ Generating scenarios for story ${story.key}...`);

    const prompt = storyToPrompt(story);
    const client = getClient();

    const response = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    let parsed: ScenariosResponse;
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = content.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      parsed = JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse Claude response as JSON:', content.text);
      throw new Error('Claude response was not valid JSON');
    }

    if (!parsed.scenarios || !Array.isArray(parsed.scenarios)) {
      throw new Error('Response missing scenarios array');
    }

    if (parsed.scenarios.length === 0) {
      throw new Error('Claude generated no scenarios');
    }

    // Validate each scenario
    const validScenarios = parsed.scenarios.filter((s: unknown) => {
      const scenario = s as Partial<Scenario>;
      if (!scenario.title || !scenario.given || !scenario.when || !scenario.then) {
        console.warn('Skipping invalid scenario:', s);
        return false;
      }
      return true;
    });

    if (validScenarios.length === 0) {
      throw new Error('No valid scenarios in Claude response');
    }

    console.log(`✓ Generated ${validScenarios.length} scenario(s)`);
    return validScenarios as Scenario[];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating scenarios:', message);
    throw new Error(`Scenario generation failed: ${message}`);
  }
}

/**
 * Tests Claude connectivity (useful for debugging)
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Say OK',
        },
      ],
    });

    return response.content.length > 0;
  } catch (error) {
    console.error('Claude connection test failed:', error);
    return false;
  }
}
