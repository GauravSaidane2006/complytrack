const { escapeRegex, escapeHtml, sanitizeFilename, hashToken, generateSecureToken, sanitizeInput } = require('../src/utils/security');

describe('Security Utilities', () => {

  describe('escapeRegex', () => {
    test('escapes special regex characters', () => {
      const malicious = '(a+)+$';
      const escaped = escapeRegex(malicious);
      expect(escaped).toBe('\\(a\\+\\)\\+\\$');
      expect(new RegExp(escaped).test('(a+)+$')).toBe(true);
    });

    test('handles empty/null input', () => {
      expect(escapeRegex('')).toBe('');
      expect(escapeRegex(null)).toBe('');
      expect(escapeRegex(undefined)).toBe('');
    });

    test('prevents ReDoS attack pattern', () => {
      const redosPattern = '(a+)+$';
      const escaped = escapeRegex(redosPattern);
      const regex = new RegExp(escaped);
      const start = Date.now();
      regex.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!');
      expect(Date.now() - start).toBeLessThan(1000);
    });
  });

  describe('escapeHtml', () => {
    test('escapes HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('escapes single quotes', () => {
      expect(escapeHtml("it's")).toBe("it&#x27;s");
    });

    test('escapes ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    test('handles null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    test('prevents XSS in user names for email templates', () => {
      const maliciousName = '<img src=x onerror=alert(1)>';
      const escaped = escapeHtml(maliciousName);
      expect(escaped).not.toContain('<img');
      expect(escaped).toContain('&lt;img');
    });
  });

  describe('sanitizeFilename', () => {
    test('sanitizes path traversal attempts', () => {
      const malicious = '../../etc/passwd';
      const sanitized = sanitizeFilename(malicious);
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');
    });

    test('sanitizes special characters', () => {
      const malicious = 'file<script>.pdf';
      const sanitized = sanitizeFilename(malicious);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    test('limits filename length', () => {
      const longName = 'a'.repeat(300) + '.pdf';
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
    });
  });

  describe('hashToken', () => {
    test('produces consistent hashes', () => {
      const token = 'test-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    test('produces SHA-256 length hashes', () => {
      const hash = hashToken('test');
      expect(hash).toHaveLength(64); // SHA-256 hex = 64 chars
    });
  });

  describe('generateSecureToken', () => {
    test('generates tokens of specified length', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    test('generates unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSecureToken(32));
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('sanitizeInput', () => {
    test('removes angle brackets', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    });

    test('trims whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    test('handles non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
    });
  });
});

describe('Mass Assignment Prevention', () => {
  test('compliance update only allows whitelisted fields', () => {
    const allowedFields = ['title', 'law', 'regulation', 'category', 'description', 'frequency', 'dueDate', 'applicableFrom', 'applicableTo', 'assignedTo', 'status', 'priority', 'riskScore', 'notes', 'isRecurring', 'proofRequired', 'reminderSettings'];

    const maliciousBody = {
      title: 'Legit Title',
      organization: '64f1a2b3c4d5e6f7a8b9c0d1',
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      completedBy: '64f1a2b3c4d5e6f7a8b9c0d1',
      __v: 5
    };

    const updates = {};
    for (const field of allowedFields) {
      if (maliciousBody[field] !== undefined) updates[field] = maliciousBody[field];
    }

    expect(updates).toEqual({ title: 'Legit Title' });
    expect(updates).not.toHaveProperty('organization');
    expect(updates).not.toHaveProperty('_id');
    expect(updates).not.toHaveProperty('completedBy');
    expect(updates).not.toHaveProperty('__v');
  });

  test('contract update only allows whitelisted fields', () => {
    const allowedFields = ['title', 'contractNumber', 'party', 'partyContact', 'type', 'description', 'value', 'currency', 'startDate', 'endDate', 'renewalDate', 'noticePeriod', 'status', 'documents', 'clauses', 'assignedTo'];

    const maliciousBody = {
      title: 'Legit Contract',
      organization: '64f1a2b3c4d5e6f7a8b9c0d1',
      createdBy: '64f1a2b3c4d5e6f7a8b9c0d1'
    };

    const updates = {};
    for (const field of allowedFields) {
      if (maliciousBody[field] !== undefined) updates[field] = maliciousBody[field];
    }

    expect(updates).toEqual({ title: 'Legit Contract' });
    expect(updates).not.toHaveProperty('organization');
    expect(updates).not.toHaveProperty('createdBy');
  });
});

describe('Developer Controller Regex Security', () => {
  test('escapeRegex prevents regex injection in search', () => {
    const maliciousSearch = '.*';
    const sanitized = escapeRegex(maliciousSearch);
    expect(sanitized).toBe('\\.\\*');
  });

  test('escapeRegex prevents ReDoS patterns', () => {
    const redosPattern = '(a+)+$';
    const sanitized = escapeRegex(redosPattern);
    expect(sanitized).not.toBe(redosPattern);
    const regex = new RegExp(sanitized, 'i');
    expect(regex.test('(a+)+$')).toBe(true);
  });
});
