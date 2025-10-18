const fs = acode.require('fs');

class ProjectCreator {
  constructor(aiOrchestrator, contextAnalyzer = null) {
    this.ai = aiOrchestrator;
    this.contextAnalyzer = contextAnalyzer;
    
    // Configuration avancée
    this.config = {
      enableAIGeneration: true,
      enableBestPractices: true,
      enableTypeScript: true,
      enableTesting: true,
      enableDocumentation: true,
      defaultStack: 'nextjs' // nextjs, react, vue, etc.
    };

    // Templates étendus avec Next.js 15
    this.templates = this.initAdvancedTemplates();
    this.projectStacks = this.initProjectStacks();
    
    // Cache et métriques
    this.creationHistory = [];
    this.metrics = {
      projectsCreated: 0,
      templatesUsed: {},
      errors: 0
    };
  }

  initAdvancedTemplates() {
    return {
      // NEXT.JS 15 - Stack complète moderne
      'nextjs-15': {
        name: 'Next.js 15 App (Full Stack)',
        description: 'Application Next.js 15 complète avec App Router, TypeScript, TailwindCSS, et Supabase',
        category: 'fullstack',
        stack: ['nextjs', 'typescript', 'tailwind', 'supabase', 'prisma'],
        structure: {
          'package.json': true,
          'next.config.js': true,
          'tailwind.config.js': true,
          'tsconfig.json': true,
          '.env.local': true,
          '.gitignore': true,
          'README.md': true,
          
          'app': {
            'layout.tsx': true,
            'page.tsx': true,
            'loading.tsx': true,
            'error.tsx': true,
            'globals.css': true,
            'api': {
              'auth': {
                '[...nextauth]': {
                  'route.ts': true
                }
              },
              'users': {
                'route.ts': true
              }
            },
            'dashboard': {
              'page.tsx': true,
              'layout.tsx': true
            }
          },
          
          'components': {
            'ui': {
              'button.tsx': true,
              'input.tsx': true,
              'card.tsx': true
            },
            'forms': {
              'login-form.tsx': true,
              'register-form.tsx': true
            },
            'layout': {
              'header.tsx': true,
              'footer.tsx': true,
              'sidebar.tsx': true
            }
          },
          
          'lib': {
            'utils.ts': true,
            'auth.ts': true,
            'db.ts': true,
            'validations.ts': true
          },
          
          'hooks': {
            'use-auth.ts': true,
            'use-theme.ts': true
          },
          
          'store': {
            'auth-store.ts': true,
            'ui-store.ts': true
          },
          
          'types': {
            'index.ts': true,
            'auth.ts': true,
            'api.ts': true
          },
          
          'prisma': {
            'schema.prisma': true
          },
          
          'public': {
            'favicon.ico': true,
            'images': {}
          },
          
          'tests': {
            '__tests__': {
              'components': {
                'ui.test.tsx': true
              },
              'utils.test.ts': true
            },
            'jest.config.js': true
          }
        }
      },

      // REACT + VITE - Stack moderne
      'react-vite': {
        name: 'React + Vite (Modern)',
        description: 'Application React moderne avec Vite, TypeScript et TailwindCSS',
        category: 'frontend',
        stack: ['react', 'typescript', 'vite', 'tailwind'],
        structure: {
          'package.json': true,
          'vite.config.ts': true,
          'tsconfig.json': true,
          'index.html': true,
          '.gitignore': true,
          'README.md': true,
          
          'src': {
            'main.tsx': true,
            'App.tsx': true,
            'vite-env.d.ts': true,
            'index.css': true,
            
            'components': {
              'ui': {
                'Button.tsx': true,
                'Input.tsx': true
              },
              'layout': {
                'Header.tsx': true
              }
            },
            
            'pages': {
              'Home.tsx': true,
              'About.tsx': true
            },
            
            'hooks': {
              'useLocalStorage.ts': true
            },
            
            'utils': {
              'helpers.ts': true
            },
            
            'types': {
              'index.ts': true
            }
          },
          
          'public': {
            'vite.svg': true
          }
        }
      },

      // NODE.JS + EXPRESS API - Backend moderne
      'node-express': {
        name: 'Node.js + Express API',
        description: 'API REST moderne avec Express, TypeScript, Prisma et JWT',
        category: 'backend',
        stack: ['nodejs', 'express', 'typescript', 'prisma', 'jwt'],
        structure: {
          'package.json': true,
          'tsconfig.json': true,
          '.env': true,
          '.gitignore': true,
          'README.md': true,
          
          'src': {
            'server.ts': true,
            
            'controllers': {
              'authController.ts': true,
              'userController.ts': true
            },
            
            'routes': {
              'auth.ts': true,
              'users.ts': true,
              'index.ts': true
            },
            
            'middleware': {
              'auth.ts': true,
              'validation.ts': true,
              'errorHandler.ts': true
            },
            
            'models': {
              'User.ts': true
            },
            
            'services': {
              'authService.ts': true,
              'userService.ts': true
            },
            
            'utils': {
              'database.ts': true,
              'jwt.ts': true,
              'validation.ts': true
            },
            
            'types': {
              'index.ts': true
            },
            
            'config': {
              'cors.ts': true
            }
          },
          
          'prisma': {
            'schema.prisma': true
          },
          
          'tests': {
            'auth.test.ts': true,
            'users.test.ts': true
          }
        }
      },

      // PYTHON FASTAPI - Backend moderne
      'python-fastapi': {
        name: 'Python FastAPI',
        description: 'API moderne avec FastAPI, Pydantic et SQLModel',
        category: 'backend',
        stack: ['python', 'fastapi', 'sqlmodel', 'pydantic'],
        structure: {
          'main.py': true,
          'requirements.txt': true,
          '.env': true,
          '.gitignore': true,
          'README.md': true,
          
          'app': {
            '__init__.py': true,
            'main.py': true,
            
            'api': {
              '__init__.py': true,
              'routes': {
                '__init__.py': true,
                'auth.py': true,
                'users.py': true
              }
            },
            
            'models': {
              '__init__.py': true,
              'user.py': true
            },
            
            'schemas': {
              '__init__.py': true,
              'auth.py': true,
              'user.py': true
            },
            
            'services': {
              '__init__.py': true,
              'auth.py': true,
              'user.py': true
            },
            
            'database': {
              '__init__.py': true,
              'session.py': true
            },
            
            'core': {
              '__init__.py': true,
              'config.py': true,
              'security.py': true
            }
          },
          
          'tests': {
            '__init__.py': true,
            'test_auth.py': true,
            'test_users.py': true
          }
        }
      },

      // MOBILE REACT NATIVE
      'react-native': {
        name: 'React Native App',
        description: 'Application mobile React Native avec TypeScript et Expo',
        category: 'mobile',
        stack: ['react-native', 'typescript', 'expo'],
        structure: {
          'package.json': true,
          'app.json': true,
          'tsconfig.json': true,
          '.gitignore': true,
          'README.md': true,
          
          'src': {
            'App.tsx': true,
            
            'components': {
              'Button.tsx': true,
              'TextInput.tsx': true
            },
            
            'screens': {
              'HomeScreen.tsx': true,
              'ProfileScreen.tsx': true
            },
            
            'navigation': {
              'AppNavigator.tsx': true
            },
            
            'hooks': {
              'useAuth.ts': true
            },
            
            'services': {
              'api.ts': true
            },
            
            'types': {
              'index.ts': true
            },
            
            'styles': {
              'theme.ts': true
            }
          },
          
          'assets': {
            'images': {},
            'icons': {}
          }
        }
      },

      // ACODE PLUGIN - Version avancée
      'acode-plugin-pro': {
        name: 'Acode Plugin (Pro)',
        description: 'Plugin Acode avancé avec architecture modulaire',
        category: 'plugin',
        stack: ['javascript', 'acode'],
        structure: {
          'plugin.json': true,
          'README.md': true,
          'CHANGELOG.md': true,
          '.gitignore': true,
          
          'src': {
            'main.js': true,
            
            'api': {
              'deepseek.js': true,
              'multi-ai.js': true
            },
            
            'features': {
              'code-generator.js': true,
              'code-corrector.js': true,
              'code-suggester.js': true,
              'project-creator.js': true
            },
            
            'ui': {
              'sidebar.js': true,
              'dialogs.js': true,
              'components.js': true
            },
            
            'utils': {
              'analytics.js': true,
              'helpers.js': true,
              'constants.js': true
            },
            
            'styles': {
              'main.css': true
            }
          },
          
          'assets': {
            'icons': {
              'icon.png': true,
              'icon-32.png': true,
              'icon-64.png': true
            },
            'screenshots': {}
          },
          
          'docs': {
            'installation.md': true,
            'usage.md': true,
            'api-reference.md': true
          },
          
          'tests': {
            'unit': {
              'api.test.js': true,
              'features.test.js': true
            },
            'integration': {
              'plugin.test.js': true
            }
          }
        }
      }
    };
  }

