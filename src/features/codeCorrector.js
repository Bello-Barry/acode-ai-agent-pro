class CodeCorrector {
  constructor(aiOrchestrator, contextAnalyzer = null) {
    this.ai = aiOrchestrator;
    this.contextAnalyzer = contextAnalyzer;
    
    // Configuration avancée
    this.config = {
      enableSmartCorrection: true,
      enableDeepAnalysis: true,
      enableSecurityScan: true,
      enablePerformanceOptimization: true,
      enableCodeStandards: true,
      maxAnalysisDepth: 3,
      autoApplyFixes: false,
      preserveCodeStyle: true
    };

    // Patterns de détection avancés
    this.errorPatterns = this.initErrorPatterns();
    this.bestPractices = this.initBestPractices();
    this.securityRules = this.initSecurityRules();
    
    // Cache et métriques
    this.analysisCache = new Map();
    this.correctionHistory = new Map();
    this.metrics = {
      corrections: 0,
      optimizations: 0,
      securityScans: 0,
      refactors: 0,
      cacheHits: 0,
      errorsDetected: 0
    };

    // Diagnostic engine
    this.diagnosticEngine = this.initDiagnosticEngine();
  }

  initErrorPatterns() {
    return {
      javascript: {
        syntax: [
          { pattern: /var\s+(\w+)/g, message: 'Use let/const instead of var', category: 'style' },
          { pattern: /==/g, message: 'Use strict equality ===', category: 'logic' },
          { pattern: /console\.log\(/g, message: 'Remove console.log in production', category: 'debug' },
          { pattern: /eval\(/g, message: 'Avoid eval for security', category: 'security', severity: 'high' }
        ],
        performance: [
          { pattern: /for\s*\(\s*;\s*;\s*\)/g, message: 'Infinite loop detected', category: 'performance', severity: 'high' },
          { pattern: /JSON\.parse\(JSON\.stringify\(/g, message: 'Inefficient deep clone', category: 'performance' },
          { pattern: /array\.indexOf\(/g, message: 'Consider using Set for lookups', category: 'performance' }
        ],
        modern: [
          { pattern: /function\s+(\w+)\s*\(/g, message: 'Use arrow functions', category: 'modern' },
          { pattern: /'\s*\+\s*'/g, message: 'Use template literals', category: 'modern' },
          { pattern: /\.then\(/g, message: 'Use async/await', category: 'modern' }
        ]
      },
      typescript: {
        syntax: [
          { pattern: /:\s*any/g, message: 'Avoid any type', category: 'typing', severity: 'high' },
          { pattern: /as\s+any/g, message: 'Avoid type assertion to any', category: 'typing' }
        ]
      },
      python: {
        syntax: [
          { pattern: /except:\s*pass/g, message: 'Avoid bare except', category: 'error-handling', severity: 'high' },
          { pattern: /print\(/g, message: 'Use logging instead of print', category: 'production' }
        ]
      }
    };
  }

  initBestPractices() {
    return {
      javascript: [
        'Use const for constants',
        'Prefer arrow functions',
        'Use template literals',
        'Destructure objects and arrays',
        'Use async/await over callbacks',
        'Handle promises properly',
        'Use strict equality checks'
      ],
      typescript: [
        'Use strict typing',
        'Avoid any type',
        'Use interfaces for objects',
        'Type function returns',
        'Use generics appropriately'
      ],
      python: [
        'Follow PEP8 guidelines',
        'Use type hints',
        'Use context managers',
        'Prefer list comprehensions',
        'Use f-strings for formatting'
      ]
    };
  }

  initSecurityRules() {
    return {
      javascript: [
        { pattern: /eval\(/g, risk: 'critical', message: 'eval() can execute arbitrary code' },
        { pattern: /innerHTML\s*=/g, risk: 'high', message: 'innerHTML can lead to XSS' },
        { pattern: /localStorage\.setItem\([^,]+,\s*([^)]+)\)/g, risk: 'medium', message: 'Sanitize data before storing' },
        { pattern: /fetch\([^,]+\)/g, risk: 'medium', message: 'Validate fetch responses' }
      ],
      python: [
        { pattern: /exec\(/g, risk: 'critical', message: 'exec() can execute arbitrary code' },
        { pattern: /eval\(/g, risk: 'critical', message: 'eval() can evaluate arbitrary expressions' },
        { pattern: /pickle\.loads\(/g, risk: 'high', message: 'Unpickling untrusted data is dangerous' }
      ]
    };
  }

  initDiagnosticEngine() {
    return {
      levels: {
        error: { color: 'red', priority: 1 },
        warning: { color: 'orange', priority: 2 },
        info: { color: 'blue', priority: 3 },
        suggestion: { color: 'green', priority: 4 }
      },
      categories: ['syntax', 'performance', 'security', 'style', 'modern', 'best-practice']
    };
  }

  // === CORE CORRECTION METHODS ===

  async correct(code, language = 'javascript', options = {}) {
    this.metrics.corrections++;

    try {
      const analysis = await this.analyzeCode(code, language, options);
      
      if (analysis.errors.length === 0 && !options.force) {
        return {
          code,
          analysis,
          changes: [],
          message: 'No corrections needed'
        };
      }

      const correctionResult = await this.applyCorrections(code, analysis, language, options);
      
      this.recordCorrection(code, correctionResult.correctedCode, analysis);
      return correctionResult;

    } catch (error) {
      this.metrics.errorsDetected++;
      throw this.enhanceCorrectionError(error, code, language);
    }
  }

  async correctAndOptimize(code, language = 'javascript', options = {}) {
    const correctionResult = await this.correct(code, language, options);
    
    if (options.optimizePerformance) {
      const optimizedResult = await this.optimize(correctionResult.correctedCode, language, {
        ...options,
        preserveBehavior: true
      });
      
      return {
        ...correctionResult,
        optimizedCode: optimizedResult.optimizedCode,
        optimizationReport: optimizedResult.report,
        combinedChanges: [
          ...correctionResult.changes,
          ...optimizedResult.changes
        ]
      };
    }

    return correctionResult;
  }

  async comprehensiveAnalysis(code, language = 'javascript', options = {}) {
    const analysisTasks = [
      this.analyzeCode(code, language, options),
      this.analyzeSecurity(code, language),
      this.analyzePerformance(code, language),
      this.analyzeCodeQuality(code, language)
    ];

    const [basicAnalysis, securityAnalysis, performanceAnalysis, qualityAnalysis] = 
      await Promise.all(analysisTasks);

    const comprehensiveReport = {
      summary: {
        lines: code.split('\n').length,
        issues: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        score: this.calculateCodeScore(basicAnalysis, securityAnalysis, performanceAnalysis)
      },
      diagnostics: {
        errors: basicAnalysis.errors,
        warnings: basicAnalysis.warnings,
        security: securityAnalysis.issues,
        performance: performanceAnalysis.issues,
        quality: qualityAnalysis.issues
      },
      recommendations: this.generateRecommendations(
        basicAnalysis, securityAnalysis, performanceAnalysis, qualityAnalysis
      ),
      metrics: {
        complexity: this.calculateComplexity(code, language),
        maintainability: this.calculateMaintainability(code, language),
        security: securityAnalysis.score,
        performance: performanceAnalysis.score
      }
    };

    return comprehensiveReport;
  }

  // === SPECIALIZED CORRECTION METHODS ===

  async refactor(code, language = 'javascript', options = {}) {
    this.metrics.refactors++;

    const refactoringGoals = options.goals || [
      'improve readability',
      'reduce complexity',
      'eliminate duplication',
      'apply design patterns'
    ];

    const systemPrompt = `Tu es un expert en refactoring ${language}.

OBJECTIFS DE REFACTORING:
${refactoringGoals.map(goal => `- ${goal}`).join('\n')}

RÈGLES:
- Maintenir la même fonctionnalité
- Améliorer la structure
- Appliquer les principes SOLID
- Réduire la complexité cyclomatique
- Éliminer la duplication de code

Retourne UNIQUEMENT le code refactorisé.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Refactorise ce code:\n\n${code}` }
    ];

    const refactoredCode = await this.ai.chat(messages, {
      temperature: 0.3,
      maxTokens: 4000
    });

    return {
      originalCode: code,
      refactoredCode: this.cleanCode(refactoredCode),
      changes: this.detectChanges(code, refactoredCode),
      goals: refactoringGoals
    };
  }

  async smartRefactor(code, context, options = {}) {
    const analysis = await this.analyzeCode(code, context.language, {
      deep: true,
      includePatterns: true
    });

    const refactoringOpportunities = this.identifyRefactoringOpportunities(analysis, context);
    
    if (refactoringOpportunities.length === 0) {
      return {
        code,
        opportunities: [],
        message: 'No refactoring opportunities identified'
      };
    }

    const refactoringResult = await this.applyTargetedRefactoring(
      code, 
      refactoringOpportunities, 
      context.language, 
      options
    );

    return {
      ...refactoringResult,
      opportunities: refactoringOpportunities,
      impact: this.assessRefactoringImpact(code, refactoringResult.refactoredCode)
    };
  }

  async optimize(code, language = 'javascript', options = {}) {
    this.metrics.optimizations++;

    const optimizationGoals = options.optimizations || [
      'improve algorithmic complexity',
      'reduce memory usage',
      'optimize loops and iterations',
      'minimize DOM operations',
      'use efficient data structures'
    ];

    const systemPrompt = `Tu es un expert en optimisation de performance ${language}.

OBJECTIFS D'OPTIMISATION:
${optimizationGoals.map(goal => `- ${goal}`).join('\n')}

RÈGLES:
- ${options.preserveBehavior ? 'Préserver le comportement exact' : 'Comportement similaire accepté'}
- Optimiser la complexité algorithmique
- Réduire l'utilisation mémoire
- Améliorer les temps d'exécution

Retourne UNIQUEMENT le code optimisé.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Optimise ce code:\n\n${code}` }
    ];

    const optimizedCode = await this.ai.chat(messages, {
      temperature: 0.2,
      maxTokens: 4000
    });

    const changes = this.detectChanges(code, optimizedCode);
    const performanceImpact = this.estimatePerformanceImpact(changes, language);

    return {
      originalCode: code,
      optimizedCode: this.cleanCode(optimizedCode),
      changes,
      performanceImpact,
      optimizationGoals
    };
  }

  async modernize(code, language = 'javascript', options = {}) {
    const modernFeatures = {
      javascript: [
        'arrow functions',
        'template literals',
        'destructuring',
        'spread operator',
        'async/await',
        'optional chaining',
        'nullish coalescing'
      ],
      python: [
        'type hints',
        'f-strings',
        'walrus operator',
        'dataclasses',
        'pattern matching'
      ]
    };

    const features = modernFeatures[language] || modernFeatures.javascript;
    const targetFeatures = options.features || features;

    const systemPrompt = `Tu es un expert en modernisation de code ${language}.

FONCTIONNALITÉS MODERNES À APPLIQUER:
${targetFeatures.map(feature => `- ${feature}`).join('\n')}

RÈGLES:
- Utiliser les fonctionnalités modernes du langage
- Maintenir la même logique
- Code plus concis et lisible
- Meilleures performances si possible

Retourne UNIQUEMENT le code modernisé.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Modernise ce code:\n\n${code}` }
    ];

    const modernCode = await this.ai.chat(messages, {
      temperature: 0.4,
      maxTokens: 4000
    });

    return {
      originalCode: code,
      modernizedCode: this.cleanCode(modernCode),
      appliedFeatures: targetFeatures,
      changes: this.detectChanges(code, modernCode)
    };
  }

  // === ANALYSIS METHODS ===

  async analyzeCode(code, language = 'javascript', options = {}) {
    const cacheKey = `analysis_${language}_${Buffer.from(code).toString('base64').substring(0, 50)}`;
    
    if (this.analysisCache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.analysisCache.get(cacheKey);
    }

    const analysis = {
      errors: [],
      warnings: [],
      suggestions: [],
      metrics: {},
      patterns: []
    };

    // Analyse syntaxique
    analysis.errors.push(...this.detectSyntaxErrors(code, language));
    
    // Analyse des patterns
    if (options.includePatterns !== false) {
      analysis.patterns.push(...this.detectCodePatterns(code, language));
    }

    // Analyse de qualité
    analysis.warnings.push(...this.detectQualityIssues(code, language));
    
    // Suggestions d'amélioration
    analysis.suggestions.push(...this.generateImprovementSuggestions(code, language));

    // Métriques
    analysis.metrics = this.calculateCodeMetrics(code, language);

    // Analyse approfondie si demandée
    if (options.deep && this.config.enableDeepAnalysis) {
      const deepAnalysis = await this.performDeepAnalysis(code, language);
      Object.assign(analysis, deepAnalysis);
    }

    this.analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  async analyzeSecurity(code, language = 'javascript') {
    this.metrics.securityScans++;

    const securityAnalysis = {
      issues: [],
      score: 100,
      recommendations: []
    };

    // Analyse basée sur les règles de sécurité
    const securityIssues = this.detectSecurityIssues(code, language);
    securityAnalysis.issues = securityIssues;

    // Calcul du score de sécurité
    securityAnalysis.score = this.calculateSecurityScore(securityIssues);

    // Analyse IA avancée pour les vulnérabilités complexes
    if (this.config.enableSecurityScan) {
      const aiSecurityAnalysis = await this.performAISecurityAnalysis(code, language);
      securityAnalysis.issues.push(...aiSecurityAnalysis.issues);
      securityAnalysis.recommendations.push(...aiSecurityAnalysis.recommendations);
    }

    return securityAnalysis;
  }

  async analyzePerformance(code, language = 'javascript') {
    const performanceAnalysis = {
      issues: [],
      score: 100,
      bottlenecks: [],
      optimizations: []
    };

    // Détection des problèmes de performance
    performanceAnalysis.issues = this.detectPerformanceIssues(code, language);
    
    // Identification des goulots d'étranglement
    performanceAnalysis.bottlenecks = this.identifyBottlenecks(code, language);
    
    // Suggestions d'optimisation
    performanceAnalysis.optimizations = this.suggestPerformanceOptimizations(code, language);
    
    // Calcul du score
    performanceAnalysis.score = this.calculatePerformanceScore(performanceAnalysis.issues);

    return performanceAnalysis;
  }

  async analyzeCodeQuality(code, language = 'javascript') {
    const qualityAnalysis = {
      issues: [],
      score: 100,
      maintainability: 0,
      readability: 0,
      bestPractices: []
    };

    // Analyse de la maintenabilité
    qualityAnalysis.maintainability = this.calculateMaintainability(code, language);
    
    // Analyse de la lisibilité
    qualityAnalysis.readability = this.calculateReadability(code, language);
    
    // Vérification des meilleures pratiques
    qualityAnalysis.bestPractices = this.checkBestPractices(code, language);
    
    // Score global
    qualityAnalysis.score = this.calculateQualityScore(qualityAnalysis);

    return qualityAnalysis;
  }

  // === DETECTION METHODS ===

  detectSyntaxErrors(code, language) {
    const errors = [];
    const patterns = this.errorPatterns[language]?.syntax || [];

    patterns.forEach(({ pattern, message, category, severity }) => {
      const matches = code.match(pattern);
      if (matches) {
        errors.push({
          type: 'syntax',
          message,
          category,
          severity: severity || 'medium',
          occurrences: matches.length,
          pattern: pattern.toString()
        });
      }
    });

    // Vérification de l'équilibre des parenthèses/accolades
    const balanceErrors = this.checkCodeBalance(code, language);
    errors.push(...balanceErrors);

    return errors;
  }

  detectSecurityIssues(code, language) {
    const issues = [];
    const rules = this.securityRules[language] || [];

    rules.forEach(({ pattern, risk, message }) => {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: 'security',
          risk,
          message,
          occurrences: matches.length,
          pattern: pattern.toString()
        });
      }
    });

    return issues;
  }

  detectPerformanceIssues(code, language) {
    const issues = [];
    const patterns = this.errorPatterns[language]?.performance || [];

    patterns.forEach(({ pattern, message, category, severity }) => {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: 'performance',
          message,
          category,
          severity: severity || 'medium',
          occurrences: matches.length
        });
      }
    });

    return issues;
  }

  detectCodePatterns(code, language) {
    const patterns = [];
    
    // Détection des patterns courants
    if (language === 'javascript' || language === 'typescript') {
      // Détection des promesses non gérées
      const unhandledPromises = (code.match(/\.then\([^)]*\)(?!\.catch)/g) || []).length;
      if (unhandledPromises > 0) {
        patterns.push({
          type: 'pattern',
          name: 'unhandled-promises',
          message: `${unhandledPromises} promesse(s) sans gestion d'erreur`,
          suggestion: 'Ajouter .catch() ou utiliser async/await avec try/catch'
        });
      }

      // Détection des fonctions trop longues
      const longFunctions = this.detectLongFunctions(code, language);
      patterns.push(...longFunctions);
    }

    return patterns;
  }

  // === AI-POWERED ANALYSIS ===

  async performDeepAnalysis(code, language) {
    const systemPrompt = `Tu es un expert en analyse de code ${language}.

Analyse ce code en profondeur et identifie:
1. Problèmes structurels
2. Opportunités d'amélioration
3. Patterns anti-productifs
4. Risques potentiels

Sois précis et propose des corrections spécifiques.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyse ce code ${language}:\n\n${code}` }
    ];

    try {
      const analysis = await this.ai.chat(messages, {
        temperature: 0.3,
        maxTokens: 2000
      });

      return this.parseDeepAnalysis(analysis, code, language);
    } catch (error) {
      console.warn('Deep analysis failed:', error);
      return { deepAnalysis: null, aiError: error.message };
    }
  }

  async performAISecurityAnalysis(code, language) {
    const systemPrompt = `Tu es un expert en sécurité ${language}.

Analyse ce code pour:
- Vulnérabilités de sécurité
- Injections potentielles
- Problèmes d'authentification
- Fuites de données
- Recommandations de sécurisation`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyse la sécurité de ce code:\n\n${code}` }
    ];

    const analysis = await this.ai.chat(messages, {
      temperature: 0.2,
      maxTokens: 1500
    });

    return this.parseSecurityAnalysis(analysis);
  }

  // === UTILITY METHODS ===

  async applyCorrections(code, analysis, language, options) {
    if (analysis.errors.length === 0) {
      return { correctedCode: code, changes: [] };
    }

    const correctionPrompt = this.buildCorrectionPrompt(code, analysis, language);
    const messages = [
      { role: 'system', content: 'Tu es un expert en correction de code. Corrige les problèmes identifiés.' },
      { role: 'user', content: correctionPrompt }
    ];

    const correctedCode = await this.ai.chat(messages, {
      temperature: 0.2,
      maxTokens: 4000
    });

    return {
      originalCode: code,
      correctedCode: this.cleanCode(correctedCode),
      changes: this.detectChanges(code, correctedCode),
      fixedIssues: analysis.errors.map(e => e.message)
    };
  }

  buildCorrectionPrompt(code, analysis, language) {
    const issues = analysis.errors.map(error => 
      `- ${error.message} (${error.severity})`
    ).join('\n');

    return `Code ${language} à corriger:

${code}

Problèmes identifiés:
${issues}

Règles de correction:
- Corriger tous les problèmes listés
- Maintenir la même fonctionnalité
- Respecter le style de code existant
- Ne pas introduire de nouveaux problèmes

Retourne uniquement le code corrigé.`;
  }

  detectChanges(original, modified) {
    const changes = [];
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');

    for (let i = 0; i < Math.max(originalLines.length, modifiedLines.length); i++) {
      const originalLine = originalLines[i] || '';
      const modifiedLine = modifiedLines[i] || '';

      if (originalLine !== modifiedLine) {
        changes.push({
          line: i + 1,
          original: originalLine,
          modified: modifiedLine,
          type: this.determineChangeType(originalLine, modifiedLine)
        });
      }
    }

    return changes;
  }

  determineChangeType(original, modified) {
    if (original.trim() === '' && modified.trim() !== '') return 'addition';
    if (original.trim() !== '' && modified.trim() === '') return 'deletion';
    return 'modification';
  }

  cleanCode(code) {
    if (!code) return '';

    return code
      .replace(/```[\w]*\n?/g, '')
      .replace(/```$/g, '')
      .replace(/^[\s]*`{3}[\s\S]*?`{3}$/gm, '')
      .replace(/^#+\s.*$/gm, '')
      .replace(/\/\/\s*AI[\s\S]*?(?=\n\n)/g, '')
      .replace(/\/\*\s*AI[\s\S]*?\*\//g, '')
      .trim();
  }

  // === COMPATIBILITY METHODS ===

  async explain(code, language = 'javascript') {
    const systemPrompt = `Tu es un expert pédagogue en programmation ${language}.

Explique ce code de manière:
- Claire et concise
- Structure avec des sections
- Avec des exemples si nécessaire
- En identifiant les bonnes pratiques`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explique ce code:\n\n${code}` }
    ];

    return await this.ai.chat(messages, { temperature: 0.5 });
  }

  async fixSyntax(code, language = 'javascript') {
    const result = await this.correct(code, language, { force: false });
    return result.correctedCode;
  }

  async addComments(code, language = 'javascript') {
    const systemPrompt = `Tu es un expert en documentation de code ${language}.

Ajoute des commentaires:
- Clairs et utiles
- JSDoc/Docstring pour les fonctions
- Expliquant la logique complexe
- Sans commentaires évidents`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Ajoute des commentaires à:\n\n${code}` }
    ];

    const commentedCode = await this.ai.chat(messages, { temperature: 0.4 });
    return this.cleanCode(commentedCode);
  }

  async checkSecurity(code, language = 'javascript') {
    const analysis = await this.analyzeSecurity(code, language);
    
    return {
      vulnerabilities: analysis.issues,
      score: analysis.score,
      recommendations: analysis.recommendations
    };
  }

  // ... autres méthodes utilitaires pour les calculs de scores, métriques, etc.

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.corrections > 0 
        ? ((this.metrics.corrections - this.metrics.errorsDetected) / this.metrics.corrections) * 100 
        : 0
    };
  }

  clearCache() {
    this.analysisCache.clear();
  }
}

export default CodeCorrector;