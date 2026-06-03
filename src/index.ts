import dotenv from 'dotenv';
import { startServer } from './server.js';

// Load environment variables
dotenv.config();

// Verify required environment variables
const requiredEnvVars = ['ANTHROPIC_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Create a .env file with:');
    console.error('  ANTHROPIC_API_KEY=your_key_here');
    console.error('  JIRA_WEBHOOK_SECRET=your_secret_here (optional for testing)');
    process.exit(1);
  }
}

// Start the server
startServer();
