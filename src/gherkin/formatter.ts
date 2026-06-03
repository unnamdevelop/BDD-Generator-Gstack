import { Scenario } from '../types.js';

/**
 * Converts a Scenario object to Gherkin (.feature) format
 */
export function scenarioToGherkin(scenario: Scenario): string {
  return `Scenario: ${scenario.title}
  Given ${scenario.given}
  When ${scenario.when}
  Then ${scenario.then}`;
}

/**
 * Converts an array of Scenarios to a complete .feature file format
 */
export function scenariosToFeatureFile(
  scenarios: Scenario[],
  featureName: string = 'Generated Feature',
): string {
  const header = `Feature: ${featureName}

`;
  const body = scenarios
    .map((scenario, index) => {
      const gherkin = scenarioToGherkin(scenario);
      // Add blank line between scenarios
      return index === 0 ? gherkin : `\n${gherkin}`;
    })
    .join('\n');

  return header + body;
}

/**
 * Formats scenarios for console output (readable debugging)
 */
export function formatScenariosForConsole(scenarios: Scenario[]): string {
  const lines = scenarios.map((s, i) => {
    return `
[Scenario ${i + 1}] ${s.title}
  Given: ${s.given}
  When:  ${s.when}
  Then:  ${s.then}
`;
  });

  return `\n✓ Generated ${scenarios.length} Scenario(s):\n${lines.join('\n')}`;
}
