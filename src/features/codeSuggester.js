class CodeSuggester {
  constructor(aiOrchestrator, contextAnalyzer = null) {
    this.ai = aiOrchestrator;
    this.contextAnalyzer = contextAnalyzer;
    
    // Configuration avancée
    this.config = {
      suggestionDelay: 1500, // 1.5 secondes
      maxSuggestions: 3,
      enableRealTimeAnalysis: true,
      enableCodeCompletion: true,
      enableErrorDetection: true,
      enableRefactoringSuggestions: true,
      contextWindow: 10, // lignes de contexte
      maxSuggestionLength: 200,
      languageSpecificRules: true
    };

    // État et historique
    this.lastSuggestionTime = 0;
    this.suggestionHistory = new Map();
    this.userPreferences = new Map();
    this.analysisCache = new Map();
    
    // Patterns et règles par langage
    this.languageRules = this.initLanguageRules();
    this.codePatterns = this.initCodePatterns();
    
    // Métriques
    this.metrics = {
      suggestionsGenerated: 0,
      suggestionsAccepted: 0,
      errorsDetected: 0,
      analysisPerformed: 0,
      cacheHits: 0
    };
  }

  initLanguageRules() {
    return {
      javascript: {
        completions: {
          'function': 'function ${1:name}(${2:params}) {\n  ${3:// code}\n}',
          'if': 'if (${1:condition}) {\n  ${2:// code}\n}',
          'for': 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n  ${3:// code}\n}',
          'foreach': '${1:array}.forEach((${2:item}) => {\n  ${3:// code}\n});',
          'try': 'try {\n  ${1:// code}\n} catch (error) {\n  ${2:// handle error}\n}',
          'class': 'class ${1:ClassName} {\n  constructor(${2:params}) {\n    ${3:// init}\n  }\n}'
        },
        antiPatterns: [
          { pattern: /var\s+\w+\s*=/g, message: 'Use let/const instead of var', fix: 'let' },
          { pattern: /==/g, message: 'Use strict equality ===', fix: '===' },
          { pattern: /console\.log\(/g, message: 'Remove console.log in production' },
          { pattern: /eval\(/g, message: 'Avoid eval for security', severity: 'high' }
        ],
        bestPractices: [
          'Use const for constants',
          'Prefer arrow functions',
          'Use template literals',
          'Destructure objects and arrays',
          'Use async/await over callbacks'
        ]
      },
      typescript: {
        completions: {
          'interface': 'interface ${1:Name} {\n  ${2:key}: ${3:type};\n}',
          'type': 'type ${1:Name} = ${2:type};',
          'generic': '<${1:T}>',
          'async': 'async function ${1:name}(${2:params}): Promise<${3:returnType}>'
        },
        antiPatterns: [
          { pattern: /:\s*any/g, message: 'Avoid any type', severity: 'high' },
          { pattern: /as\s+any/g, message: 'Avoid type assertion to any' }
        ]
      },
      python: {
        completions: {
          'function': 'def ${1:name}(${2:params}):\n    ${3:pass}',
          'class': 'class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}',
          'if': 'if ${1:condition}:\n    ${2:pass}',
          'for': 'for ${1:item} in ${2:iterable}:\n    ${3:pass}'
        },
        antiPatterns: [
          { pattern: /except:\s*pass/g, message: 'Avoid bare except', severity: 'high' },
          { pattern: /print\(/g, message: 'Use logging instead of print in production' }
        ]
      },
      // Ajouter d'autres langages...
    };
  }

  initCodePatterns() {
    return {
      imports: {
        javascript: /import\s+.*?from\s+['"](.*?)['"]/g,
        python: /^import\s+|^from\s+.*?import/g,
        typescript: /import\s+.*?from\s+['"](.*?)['"]/g
      },
      functions: {
        javascript: /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|let\s+(\w+)\s*=\s*(?:async\s*)?function)/g,
        python: /def\s+(\w+)\s*\([^)]*\):/g,
        typescript: /(?:function\s+(\w+)|const\s+(\w+)\s*:\s*\([^)]*\)\s*=>)/g
      },
      classes: {
        javascript: /class\s+(\w+)/g,
        python: /class\s+(\w+)/g,
        typescript: /class\s+(\w+)/g
      }
    };
  }

  // === SUGGESTION ENGINE ===

  async getSmartSuggestions(code, cursorPosition, language = 'javascript', options = {}) {
    const now = Date.now();
    if (now - this.lastSuggestionTime < this.config.suggestionDelay) {
      return { suggestions: [], analysis: null };
    }

    this.lastSuggestionTime = now;
    this.metrics.suggestionsGenerated++;

    try {
      // Analyse contextuelle avancée
      const context = await this.analyzeAdvancedContext(code, cursorPosition, language);
      
      // Générer différents types de suggestions
      const [completions, refactorings, quickFixes] = await Promise.all([
        this.generateCompletions(context, language, options),
        this.generateRefactoringSuggestions(context, language),
        this.generateQuickFixes(context, language)
      ]);

      // Fusionner et prioriser les suggestions
      const allSuggestions = this.mergeAndPrioritizeSuggestions(
        completions, 
        refactorings, 
        quickFixes
      );

      // Analyse de code en temps réel
      const analysis = this.config.enableRealTimeAnalysis 
        ? await this.performRealTimeAnalysis(code, language, context)
        : null;

      return {
        suggestions: allSuggestions.slice(0, this.config.maxSuggestions),
        analysis,
        context: this.summarizeContext(context)
      };

    } catch (error) {
      console.error('Erreur génération suggestions:', error);
      return this.getFallbackSuggestions(code, cursorPosition, language);
    }
  }

  async analyzeAdvancedContext(code, cursorPosition, language) {
    const lines = code.split('\n');
    const currentLine = cursorPosition.row;
    const currentColumn = cursorPosition.column;
    
    // Contexte étendu
    const startLine = Math.max(0, currentLine - this.config.contextWindow);
    const endLine = Math.min(lines.length, currentLine + this.config.contextWindow);
    
    const context = {
      // Contexte textuel
      before: lines.slice(startLine, currentLine).join('\n'),
      currentLine: lines[currentLine] || '',
      after: lines.slice(currentLine + 1, endLine).join('\n'),
      
      // Position
      lineNumber: currentLine,
      column: currentColumn,
      
      // Analyse structurelle
      structure: this.analyzeCodeStructure(code, language),
      currentToken: this.extractCurrentToken(lines[currentLine], currentColumn),
      
      // Métadonnées
      language,
      timestamp: Date.now()
    };

    // Enrichir avec l'analyseur de contexte si disponible
    if (this.contextAnalyzer) {
      try {
        const fileContext = this.contextAnalyzer.analyzeFile({
          name: `suggestion_${language}`,
          session: { getValue: () => code }
        });
        context.fileAnalysis = fileContext;
      } catch (error) {
        console.warn('Context analyzer error:', error);
      }
    }

    return context;
  }

  // === GENERATION DE SUGGESTIONS ===

  async generateCompletions(context, language, options = {}) {
    const suggestions = [];

    // 1. Completions basées sur le contexte immédiat
    const contextualCompletions = await this.generateContextualCompletions(context, language);
    suggestions.push(...contextualCompletions);

    // 2. Completions basées sur les patterns du langage
    const patternCompletions = this.generatePatternCompletions(context, language);
    suggestions.push(...patternCompletions);

    // 3. Completions intelligentes via IA
    if (this.config.enableCodeCompletion) {
      const aiCompletions = await this.generateAICompletions(context, language);
      suggestions.push(...aiCompletions);
    }

    return suggestions;
  }

  async generateContextualCompletions(context, language) {
    const completions = [];
    const { currentLine, currentToken, structure } = context;

    // Completions basées sur le token courant
    if (currentToken) {
      const tokenCompletions = this.getTokenBasedCompletions(currentToken, language, structure);
      completions.push(...tokenCompletions);
    }

    // Completions basées sur la ligne courante
    const lineCompletions = this.getLineBasedCompletions(currentLine, language);
    completions.push(...lineCompletions);

    return completions;
  }

  async generateAICompletions(context, language) {
    const cacheKey = `ai_completion_${language}_${JSON.stringify(context.currentToken)}`;
    
    if (this.analysisCache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.analysisCache.get(cacheKey);
    }

    try {
      const systemPrompt = `Tu es un expert en autocomplétion de code ${language}.

RÈGLES STRICTES:
- Suggère UNIQUEMENT du code à compléter
- Maximum ${this.config.maxSuggestionLength} caractères
- Code pertinent au contexte
- Respecte le style et les conventions
- Pas d'explications, juste le code`;

      const userPrompt = `Contexte ${language}:
Ligne actuelle: "${context.currentLine}"
Token: "${context.currentToken}"
Contexte précédent: 
${context.before.split('\n').slice(-3).join('\n')}

Suggère 1-3 complétions courtes et pertinentes:`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await this.ai.chat(messages, {
        temperature: 0.3,
        maxTokens: 300
      });

      const suggestions = this.parseAICompletions(response, context);
      this.analysisCache.set(cacheKey, suggestions);

      return suggestions;

    } catch (error) {
      console.warn('AI completion failed:', error);
      return [];
    }
  }

  async generateRefactoringSuggestions(context, language) {
    if (!this.config.enableRefactoringSuggestions) return [];

    const suggestions = [];
    const { structure, currentLine } = context;

    // Détection de code smells
    const codeSmells = this.detectCodeSmells(context, language);
    suggestions.push(...codeSmells);

    // Suggestions d'optimisation
    const optimizations = this.suggestOptimizations(context, language);
    suggestions.push(...optimizations);

    return suggestions;
  }

  async generateQuickFixes(context, language) {
    if (!this.config.enableErrorDetection) return [];

    const quickFixes = [];
    const { currentLine, structure } = context;

    // Détection d'erreurs de syntaxe
    const syntaxErrors = this.detectSyntaxErrors(context, language);
    quickFixes.push(...syntaxErrors);

    // Détection de problèmes de performance
    const performanceIssues = this.detectPerformanceIssues(context, language);
    quickFixes.push(...performanceIssues);

    // Détection de problèmes de sécurité
    const securityIssues = this.detectSecurityIssues(context, language);
    quickFixes.push(...securityIssues);

    return quickFixes;
  }

  // === ANALYSIS ENGINE ===

  async performRealTimeAnalysis(code, language, context) {
    this.metrics.analysisPerformed++;

    const analysis = {
      errors: [],
      warnings: [],
      info: [],
      metrics: {},
      suggestions: []
    };

    // Analyse de syntaxe
    analysis.errors.push(...this.detectSyntaxErrors(context, language));

    // Analyse de qualité
    analysis.warnings.push(...this.detectQualityIssues(context, language));

    // Métriques de code
    analysis.metrics = this.calculateCodeMetrics(code, language);

    // Suggestions d'amélioration
    analysis.suggestions.push(...this.generateImprovementSuggestions(context, language));

    return analysis;
  }

  detectSyntaxErrors(context, language) {
    const errors = [];
    const { currentLine, structure } = context;

    // Vérification d'équilibre des parenthèses/accollades
    const balanceErrors = this.checkBalance(currentLine, language);
    errors.push(...balanceErrors);

    // Vérification des terminaux manquants
    const terminationErrors = this.checkTermination(currentLine, language);
    errors.push(...terminationErrors);

    return errors;
  }

  detectQualityIssues(context, language) {
    const warnings = [];
    const rules = this.languageRules[language];

    if (rules && rules.antiPatterns) {
      rules.antiPatterns.forEach(rule => {
        const matches = context.currentLine.match(rule.pattern);
        if (matches) {
          warnings.push({
            type: 'anti-pattern',
            message: rule.message,
            severity: rule.severity || 'warning',
            line: context.lineNumber,
            fix: rule.fix
          });
        }
      });
    }

    return warnings;
  }

  calculateCodeMetrics(code, language) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    return {
      lines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      characters: code.length,
      functions: this.countFunctions(code, language),
      classes: this.countClasses(code, language),
      complexity: this.calculateComplexity(code, language)
    };
  }

  // === PATTERN DETECTION ===

  getTokenBasedCompletions(token, language, structure) {
    const completions = [];
    const rules = this.languageRules[language];

    if (!rules || !rules.completions) return completions;

    // Completions basées sur le token
    Object.entries(rules.completions).forEach(([key, template]) => {
      if (token.includes(key) || key.includes(token)) {
        completions.push({
          type: 'completion',
          content: template,
          description: `Complete ${key} pattern`,
          relevance: 0.9,
          category: 'pattern'
        });
      }
    });

    return completions;
  }

  getLineBasedCompletions(line, language) {
    const completions = [];
    const trimmedLine = line.trim();

    // Détection de patterns courants
    if (trimmedLine.endsWith('if (')) {
      completions.push({
        type: 'completion',
        content: ') {\n  \n}',
        description: 'Complete if statement',
        relevance: 0.8,
        category: 'syntax'
      });
    }

    if (trimmedLine.endsWith('function')) {
      completions.push({
        type: 'completion',
        content: ' ${1:name}(${2:params}) {\n  ${3:// code}\n}',
        description: 'Complete function declaration',
        relevance: 0.9,
        category: 'syntax'
      });
    }

    return completions;
  }

  // === UTILITY METHODS ===

  extractCurrentToken(line, column) {
    if (!line || column === undefined) return '';
    
    // Extraire le token autour du curseur
    const beforeCursor = line.substring(0, column);
    const afterCursor = line.substring(column);
    
    const beforeMatch = beforeCursor.match(/(\w+)$/);
    const afterMatch = afterCursor.match(/^(\w+)/);
    
    const before = beforeMatch ? beforeMatch[1] : '';
    const after = afterMatch ? afterMatch[1] : '';
    
    return before + after;
  }

  analyzeCodeStructure(code, language) {
    const structure = {
      imports: [],
      functions: [],
      classes: [],
      variables: []
    };

    const patterns = this.codePatterns[language];
    if (!patterns) return structure;

    // Analyser les imports
    if (patterns.imports) {
      const importMatches = code.matchAll(patterns.imports);
      structure.imports = Array.from(importMatches).map(m => m[1] || m[0]);
    }

    // Analyser les fonctions
    if (patterns.functions) {
      const functionMatches = code.matchAll(patterns.functions);
      structure.functions = Array.from(functionMatches)
        .map(m => m[1] || m[2] || m[3])
        .filter(Boolean);
    }

    // Analyser les classes
    if (patterns.classes) {
      const classMatches = code.matchAll(patterns.classes);
      structure.classes = Array.from(classMatches).map(m => m[1]);
    }

    return structure;
  }

  parseAICompletions(response, context) {
    if (!response) return [];

    // Nettoyer et parser la réponse
    const cleanResponse = response
      .replace(/```[\w]*\n?/g, '')
      .replace(/```$/g, '')
      .trim();

    // Séparer les suggestions
    const suggestions = cleanResponse.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(suggestion => suggestion.length <= this.config.maxSuggestionLength)
      .map(suggestion => ({
        type: 'completion',
        content: suggestion,
        description: 'AI-suggested completion',
        relevance: 0.7,
        category: 'ai',
        source: 'ai'
      }));

    return suggestions.slice(0, 3);
  }

  mergeAndPrioritizeSuggestions(completions, refactorings, quickFixes) {
    const allSuggestions = [
      ...quickFixes.map(s => ({ ...s, priority: 1 })), // Highest priority
      ...completions.map(s => ({ ...s, priority: 2 })),
      ...refactorings.map(s => ({ ...s, priority: 3 })) // Lowest priority
    ];

    // Trier par priorité et pertinence
    return allSuggestions.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (b.relevance || 0) - (a.relevance || 0);
    });
  }

  summarizeContext(context) {
    return {
      line: context.lineNumber,
      token: context.currentToken,
      language: context.language,
      hasStructure: !!context.structure.functions.length
    };
  }

  getFallbackSuggestions(code, cursorPosition, language) {
    // Suggestions de fallback basiques
    return {
      suggestions: [
        {
          type: 'completion',
          content: '// Start typing...',
          description: 'Basic completion',
          relevance: 0.5,
          category: 'fallback'
        }
      ],
      analysis: null,
      context: { line: cursorPosition.row, language }
    };
  }

  // === METRICS AND CONFIGURATION ===

  trackSuggestionAccepted(suggestion) {
    this.metrics.suggestionsAccepted++;
    
    // Apprendre des préférences utilisateur
    const key = `${suggestion.type}_${suggestion.category}`;
    this.userPreferences.set(key, (this.userPreferences.get(key) || 0) + 1);
  }

  getMetrics() {
    return {
      ...this.metrics,
      acceptanceRate: this.metrics.suggestionsGenerated > 0 
        ? (this.metrics.suggestionsAccepted / this.metrics.suggestionsGenerated) * 100 
        : 0,
      userPreferences: Object.fromEntries(this.userPreferences),
      cacheSize: this.analysisCache.size
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  clearCache() {
    this.analysisCache.clear();
  }

  // === COMPATIBILITY METHODS ===

  async getSuggestions(code, cursorPosition, language = 'javascript') {
    const result = await this.getSmartSuggestions(code, cursorPosition, language);
    return result.suggestions.map(s => s.content);
  }

  async analyzeCode(code, language) {
    const context = await this.analyzeAdvancedContext(code, { row: 0, column: 0 }, language);
    return await this.performRealTimeAnalysis(code, language, context);
  }
}

export default CodeSuggester;