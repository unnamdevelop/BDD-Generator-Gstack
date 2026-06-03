import { Scenario } from '../types.js';

/**
 * Validates raw Gherkin text contains required keywords
 */
export function validateGherkinSyntax(gherkinText: string): boolean {
  const hasGiven = /Given\s+/i.test(gherkinText);
  const hasWhen = /When\s+/i.test(gherkinText);
  const hasThen = /Then\s+/i.test(gherkinText);

  return hasGiven && hasWhen && hasThen;
}

/**
 * Parses a single Gherkin scenario line
 * Extracts the statement after Given/When/Then keyword
 */
function extractStatement(line: string): string {
  const match = line.match(/(?:Given|When|Then|And|But)\s+(.+)/i);
  return match ? match[1].trim() : '';
}

/**
 * Parses raw Gherkin text into structured Scenario objects
 * Basic parser for simple single-scenario format
 */
export function parseGherkinText(gherkinText: string): Scenario[] {
  try {
    const lines = gherkinText.split('\n').filter(l => l.trim());
    const scenarios: Scenario[] = [];

    let currentScenario: Partial<Scenario> | null = null;
    let currentGiven = '';
    let currentWhen = '';
    let currentThen = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (/^Scenario:/i.test(trimmed)) {
        // Save previous scenario if exists
        if (currentScenario && currentGiven && currentWhen && currentThen) {
          scenarios.push({
            title: currentScenario.title || 'Untitled',
            given: currentGiven,
            when: currentWhen,
            then: currentThen,
          });
        }

        // Start new scenario
        const title = trimmed.replace(/^Scenario:\s*/i, '').trim();
        currentScenario = { title };
        currentGiven = '';
        currentWhen = '';
        currentThen = '';
      } else if (/^Given\s+/i.test(trimmed)) {
        currentGiven += extractStatement(trimmed);
      } else if (/^When\s+/i.test(trimmed)) {
        currentWhen += extractStatement(trimmed);
      } else if (/^Then\s+/i.test(trimmed)) {
        currentThen += extractStatement(trimmed);
      } else if (/^And\s+/i.test(trimmed) || /^But\s+/i.test(trimmed)) {
        // Add And/But to the last statement
        const statement = extractStatement(trimmed);
        if (currentThen) {
          currentThen += ` and ${statement}`;
        } else if (currentWhen) {
          currentWhen += ` and ${statement}`;
        } else if (currentGiven) {
          currentGiven += ` and ${statement}`;
        }
      }
    }

    // Save last scenario
    if (currentScenario && currentGiven && currentWhen && currentThen) {
      scenarios.push({
        title: currentScenario.title || 'Untitled',
        given: currentGiven,
        when: currentWhen,
        then: currentThen,
      });
    }

    if (scenarios.length === 0) {
      throw new Error('No valid scenarios parsed from Gherkin text');
    }

    return scenarios;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Gherkin parsing error:', message);
    throw new Error(`Failed to parse Gherkin: ${message}`);
  }
}

/**
 * Validates a parsed Scenario has all required fields
 */
export function validateScenario(scenario: Scenario): boolean {
  return !!(
    scenario.title &&
    scenario.given &&
    scenario.when &&
    scenario.then
  );
}
