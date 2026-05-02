import prisma from '../config/prisma';

interface EvaluateRequest {
  labId: string;
  code: string;
  requiredPatterns: string[];
  forbiddenPatterns: string[];
  xp: number;
  userId: string;
}

interface EvaluateResult {
  passed: boolean;
  score: number;
  total: number;
  feedback: string;
  hints: string[];
  xp: number;
}

// ── Strip comments from Verilog/SV code before checking ───────────────────────
const stripComments = (code: string): string => {
  // Remove single-line comments (//)
  let stripped = code.replace(/\/\/[^\n]*/g, '');
  // Remove multi-line comments (/* ... */)
  stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');
  return stripped;
};

// ── Check if a pattern exists as actual code (not inside a comment) ───────────
const patternExists = (code: string, pattern: string): boolean => {
  const strippedCode = stripComments(code).toLowerCase();
  const normalizedPattern = pattern.toLowerCase().trim();

  // For multi-word patterns, normalize internal whitespace
  const patternRegex = normalizedPattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex chars
    .replace(/\s+/g, '\\s+');                // flexible whitespace

  return new RegExp(patternRegex).test(strippedCode);
};

// ── Minimum code length check — prevent empty/trivial submissions ─────────────
const isCodeTooShort = (code: string, starterCode: string): boolean => {
  const stripped = stripComments(code).replace(/\s+/g, '');
  const starterStripped = starterCode.replace(/\s+/g, '');
  // User must have added at least 20 characters beyond the starter
  return stripped.length < starterStripped.length + 20;
};

// ── Check for placeholder markers that indicate incomplete code ───────────────
const hasPlaceholders = (code: string): boolean => {
  const placeholders = [
    '// your logic here',
    '// fill in',
    '// complete',
    '// add your',
    '// implement',
    '= //',
    '? //',
  ];
  const lower = code.toLowerCase();
  return placeholders.some((p) => lower.includes(p));
};

export const evaluateLab = async (req: EvaluateRequest): Promise<EvaluateResult> => {
  const { code, requiredPatterns, forbiddenPatterns, xp, userId, labId } = req;

  // ── Guard 1: Code too short ────────────────────────────────────────────────
  if (code.trim().length < 80) {
    return {
      passed: false,
      score: 0,
      total: requiredPatterns.length,
      feedback: 'Your submission is too short. Please write a complete Verilog module.',
      hints: ['Start with the module declaration and add all required ports and logic.'],
      xp: 0,
    };
  }

  // ── Guard 2: Contains unfilled placeholders ────────────────────────────────
  if (hasPlaceholders(code)) {
    return {
      passed: false,
      score: 0,
      total: requiredPatterns.length,
      feedback: 'Your code still has incomplete sections. Fill in all the placeholder comments.',
      hints: ['Look for lines with "// your logic here" or "// fill in" and complete them.'],
      xp: 0,
    };
  }

  // ── Guard 3: Must contain endmodule (basic Verilog validity) ──────────────
  if (!patternExists(code, 'endmodule')) {
    return {
      passed: false,
      score: 0,
      total: requiredPatterns.length,
      feedback: 'Invalid Verilog: missing "endmodule". Your module must be complete.',
      hints: ['Every Verilog module must end with "endmodule"'],
      xp: 0,
    };
  }

  // ── Check required patterns ───────────────────────────────────────────────
  const missingPatterns: string[] = [];
  let matchedCount = 0;

  for (const pattern of requiredPatterns) {
    if (patternExists(code, pattern)) {
      matchedCount++;
    } else {
      missingPatterns.push(pattern);
    }
  }

  // ── Check forbidden patterns ──────────────────────────────────────────────
  const foundForbidden: string[] = [];
  for (const pattern of forbiddenPatterns) {
    if (patternExists(code, pattern)) {
      foundForbidden.push(pattern);
    }
  }

  const total = requiredPatterns.length;
  // Must match ALL required patterns and have NO forbidden patterns
  const passed = missingPatterns.length === 0 && foundForbidden.length === 0;

  let feedback = '';
  const hints: string[] = [];

  if (passed) {
    feedback = `All ${total} checks passed. Your solution is correct!`;

    // Award XP
    try {
      await prisma.userProfile.update({
        where: { userId },
        data: { xp: { increment: xp } },
      });
    } catch (e) {
      console.error('Failed to award XP:', e);
    }
  } else {
    if (foundForbidden.length > 0) {
      feedback = `Forbidden pattern detected: "${foundForbidden[0]}". This approach is not allowed for this lab.`;
      hints.push(`Remove "${foundForbidden[0]}" from your code — the lab requires a different approach.`);
    } else {
      const missing = missingPatterns.length;
      feedback = `${matchedCount}/${total} checks passed. ${missing} required element${missing > 1 ? 's' : ''} not found.`;

      // Show up to 2 missing patterns as hints
      missingPatterns.slice(0, 2).forEach((p) => {
        hints.push(`Missing: "${p}" — make sure this is present in your code.`);
      });
    }
  }

  return { passed, score: matchedCount, total, feedback, hints, xp: passed ? xp : 0 };
};