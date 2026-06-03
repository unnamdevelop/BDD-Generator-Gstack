import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { ValidationResult } from '../types.js';

const WEBHOOK_SECRET = process.env.JIRA_WEBHOOK_SECRET || '';

/**
 * Validates JIRA webhook signature using HMAC-SHA256
 * JIRA sends: X-Atlassian-Webhook-Token header with HMAC(secret, body)
 * For local development, signature validation is skipped if JIRA_WEBHOOK_SECRET is not set
 */
export function validateWebhookSignature(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const signature = req.headers['x-atlassian-webhook-token'] as string;
    const body = req.body as string;

    // Skip validation in development if secret not configured
    if (!WEBHOOK_SECRET) {
      console.warn('⚠️  Webhook signature validation skipped (JIRA_WEBHOOK_SECRET not set)');
      next();
      return;
    }

    // Production: require valid signature
    if (!signature) {
      console.error('Missing webhook signature header');
      res.status(401).json({ error: 'Missing signature header' });
      return;
    }

    // Compute HMAC-SHA256 of the request body
    const computed = createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    try {
      if (!timingSafeEqual(Buffer.from(signature), Buffer.from(computed))) {
        console.error('Webhook signature mismatch');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    } catch {
      console.error('Webhook signature verification failed');
      res.status(401).json({ error: 'Signature verification failed' });
      return;
    }

    next();
  } catch (error) {
    console.error('Webhook validation error:', error);
    res.status(400).json({ error: 'Webhook validation error' });
  }
}

/**
 * Standalone validation function for testing
 */
export function validateSignature(
  body: string,
  signature: string,
  secret: string = WEBHOOK_SECRET,
): ValidationResult {
  if (!signature) {
    return { valid: false, error: 'Missing signature' };
  }

  if (!secret) {
    return { valid: false, error: 'Webhook secret not configured' };
  }

  try {
    const computed = createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    try {
      const isValid = timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computed),
      );
      if (!isValid) {
        return { valid: false, error: 'Signature mismatch' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Signature mismatch' };
    }
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}
