import { describe, it, expect, vi } from "vitest";
import {
  generateShortCode,
  generateMultipleShortCodes,
  isValidShortCode,
  sanitizeShortCode,
  generatePatternedShortCode,
} from "../../src/utils/codeGenerator";

describe("CodeGenerator", () => {
  describe("generateShortCode", () => {
    it("should generate a short code with default length of 6", () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
      expect(typeof code).toBe("string");
    });

    it("should generate a short code with custom length", () => {
      const length = 8;
      const code = generateShortCode(length);
      expect(code).toHaveLength(length);
    });

    it("should generate codes with only allowed characters", () => {
      const code = generateShortCode();
      const allowedChars =
        "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

      for (const char of code) {
        expect(allowedChars).toContain(char);
      }
    });

    it("should generate unique codes on multiple calls", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode());
      }
      // With nanoid, we expect high uniqueness
      expect(codes.size).toBeGreaterThan(95);
    });

    it("should throw error for invalid length", () => {
      expect(() => generateShortCode(0)).toThrow(
        "Length must be between 1 and 20 characters"
      );
      expect(() => generateShortCode(21)).toThrow(
        "Length must be between 1 and 20 characters"
      );
    });
  });

  describe("generateMultipleShortCodes", () => {
    it("should generate the requested number of codes", () => {
      const count = 5;
      const codes = generateMultipleShortCodes(count);
      expect(codes).toHaveLength(count);
    });

    it("should generate unique codes", () => {
      const count = 10;
      const codes = generateMultipleShortCodes(count);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(count);
    });

    it("should generate codes with specified length", () => {
      const count = 3;
      const length = 8;
      const codes = generateMultipleShortCodes(count, length);

      codes.forEach((code) => {
        expect(code).toHaveLength(length);
      });
    });
  });

  describe("isValidShortCode", () => {
    it("should return true for valid short codes", () => {
      expect(isValidShortCode("AbC23")).toBe(true);
      expect(isValidShortCode("xyz789")).toBe(true);
      expect(isValidShortCode("HEZ2")).toBe(true); // avoid 'L' which is excluded
    });

    it("should return false for invalid characters", () => {
      expect(isValidShortCode("abc0123")).toBe(false); // contains '0'
      expect(isValidShortCode("abc1def")).toBe(false); // contains '1'
      expect(isValidShortCode("abcOdef")).toBe(false); // contains 'O'
      expect(isValidShortCode("abcIdef")).toBe(false); // contains 'I'
      expect(isValidShortCode("abc@def")).toBe(false); // contains '@'
    });

    it("should return false for empty or null input", () => {
      expect(isValidShortCode("")).toBe(false);
      expect(isValidShortCode(null as any)).toBe(false);
      expect(isValidShortCode(undefined as any)).toBe(false);
    });
  });

  describe("sanitizeShortCode", () => {
    it("should remove invalid characters", () => {
      expect(sanitizeShortCode("abc0def")).toBe("abcdef");
      expect(sanitizeShortCode("he@@o@wrd")).toBe("hewrd"); // @ is not in allowed chars
      expect(sanitizeShortCode("test123")).toBe("test23");
    });

    it("should keep valid characters", () => {
      expect(sanitizeShortCode("AbCdEf")).toBe("AbCdEf");
      expect(sanitizeShortCode("xyz789")).toBe("xyz789");
    });

    it("should handle empty input", () => {
      expect(sanitizeShortCode("")).toBe("");
      expect(sanitizeShortCode(null as any)).toBe("");
      expect(sanitizeShortCode(undefined as any)).toBe("");
    });
  });

  describe("generatePatternedShortCode", () => {
    it("should replace X with random characters", () => {
      const pattern = "test-XXX";
      const code = generatePatternedShortCode(pattern);

      expect(code).toMatch(/^test-[A-Za-z2-9]{3}$/);
      expect(code).toHaveLength(pattern.length);
    });

    it("should keep non-X characters unchanged", () => {
      const pattern = "ABC-X-DEF";
      const code = generatePatternedShortCode(pattern);

      expect(code).toMatch(/^ABC-[A-Za-z2-9]-DEF$/);
      expect(code.slice(0, 4)).toBe("ABC-");
      expect(code.slice(5)).toBe("-DEF"); // slice from position 5, not 6
    });

    it("should handle pattern with no X characters", () => {
      const pattern = "ABCDEF";
      const code = generatePatternedShortCode(pattern);
      expect(code).toBe(pattern);
    });
  });
});
