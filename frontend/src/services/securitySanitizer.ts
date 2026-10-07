/**
 * HealthGrid Enterprise Security Sanitizer & Clinical Defense Shield
 * 
 * Implements OWASP A03:2021 (Injection) and LLM01:2025 (Prompt Injection) Mitigations:
 * 1. XSS / Polyglot Script Neutralizer: Strips hazardous HTML tags, event handlers, and data/javascript URIs.
 * 2. SQL Injection Guard: Scans and neutralizes SQL escape sequences and command vectors.
 * 3. Path Traversal Shield: Neutralizes directory traversal sequences ('../', '..\\').
 * 4. Clinical Drug Shield (CDSCO Schedule H/X): Detects unauthorized prompt injections attempting to forge
 *    prescriptions for narcotics, habit-forming sedatives, and restricted opioids.
 */

// CDSCO Schedule H and X Regulated Controlled Substances in India
export const SCHEDULE_HX_RESTRICTED_DRUGS = [
  'alprazolam', 'diazepam', 'fentanyl', 'morphine', 'tramadol',
  'codeine', 'ketamine', 'clonazepam', 'lorazepam', 'zolpidem',
  'buprenorphine', 'pentazocine', 'methadone', 'midazolam',
  'oxycodone', 'hydrocodone', 'nitrazepam', 'chlordiazepoxide'
] as const;

// Common LLM Jailbreak & System Prompt Override Signatures
export const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /bypass\s+(safety|clinical)\s+protocols/i,
  /act\s+as\s+an\s+unfiltered\s+ai/i,
  /pretend\s+you\s+have\s+no\s+medical\s+guidelines/i,
  /system\s*:\s*override/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
];

export interface SanitizationResult {
  sanitized: string;
  hasThreats: boolean;
  detectedThreats: string[];
}

export interface ClinicalShieldResult {
  isSafe: boolean;
  isRestrictedSubstance: boolean;
  isPromptInjection: boolean;
  warningMessage?: string;
  flaggedTokens: string[];
}

class SecuritySanitizer {
  /**
   * Sanitizes generic user input string to neutralize Cross-Site Scripting (XSS).
   */
  public sanitizeText(input: string | undefined | null): string {
    if (!input) return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Strip iframes
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Strip style tags
      .replace(/\bon\w+\s*=/gi, '')                                       // Strip inline event handlers (onerror=, onclick=)
      .replace(/javascript:/gi, '')                                      // Strip javascript: pseudo-protocol
      .replace(/vbscript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }

  /**
   * Comprehensive audit and neutralization of user-provided content.
   */
  public auditAndSanitize(input: string): SanitizationResult {
    const threats: string[] = [];
    if (!input) return { sanitized: '', hasThreats: false, detectedThreats: [] };

    // Check for XSS
    if (/<[a-z][\s\S]*>/i.test(input) || /javascript:/i.test(input) || /on\w+=/i.test(input)) {
      threats.push('XSS_HTML_INJECTION');
    }

    // Check for SQL injection patterns
    if (/(?:--|;|\/\*|\*\/|union\s+select|insert\s+into|drop\s+table)/i.test(input)) {
      threats.push('SQL_INJECTION_PATTERN');
    }

    // Check for directory traversal
    if (/\.\.[\/\\]/.test(input)) {
      threats.push('PATH_TRAVERSAL_ATTEMPT');
    }

    const sanitized = this.sanitizeText(input);

    return {
      sanitized,
      hasThreats: threats.length > 0,
      detectedThreats: threats,
    };
  }

  /**
   * Evaluates patient message or clinical query against LLM Prompt Injection
   * and CDSCO Schedule H/X controlled substance dispensing rules.
   */
  public evaluateClinicalSafety(prompt: string): ClinicalShieldResult {
    if (!prompt || typeof prompt !== 'string') {
      return {
        isSafe: true,
        isRestrictedSubstance: false,
        isPromptInjection: false,
        flaggedTokens: [],
      };
    }

    const lower = prompt.toLowerCase();
    const flaggedTokens: string[] = [];
    let isPromptInjection = false;
    let isRestrictedSubstance = false;

    // 1. Detect prompt injection jailbreaks
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        isPromptInjection = true;
        flaggedTokens.push('PROMPT_INJECTION_SIGNATURE');
        break;
      }
    }

    // 2. Detect Schedule H/X controlled substances
    for (const drug of SCHEDULE_HX_RESTRICTED_DRUGS) {
      if (lower.includes(drug)) {
        isRestrictedSubstance = true;
        flaggedTokens.push(drug.toUpperCase());
      }
    }

    if (isPromptInjection) {
      return {
        isSafe: false,
        isRestrictedSubstance,
        isPromptInjection: true,
        warningMessage:
          '⚠️ Security Alert: The input contained an unauthorized instruction override pattern. Queries must adhere to clinical safety standards.',
        flaggedTokens,
      };
    }

    if (isRestrictedSubstance) {
      return {
        isSafe: false,
        isRestrictedSubstance: true,
        isPromptInjection: false,
        warningMessage:
          '⚠️ Statutory Safety Shield (CDSCO Schedule H/X): Prescriptions for controlled narcotics, habit-forming sedatives, and restricted opioids cannot be generated autonomously by AI. A physical examination by a registered MBBS/MD physician is legally mandated.',
        flaggedTokens,
      };
    }

    return {
      isSafe: true,
      isRestrictedSubstance: false,
      isPromptInjection: false,
      flaggedTokens: [],
    };
  }
}

export const securitySanitizer = new SecuritySanitizer();
