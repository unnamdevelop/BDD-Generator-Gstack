import {
  validateGherkinSyntax,
  parseGherkinText,
  validateScenario,
} from '../../src/gherkin/parser';

describe('Gherkin Parser', () => {
  describe('validateGherkinSyntax', () => {
    it('should accept valid Gherkin with Given/When/Then', () => {
      const gherkin = `
        Scenario: User login
        Given user is on login page
        When user enters credentials
        Then user should be logged in
      `;

      expect(validateGherkinSyntax(gherkin)).toBe(true);
    });

    it('should reject missing Given', () => {
      const gherkin = `
        Scenario: User login
        When user enters credentials
        Then user should be logged in
      `;

      expect(validateGherkinSyntax(gherkin)).toBe(false);
    });

    it('should reject missing When', () => {
      const gherkin = `
        Scenario: User login
        Given user is on login page
        Then user should be logged in
      `;

      expect(validateGherkinSyntax(gherkin)).toBe(false);
    });

    it('should reject missing Then', () => {
      const gherkin = `
        Scenario: User login
        Given user is on login page
        When user enters credentials
      `;

      expect(validateGherkinSyntax(gherkin)).toBe(false);
    });

    it('should be case insensitive', () => {
      const gherkin = `
        Scenario: Test
        given user action
        when something happens
        then result appears
      `;

      expect(validateGherkinSyntax(gherkin)).toBe(true);
    });
  });

  describe('parseGherkinText', () => {
    it('should parse simple scenario', () => {
      const gherkin = `
        Scenario: User login
        Given user is on login page
        When user enters valid credentials
        Then user is redirected to dashboard
      `;

      const scenarios = parseGherkinText(gherkin);

      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].title).toBe('User login');
      expect(scenarios[0].given).toContain('on login page');
      expect(scenarios[0].when).toContain('credentials');
      expect(scenarios[0].then).toContain('dashboard');
    });

    it('should parse multiple scenarios', () => {
      const gherkin = `
        Scenario: Valid login
        Given user is on login page
        When user enters valid credentials
        Then user is logged in

        Scenario: Invalid login
        Given user is on login page
        When user enters invalid credentials
        Then error message appears
      `;

      const scenarios = parseGherkinText(gherkin);

      expect(scenarios).toHaveLength(2);
      expect(scenarios[0].title).toBe('Valid login');
      expect(scenarios[1].title).toBe('Invalid login');
    });

    it('should handle And/But statements', () => {
      const gherkin = `
        Scenario: Complex flow
        Given user is on login page
        And user has valid account
        When user enters credentials
        And user clicks submit
        Then user is logged in
        And user sees welcome message
      `;

      const scenarios = parseGherkinText(gherkin);

      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].given).toContain('and');
      expect(scenarios[0].when).toContain('and');
      expect(scenarios[0].then).toContain('and');
    });

    it('should throw error on empty Gherkin', () => {
      const gherkin = '';

      expect(() => parseGherkinText(gherkin)).toThrow();
    });

    it('should throw error with missing statements', () => {
      const gherkin = `
        Scenario: Incomplete
        Given user action
      `;

      expect(() => parseGherkinText(gherkin)).toThrow();
    });
  });

  describe('validateScenario', () => {
    it('should validate complete scenario', () => {
      const scenario = {
        title: 'User login',
        given: 'user is on login page',
        when: 'user enters credentials',
        then: 'user is logged in',
      };

      expect(validateScenario(scenario)).toBe(true);
    });

    it('should reject missing title', () => {
      const scenario = {
        title: '',
        given: 'user action',
        when: 'something happens',
        then: 'result appears',
      };

      expect(validateScenario(scenario)).toBe(false);
    });

    it('should reject missing given', () => {
      const scenario = {
        title: 'Test',
        given: '',
        when: 'something happens',
        then: 'result appears',
      };

      expect(validateScenario(scenario)).toBe(false);
    });

    it('should reject missing when', () => {
      const scenario = {
        title: 'Test',
        given: 'user action',
        when: '',
        then: 'result appears',
      };

      expect(validateScenario(scenario)).toBe(false);
    });

    it('should reject missing then', () => {
      const scenario = {
        title: 'Test',
        given: 'user action',
        when: 'something happens',
        then: '',
      };

      expect(validateScenario(scenario)).toBe(false);
    });
  });
});
