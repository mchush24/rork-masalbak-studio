# Backend Integration Tests

This directory contains integration tests for the RenkiOO (Renkioo Studio) backend API endpoints.

## Test Structure

```
backend/trpc/routes/__tests__/
├── auth.integration.test.ts        # Authentication endpoints
├── user.integration.test.ts        # User profile & GDPR endpoints
├── analysis.integration.test.ts    # Analysis CRUD endpoints
└── studio/
    └── __tests__/
        └── analyze-drawing.test.ts # AI drawing analysis
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- auth.integration.test
```

## Test Coverage

### Authentication (auth.integration.test.ts)
- ✅ User registration with email verification
- ✅ Email verification with 6-digit code
- ✅ Login with password
- ✅ Password reset flow
- ✅ Complete onboarding
- ✅ Invalid email/password handling
- ✅ Expired verification code handling

### User Management (user.integration.test.ts)
- ✅ Get user profile
- ✅ Update user profile
- ✅ Get children list
- ✅ Update children
- ✅ Export user data (GDPR Article 20)
- ✅ Delete account (GDPR Right to Erasure)
- ✅ Email/password verification for deletion

### Analysis (analysis.integration.test.ts)
- ✅ Save new analysis
- ✅ List analyses with pagination
- ✅ Filter favorited analyses
- ✅ Get specific analysis by ID
- ✅ Update analysis (favorited status, tags)
- ✅ Delete analysis
- ✅ Access control (user can only access own analyses)

### AI Drawing Analysis (analyze-drawing.test.ts)
- ✅ Analyze drawing with image (base64)
- ✅ Analyze without image (text-only)
- ✅ Handle markdown code blocks in response
- ✅ Fallback response on JSON parse error
- ✅ OpenAI API error handling
- ✅ Multi-language support (tr/en)
- ✅ Child age handling

## Test Environment

- **Framework**: Jest with ts-jest
- **Mocking**:
  - Supabase client (database operations)
  - OpenAI API (AI analysis)
  - bcrypt (password hashing)
  - jsonwebtoken (JWT tokens)
  - Resend (email service)

## Writing New Tests

### Template for new endpoint test:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { appRouter } from '../../app-router';

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(),
};

jest.mock('../../../lib/supabase-secure', () => ({
  getSecureClient: jest.fn(() => mockSupabaseClient),
}));

describe('MyEndpoint Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockContext = {
    req: { headers: { authorization: 'Bearer mock_token' } },
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  it('should do something', async () => {
    // Arrange
    mockSupabaseClient.from.mockImplementation((table: string) => {
      // Mock database operations
    });

    // Act
    const caller = appRouter.createCaller(mockContext as any);
    const result = await caller.myRouter.myEndpoint({ /* params */ });

    // Assert
    expect(result).toBeDefined();
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Manual workflow dispatch

Minimum coverage requirement: **80%**

## Troubleshooting

### ESM Module Issues
If you encounter ESM import errors, check `transformIgnorePatterns` in `jest.config.js`.

### TypeScript Errors
Ignored diagnostic codes are configured in `jest.config.js`. Adjust if needed.

### Mock Issues
Ensure mocks are defined **before** importing the modules that use them.

## Future Improvements

- [ ] Add tests for studio endpoints (createStorybook, generateColoringPDF)
- [ ] Add tests for settings endpoints
- [ ] Add E2E tests with real database (test environment)
- [ ] Add performance tests (rate limiting validation)
- [ ] Add WebSocket tests (if applicable)
