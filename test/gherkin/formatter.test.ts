import {
  scenarioToGherkin,
  scenariosToFeatureFile,
  formatScenariosForConsole,
} from '../../src/gherkin/formatter';
import { Scenario } from '../../src/types';

describe('Gherkin Formatter', () => {
  const scenario: Scenario = {
    title: 'User login with valid credentials',
    given: 'user is on login page',
    when: 'user enters valid email and password',
    then: 'user is redirected to dashboard',
  };

  describe('scenarioToGherkin', () => {
    it('should format scenario to Gherkin syntax', () => {
      const gherkin = scenarioToGherkin(scenario);

      expect(gherkin).toContain('Scenario: User login with valid credentials');
      expect(gherkin).toContain('Given user is on login page');
      expect(gherkin).toContain('When user enters valid email and password');
      expect(gherkin).toContain('Then user is redirected to dashboard');
    });

    it('should maintain proper indentation', () => {
      const gherkin = scenarioToGherkin(scenario);
      const lines = gherkin.split('\n');

      expect(lines[0]).not.toMatch(/^\s/); // First line not indented
      expect(lines[1]).toMatch(/^\s{2}/); // Given indented
      expect(lines[2]).toMatch(/^\s{2}/); // When indented
      expect(lines[3]).toMatch(/^\s{2}/); // Then indented
    });
  });

  describe('scenariosToFeatureFile', () => {
    it('should create feature file with single scenario', () => {
      const file = scenariosToFeatureFile([scenario], 'Login Feature');

      expect(file).toContain('Feature: Login Feature');
      expect(file).toContain('Scenario: User login with valid credentials');
    });

    it('should create feature file with multiple scenarios', () => {
      const scenario2: Scenario = {
        title: 'User login with invalid credentials',
        given: 'user is on login page',
        when: 'user enters invalid email and password',
        then: 'error message is displayed',
      };

      const file = scenariosToFeatureFile(
        [scenario, scenario2],
        'Login Feature',
      );

      expect(file).toContain('Feature: Login Feature');
      expect(file).toContain('Scenario: User login with valid credentials');
      expect(file).toContain('Scenario: User login with invalid credentials');
    });

    it('should use default feature name if not provided', () => {
      const file = scenariosToFeatureFile([scenario]);

      expect(file).toContain('Feature: Generated Feature');
    });

    it('should add blank lines between scenarios', () => {
      const scenario2: Scenario = {
        title: 'Second scenario',
        given: 'precondition',
        when: 'action',
        then: 'result',
      };

      const file = scenariosToFeatureFile([scenario, scenario2]);
      const lines = file.split('\n');

      const firstScenarioIndex = lines.findIndex(l =>
        l.includes('Scenario: User login'),
      );
      const secondScenarioIndex = lines.findIndex(l =>
        l.includes('Scenario: Second scenario'),
      );

      // Should have blank line(s) between scenarios
      expect(secondScenarioIndex - firstScenarioIndex).toBeGreaterThan(4);
    });
  });

  describe('formatScenariosForConsole', () => {
    it('should format for console output', () => {
      const output = formatScenariosForConsole([scenario]);

      expect(output).toContain('✓ Generated 1 Scenario(s):');
      expect(output).toContain('[Scenario 1]');
      expect(output).toContain('Given:');
      expect(output).toContain('When:');
      expect(output).toContain('Then:');
    });

    it('should format multiple scenarios', () => {
      const scenario2: Scenario = {
        title: 'Second test',
        given: 'setup',
        when: 'action',
        then: 'expected',
      };

      const output = formatScenariosForConsole([scenario, scenario2]);

      expect(output).toContain('✓ Generated 2 Scenario(s):');
      expect(output).toContain('[Scenario 1]');
      expect(output).toContain('[Scenario 2]');
    });

    it('should use correct pluralization', () => {
      const singleOutput = formatScenariosForConsole([scenario]);
      expect(singleOutput).toContain('1 Scenario(s)');

      const multipleOutput = formatScenariosForConsole([scenario, scenario]);
      expect(multipleOutput).toContain('2 Scenario(s)');
    });
  });
});
