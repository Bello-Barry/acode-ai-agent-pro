class CodeGenerator {
  constructor(aiOrchestrator, contextAnalyzer = null) {
    this.ai = aiOrchestrator;
    this.contextAnalyzer = contextAnalyzer;
    
    // Configuration avancée
    this.config = {
      enableSmartGeneration: true,
      enableCodeValidation: true,
      enableTemplateSystem: true,
      enableMultiFileOutput: false,
      maxRetries: 2,
      defaultQuality: 'production', // 'draft' | 'production' | 'optimized'
      languageStandards: true
    };

    // Système de templates
    this.templates = this.initTemplates();
    this.codePatterns = this.initCodePatterns();
    
    // Cache et métriques
    this.generationCache = new Map();
    this.metrics = {
      generations: 0,
      successes: 0,
      failures: 0,
      cacheHits: 0,
      tokensUsed: 0
    };

    // Historique des générations
    this.generationHistory = [];
  }

  initTemplates() {
    return {
      nextjs: {
        component: {
          client: `"use client";

import { FC } from 'react';
import { cn } from '@/lib/utils';

interface {{componentName}}Props {
  className?: string;
}

export const {{componentName}}: FC<{{componentName}}Props> = ({ className }) => {
  return (
    <div className={cn('', className)}>
      {{content}}
    </div>
  );
};`,
          server: `import { FC } from 'react';

interface {{componentName}}Props {
  className?: string;
}

export const {{componentName}}: FC<{{componentName}}Props> = async ({ className }) => {
  {{content}}
  return (
    <div className={className}>
      {{content}}
    </div>
  );
};`
        },
        page: `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '{{pageTitle}}',
  description: '{{pageDescription}}',
};

export default async function {{pageName}}() {
  {{content}}
  return (
    <main className="container mx-auto p-4">
      {{content}}
    </main>
  );
}`,
        api: `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const {{schemaName}} = z.object({
  {{validationSchema}}
});

export async function {{method}}(request: NextRequest) {
  try {
    {{content}}
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}`
      },
      react: {
        component: `import React from 'react';

const {{componentName}} = ({{props}}) => {
  {{state}}
  {{effects}}
  
  return (
    <div>
      {{content}}
    </div>
  );
};

export default {{componentName}};`,
        hook: `import { useState, useEffect } from 'react';

export const use{{HookName}} = ({{parameters}}) => {
  {{state}}
  {{effects}}
  
  return {
    {{returnValues}}
  };
};`
      },
      // Templates pour d'autres frameworks...
    };
  }

  initCodePatterns() {
    return {
      quality: {
        production: {
          includeErrorHandling: true,
          includeTypes: true,
          includeComments: true,
          optimizePerformance: true,
          followBestPractices: true
        },
        draft: {
          includeErrorHandling: false,
          includeTypes: false,
          includeComments: false,
          optimizePerformance: false,
          followBestPractices: false
        },
        optimized: {
          includeErrorHandling: true,
          includeTypes: true,
          includeComments: true,
          optimizePerformance: true,
          followBestPractices: true,
          minify: false
        }
      },
      validation: {
        javascript: ['eslint', 'prettier'],
        typescript: ['typescript', 'eslint', 'prettier'],
        python: ['pylint', 'black', 'mypy'],
        java: ['checkstyle', 'pmd']
      }
    };
  }

  // === CORE GENERATION METHODS ===

  async generate(prompt, language = 'javascript', context = '', options = {}) {
    this.metrics.generations++;

    try {
      const cacheKey = this.generateCacheKey(prompt, language, context, options);
      
      // Vérifier le cache
      if (this.generationCache.has(cacheKey)) {
        this.metrics.cacheHits++;
        return this.generationCache.get(cacheKey);
      }

      // Génération intelligente
      const code = await this.generateIntelligentCode(prompt, language, context, options);
      
      // Validation et nettoyage
      const cleanedCode = this.cleanAndValidateCode(code, language, options);
      
      // Mettre en cache
      this.generationCache.set(cacheKey, cleanedCode);
      
      // Historique
      this.recordGeneration(prompt, language, cleanedCode, options);
      
      this.metrics.successes++;
      return cleanedCode;

    } catch (error) {
      this.metrics.failures++;
      console.error('Erreur de génération:', error);
      throw this.enhanceGenerationError(error, prompt, language);
    }
  }

  async generateIntelligentCode(prompt, language, context, options) {
    const qualityProfile = this.codePatterns.quality[options.quality || this.config.defaultQuality];
    
    // Préparer le contexte étendu
    const extendedContext = await this.prepareGenerationContext(context, language, options);
    
    // Construire le prompt système
    const systemPrompt = this.buildSystemPrompt(language, qualityProfile, options);
    
    // Construire le prompt utilisateur
    const userPrompt = this.buildUserPrompt(prompt, extendedContext, language, options);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Génération avec retry
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.ai.chat(messages, {
          temperature: options.temperature || 0.3,
          maxTokens: options.maxTokens || 4000,
          ...options.aiOptions
        });

        return response;

      } catch (error) {
        if (attempt === this.config.maxRetries) throw error;
        
        // Ajuster les paramètres pour la retry
        options.temperature = Math.min(0.7, (options.temperature || 0.3) + 0.1);
        console.warn(`Retry ${attempt + 1} avec température ${options.temperature}`);
      }
    }

    throw new Error('Échec de génération après plusieurs tentatives');
  }

  // === SPECIALIZED GENERATION METHODS ===

  async generateSmart(prompt, context = {}, options = {}) {
    const {
      includeTests = false,
      includeDocs = false,
      followPatterns = true,
      quality = 'production'
    } = options;

    const generationTasks = [
      this.generate(prompt, context.language || 'javascript', context.code, { quality })
    ];

    // Générer des tests si demandé
    if (includeTests) {
      generationTasks.push(
        this.generateTests(context.code, context.language, { quality })
      );
    }

    // Générer de la documentation si demandé
    if (includeDocs) {
      generationTasks.push(
        this.generateDocumentation(context.code, context.language, { format: 'markdown' })
      );
    }

    const [code, tests, docs] = await Promise.all(generationTasks);

    const result = {
      code,
      ...(includeTests && { tests }),
      ...(includeDocs && { docs }),
      metadata: {
        language: context.language,
        quality,
        timestamp: new Date().toISOString(),
        context: this.summarizeContext(context)
      }
    };

    return result;
  }

  async generateTests(code, language = 'javascript', options = {}) {
    const testFramework = this.getTestFramework(language);
    const testPattern = this.getTestPattern(language, options.testType);
    
    const prompt = `Génère des tests ${testFramework} complets pour le code suivant.
    
Code à tester:
${code}

Exigences:
- Couvrir tous les cas d'usage
- Tests isolés et indépendants
- Bonnes pratiques ${testFramework}
- ${testPattern.requirements || ''}`;

    return await this.generate(prompt, language, '', {
      ...options,
      temperature: 0.4
    });
  }

  async generateDocumentation(code, language = 'javascript', options = {}) {
    const format = options.format || 'markdown';
    
    const prompt = `Génère une documentation ${format} complète pour le code suivant.

Code:
${code}

Format de documentation: ${format}
Inclure:
- Description générale
- Paramètres/fonctions
- Exemples d'utilisation
- Notes importantes`;

    return await this.generate(prompt, 'markdown', '', {
      temperature: 0.5,
      maxTokens: 3000
    });
  }

  async generateFunction(functionName, description, language = 'javascript', options = {}) {
    const signature = options.signature || this.inferFunctionSignature(description, language);
    
    const prompt = `Crée une fonction ${language} nommée "${functionName}" avec la signature: ${signature}

Description: ${description}

Exigences:
- ${options.returnType ? `Type de retour: ${options.returnType}` : 'Type de retour approprié'}
- ${options.parameters || 'Paramètres typés'}
- Gestion d'erreurs
- Documentation intégrée`;

    return await this.generate(prompt, language, '', {
      quality: 'production',
      ...options
    });
  }

  async generateClass(className, description, language = 'javascript', options = {}) {
    const properties = options.properties || this.inferClassProperties(description, language);
    
    const prompt = `Crée une classe ${language} nommée "${className}"

Description: ${description}

Propriétés: ${properties.join(', ')}

Méthodes attendues:
- Constructor
- Getters/Setters si nécessaire
- Méthodes métier
- Méthodes utilitaires

Exigences:
- Encapsulation appropriée
- Principes SOLID
- Typage strict`;

    return await this.generate(prompt, language, '', {
      quality: 'production',
      ...options
    });
  }

  async generateComponent(componentName, framework, description, options = {}) {
    const componentType = options.componentType || 'client';
    const props = options.props || this.inferComponentProps(description);
    
    const prompt = `Crée un composant ${framework} ${componentType} nommé "${componentName}"

Framework: ${framework}
Type: ${componentType}
Description: ${description}

Props: ${props.join(', ')}

Exigences:
- ${framework === 'nextjs' ? 'Directive "use client" si nécessaire' : ''}
- Typage TypeScript
- Styling avec ${options.styling || 'TailwindCSS'}
- Accessibilité ARIA
- Responsive design`;

    return await this.generate(prompt, 'typescript', '', {
      quality: 'production',
      ...options
    });
  }

  async generateFromTemplate(templateType, variables, language = 'javascript') {
    const template = this.templates[language]?.[templateType];
    
    if (!template) {
      throw new Error(`Template non trouvé: ${templateType} pour ${language}`);
    }

    // Remplir le template
    let code = template;
    Object.entries(variables).forEach(([key, value]) => {
      code = code.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Générer le contenu manquant via AI si nécessaire
    if (code.includes('{{content}}')) {
      const contentPrompt = `Génère le contenu pour: ${variables.componentName || variables.pageName || 'le template'}`;
      const content = await this.generate(contentPrompt, language, '', {
        temperature: 0.4,
        maxTokens: 2000
      });
      code = code.replace('{{content}}', content);
    }

    return this.cleanCode(code);
  }

  // === CONTEXT AND PROMPT ENGINEERING ===

  async prepareGenerationContext(context, language, options) {
    let extendedContext = context;

    // Analyser le contexte existant si fourni
    if (typeof context === 'string' && context.length > 0) {
      extendedContext = {
        code: context,
        language,
        structure: this.analyzeCodeStructure(context, language),
        ...options.context
      };
    }

    // Enrichir avec l'analyseur de contexte si disponible
    if (this.contextAnalyzer && typeof context === 'string') {
      try {
        const analysis = this.contextAnalyzer.analyzeFile({
          name: `generation.${language}`,
          session: { getValue: () => context }
        });
        extendedContext.analysis = analysis;
      } catch (error) {
        console.warn('Context analysis failed:', error);
      }
    }

    return extendedContext;
  }

  buildSystemPrompt(language, qualityProfile, options) {
    const rules = [
      'Génère UNIQUEMENT du code fonctionnel et complet',
      'Pas d\'explications, commentaires ou texte superflu',
      'Code prêt pour la production',
      `Langage: ${language}`,
      ...this.getLanguageSpecificRules(language)
    ];

    if (qualityProfile.includeErrorHandling) {
      rules.push('Inclure la gestion d\'erreurs appropriée');
    }

    if (qualityProfile.includeTypes && (language === 'typescript' || language === 'java')) {
      rules.push('Utiliser des types stricts');
    }

    if (qualityProfile.followBestPractices) {
      rules.push('Suivre les meilleures pratiques du langage');
    }

    if (qualityProfile.optimizePerformance) {
      rules.push('Optimiser les performances');
    }

    if (options.framework) {
      rules.push(`Framework: ${options.framework} - suivre ses conventions`);
    }

    return `Tu es un expert développeur ${language}.

RÈGLES STRICTES DE GÉNÉRATION:
${rules.map(rule => `- ${rule}`).join('\n')}

Retourne uniquement le code sans formatage markdown.`;
  }

  buildUserPrompt(prompt, context, language, options) {
    let userPrompt = prompt;

    // Ajouter le contexte si disponible
    if (context && typeof context === 'object' && context.code) {
      userPrompt += `\n\nContexte:\n${context.code}`;
      
      if (context.analysis) {
        userPrompt += `\n\nAnalyse du contexte:\n${this.formatContextAnalysis(context.analysis)}`;
      }
    } else if (context && typeof context === 'string') {
      userPrompt += `\n\nContexte:\n${context}`;
    }

    // Ajouter des exigences spécifiques
    if (options.requirements) {
      userPrompt += `\n\nExigences supplémentaires:\n${options.requirements}`;
    }

    return userPrompt;
  }

  // === VALIDATION AND CLEANING ===

  cleanAndValidateCode(code, language, options) {
    if (!code) throw new Error('Code généré vide');

    // Nettoyer le code
    let cleanedCode = this.cleanCode(code);

    // Validation basique
    this.validateGeneratedCode(cleanedCode, language);

    // Application des standards de qualité
    if (this.config.enableCodeValidation) {
      cleanedCode = this.applyCodeStandards(cleanedCode, language, options);
    }

    return cleanedCode;
  }

  cleanCode(code) {
    if (!code) return '';

    // Suppression complète du markdown
    let cleaned = code
      .replace(/```[\w]*\n?/g, '')
      .replace(/```$/g, '')
      .replace(/^[\s]*`{3}[\s\S]*?`{3}$/gm, '') // Blocs de code complets
      .replace(/^#+\s.*$/gm, '') // En-têtes markdown
      .replace(/^\s*[-*]\s/gm, '') // Listes markdown
      .replace(/\[.*?\]\(.*?\)/g, '') // Liens markdown
      .trim();

    // Suppression des commentaires d'explication de l'IA
    cleaned = cleaned.replace(/\/\/\s*AI[\s\S]*?(?=\n\n)/g, '');
    cleaned = cleaned.replace(/\/\*\s*AI[\s\S]*?\*\//g, '');

    return cleaned;
  }

  validateGeneratedCode(code, language) {
    // Validation de base de la syntaxe
    const issues = [];

    // Vérifier l'équilibre des parenthèses/accollades
    const balanceIssues = this.checkCodeBalance(code, language);
    issues.push(...balanceIssues);

    // Vérifier les terminaux manquants
    const terminationIssues = this.checkCodeTermination(code, language);
    issues.push(...terminationIssues);

    if (issues.length > 0) {
      console.warn('Problèmes de validation détectés:', issues);
      // Pour l'instant, on loggue juste les warnings
      // On pourrait lancer une erreur pour les problèmes critiques
    }
  }

  applyCodeStandards(code, language, options) {
    let standardizedCode = code;

    // Application des standards spécifiques au langage
    switch (language) {
      case 'javascript':
      case 'typescript':
        // S'assurer de l'utilisation de const/let
        standardizedCode = standardizedCode.replace(/var\s+(\w+)/g, 'const $1');
        break;
      
      case 'python':
        // Respecter PEP8 pour l'indentation
        standardizedCode = standardizedCode.replace(/\t/g, '    ');
        break;
    }

    return standardizedCode;
  }

  // === UTILITY METHODS ===

  getTestFramework(language) {
    const frameworks = {
      javascript: 'Jest',
      typescript: 'Jest',
      python: 'pytest',
      java: 'JUnit',
      csharp: 'xUnit',
      php: 'PHPUnit'
    };
    return frameworks[language] || 'framework de test standard';
  }

  getTestPattern(language, testType = 'unit') {
    const patterns = {
      unit: {
        requirements: 'Tests unitaires isolés'
      },
      integration: {
        requirements: 'Tests d\'intégration avec mocks appropriés'
      },
      e2e: {
        requirements: 'Tests end-to-end complets'
      }
    };
    return patterns[testType] || patterns.unit;
  }

  inferFunctionSignature(description, language) {
    // Logique simple d'inférence de signature
    if (description.includes('async') || description.includes('await')) {
      return language === 'python' ? 'async def' : 'async function';
    }
    return language === 'python' ? 'def' : 'function';
  }

  inferClassProperties(description, language) {
    // Extraction basique de propriétés depuis la description
    const propertyKeywords = ['name', 'age', 'email', 'address', 'title', 'description'];
    return propertyKeywords.filter(keyword => 
      description.toLowerCase().includes(keyword)
    );
  }

  inferComponentProps(description) {
    const propKeywords = ['onClick', 'onChange', 'value', 'disabled', 'className', 'children'];
    return propKeywords.filter(keyword =>
      description.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  analyzeCodeStructure(code, language) {
    // Analyse basique de la structure du code
    const lines = code.split('\n');
    return {
      lines: lines.length,
      functions: (code.match(/function\s+\w+|const\s+\w+\s*=/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      imports: (code.match(/import|require/g) || []).length
    };
  }

  formatContextAnalysis(analysis) {
    return `Fichier: ${analysis.fileName}
Langage: ${analysis.language}
Framework: ${analysis.framework || 'Aucun'}
Fonctions: ${analysis.functions.length}
Classes: ${analysis.classes.length}
Imports: ${analysis.imports.slice(0, 5).join(', ')}`;
  }

  summarizeContext(context) {
    if (!context) return {};
    
    return {
      hasCode: !!context.code,
      language: context.language,
      framework: context.framework,
      structure: context.structure ? {
        lines: context.structure.lines,
        functions: context.structure.functions,
        classes: context.structure.classes
      } : null
    };
  }

  generateCacheKey(prompt, language, context, options) {
    return JSON.stringify({
      prompt: prompt.substring(0, 200), // Limiter la longueur
      language,
      context: typeof context === 'string' ? context.substring(0, 100) : 'object',
      options: {
        quality: options.quality,
        framework: options.framework
      }
    });
  }

  recordGeneration(prompt, language, code, options) {
    this.generationHistory.push({
      prompt,
      language,
      codeLength: code.length,
      options,
      timestamp: new Date().toISOString()
    });

    // Garder seulement les 100 dernières générations
    if (this.generationHistory.length > 100) {
      this.generationHistory.shift();
    }
  }

  enhanceGenerationError(error, prompt, language) {
    if (error.message.includes('API') || error.message.includes('network')) {
      return new Error(`Erreur de génération: Problème de connexion API. Langage: ${language}`);
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      return new Error('Limite de génération atteinte. Réessayez plus tard.');
    }

    return new Error(`Échec de génération pour: "${prompt.substring(0, 50)}..." - ${error.message}`);
  }

  // === METRICS AND MANAGEMENT ===

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.generations > 0 
        ? (this.metrics.successes / this.metrics.generations) * 100 
        : 0,
      cacheHitRate: this.metrics.generations > 0
        ? (this.metrics.cacheHits / this.metrics.generations) * 100
        : 0,
      historySize: this.generationHistory.length,
      cacheSize: this.generationCache.size
    };
  }

  clearCache() {
    this.generationCache.clear();
  }

  clearHistory() {
    this.generationHistory = [];
  }

  getLanguageSpecificRules(language) {
    const rules = {
      javascript: [
        'Utiliser const/let au lieu de var',
        'Préférer les arrow functions',
        'Utiliser template literals',
        'Éviter les fonctions constructeur'
      ],
      typescript: [
        'Utiliser des types stricts',
        'Éviter le type any',
        'Utiliser interfaces pour les objets',
        'Typer les retours de fonction'
      ],
      python: [
        'Suivre PEP8',
        'Utiliser les type hints',
        'Préférer les list comprehensions',
        'Utiliser les f-strings'
      ]
    };
    return rules[language] || [];
  }

  checkCodeBalance(code, language) {
    const issues = [];
    
    const pairs = [
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '[', close: ']' }
    ];

    pairs.forEach(({ open, close }) => {
      const openCount = (code.match(new RegExp('\\' + open, 'g')) || []).length;
      const closeCount = (code.match(new RegExp('\\' + close, 'g')) || []).length;
      
      if (openCount !== closeCount) {
        issues.push(`Déséquilibre ${open}${close}: ${openCount} ouvertures, ${closeCount} fermetures`);
      }
    });

    return issues;
  }

  checkCodeTermination(code, language) {
    const issues = [];
    
    if (language === 'javascript' || language === 'typescript') {
      // Vérifier les points-virgules manquants dans certaines situations
      const lines = code.split('\n');
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && 
            !trimmed.endsWith('}') && !trimmed.includes('//') && !trimmed.includes('if') &&
            !trimmed.includes('for') && !trimmed.includes('while')) {
          issues.push(`Ligne ${index + 1}: point-virgule manquant possible`);
        }
      });
    }

    return issues;
  }

  // === COMPATIBILITY METHODS ===

  async generateFromSchema(schema, language = 'javascript') {
    // Génération de code à partir d'un schéma JSON/TypeScript
    const prompt = `Génère du code ${language} basé sur ce schéma:
    
${JSON.stringify(schema, null, 2)}

Inclure:
- Types/Interfaces
- Fonctions de validation
- Converters si nécessaire`;

    return await this.generate(prompt, language, '', { quality: 'production' });
  }

  extractCodeBlocks(text) {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }

    return matches.length > 0 ? matches : [text];
  }
}

export default CodeGenerator;