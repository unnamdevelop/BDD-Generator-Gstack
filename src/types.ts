// JIRA webhook event structure
export interface JiraWebhookEvent {
  issue: {
    key: string;
    fields: {
      summary: string;
      description?: string;
    };
  };
}

// User story extracted from JIRA
export interface UserStory {
  key: string;
  summary: string;
  description: string;
}

// Gherkin scenario structure
export interface Scenario {
  title: string;
  given: string;
  when: string;
  then: string;
}

// Generated scenarios response from Claude
export interface ScenariosResponse {
  scenarios: Scenario[];
}

// Webhook validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
