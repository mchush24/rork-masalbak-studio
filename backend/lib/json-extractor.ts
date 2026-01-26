/**
 * JSON Extractor Utility
 * Robustly extracts JSON from AI-generated text responses
 */

import { logger } from "./utils.js";

export interface ExtractionResult {
  success: boolean;
  data: unknown;
  rawJson?: string;
  error?: string;
}

/**
 * Extracts and parses JSON from AI response text
 *
 * Handles:
 * - Pure JSON responses
 * - JSON wrapped in markdown code blocks (```json ... ```)
 * - JSON with surrounding text
 * - Nested JSON objects
 *
 * @param text - The raw text from AI response
 * @param options - Extraction options
 * @returns Extraction result with parsed data or error
 */
export function extractJSON(
  text: string,
  options: {
    /** If true, try to extract array instead of object */
    expectArray?: boolean;
    /** Fallback value if extraction fails */
    fallback?: unknown;
    /** Log extraction steps */
    debug?: boolean;
  } = {}
): ExtractionResult {
  const { expectArray = false, fallback, debug = false } = options;

  if (!text || typeof text !== "string") {
    return {
      success: false,
      data: fallback,
      error: "Invalid input: expected non-empty string",
    };
  }

  const log = debug ? logger.debug.bind(logger) : () => {};

  // Strategy 1: Try parsing the entire text as JSON (best case)
  try {
    const parsed = JSON.parse(text.trim());
    if (isValidResult(parsed, expectArray)) {
      log("[JSON Extractor] Strategy 1 success: direct parse");
      return { success: true, data: parsed, rawJson: text.trim() };
    }
  } catch {
    log("[JSON Extractor] Strategy 1 failed: direct parse");
  }

  // Strategy 2: Extract from markdown code block
  const codeBlockPatterns = [
    /```json\s*([\s\S]*?)\s*```/i,
    /```\s*([\s\S]*?)\s*```/,
  ];

  for (const pattern of codeBlockPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (isValidResult(parsed, expectArray)) {
          log("[JSON Extractor] Strategy 2 success: code block");
          return { success: true, data: parsed, rawJson: match[1].trim() };
        }
      } catch {
        log("[JSON Extractor] Strategy 2 failed: code block parse error");
      }
    }
  }

  // Strategy 3: Find balanced braces/brackets
  const startChar = expectArray ? "[" : "{";
  const endChar = expectArray ? "]" : "}";
  const balancedJson = extractBalancedJson(text, startChar, endChar);

  if (balancedJson) {
    try {
      const parsed = JSON.parse(balancedJson);
      if (isValidResult(parsed, expectArray)) {
        log("[JSON Extractor] Strategy 3 success: balanced extraction");
        return { success: true, data: parsed, rawJson: balancedJson };
      }
    } catch {
      log("[JSON Extractor] Strategy 3 failed: balanced parse error");
    }
  }

  // Strategy 4: Greedy match (fallback - less reliable)
  const greedyPattern = expectArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const greedyMatch = text.match(greedyPattern);

  if (greedyMatch) {
    try {
      const parsed = JSON.parse(greedyMatch[0]);
      if (isValidResult(parsed, expectArray)) {
        log("[JSON Extractor] Strategy 4 success: greedy match");
        return { success: true, data: parsed, rawJson: greedyMatch[0] };
      }
    } catch {
      log("[JSON Extractor] Strategy 4 failed: greedy parse error");
    }
  }

  // Strategy 5: Try to fix common JSON issues
  const fixedJson = tryFixCommonIssues(text, expectArray);
  if (fixedJson) {
    try {
      const parsed = JSON.parse(fixedJson);
      if (isValidResult(parsed, expectArray)) {
        log("[JSON Extractor] Strategy 5 success: fixed JSON");
        return { success: true, data: parsed, rawJson: fixedJson };
      }
    } catch {
      log("[JSON Extractor] Strategy 5 failed: fix attempt error");
    }
  }

  // All strategies failed
  logger.warn("[JSON Extractor] All extraction strategies failed", {
    textLength: text.length,
    textPreview: text.substring(0, 200),
  });

  return {
    success: false,
    data: fallback,
    error: "Failed to extract valid JSON from response",
  };
}

/**
 * Extracts JSON by finding balanced braces/brackets
 */
function extractBalancedJson(
  text: string,
  startChar: string,
  endChar: string
): string | null {
  const startIndex = text.indexOf(startChar);
  if (startIndex === -1) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === startChar) {
        depth++;
      } else if (char === endChar) {
        depth--;
        if (depth === 0) {
          return text.substring(startIndex, i + 1);
        }
      }
    }
  }

  return null;
}

/**
 * Attempts to fix common JSON issues from AI responses
 */
function tryFixCommonIssues(text: string, expectArray: boolean): string | null {
  // Extract potential JSON content
  const pattern = expectArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = text.match(pattern);
  if (!match) return null;

  let json = match[0];

  // Fix 1: Remove trailing commas before ] or }
  json = json.replace(/,(\s*[}\]])/g, "$1");

  // Fix 2: Handle single quotes (convert to double)
  // Only if the JSON doesn't already have double quotes
  if (!json.includes('"') && json.includes("'")) {
    json = json.replace(/'/g, '"');
  }

  // Fix 3: Quote unquoted keys
  json = json.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  // Fix 4: Handle JavaScript-style undefined -> null
  json = json.replace(/:\s*undefined\b/g, ": null");

  return json;
}

/**
 * Validates that the result matches expectations
 */
function isValidResult(data: unknown, expectArray: boolean): boolean {
  if (expectArray) {
    return Array.isArray(data);
  }
  return typeof data === "object" && data !== null && !Array.isArray(data);
}

/**
 * Type-safe JSON extraction with schema validation
 */
export function extractJSONWithType<T>(
  text: string,
  validate: (data: unknown) => data is T,
  fallback: T
): T {
  const result = extractJSON(text);

  if (result.success && validate(result.data)) {
    return result.data;
  }

  logger.warn("[JSON Extractor] Type validation failed, using fallback");
  return fallback;
}
