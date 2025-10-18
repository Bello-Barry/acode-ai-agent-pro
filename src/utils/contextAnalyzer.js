class ContextAnalyzer {
  constructor() {
    this.languagePatterns = this.initLanguagePatterns();
    this.frameworkPatterns = this.initFrameworkPatterns();
    this.performanceMetrics = this.initPerformanceMetrics();
  }

  initLanguagePatterns() {
    return {
      javascript: {
        extensions: ['js', 'jsx', 'mjs', 'cjs'],
        keywords: ['function', 'const', 'let', 'var', 'class', 'import', 'export', 'async', 'await'],
        testFrameworks: ['jest', 'mocha', 'vitest', 'cypress'],
        buildTools: ['webpack', 'vite', 'rollup', 'parcel']
      },
      typescript: {
        extensions: ['ts', 'tsx', 'd.ts'],
        keywords: ['interface', 'type', 'enum', 'namespace', 'declare', 'implements'],
        testFrameworks: ['jest', 'mocha', 'vitest'],
        buildTools: ['tsc', 'webpack', 'vite']
      },
      python: {
        extensions: ['py', 'pyw', 'pyx'],
        keywords: ['def', 'class', 'import', 'from', 'lambda', 'async', 'await'],
        testFrameworks: ['pytest', 'unittest', 'nose'],
        buildTools: ['setuptools', 'poetry', 'pipenv']
      },
      html: {
        extensions: ['html', 'htm', 'xhtml'],
        keywords: ['<!DOCTYPE', '<html', '<head', '<body', '<div', '<script', '<style'],
        frameworks: ['vue', 'angular', 'react']
      },
      css: {
        extensions: ['css', 'scss', 'sass', 'less', 'styl'],
        keywords: ['@media', '@import', '@keyframes', '@mixin', '@include'],
        frameworks: ['bootstrap', 'tailwind', 'foundation']
      },
      php: {
        extensions: ['php', 'phtml', 'php3', 'php4', 'php5', 'php7'],
        keywords: ['<?php', 'function', 'class', 'namespace', 'use', 'echo', 'print'],
        frameworks: ['laravel', 'symfony', 'codeigniter', 'wordpress']
      },
      java: {
        extensions: ['java', 'jar', 'jsp'],
        keywords: ['public class', 'private', 'protected', 'extends', 'implements', 'interface'],
        frameworks: ['spring', 'hibernate', 'jakarta', 'javafx']
      },
      rust: {
        extensions: ['rs', 'rlib'],
        keywords: ['fn', 'struct', 'impl', 'trait', 'mod', 'use'],
        frameworks: ['actix', 'rocket', 'tokio']
      },
      go: {
        extensions: ['go'],
        keywords: ['func', 'package', 'import', 'struct', 'interface'],
        frameworks: ['gin', 'echo', 'fiber']
      },
      sql: {
        extensions: ['sql', 'mysql', 'pgsql'],
        keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'CREATE TABLE'],
        databases: ['mysql', 'postgresql', 'sqlite', 'oracle']
      },
      shell: {
        extensions: ['sh', 'bash', 'zsh', 'fish'],
        keywords: ['#!/bin/', 'echo', 'export', 'function', 'if', 'then']
      },
      yaml: {
        extensions: ['yml', 'yaml'],
        keywords: ['---', 'apiVersion', 'kind', 'metadata', 'spec']
      },
      json: {
        extensions: ['json'],
        keywords: ['{', '}', '"', ':', '[', ']']
      },
      markdown: {
        extensions: ['md', 'markdown'],
        keywords: ['# ', '## ', '```', '**', '*']
      }
    };
  }

  initFrameworkPatterns() {
    return {
      // React Ecosystem
      react: {
        keywords: ['React', 'useState', 'useEffect', 'createContext', 'useReducer'],
        files: ['package.json:react', 'jsx', 'tsx'],
        testing: ['@testing-library/react', 'enzyme']
      },
      nextjs: {
        keywords: [
          'use client', 'use server', 'next/head', 'next/image', 'next/link',
          'getServerSideProps', 'getStaticProps', 'getInitialProps',
          'NextResponse', 'NextRequest', 'generateMetadata', 'generateStaticParams'
        ],
        files: ['next.config.js', 'app/', 'pages/', 'middleware.ts'],
        versions: {
          '13+': ['app/router', 'use server'],
          '12-': ['pages/router', 'getInitialProps']
        }
      },
      vue: {
        keywords: ['Vue', 'createApp', 'ref', 'reactive', 'computed', 'watch'],
        files: ['vue.config.js', '.vue'],
        versions: {
          '3': ['createApp', 'setup'],
          '2': ['new Vue', 'Vue.component']
        }
      },
      angular: {
        keywords: ['@Component', '@Injectable', '@NgModule', '@Input', '@Output'],
        files: ['angular.json', '.component.ts', '.service.ts'],
        versions: {
          '2+': ['@Component', 'rxjs'],
          '1': ['$scope', 'controller']
        }
      },
      // CSS Frameworks
      tailwind: {
        keywords: ['className="', 'class="', 'bg-', 'text-', 'flex ', 'grid '],
        files: ['tailwind.config.js', 'tailwind.config.ts'],
        plugins: ['@tailwind', '@apply']
      },
      bootstrap: {
        keywords: ['container', 'row', 'col-', 'btn-', 'navbar'],
        files: ['bootstrap.css', 'bootstrap.js']
      },
      // Backend Frameworks
      express: {
        keywords: ['express()', 'app.get', 'app.post', 'app.use', 'res.send'],
        files: ['app.js', 'server.js', 'index.js']
      },
      django: {
        keywords: ['from django', 'models.Model', 'class Meta', 'def get_queryset'],
        files: ['manage.py', 'settings.py', 'urls.py', 'views.py']
      },
      flask: {
        keywords: ['Flask', '@app.route', 'render_template', 'request.json'],
        files: ['app.py', 'application.py']
      },
      laravel: {
        keywords: ['Route::', 'Eloquent', 'Model', 'Controller', 'Blade'],
        files: ['artisan', 'web.php', 'api.php', '.blade.php']
      },
      // Mobile
      reactnative: {
        keywords: ['View', 'Text', 'StyleSheet', 'Platform.OS'],
        files: ['App.js', 'index.js', 'metro.config.js']
      },
      flutter: {
        keywords: ['Widget', 'StatefulWidget', 'setState', 'MaterialApp'],
        files: ['pubspec.yaml', 'main.dart', '.dart']
      }
    };
  }

  initPerformanceMetrics() {
    return {
      javascript: {
        antiPatterns: [
          { pattern: /console\.log\([^)]+\)/g, message: 'Console.log en production' },
          { pattern: /eval\(/g, message: 'Usage de eval() dangereux' },
          { pattern: /document\.innerHTML\s*=/g, message: 'innerHTML non sécurisé' }
        ],
        optimizations: [
          { pattern: /const\s+\w+\s*=\s*\(\)\s*=>/g, suggestion: 'Utiliser useCallback pour les fonctions' },
          { pattern: /Array\(\d+\)\.fill/g, suggestion: 'Préférer new Array(n).fill()' }
        ]
      },
      python: {
        antiPatterns: [
          { pattern: /except:\s*pass/g, message: 'Except pass silencieux' },
          { pattern: /pd\.read_csv\([^)]+\)/g, message: 'Charger tout le CSV en mémoire' }
        ],
        optimizations: [
          { pattern: /for\s+\w+\s+in\s+range\(len\(/g, suggestion: 'Utiliser enumerate()' },
          { pattern: /\[\w+\s+for\s+\w+\s+in/g, suggestion: 'Compréhension de liste optimisée' }
        ]
      },
      css: {
        antiPatterns: [
          { pattern: /!important/g, message: 'Trop de !important' },
          { pattern: /\*\{[^}]+\}/g, message: 'Sélecteur universel impactant les performances' }
        ],
        optimizations: [
          { pattern: /\.\w+-\w+-\w+-\w+-\w+/g, suggestion: 'Classes CSS trop spécifiques' }
        ]
      }
    };
  }

  analyzeFile(file, content = null) {
    if (!file || !file.name) {
      return this.getDefaultContext();
    }

    const fileContent = content || (file.session && file.session.getValue ? file.session.getValue() : '');
    
    const context = {
      fileName: file.name,
      filePath: file.path || file.name,
      language: this.detectLanguage(file),
      framework: null,
      frameworkVersion: null,
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      variables: [],
      dependencies: [],
      performance: {
        issues: [],
        suggestions: [],
        score: 100
      },
      structure: {
        lines: fileContent.split('\n').length,
        size: new Blob([fileContent]).size,
        complexity: this.analyzeCodeComplexity(fileContent, this.detectLanguage(file))
      },
      metadata: {
        hasTests: false,
        hasDocs: false,
        hasConfig: false,
        lastModified: file.lastModified || Date.now()
      }
    };

    context.framework = this.detectFramework(fileContent, context.language);
    context.imports = this.extractImports(fileContent, context.language);
    context.exports = this.extractExports(fileContent, context.language);
    context.functions = this.extractFunctions(fileContent, context.language);
    context.classes = this.extractClasses(fileContent, context.language);
    context.variables = this.extractVariables(fileContent, context.language);
    context.dependencies = this.extractDependencies(fileContent, context.language);
    
    // Analyse des performances
    context.performance = this.analyzePerformance(fileContent, context.language);
    
    // Métadonnées
    context.metadata = this.extractMetadata(context, fileContent);

    return context;
  }

  detectLanguage(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const name = file.name.toLowerCase();

    // Détection par extension
    for (const [language, config] of Object.entries(this.languagePatterns)) {
      if (config.extensions && config.extensions.includes(ext)) {
        return language;
      }
    }

    // Détection par nom de fichier
    const filePatterns = {
      'dockerfile': 'shell',
      'makefile': 'shell',
      'package.json': 'json',
      'tsconfig.json': 'json',
      'webpack.config': 'javascript',
      'tailwind.config': 'javascript',
      'requirements.txt': 'python',
      'composer.json': 'json'
    };

    for (const [pattern, lang] of Object.entries(filePatterns)) {
      if (name.includes(pattern)) {
        return lang;
      }
    }

    return 'text';
  }

  detectFramework(code, language) {
    const patterns = this.frameworkPatterns;
    
    for (const [framework, config] of Object.entries(patterns)) {
      // Vérifier les keywords
      if (config.keywords) {
        for (const keyword of config.keywords) {
          if (code.includes(keyword)) {
            // Vérifier la version si disponible
            if (config.versions) {
              for (const [version, versionKeywords] of Object.entries(config.versions)) {
                for (const vKeyword of versionKeywords) {
                  if (code.includes(vKeyword)) {
                    return `${framework}${version}`;
                  }
                }
              }
            }
            return framework;
          }
        }
      }
    }

    return null;
  }

  extractImports(code, language) {
    const imports = [];

    try {
      const importPatterns = {
        javascript: [
          /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+))\s+from\s+['"]([^'"]+)['"]/g,
          /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
          /from\s+['"]([^'"]+)['"]/g
        ],
        typescript: [
          /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+))\s+from\s+['"]([^'"]+)['"]/g,
          /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
          /import\s+['"]([^'"]+)['"]/g
        ],
        python: [
          /^import\s+([\w., ]+)/gm,
          /^from\s+([\w.]+)\s+import/gm
        ],
        php: [
          /^use\s+([\w\\]+)/gm,
          /(?:require|include)(?:_once)?\s*\(?['"]([^'"]+)['"]\)?/g
        ],
        java: [
          /^import\s+([\w.]+);/gm,
          /^import\s+static\s+([\w.]+);/gm
        ],
        rust: [
          /^use\s+([\w:{}, ]+);/gm,
          /^extern\s+crate\s+(\w+);/gm
        ],
        go: [
          /^import\s+\(([^)]+)\)/gms,
          /^import\s+"([^"]+)"/gm
        ]
      };

      const patterns = importPatterns[language] || [];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          if (match[1]) {
            imports.push(match[1].trim());
          }
        }
      }

    } catch (error) {
      console.error('Erreur extraction imports:', error);
    }

    return [...new Set(imports)].filter(Boolean);
  }

  extractExports(code, language) {
    const exports = [];

    try {
      const exportPatterns = {
        javascript: [
          /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
          /export\s+\{\s*([^}]+)\s*\}/g,
          /module\.exports\s*=\s*(\w+)/g
        ],
        typescript: [
          /export\s+(?:default\s+)?(?:interface|type|enum|class|function)\s+(\w+)/g,
          /export\s+\{\s*([^}]+)\s*\}/g
        ],
        python: [
          /__all__\s*=\s*\[([^\]]+)\]/g
        ],
        php: [
          /class\s+(\w+)\s*\{/g
        ]
      };

      const patterns = exportPatterns[language] || [];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          if (match[1]) {
            exports.push(...match[1].split(',').map(e => e.trim()).filter(Boolean));
          } else if (match[0]) {
            exports.push(match[0]);
          }
        }
      }

    } catch (error) {
      console.error('Erreur extraction exports:', error);
    }

    return [...new Set(exports)].filter(Boolean);
  }

  extractFunctions(code, language) {
    const functions = [];

    try {
      const functionPatterns = {
        javascript: [
          /function\s+(\w+)\s*\([^)]*\)/g,
          /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
          /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(/g,
          /async\s+function\s+(\w+)\s*\(/g
        ],
        typescript: [
          /function\s+(\w+)\s*\([^)]*\)/g,
          /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*:\s*\w+\s*=>/g,
          /(?:const|let|var)\s+(\w+)\s*:\s*\([^)]*\)\s*=>/g
        ],
        python: [
          /def\s+(\w+)\s*\([^)]*\):/g,
          /async\s+def\s+(\w+)\s*\([^)]*\):/g,
          /lambda\s+(\w+)\s*:/g
        ],
        php: [
          /function\s+(\w+)\s*\([^)]*\)/g
        ],
        java: [
          /(?:public|private|protected)\s+(?:static\s+)?(?:\w+\s+)+(\w+)\s*\([^)]*\)/g
        ],
        rust: [
          /fn\s+(\w+)\s*\([^)]*\)/g
        ],
        go: [
          /func\s+(\w+)\s*\([^)]*\)/g
        ]
      };

      const patterns = functionPatterns[language] || [];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          if (match[1] && !['if', 'for', 'while'].includes(match[1])) {
            functions.push(match[1]);
          }
        }
      }

    } catch (error) {
      console.error('Erreur extraction fonctions:', error);
    }

    return [...new Set(functions)];
  }

  extractClasses(code, language) {
    const classes = [];

    try {
      const classPatterns = {
        javascript: [/class\s+(\w+)/g],
        typescript: [/class\s+(\w+)/g, /interface\s+(\w+)/g, /type\s+(\w+)/g],
        python: [/class\s+(\w+)/g],
        php: [/class\s+(\w+)/g],
        java: [/(?:public|private|protected)?\s*class\s+(\w+)/g, /interface\s+(\w+)/g],
        rust: [/struct\s+(\w+)/g, /enum\s+(\w+)/g, /trait\s+(\w+)/g],
        go: [/type\s+(\w+)\s+struct/g]
      };

      const patterns = classPatterns[language] || [];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          classes.push(match[1]);
        }
      }

    } catch (error) {
      console.error('Erreur extraction classes:', error);
    }

    return [...new Set(classes)];
  }

  extractVariables(code, language) {
    const variables = [];

    try {
      const variablePatterns = {
        javascript: [
          /(?:const|let|var)\s+(\w+)\s*=/g,
          /(\w+)\s*=\s*(?:function|\()/g
        ],
        typescript: [
          /(?:const|let|var)\s+(\w+)\s*:\s*\w+\s*=/g,
          /(?:const|let|var)\s+(\w+)\s*=/g
        ],
        python: [
          /^(\w+)\s*=/gm,
          /,\s*(\w+)\s*=/g
        ],
        php: [
          /\$(\w+)\s*=/g
        ],
        java: [
          /(?:String|int|double|boolean|Object)\s+(\w+)\s*=/g
        ]
      };

      const patterns = variablePatterns[language] || [];
      const reservedKeywords = ['if', 'for', 'while', 'def', 'class', 'function'];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          if (match[1] && !reservedKeywords.includes(match[1])) {
            variables.push(match[1]);
          }
        }
      }

    } catch (error) {
      console.error('Erreur extraction variables:', error);
    }

    return [...new Set(variables)].slice(0, 25);
  }

  extractDependencies(code, language) {
    const dependencies = [];

    try {
      // Détection des dépendances dans les imports
      const imports = this.extractImports(code, language);
      
      imports.forEach(imp => {
        // Extraire le nom du package (première partie)
        const packageName = imp.split('/')[0].replace(/['"`]/g, '');
        if (packageName && !packageName.startsWith('.')) {
          dependencies.push(packageName);
        }
      });

      // Détection spécifique selon le langage
      if (language === 'python') {
        const fromImports = code.match(/from\s+([\w.]+)\s+import/g) || [];
        fromImports.forEach(imp => {
          const packageName = imp.replace('from ', '').replace(' import', '');
          if (packageName && !packageName.startsWith('.')) {
            dependencies.push(packageName);
          }
        });
      }

    } catch (error) {
      console.error('Erreur extraction dépendances:', error);
    }

    return [...new Set(dependencies)];
  }

  analyzePerformance(code, language) {
    const issues = [];
    const suggestions = [];
    let score = 100;

    const metrics = this.performanceMetrics[language];
    if (!metrics) {
      return { issues, suggestions, score };
    }

    // Vérifier les anti-patterns
    if (metrics.antiPatterns) {
      metrics.antiPatterns.forEach(({ pattern, message }) => {
        const matches = code.match(pattern);
        if (matches) {
          issues.push({
            message,
            count: matches.length,
            severity: 'high'
          });
          score -= matches.length * 2;
        }
      });
    }

    // Vérifier les optimisations
    if (metrics.optimizations) {
      metrics.optimizations.forEach(({ pattern, suggestion }) => {
        const matches = code.match(pattern);
        if (matches) {
          suggestions.push({
            suggestion,
            count: matches.length
          });
        }
      });
    }

    // Analyses spécifiques au langage
    switch (language) {
      case 'javascript':
      case 'typescript':
        // Vérifier les boucles potentiellement coûteuses
        const expensiveLoops = code.match(/for\s*\(\s*(?:let|const|var)\s+\w+\s+in\s+/g);
        if (expensiveLoops) {
          issues.push({
            message: 'Boucles for...in potentiellement lentes',
            count: expensiveLoops.length,
            severity: 'medium'
          });
          score -= expensiveLoops.length;
        }
        break;
      
      case 'python':
        // Vérifier les compréhensions de liste vs boucles
        const listComprehensions = code.match(/\[\s*\w+\s+for\s+\w+\s+in/g) || [];
        const traditionalLoops = code.match(/for\s+\w+\s+in\s+range\(/g) || [];
        if (traditionalLoops.length > listComprehensions.length * 2) {
          suggestions.push({
            suggestion: 'Utiliser plus de compréhensions de liste pour la performance',
            count: traditionalLoops.length
          });
        }
        break;
    }

    return {
      issues: issues.slice(0, 10),
      suggestions: suggestions.slice(0, 10),
      score: Math.max(0, score)
    };
  }

  extractMetadata(context, code) {
    const metadata = {
      hasTests: false,
      hasDocs: false,
      hasConfig: false,
      hasTypes: false,
      lines: code.split('\n').length,
      size: new Blob([code]).size
    };

    // Détection des tests
    const testPatterns = [
      /test\(/g, /it\(/g, /describe\(/g,
      /def test_/g, /class Test/g,
      /@Test/g, /@org.junit.Test/g
    ];

    metadata.hasTests = testPatterns.some(pattern => pattern.test(code));

    // Détection de la documentation
    const docPatterns = [
      /\/\*\*[\s\S]*?\*\//g, // JSDoc
      /""".*?"""/gs, // Docstring Python
      /#\s*@/g // Annotations
    ];

    metadata.hasDocs = docPatterns.some(pattern => pattern.test(code));

    // Détection des types
    metadata.hasTypes = /:\s*\w+[=>]/.test(code) || /interface|type|enum/.test(code);

    // Détection des fichiers de configuration
    const configFiles = [
      'package.json', 'webpack.config', 'tailwind.config',
      'tsconfig.json', '.eslintrc', '.prettierrc'
    ];

    metadata.hasConfig = configFiles.some(file => context.fileName.includes(file));

    return metadata;
  }

  analyzeCodeComplexity(code, language) {
    const complexity = {
      lines: code.split('\n').length,
      characters: code.length,
      functions: this.extractFunctions(code, language).length,
      classes: this.extractClasses(code, language).length,
      imports: this.extractImports(code, language).length,
      cyclomatic: this.calculateCyclomaticComplexity(code, language),
      halstead: this.calculateHalsteadMetrics(code, language)
    };

    return complexity;
  }

  calculateCyclomaticComplexity(code, language) {
    let complexity = 1;

    const conditionalPatterns = {
      javascript: ['if', 'else if', 'case', '&&', '\\|\\|', '\\?', 'while', 'for', 'catch'],
      typescript: ['if', 'else if', 'case', '&&', '\\|\\|', '\\?', 'while', 'for', 'catch'],
      python: ['if', 'elif', 'while', 'for', 'and', 'or', 'except'],
      java: ['if', 'else if', 'case', '&&', '\\|\\|', '\\?', 'while', 'for', 'catch'],
      php: ['if', 'elseif', 'case', '&&', '\\|\\|', '\\?', 'while', 'for', 'catch'],
      csharp: ['if', 'else if', 'case', '&&', '\\|\\|', '\\?', 'while', 'for', 'catch'],
      rust: ['if', 'else if', 'match', '&&', '\\|\\|', 'while', 'for', 'loop']
    };

    const patterns = conditionalPatterns[language] || conditionalPatterns.javascript;

    patterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  calculateHalsteadMetrics(code, language) {
    // Implémentation simplifiée des métriques de Halstead
    const operators = code.match(/[=+\-*/%&|^~!<>?:]+/g) || [];
    const operands = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];

    const uniqueOperators = [...new Set(operators)];
    const uniqueOperands = [...new Set(operands)];

    return {
      distinctOperators: uniqueOperators.length,
      distinctOperands: uniqueOperands.length,
      totalOperators: operators.length,
      totalOperands: operands.length,
      vocabulary: uniqueOperators.length + uniqueOperands.length,
      length: operators.length + operands.length,
      volume: Math.round((operators.length + operands.length) * Math.log2(uniqueOperators.length + uniqueOperands.length))
    };
  }

  getCodeContext(cursorPosition, code) {
    const lines = code.split('\n');
    const currentLine = cursorPosition.row || cursorPosition.line || 0;
    
    const startLine = Math.max(0, currentLine - 8);
    const endLine = Math.min(lines.length, currentLine + 8);
    
    const contextLines = lines.slice(startLine, endLine);
    const beforeCursor = lines.slice(0, currentLine + 1).join('\n');
    const afterCursor = lines.slice(currentLine).join('\n');
    
    return {
      full: contextLines.join('\n'),
      before: beforeCursor,
      after: afterCursor,
      currentLine: lines[currentLine] || '',
      lineNumber: currentLine,
      totalLines: lines.length,
      contextStart: startLine,
      contextEnd: endLine
    };
  }

  getContextSummary(context) {
    const parts = [];

    if (context.language) {
      parts.push(`Langage: ${context.language}`);
    }

    if (context.framework) {
      parts.push(`Framework: ${context.framework}`);
    }

    if (context.imports.length > 0) {
      parts.push(`Imports: ${context.imports.slice(0, 3).join(', ')}${context.imports.length > 3 ? '...' : ''}`);
    }

    if (context.functions.length > 0) {
      parts.push(`Fonctions: ${context.functions.slice(0, 3).join(', ')}${context.functions.length > 3 ? '...' : ''}`);
    }

    if (context.performance.score < 80) {
      parts.push(`⚠️ Performance: ${context.performance.score}/100`);
    }

    return parts.join(' | ');
  }

  getDetailedReport(context) {
    return {
      summary: this.getContextSummary(context),
      fileInfo: {
        name: context.fileName,
        language: context.language,
        framework: context.framework,
        size: context.structure.size,
        lines: context.structure.lines
      },
      codeStructure: {
        functions: context.functions,
        classes: context.classes,
        variables: context.variables.slice(0, 10),
        imports: context.imports,
        exports: context.exports
      },
      complexity: context.structure.complexity,
      performance: context.performance,
      metadata: context.metadata,
      suggestions: this.generateSuggestions(context)
    };
  }

  generateSuggestions(context) {
    const suggestions = [];

    // Suggestions basées sur le langage
    switch (context.language) {
      case 'javascript':
      case 'typescript':
        if (context.performance.score < 70) {
          suggestions.push('Optimiser les performances: éviter les boucles coûteuses, utiliser des memoization');
        }
        if (!context.metadata.hasTests) {
          suggestions.push('Ajouter des tests unitaires avec Jest ou Vitest');
        }
        if (context.framework === 'nextjs' && !context.imports.includes('next/image')) {
          suggestions.push('Utiliser next/image pour optimiser les images');
        }
        break;
      
      case 'python':
        if (context.performance.score < 70) {
          suggestions.push('Utiliser des compréhensions de liste et éviter les boucles for traditionnelles');
        }
        if (!context.metadata.hasDocs) {
          suggestions.push('Ajouter des docstrings pour la documentation');
        }
        break;
      
      case 'html':
        if (!context.imports.some(imp => imp.includes('tailwind') || imp.includes('bootstrap'))) {
          suggestions.push('Envisager un framework CSS comme Tailwind ou Bootstrap');
        }
        break;
    }

    // Suggestions générales
    if (context.structure.complexity.cyclomatic > 10) {
      suggestions.push('Réduire la complexité cyclomatique en divisant les fonctions');
    }

    if (context.structure.lines > 500) {
      suggestions.push('Considérer la division du fichier en modules plus petits');
    }

    return suggestions.slice(0, 5);
  }

  getDefaultContext() {
    return {
      fileName: 'untitled',
      filePath: 'untitled',
      language: 'text',
      framework: null,
      frameworkVersion: null,
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      variables: [],
      dependencies: [],
      performance: {
        issues: [],
        suggestions: [],
        score: 100
      },
      structure: {
        lines: 0,
        size: 0,
        complexity: {}
      },
      metadata: {
        hasTests: false,
        hasDocs: false,
        hasConfig: false,
        hasTypes: false,
        lastModified: Date.now()
      }
    };
  }

  // Méthode pour analyser un projet entier
  analyzeProject(files) {
    const projectAnalysis = {
      languages: {},
      frameworks: {},
      dependencies: new Set(),
      performance: {
        totalScore: 0,
        filesAnalyzed: 0
      },
      structure: {
        totalFiles: files.length,
        totalLines: 0,
        totalSize: 0
      },
      recommendations: []
    };

    files.forEach(file => {
      const analysis = this.analyzeFile(file);
      
      // Compter les langages
      projectAnalysis.languages[analysis.language] = (projectAnalysis.languages[analysis.language] || 0) + 1;
      
      // Compter les frameworks
      if (analysis.framework) {
        projectAnalysis.frameworks[analysis.framework] = (projectAnalysis.frameworks[analysis.framework] || 0) + 1;
      }
      
      // Collecter les dépendances
      analysis.dependencies.forEach(dep => projectAnalysis.dependencies.add(dep));
      
      // Métriques de performance
      projectAnalysis.performance.totalScore += analysis.performance.score;
      projectAnalysis.performance.filesAnalyzed++;
      
      // Structure
      projectAnalysis.structure.totalLines += analysis.structure.lines;
      projectAnalysis.structure.totalSize += analysis.structure.size;
    });

    // Calculer le score moyen
    if (projectAnalysis.performance.filesAnalyzed > 0) {
      projectAnalysis.performance.averageScore = 
        Math.round(projectAnalysis.performance.totalScore / projectAnalysis.performance.filesAnalyzed);
    }

    // Générer des recommandations pour le projet
    projectAnalysis.recommendations = this.generateProjectRecommendations(projectAnalysis);

    return projectAnalysis;
  }

  generateProjectRecommendations(projectAnalysis) {
    const recommendations = [];

    // Recommandations basées sur les langages détectés
    if (projectAnalysis.languages.javascript || projectAnalysis.languages.typescript) {
      if (!projectAnalysis.frameworks.nextjs && !projectAnalysis.frameworks.react) {
        recommendations.push('Envisager Next.js pour une application React fullstack');
      }
      
      if (projectAnalysis.performance.averageScore < 80) {
        recommendations.push('Auditer les performances avec Lighthouse ou WebPageTest');
      }
    }

    if (projectAnalysis.languages.python) {
      recommendations.push('Utiliser type hints pour améliorer la maintenabilité');
    }

    // Recommandations générales
    if (Object.keys(projectAnalysis.languages).length > 3) {
      recommendations.push('Consolider les technologies pour réduire la complexité');
    }

    if (projectAnalysis.structure.totalFiles > 50) {
      recommendations.push('Mettre en place une architecture modulaire et des conventions de code');
    }

    return recommendations;
  }
}

// Export pour différents environnements
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextAnalyzer;
} else if (typeof window !== 'undefined') {
  window.ContextAnalyzer = ContextAnalyzer;
}

export default ContextAnalyzer;