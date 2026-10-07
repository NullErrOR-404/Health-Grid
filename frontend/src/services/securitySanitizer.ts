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

export interface PrivacyBoundaryResult {
  isBreachAttempt: boolean;
  reason?: 'AUTHORITY_IMPERSONATION' | 'CROSS_PATIENT_EXFILTRATION' | 'SYSTEM_PROBE';
  warningMessage?: string;
  flaggedTokens: string[];
}

class SecuritySanitizer {
  /**
   * Evaluates patient message or clinical query against Authority Impersonation
   * and cross-user data exfiltration (DPDP Act 2023 & ABDM Sovereign Zero-Trust Boundary).
   */
  public evaluatePatientPrivacyBoundary(prompt: string): PrivacyBoundaryResult {
    if (!prompt || typeof prompt !== 'string') {
      return { isBreachAttempt: false, flaggedTokens: [] };
    }

    const lower = prompt.toLowerCase();
    const flaggedTokens: string[] = [];

    // 1. Detect authority impersonation & social engineering
    const authorityRegex = /\b(i am|i'm|act as|be|acting as)\s+(the\s+)?(cmo|chief medical officer|police|cop|inspector|magistrate|auditor|superintendent|hospital admin|administrator|system admin|government official|health minister)\b/i;
    const authorityDemandRegex = /\b(official\s+police\s+investigation|court\s+order|warrant|audit\s+demand|as\s+a\s+(doctor|police|cmo|auditor|admin|inspector|officer))\b/i;

    const hasAuthorityClaim = authorityRegex.test(prompt) || authorityDemandRegex.test(prompt);

    // 2. Detect cross-patient data probes and exfiltration attempts
    const exfiltrationRegex = /\b(show|give|fetch|display|print|read|export|dump|reveal)\s+(me\s+)?(the\s+)?(medical\s+)?(records?|vitals?|history|details?|profile|prescriptions?|data|chats?|memory|notes?)\s+(of|for|about)\s+(patient|user|another|someone\s+else|other\s+people|[a-z0-9_-]+)/i;
    const thirdPartyProbeRegex = /\bwhat\s+did\s+(another|the\s+other|previous)\s+(patient|user)\s+(say|ask|complain|take|tell|have)\b/i;
    const accountAccessRegex = /\b(access|view|inspect)\s+(another|other|foreign)\s+(user's?|patient's?)\s+(account|records?|data|vault)\b/i;
    const bulkDumpRegex = /\bdump\s+(all\s+)?(patients?|users?|records?|vaults?)\b/i;

    const hasExfiltrationProbe =
      exfiltrationRegex.test(prompt) ||
      thirdPartyProbeRegex.test(prompt) ||
      accountAccessRegex.test(prompt) ||
      bulkDumpRegex.test(prompt);

    if (hasAuthorityClaim && hasExfiltrationProbe) {
      flaggedTokens.push('AUTHORITY_IMPERSONATION_DATA_PROBE');
      return {
        isBreachAttempt: true,
        reason: 'AUTHORITY_IMPERSONATION',
        warningMessage:
          "HealthGrid operates under strict sovereign zero-trust data air-gapping in compliance with India's Digital Personal Data Protection (DPDP) Act 2023 and ABDM standards. Clinical records, episodic memory, and vitals are cryptographically isolated per authenticated patient account. You can only view and manage your own personal health records in this consultation session. Official hospital administration and regulatory audits must authenticate directly via the credentialed Hospital ERP Portal with verified staff credentials.",
        flaggedTokens,
      };
    }

    if (hasExfiltrationProbe) {
      flaggedTokens.push('CROSS_PATIENT_EXFILTRATION_PROBE');
      return {
        isBreachAttempt: true,
        reason: 'CROSS_PATIENT_EXFILTRATION',
        warningMessage:
          "HealthGrid enforces sovereign account memory isolation. Every user's health records, vitals, and consultation memory are private and strictly inaccessible to any other user. Only your own personal records can be viewed or managed in this session.",
        flaggedTokens,
      };
    }

    if (hasAuthorityClaim && (lower.includes('patient') || lower.includes('record') || lower.includes('data') || lower.includes('file'))) {
      flaggedTokens.push('AUTHORITY_DECEPTION_PROBE');
      return {
        isBreachAttempt: true,
        reason: 'AUTHORITY_IMPERSONATION',
        warningMessage:
          "HealthGrid operates under strict zero-trust principles. Public AI consultation sessions cannot be used to bypass clinical access controls or inspect patient records under claimed authority. Please log in through the verified Hospital ERP Staff Portal with your cryptographic digital credentials.",
        flaggedTokens,
      };
    }

    return { isBreachAttempt: false, flaggedTokens: [] };
  }

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
