import { parseJiraEvent, validateStory, storyToPrompt } from '../../src/webhook/parser';

describe('JIRA Event Parser', () => {
  describe('parseJiraEvent', () => {
    it('should parse valid JIRA webhook event', () => {
      const event = {
        issue: {
          key: 'TEST-1',
          fields: {
            summary: 'User login functionality',
            description: 'Users should be able to login with email and password',
          },
        },
      };

      const story = parseJiraEvent(event);

      expect(story.key).toBe('TEST-1');
      expect(story.summary).toBe('User login functionality');
      expect(story.description).toBe('Users should be able to login with email and password');
    });

    it('should handle missing description', () => {
      const event = {
        issue: {
          key: 'TEST-2',
          fields: {
            summary: 'Create dashboard',
          },
        },
      };

      const story = parseJiraEvent(event);

      expect(story.key).toBe('TEST-2');
      expect(story.summary).toBe('Create dashboard');
      expect(story.description).toBe('');
    });

    it('should throw error on missing key', () => {
      const event = {
        issue: {
          fields: {
            summary: 'Some feature',
          },
        },
      };

      expect(() => parseJiraEvent(event)).toThrow('Missing issue key');
    });

    it('should throw error on missing summary', () => {
      const event = {
        issue: {
          key: 'TEST-3',
          fields: {
            description: 'Description without summary',
          },
        },
      };

      expect(() => parseJiraEvent(event)).toThrow('Missing issue summary');
    });

    it('should throw error on missing issue', () => {
      const event = {};

      expect(() => parseJiraEvent(event)).toThrow('Missing issue field');
    });
  });

  describe('validateStory', () => {
    it('should return true for valid story', () => {
      const story = {
        key: 'TEST-1',
        summary: 'Feature',
        description: 'Description',
      };

      expect(validateStory(story)).toBe(true);
    });

    it('should return false if missing key', () => {
      const story = {
        key: '',
        summary: 'Feature',
        description: 'Description',
      };

      expect(validateStory(story)).toBe(false);
    });

    it('should return false if missing summary', () => {
      const story = {
        key: 'TEST-1',
        summary: '',
        description: 'Description',
      };

      expect(validateStory(story)).toBe(false);
    });
  });

  describe('storyToPrompt', () => {
    it('should generate prompt from story', () => {
      const story = {
        key: 'TEST-1',
        summary: 'User login',
        description: 'Users can login with credentials',
      };

      const prompt = storyToPrompt(story);

      expect(prompt).toContain('TEST-1');
      expect(prompt).toContain('User login');
      expect(prompt).toContain('Users can login with credentials');
      expect(prompt).toContain('Given');
      expect(prompt).toContain('When');
      expect(prompt).toContain('Then');
    });

    it('should handle empty description', () => {
      const story = {
        key: 'TEST-2',
        summary: 'Create dashboard',
        description: '',
      };

      const prompt = storyToPrompt(story);

      expect(prompt).toContain('No description provided');
    });
  });
});
