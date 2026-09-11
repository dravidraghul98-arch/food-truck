/**
 * Frontend Security & Sanitization Utilities
 */

/**
 * Sanitizes input strings by stripping dangerous HTML tags and trimming whitespace.
 * Prevents Stored & Reflected XSS in customer inputs (names, addresses, comments).
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove dangerous HTML opening/closing tags
}

/**
 * Validates email format using safe regular expression.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 100;
}

/**
 * Validates phone numbers (minimum 7 digits, supports + and hyphens).
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s+\-()]{7,20}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validates booking price calculation on client side to catch tampering.
 */
export function verifyPriceCalculation(
  basePrice: number,
  addOnsTotal: number,
  quantity: number,
  expectedTotal: number
): boolean {
  const calculated = Math.round((basePrice + addOnsTotal) * quantity * 100) / 100;
  const roundedExpected = Math.round(expectedTotal * 100) / 100;
  return calculated === roundedExpected;
}