  initProjectStacks() {
    return {
      nextjs: {
        dependencies: {
          "next": "15.0.0",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "typescript": "^5.0.0",
          "@types/node": "^20.0.0",
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0",
          "tailwindcss": "^3.3.0",
          "autoprefixer": "^10.4.0",
          "postcss": "^8.4.0",
          "clsx": "^2.0.0",
          "lucide-react": "^0.294.0",
          "zod": "^3.22.0"
        },
        devDependencies: {
          "eslint": "^8.0.0",
          "eslint-config-next": "15.0.0"
        }
      },
      'react-vite': {
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "typescript": "^5.0.0",
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0"
        },
        devDependencies: {
          "vite": "^4.4.0",
          "@vitejs/plugin-react": "^4.0.0"
        }
      }
    };
  }

  // === CORE CREATION METHODS ===

  async create(projectType, projectName, rootPath, options = {}) {
    try {
      const template = this.templates[projectType];
      
      if (!template) {
        throw new Error(`Type de projet inconnu: ${projectType}. Types disponibles: ${Object.keys(this.templates).join(', ')}`);
      }

      // Créer le chemin du projet
      const projectPath = `${rootPath}/${projectName}`;
      
      // Vérifier l'existence
      const exists = await fs(projectPath).exists();
      if (exists && !options.overwrite) {
        throw new Error(`Le dossier "${projectName}" existe déjà. Utilisez l'option overwrite.`);
      }

      // Créer le dossier
      if (!exists) {
        await fs(rootPath).createDirectory(projectName);
      }

      // Génération intelligente avec AI si activé
      if (this.config.enableAIGeneration) {
        await this.createAIGeneratedStructure(projectPath, template, projectName, options);
      } else {
        await this.createStructure(projectPath, template.structure, projectType, projectName, options);
      }

      // Mettre à jour les métriques
      this.metrics.projectsCreated++;
      this.metrics.templatesUsed[projectType] = (this.metrics.templatesUsed[projectType] || 0) + 1;

      // Historique
      this.creationHistory.push({
        type: projectType,
        name: projectName,
        path: projectPath,
        timestamp: new Date().toISOString(),
        options
      });

      // Ouvrir le fichier principal
      await this.openMainFile(projectPath, projectType);

      return {
        success: true,
        path: projectPath,
        template: template.name,
        structure: this.getStructureSummary(template.structure)
      };

    } catch (error) {
      this.metrics.errors++;
      console.error('Erreur de création de projet:', error);
      throw this.enhanceCreationError(error, projectType, projectName);
    }
  }

  async createAIGeneratedStructure(basePath, template, projectName, options) {
    // Génération intelligente avec AI pour le contenu des fichiers
    for (const [path, content] of Object.entries(template.structure)) {
      const fullPath = `${basePath}/${path}`;

      if (content === true) {
        // Fichier - générer le contenu avec AI
        const fileContent = await this.generateAIFileContent(path, template, projectName, options);
        await this.createFile(fullPath, fileContent);
      } else if (typeof content === 'object') {
        // Dossier - créer récursivement
        await fs(basePath).createDirectory(path);
        await this.createAIGeneratedStructure(fullPath, { structure: content }, projectName, options);
      }
    }
  }

  async generateAIFileContent(fileName, template, projectName, options) {
    // Utiliser l'AI pour générer du contenu contextuel
    const prompt = this.buildFileGenerationPrompt(fileName, template, projectName, options);
    
    try {
      const response = await this.ai.chat([
        {
          role: 'system',
          content: `Tu es un expert en génération de code. Crée du contenu de fichier professionnel et fonctionnel.`
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        temperature: 0.3,
        maxTokens: 2000
      });

      return this.cleanGeneratedContent(response);
    } catch (error) {
      console.warn(`AI generation failed for ${fileName}, using template:`, error);
      return this.generateFileContent(fileName, template.stack[0], projectName);
    }
  }

  buildFileGenerationPrompt(fileName, template, projectName, options) {
    const stack = template.stack.join(', ');
    
    return `Génère le contenu du fichier ${fileName} pour le projet ${projectName}.

Stack technique: ${stack}
Type de projet: ${template.category}
Description: ${template.description}

Exigences:
- Code professionnel et fonctionnel
- Respect des best practices de la stack
- Documentation appropriée
- Prêt pour la production

Retourne uniquement le contenu du fichier sans explications.`;
  }

  // === NEXT.JS 15 SPECIFIC METHODS ===

  async createNextJSProject(projectName, rootPath, options = {}) {
    const nextOptions = {
      withAuth: options.withAuth !== false,
      withDatabase: options.withDatabase !== false,
      withTesting: options.withTesting !== false,
      withUI: options.withUI !== false,
      ...options
    };

    return await this.create('nextjs-15', projectName, rootPath, nextOptions);
  }

  generateNextJSFileContent(fileName, projectName, options = {}) {
    const templates = {
      'layout.tsx': this.getNextJSLayoutTemplate(projectName, options),
      'page.tsx': this.getNextJSPageTemplate(projectName, options),
      'loading.tsx': this.getNextJSLoadingTemplate(),
      'error.tsx': this.getNextJSErrorTemplate(),
      'globals.css': this.getNextJSCSSGlobalTemplate(),
      'button.tsx': this.getNextJSButtonTemplate(),
      'input.tsx': this.getNextJSInputTemplate(),
      'utils.ts': this.getNextJSUtilsTemplate(),
      'auth.ts': this.getNextJSAuthTemplate(),
      'db.ts': this.getNextJSDatabaseTemplate(),
      'package.json': this.getNextJSPackageJson(projectName, options)
    };

    return templates[fileName] || this.generateFileContent(fileName, 'nextjs', projectName);
  }

  getNextJSLayoutTemplate(projectName, options) {
    return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Application Next.js 15 moderne',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}`;
  }

  getNextJSPageTemplate(projectName, options) {
    return `import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bienvenue sur ${projectName}</CardTitle>
            <CardDescription>
              Votre application Next.js 15 est prête !
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Commencez à développer votre application moderne.
            </p>
            <Button className="w-full">
              Commencer
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}`;
  }

  getNextJSPackageJson(projectName, options) {
    const baseDependencies = this.projectStacks.nextjs.dependencies;
    const additionalDeps = {};
    
    if (options.withAuth) {
      Object.assign(additionalDeps, {
        "next-auth": "^4.24.0",
        "@auth/prisma-adapter": "^1.0.0"
      });
    }
    
    if (options.withDatabase) {
      Object.assign(additionalDeps, {
        "@prisma/client": "^5.0.0",
        "prisma": "^5.0.0"
      });
    }

    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      description: `Application Next.js 15 - ${projectName}`,
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        ...(options.withDatabase && { "db:push": "prisma db push" })
      },
      dependencies: {
        ...baseDependencies,
        ...additionalDeps
      },
      devDependencies: this.projectStacks.nextjs.devDependencies,
      keywords: ["nextjs", "react", "typescript", "tailwindcss"],
      author: "",
      license: "MIT"
    }, null, 2);
  }

  // === ADVANCED PROJECT MANAGEMENT ===

  async createFromBlueprint(blueprint, projectName, rootPath) {
    // Création à partir d'un blueprint personnalisé
    const customTemplate = {
      name: blueprint.name,
      description: blueprint.description,
      structure: blueprint.structure,
      stack: blueprint.stack || ['custom']
    };

    return await this.createCustomProject(customTemplate, projectName, rootPath);
  }

  async createCustomProject(template, projectName, rootPath) {
    const projectPath = `${rootPath}/${projectName}`;
    
    await fs(rootPath).createDirectory(projectName);
    await this.createStructure(projectPath, template.structure, 'custom', projectName);
    
    return {
      success: true,
      path: projectPath,
      template: template.name,
      custom: true
    };
  }

  async generateProjectDocumentation(projectPath, projectType, projectName) {
    const template = this.templates[projectType];
    const docs = {
      'README.md': this.generateAdvancedReadme(projectName, template),
      'ARCHITECTURE.md': this.generateArchitectureDoc(template),
      'DEPLOYMENT.md': this.generateDeploymentDoc(template),
      'DEVELOPMENT.md': this.generateDevelopmentGuide(template)
    };

    for (const [docName, content] of Object.entries(docs)) {
      await this.createFile(`${projectPath}/${docName}`, content);
    }
  }

  generateAdvancedReadme(projectName, template) {
    return `# ${projectName}

## 🚀 Description
${template.description}

## 📦 Stack Technique
${template.stack.map(tech => `- ${tech}`).join('\n')}

## 🏗️ Structure
\`\`\`
${this.generateTreeStructure(template.structure)}
\`\`\`

## ⚡ Démarrage Rapide

\`\`\`bash
# Installation
npm install

# Développement
npm run dev

# Production
npm run build
npm start
\`\`\`

## 📚 Scripts Disponibles
${this.generateScriptsList(template)}

## 🔧 Configuration
Les fichiers de configuration sont pré-configurés pour un démarrage rapide.

## 🛠️ Développement
- **ESLint** : Linting du code
- **TypeScript** : Typage statique
- **TailwindCSS** : Styling utilitaire

---
*Créé avec AI Agent Pro - ${new Date().getFullYear()}*
`;
  }

  // === UTILITY METHODS ===

  generateTreeStructure(structure, prefix = '') {
    let tree = '';
    const entries = Object.entries(structure);
    
    entries.forEach(([name, content], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      
      tree += `${prefix}${connector}${name}\n`;
      
      if (typeof content === 'object') {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        tree += this.generateTreeStructure(content, newPrefix);
      }
    });
    
    return tree;
  }

  generateScriptsList(template) {
    const commonScripts = {
      'dev': 'Démarre le serveur de développement',
      'build': 'Compile pour la production',
      'start': 'Démarre le serveur de production',
      'lint': 'Exécute le linter'
    };

    return Object.entries(commonScripts)
      .map(([script, description]) => `- \`npm run ${script}\` - ${description}`)
      .join('\n');
  }

  async createFile(filePath, content) {
    try {
      const fileName = filePath.split('/').pop();
      await editorManager.addNewFile(fileName, {
        text: content,
        uri: filePath,
        isUnsaved: false
      });
      await editorManager.activeFile.saveAs(filePath);
    } catch (error) {
      console.error(`Erreur création fichier ${filePath}:`, error);
      // Fallback: créer le fichier directement
      await fs(filePath).writeFile(content);
    }
  }

  cleanGeneratedContent(content) {
    return content
      .replace(/```[\w]*\n?/g, '')
      .replace(/```$/g, '')
      .replace(/^[\s]*`{3}[\s\S]*?`{3}$/gm, '')
      .trim();
  }

  enhanceCreationError(error, projectType, projectName) {
    if (error.message.includes('existe déjà')) {
      return new Error(`Le projet "${projectName}" existe déjà. Choisissez un autre nom ou utilisez l'option overwrite.`);
    }
    
    if (error.message.includes('permission')) {
      return new Error(`Permission refusée pour créer le projet dans ce dossier.`);
    }
    
    return new Error(`Échec de création du projet ${projectType}: ${error.message}`);
  }

  getStructureSummary(structure) {
    const count = { files: 0, folders: 0 };
    
    const countItems = (obj) => {
      Object.values(obj).forEach(value => {
        if (value === true) {
          count.files++;
        } else if (typeof value === 'object') {
          count.folders++;
          countItems(value);
        }
      });
    };
    
    countItems(structure);
    return count;
  }

  // === COMPATIBILITY METHODS ===

  async createStructure(basePath, structure, projectType, projectName, options = {}) {
    for (const [name, content] of Object.entries(structure)) {
      const fullPath = `${basePath}/${name}`;

      if (content === true) {
        const fileContent = this.generateFileContent(name, projectType, projectName, options);
        await this.createFile(fullPath, fileContent);
      } else if (typeof content === 'object') {
        await fs(basePath).createDirectory(name);
        await this.createStructure(fullPath, content, projectType, projectName, options);
      }
    }
  }

  generateFileContent(fileName, projectType, projectName, options = {}) {
    // Garder la compatibilité avec les anciennes méthodes
    const legacyTemplates = {
      'package.json': this.getPackageJsonTemplate(projectType, projectName, options),
      'README.md': this.getReadmeTemplate(projectName, projectType),
      // ... autres templates de compatibilité
    };

    return legacyTemplates[fileName] || `// ${fileName}\n// Generated by AI Agent Pro\n`;
  }

  // ... autres méthodes de compatibilité

  getMetrics() {
    return {
      ...this.metrics,
      totalFilesCreated: this.creationHistory.reduce((total, creation) => {
        const template = this.templates[creation.type];
        return total + this.countFilesInStructure(template.structure);
      }, 0)
    };
  }

  countFilesInStructure(structure) {
    let count = 0;
    Object.values(structure).forEach(value => {
      if (value === true) {
        count++;
      } else if (typeof value === 'object') {
        count += this.countFilesInStructure(value);
      }
    });
    return count;
  }

  async openMainFile(projectPath, projectType) {
    const mainFiles = {
      'nextjs-15': 'app/page.tsx',
      'react-vite': 'src/App.tsx',
      'node-express': 'src/server.ts',
      'python-fastapi': 'app/main.py',
      'react-native': 'src/App.tsx',
      'acode-plugin-pro': 'src/main.js'
    };

    const mainFile = mainFiles[projectType] || 'README.md';
    const filePath = `${projectPath}/${mainFile}`;

    try {
      await editorManager.addNewFile(mainFile.split('/').pop(), {
        uri: filePath,
        isUnsaved: false
      });
    } catch (error) {
      console.log('Impossible d\'ouvrir le fichier principal:', error);
    }
  }
}

export default ProjectCreator;