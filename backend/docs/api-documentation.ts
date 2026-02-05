/**
 * API Documentation Generator
 *
 * Generates documentation for tRPC routes
 * Supports OpenAPI-like schema generation
 */

import type { AnyRouter, ProcedureType } from '@trpc/server';

// ============================================
// Types
// ============================================

export interface EndpointDoc {
  path: string;
  type: ProcedureType;
  description?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  tags?: string[];
  examples?: Array<{
    name: string;
    input: unknown;
    output?: unknown;
  }>;
}

export interface APIDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  endpoints: EndpointDoc[];
}

// ============================================
// Documentation Registry
// ============================================

const endpointDocs = new Map<string, Partial<EndpointDoc>>();

/**
 * Register documentation for an endpoint
 */
export function documentEndpoint(
  path: string,
  doc: Omit<EndpointDoc, 'path' | 'type'>
): void {
  endpointDocs.set(path, doc);
}

/**
 * Get documentation for an endpoint
 */
export function getEndpointDoc(path: string): Partial<EndpointDoc> | undefined {
  return endpointDocs.get(path);
}

// ============================================
// API Endpoints Documentation
// ============================================

// Auth endpoints
documentEndpoint('auth.register', {
  description: 'Register a new user account',
  tags: ['auth'],
  input: {
    email: 'string (required) - User email address',
    password: 'string (required) - User password (min 6 characters)',
    name: 'string (required) - User display name',
  },
  output: {
    user: 'User object with id, email, name',
    accessToken: 'JWT access token',
    refreshToken: 'JWT refresh token',
  },
  examples: [
    {
      name: 'Basic registration',
      input: {
        email: 'user@example.com',
        password: 'secure123',
        name: 'John Doe',
      },
    },
  ],
});

documentEndpoint('auth.login', {
  description: 'Authenticate and login a user',
  tags: ['auth'],
  input: {
    email: 'string (required) - User email address',
    password: 'string (required) - User password',
  },
  output: {
    user: 'User object',
    accessToken: 'JWT access token',
    refreshToken: 'JWT refresh token',
  },
});

documentEndpoint('auth.logout', {
  description: 'Logout the current user',
  tags: ['auth'],
  input: {},
  output: {
    success: 'boolean',
  },
});

documentEndpoint('auth.refreshToken', {
  description: 'Refresh access token using refresh token',
  tags: ['auth'],
  input: {
    refreshToken: 'string (required) - Valid refresh token',
  },
  output: {
    accessToken: 'New JWT access token',
    refreshToken: 'New JWT refresh token',
  },
});

// Analysis endpoints
documentEndpoint('analysis.create', {
  description: 'Create a new drawing analysis',
  tags: ['analysis'],
  input: {
    imageBase64: 'string (required) - Base64 encoded image',
    childId: 'string (optional) - Child profile ID',
    metadata: 'object (optional) - Additional metadata',
  },
  output: {
    id: 'Analysis ID',
    status: 'pending | processing | completed | failed',
    createdAt: 'ISO timestamp',
  },
});

documentEndpoint('analysis.get', {
  description: 'Get analysis by ID',
  tags: ['analysis'],
  input: {
    id: 'string (required) - Analysis ID',
  },
  output: {
    id: 'Analysis ID',
    status: 'Analysis status',
    result: 'Analysis result object (if completed)',
    imageUrl: 'Original image URL',
    createdAt: 'ISO timestamp',
  },
});

documentEndpoint('analysis.list', {
  description: 'List all analyses for the current user',
  tags: ['analysis'],
  input: {
    childId: 'string (optional) - Filter by child',
    limit: 'number (optional) - Max results (default: 20)',
    cursor: 'string (optional) - Pagination cursor',
  },
  output: {
    items: 'Array of analysis objects',
    nextCursor: 'Pagination cursor for next page',
  },
});

// Child profile endpoints
documentEndpoint('child.create', {
  description: 'Create a child profile',
  tags: ['child'],
  input: {
    name: 'string (required) - Child name',
    age: 'number (required) - Child age (3-12)',
    gender: 'male | female | other (optional)',
    avatarId: 'string (optional) - Avatar identifier',
  },
  output: {
    id: 'Child profile ID',
    name: 'Child name',
    age: 'Child age',
    createdAt: 'ISO timestamp',
  },
});

documentEndpoint('child.list', {
  description: 'List all child profiles for the current user',
  tags: ['child'],
  input: {},
  output: {
    children: 'Array of child profile objects',
  },
});

// Story endpoints
documentEndpoint('story.list', {
  description: 'List available stories',
  tags: ['story'],
  input: {
    category: 'string (optional) - Filter by category',
    ageRange: '[number, number] (optional) - Filter by age range',
  },
  output: {
    stories: 'Array of story objects',
  },
});

