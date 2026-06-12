import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Input validation utility using Zod-like pattern (manual for minimal deps).
 * 
 * Usage:
 *   const validation = await base44.functions.invoke('validateInput', {
 *     data: { name: '...', email: '...' },
 *     schema: {
 *       name: { required: true, type: 'string', min: 2, max: 100 },
 *       email: { required: true, type: 'email' },
 *       age: { type: 'number', min: 1 },
 *       role: { required: true, type: 'enum', values: ['admin', 'user'] },
 *       marketplaceId: { required: true, type: 'string' }
 *     }
 *   });
 *   if (validation.data.errors) return Response.json({ error: validation.data.errors }, { status: 400 });
 *   const clean = validation.data.clean;
 */

const validators = {
  string: (val) => typeof val === 'string',
  number: (val) => typeof val === 'number' && !isNaN(val),
  boolean: (val) => typeof val === 'boolean',
  email: (val) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  url: (val) => typeof val === 'string' && /^https?:\/\/.+/.test(val),
  array: (val) => Array.isArray(val),
  object: (val) => typeof val === 'object' && val !== null && !Array.isArray(val),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, schema } = await req.json();

    if (!data || !schema) {
      return Response.json({ errors: [{ field: '_root', message: 'data and schema are required' }] }, { status: 400 });
    }

    const errors = [];
    const clean = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      // Skip optional empty fields
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type check
      if (rules.type) {
        if (rules.type === 'enum') {
          if (!rules.values || !rules.values.includes(value)) {
            errors.push({ field, message: `${field} must be one of: ${(rules.values || []).join(', ')}` });
            continue;
          }
        } else if (validators[rules.type]) {
          if (!validators[rules.type](value)) {
            errors.push({ field, message: `${field} must be a valid ${rules.type}` });
            continue;
          }
        }
      }

      // Min/max for strings
      if (rules.type === 'string' || typeof value === 'string') {
        if (rules.min !== undefined && value.length < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min} characters` });
          continue;
        }
        if (rules.max !== undefined && value.length > rules.max) {
          errors.push({ field, message: `${field} must be at most ${rules.max} characters` });
          continue;
        }
      }

      // Min/max for numbers
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min}` });
          continue;
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({ field, message: `${field} must be at most ${rules.max}` });
          continue;
        }
      }

      clean[field] = value;
    }

    if (errors.length > 0) {
      return Response.json({ errors }, { status: 400 });
    }

    return Response.json({ clean });
  } catch (error) {
    console.error('validateInput error:', error);
    return Response.json({ errors: [{ field: '_root', message: error.message }] }, { status: 500 });
  }
});