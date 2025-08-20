import { randomBytes } from "crypto";

/**
 * Characters used for generating short codes
 * Excludes visually similar characters like 0/O, 1/l/I for better usability
 */
const CHARACTERS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/**
 * Generate a random short code
 * @param length - Length of the short code (default: 6)
 * @returns A random short code string
 */
export function generateShortCode(length: number = 6): string {
  if (length < 1 || length > 20) {
    throw new Error("Length must be between 1 and 20 characters");
  }

  const randomBytesArray = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = (randomBytesArray[i] || 0) % CHARACTERS.length;
    result += CHARACTERS.charAt(randomIndex);
  }

  return result;
}

/**
 * Generate multiple short codes
 * @param count - Number of codes to generate
 * @param length - Length of each code
 * @returns Array of unique short codes
 */
export function generateMultipleShortCodes(
  count: number,
  length: number = 6
): string[] {
  const codes = new Set<string>();

  // Generate codes until we have the required count
  while (codes.size < count) {
    codes.add(generateShortCode(length));
  }

  return Array.from(codes);
}

/**
 * Validate that a short code contains only allowed characters
 * @param shortCode - The short code to validate
 * @returns True if valid, false otherwise
 */
export function isValidShortCode(shortCode: string): boolean {
  if (!shortCode || shortCode.length === 0) {
    return false;
  }

  // Check if all characters are from our allowed set
  for (let i = 0; i < shortCode.length; i++) {
    if (!CHARACTERS.includes(shortCode.charAt(i))) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize a custom short code by removing/replacing invalid characters
 * @param customCode - The custom code to sanitize
 * @returns A sanitized version of the code
 */
export function sanitizeShortCode(customCode: string): string {
  if (!customCode) {
    return "";
  }

  // Remove any characters not in our allowed set
  let sanitized = "";
  for (let i = 0; i < customCode.length; i++) {
    const char = customCode.charAt(i);
    if (CHARACTERS.includes(char)) {
      sanitized += char;
    }
  }

  return sanitized;
}

/**
 * Generate a short code with specific pattern (for testing purposes)
 * @param pattern - Pattern where 'X' will be replaced with random characters
 * @returns A short code following the pattern
 */
export function generatePatternedShortCode(pattern: string): string {
  let result = "";

  for (let i = 0; i < pattern.length; i++) {
    if (pattern.charAt(i) === "X") {
      const randomIndex = (randomBytes(1)[0] || 0) % CHARACTERS.length;
      result += CHARACTERS.charAt(randomIndex);
    } else {
      result += pattern.charAt(i);
    }
  }

  return result;
}

export default {
  generateShortCode,
  generateMultipleShortCodes,
  isValidShortCode,
  sanitizeShortCode,
  generatePatternedShortCode,
};