documentEndpoint('story.get', {
  description: 'Get story details',
  tags: ['story'],
  input: {
    id: 'string (required) - Story ID',
  },
  output: {
    id: 'Story ID',
    title: 'Story title',
    content: 'Story content with choices',
    choices: 'Available choices array',
  },
});

// Chat endpoints
documentEndpoint('chat.sendMessage', {
  description: 'Send a message to the AI assistant',
  tags: ['chat'],
  input: {
    message: 'string (required) - User message',
    conversationId: 'string (optional) - Existing conversation ID',
    context: 'object (optional) - Additional context',
  },
  output: {
    response: 'AI assistant response',
    conversationId: 'Conversation ID for continuation',
  },
});

// ============================================
// Documentation Generator
// ============================================

/**
 * Generate full API documentation
 */
export function generateAPIDocumentation(
  options: {
    title?: string;
    version?: string;
    description?: string;
    baseUrl?: string;
  } = {}
): APIDocumentation {
  const {
    title = 'Renkioo API',
    version = '1.0.0',
    description = 'API for Renkioo children psychology app',
    baseUrl = '/api/trpc',
  } = options;

  const endpoints: EndpointDoc[] = [];

  for (const [path, doc] of endpointDocs) {
    endpoints.push({
      path,
      type: path.includes('.get') || path.includes('.list') ? 'query' : 'mutation',
      ...doc,
    });
  }

  // Sort by path
  endpoints.sort((a, b) => a.path.localeCompare(b.path));

  return {
    title,
    version,
    description,
    baseUrl,
    endpoints,
  };
}

/**
 * Generate markdown documentation
 */
export function generateMarkdownDocs(): string {
  const docs = generateAPIDocumentation();

  const lines: string[] = [
    `# ${docs.title}`,
    '',
    `**Version:** ${docs.version}`,
    '',
    docs.description,
    '',
    `**Base URL:** \`${docs.baseUrl}\``,
    '',
    '---',
    '',
    '## Endpoints',
    '',
  ];

  // Group by tags
  const byTag = new Map<string, EndpointDoc[]>();
  for (const endpoint of docs.endpoints) {
    const tag = endpoint.tags?.[0] || 'other';
    if (!byTag.has(tag)) {
      byTag.set(tag, []);
    }
    byTag.get(tag)!.push(endpoint);
  }

  for (const [tag, endpoints] of byTag) {
    lines.push(`### ${tag.charAt(0).toUpperCase() + tag.slice(1)}`);
    lines.push('');

    for (const endpoint of endpoints) {
      lines.push(`#### \`${endpoint.path}\``);
      lines.push('');
      lines.push(`**Type:** ${endpoint.type}`);
      lines.push('');
      if (endpoint.description) {
        lines.push(endpoint.description);
        lines.push('');
      }

      if (endpoint.input && Object.keys(endpoint.input).length > 0) {
        lines.push('**Input:**');
        lines.push('```typescript');
        for (const [key, value] of Object.entries(endpoint.input)) {
          lines.push(`  ${key}: ${value}`);
        }
        lines.push('```');
        lines.push('');
      }

      if (endpoint.output && Object.keys(endpoint.output).length > 0) {
        lines.push('**Output:**');
        lines.push('```typescript');
        for (const [key, value] of Object.entries(endpoint.output)) {
          lines.push(`  ${key}: ${value}`);
        }
        lines.push('```');
        lines.push('');
      }

      if (endpoint.examples && endpoint.examples.length > 0) {
        lines.push('**Examples:**');
        for (const example of endpoint.examples) {
          lines.push(`- ${example.name}:`);
          lines.push('```json');
          lines.push(JSON.stringify(example.input, null, 2));
          lines.push('```');
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate JSON schema for API
 */
export function generateJSONSchema(): object {
  const docs = generateAPIDocumentation();

  return {
    openapi: '3.0.0',
    info: {
      title: docs.title,
      version: docs.version,
      description: docs.description,
    },
    servers: [
      {
        url: docs.baseUrl,
        description: 'tRPC API Server',
      },
    ],
    paths: Object.fromEntries(
      docs.endpoints.map((endpoint) => [
        `/${endpoint.path}`,
        {
          [endpoint.type === 'query' ? 'get' : 'post']: {
            summary: endpoint.description,
            tags: endpoint.tags,
            requestBody:
              endpoint.type === 'mutation'
                ? {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: endpoint.input,
                        },
                      },
                    },
                  }
                : undefined,
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: endpoint.output,
                    },
                  },
                },
              },
            },
          },
        },
      ])
    ),
  };
}
