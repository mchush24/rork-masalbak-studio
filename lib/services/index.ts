/**
 * Services Export
 * Part of #23: Profesyonel Copywriting Revizyonu
 *
 * Central export point for all services
 */

// Greeting Service
export {
  GreetingService,
  type TimeOfDay,
  type UserActivity,
  type Greeting,
} from './greeting-service';

// Role-Aware Greeting Service
export {
  RoleAwareGreetingService,
  getRoleAwareGreetingService,
} from './role-aware-greeting-service';

// Copywriting Service
export {
  CopywritingService,
  getCopywritingService,
  getCopyForRole,
  type CopywritingTexts,
} from './copywriting-service';
