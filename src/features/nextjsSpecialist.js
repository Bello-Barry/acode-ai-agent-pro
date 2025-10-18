class NextJSSpecialist {
  constructor(deepseekAPI, contextAnalyzer = null) {
    this.api = deepseekAPI;
    this.contextAnalyzer = contextAnalyzer;
    
    // Stack technique étendue
    this.stackInfo = {
      framework: 'Next.js 15',
      styling: 'TailwindCSS',
      icons: 'lucide-react',
      notifications: 'react-toastify',
      validation: 'zod',
      forms: 'react-hook-form',
      ui: 'shadcn/ui',
      language: 'TypeScript',
      database: 'Supabase',
      stateManagement: 'Zustand',
      testing: 'Jest & Testing Library',
      deployment: 'Vercel'
    };

    // Templates et patterns réutilisables
    this.templates = this.initTemplates();
    this.bestPractices = this.initBestPractices();
  }

  initTemplates() {
    return {
      component: {
        client: `"use client";

import { FC } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export const ComponentName: FC<Props> = ({ className }) => {
  return (
    <div className={cn('', className)}>
      {/* Content */}
    </div>
  );
};`,
        server: `import { FC } from 'react';

interface Props {
  className?: string;
}

export const ComponentName: FC<Props> = async ({ className }) => {
  // Data fetching here
  return (
    <div className={className}>
      {/* Content */}
    </div>
  );
};`
      },
      page: `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};

export default async function PageName() {
  return (
    <main className="container mx-auto p-4">
      {/* Page content */}
    </main>
  );
}`,
      form: `"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'react-toastify';

const formSchema = z.object({
  // fields
});

type FormValues = z.infer<typeof formSchema>;

export function FormName() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Handle form submission
      toast.success('Success!');
    } catch (error) {
      toast.error('Error occurred');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
      </form>
    </Form>
  );
}`
    };
  }

  initBestPractices() {
    return {
      performance: [
        'Use Server Components by default',
        'Implement loading.tsx and error.tsx',
        'Use React.memo for expensive components',
        'Implement proper code splitting',
        'Optimize images with next/image',
        'Use caching strategies appropriately'
      ],
      security: [
        'Validate all inputs with Zod',
        'Implement proper authentication',
        'Use environment variables for secrets',
        'Sanitize user content',
        'Implement rate limiting',
        'Use CSRF protection'
      ],
      accessibility: [
        'Use semantic HTML',
        'Implement proper ARIA labels',
        'Ensure keyboard navigation',
        'Provide alt text for images',
        'Maintain proper color contrast',
        'Test with screen readers'
      ]
    };
  }

  getStackContext() {
    return `
STACK TECHNIQUE COMPLÈTE NEXT.JS 15:
- Framework: Next.js 15 (App Router avec React 18)
- Langage: TypeScript strict avec es2022
- Styling: TailwindCSS v3.4+ avec dark mode
- Icônes: lucide-react (icônes optimisées)
- Notifications: react-toastify avec positions multiples
- Validation: Zod avec schémas stricts
- Formulaires: react-hook-form v7+ avec resolvers Zod
- Composants UI: shadcn/ui (Radix UI + Tailwind)
- Base de données: Supabase (PostgreSQL + Auth + Storage)
- State Management: Zustand avec middleware persist
- Testing: Jest + Testing Library + MSW
- Déploiement: Vercel avec optimizations
- Analytics: Vercel Analytics + Speed Insights

ARCHITECTURE APP ROUTER:
- app/ directory structure
- Server Components par défaut
- Client Components avec "use client"
- Layouts hiérarchiques (root, nested)
- Templates pour animations
- Loading states avec Suspense
- Error boundaries automatiques
- Route handlers (API routes)
- Server Actions avec "use server"
- Metadata API pour SEO
- Streaming et Suspense

CONVENTIONS DE CODE:
- Types TypeScript stricts (noImplicitAny, strictNullChecks)
- Components: PascalCase dans app/ et components/
- Files: kebab-case pour les noms de fichiers
- Composants: fonctionnels avec FC<Props>
- Exports: exports nommés pour les composants
- Imports: alias @/ pour le chemin absolu
- Styles: TailwindCSS avec classes sémantiques
- State: Zustand pour global, useState pour local
- Data: Server Components pour fetching, SWR/TanStack Query pour client
- Forms: react-hook-form + Zod validation
- Errors: Error boundaries et try/catch
- Loading: Suspense avec fallback UI
`;
  }

  async generateComponent(componentName, description, options = {}) {
    const {
      type = 'client', // 'client' | 'server' | 'shared'
      withTests = false,
      withStory = false,
      complexity = 'simple' // 'simple' | 'medium' | 'complex'
    } = options;

    const systemPrompt = `Tu es un architecte Next.js 15 expert.

${this.getStackContext()}

RÈGLES DE GÉNÉRATION DE COMPOSANTS:
- ${type === 'server' ? 'Server Component async par défaut' : 'Client Component avec "use client"'}
- Interface TypeScript stricte pour les props
- Props étendues (className, children, etc.)
- TailwindCSS avec classes utilitaires
- Import depuis @/components/ui pour shadcn
- Gestion d'erreurs intégrée
- Accessibilité ARIA complète
- Responsive design mobile-first
- ${withTests ? 'Tests unitaires inclus' : 'Pas de tests'}
- Code production-ready immédiatement
- RETOURNE UNIQUEMENT LE CODE SANS EXPLICATIONS`;

    const complexitySpecs = {
      simple: 'Composant présentationnel simple',
      medium: 'Composant avec état interne et logique',
      complex: 'Composant avec hooks personnalisés, context, et logique métier'
    };

    const userPrompt = `CRÉER LE COMPOSANT: ${componentName}
Type: ${type} | Complexité: ${complexity}
${complexitySpecs[complexity]}

DESCRIPTION: ${description}

EXIGENCES SPÉCIFIQUES:
- Nom du fichier: ${componentName}.tsx
- Export nommé: export const ${componentName}
- Props typées avec interface
- ${type === 'client' ? 'Hook personnalisé si nécessaire' : 'Data fetching si nécessaire'}
- Styles TailwindCSS responsive
- ${withStory ? 'Storybook stories incluses' : 'Pas de stories'}
- Accessibilité complète (aria-*)
- Gestion des états de loading/error
- Documentation des props en commentaires`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const code = await this.api.chat(messages, { 
      temperature: 0.3,
      maxTokens: 4000 
    });

    let result = { code: this.cleanCode(code) };

    // Générer les tests si demandé
    if (withTests) {
      result.tests = await this.generateComponentTests(componentName, result.code);
    }

    // Générer les stories si demandé
    if (withStory) {
      result.story = await this.generateComponentStory(componentName, result.code);
    }

    return result;
  }

  async generatePage(pageName, description, options = {}) {
    const {
      withLayout = true,
      withMetadata = true,
      withLoading = true,
      withError = true,
      dataFetching = false
    } = options;

    const systemPrompt = `Tu es un expert Next.js 15 App Router.

${this.getStackContext()}

RÈGLES PAGES APP ROUTER:
- Page Server Component par défaut
- Export default pour le composant page
- ${withMetadata ? 'Metadata export pour SEO' : 'Pas de metadata'}
- ${withLayout ? 'Utilisation du layout racine' : 'Page standalone'}
- ${dataFetching ? 'Data fetching async/await' : 'Pas de data fetching'}
- ${withLoading ? 'Suspense intégré' : 'Pas de loading state'}
- ${withError ? 'Error boundaries' : 'Pas de error handling'}
- TailwindCSS pour le styling
- Structure sémantique HTML5
- RETOURNE UNIQUEMENT LE CODE`;

    const userPrompt = `CRÉER LA PAGE: ${pageName}
Emplacement: app/${pageName}/page.tsx

DESCRIPTION: ${description}

CARACTÉRISTIQUES:
- ${withMetadata ? 'Metadata complète (title, description, openGraph)' : 'Pas de metadata'}
- ${dataFetching ? 'Data fetching from Supabase/API' : 'Page statique'}
- ${withLoading ? 'Loading state avec Suspense' : 'Pas de loading'}
- ${withError ? 'Gestion erreurs avec error.tsx' : 'Pas de error handling'}
- Design responsive mobile-first
- Structure sémantique accessible
- Composants modulaires réutilisables
- Performance optimisée`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const code = await this.api.chat(messages, { 
      temperature: 0.4,
      maxTokens: 3000 
    });

    return this.cleanCode(code);
  }

  async generateForm(formName, fields, options = {}) {
    const {
      withValidation = true,
      withSubmitAction = true,
      withFileUpload = false,
      withMultiStep = false
    } = options;

    const systemPrompt = `Tu es un expert forms Next.js 15.

${this.getStackContext()}

RÈGLES FORMULAIRES AVANCÉES:
- "use client" OBLIGATOIRE
- react-hook-form v7+ avec TypeScript
- ${withValidation ? 'Validation Zod stricte' : 'Validation basique'}
- ${withSubmitAction ? 'Server Action ou API route' : 'Submit handler client'}
- Composants shadcn/ui (Form, Input, Button, etc.)
- États: loading, success, error
- Toast notifications avec react-toastify
- Accessibilité complète (labels, descriptions)
- ${withFileUpload ? 'Upload fichiers avec Supabase Storage' : 'Pas de upload'}
- ${withMultiStep ? 'Form multi-étapes avec état' : 'Form simple'}
- RETOURNE UNIQUEMENT LE CODE`;

    const userPrompt = `CRÉER FORMULAIRE: ${formName}

CHAMPS: ${fields}

FONCTIONNALITÉS AVANCÉES:
- ${withValidation ? 'Schema Zod complet avec messages custom' : 'Validation HTML5'}
- ${withSubmitAction ? 'Server Action avec revalidation' : 'Fetch vers API route'}
- États visuels (disabled pendant submit)
- Messages d'erreur contextuels
- Reset form après succès
- ${withFileUpload ? 'Upload images/fichiers' : 'Pas de upload'}
- ${withMultiStep ? 'Navigation entre étapes' : 'Form simple'}
- Design accessible et responsive
- Loading states avec désactivation`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const code = await this.api.chat(messages, { 
      temperature: 0.3,
      maxTokens: 5000 
    });

    return this.cleanCode(code);
  }

  async generateZustandStore(storeName, stateDescription, options = {}) {
    const {
      withPersist = true,
      withDevtools = true,
      withMiddleware = true,
      withSelectors = true
    } = options;

    const systemPrompt = `Tu es un expert Zustand avec TypeScript.

${this.getStackContext()}

RÈGLES STORES ZUSTAND:
- Store avec create() et type inference
- Interface TypeScript pour le state
- Actions typées avec set/get
- ${withPersist ? 'Persist middleware avec localStorage' : 'Pas de persist'}
- ${withDevtools ? 'DevTools en développement' : 'Pas de devtools'}
- ${withMiddleware ? 'Immer pour state complexe' : 'Pas de middleware'}
- ${withSelectors ? 'Selectors optimisés avec useShallow' : 'Pas de selectors'}
- Reset action pour réinitialiser
- Initial state clair
- RETOURNE UNIQUEMENT LE CODE`;

    const userPrompt = `CRÉER STORE: ${storeName}

DESCRIPTION DU STATE: ${stateDescription}

CARACTÉRISTIQUES:
- Interface TypeScript complète
- Actions CRUD typées
- ${withPersist ? 'Persistance automatique' : 'State volatile'}
- ${withDevtools ? 'Debug avec Redux DevTools' : 'Production seulement'}
- ${withMiddleware ? 'Mutations complexes avec Immer' : 'Mutations simples'}
- ${withSelectors ? 'Selectors pour performances' : 'Accès direct au state'}
- Gestion erreurs dans les actions
- Reset complet du state`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const code = await this.api.chat(messages, { 
      temperature: 0.4,
      maxTokens: 3000 
    });

    return this.cleanCode(code);
  }

  async generateSupabaseFeature(featureType, description, options = {}) {
    const {
      withAuth = false,
      withRLS = true,
      withTypes = true,
      withHooks = true
    } = options;

    const systemPrompt = `Tu es un expert Supabase avec Next.js 15.

${this.getStackContext()}

RÈGLES SUPABASE:
- Client approprié (server/client component)
- ${withAuth ? 'Intégration authentication' : 'Pas de auth'}
- ${withRLS ? 'Respect RLS policies' : 'Pas de RLS'}
- ${withTypes ? 'Types Database depuis Supabase' : 'Pas de types'}
- ${withHooks ? 'Custom hooks réutilisables' : 'Pas de hooks'}
- Gestion erreurs complète
- Retry logic si nécessaire
- Optimistic updates si approprié
- RETOURNE UNIQUEMENT LE CODE`;

    const featurePrompts = {
      auth: `SYSTÈME AUTHENTIFICATION COMPLET:
- Sign up/in/out avec Supabase Auth
- Protected routes avec middleware
- User profile management
- Session handling
- Password reset flow`,

      crud: `OPÉRATIONS CRUD COMPLÈTES:
- Create, Read, Update, Delete
- Real-time subscriptions
- Optimistic updates
- Error states
- Loading states`,

      storage: `SUPABASE STORAGE:
- Upload fichiers/images
- Gestion permissions
- URLs signed
- Progress indicators
- Error handling`,

      realtime: `REALTIME SUBSCRIPTIONS:
- Abonnements temps réel
- Gestion connexion/déconnexion
- Optimistic updates
- Conflict resolution`
    };

    const userPrompt = `CRÉER FONCTIONNALITÉ SUPABASE: ${featureType}

${featurePrompts[featureType] || description}

EXIGENCES:
- ${withAuth ? 'Intégration auth complète' : 'Sans auth'}
- ${withRLS ? 'Respect policies RLS' : 'Ignore RLS'}
- ${withTypes ? 'Types TypeScript stricts' : 'Types basiques'}
- ${withHooks ? 'Custom hooks React' : 'Fonctions directes'}
- Performance optimisée
- Gestion erreurs robuste`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const code = await this.api.chat(messages, { 
      temperature: 0.3,
      maxTokens: 4000 
    });

    return this.cleanCode(code);
  }

  async generateAPIRoute(routeName, description, options = {}) {
    const {
      method = 'GET', // GET, POST, PUT, DELETE, etc.
      withAuth = false,
      withValidation = true,
      withRateLimit = true,
      withCORS = true
    } = options;

    const systemPrompt = `Tu es un expert Next.js 15 API Routes.

${this.getStackContext()}

RÈGLES API ROUTES:
- Route handler dans app/api/
- Méthode HTTP: ${method}
- ${withAuth ? 'Authentication requise' : 'Public endpoint'}
- ${withValidation ? 'Validation Zod des inputs' : 'Pas de validation'}
- ${withRateLimit ? 'Rate limiting' : 'Pas de rate limit'}
- ${withCORS ? 'CORS headers' : 'Pas de CORS'}
- Status codes HTTP appropriés
- Error responses standardisées
- Logging si nécessaire
- RETOURNE UNIQUEMENT LE CODE`;

    const userPrompt = `CRÉER API ROUTE: ${routeName}
Méthode: ${method}
Emplacement: app/api/${routeName}/route.ts

DESCRIPTION: ${description}

CARACTÉRISTIQUES:
- ${method} handler avec typage
- ${withAuth ? 'Vérification authentication' : 'Endpoint public'}
- ${withValidation ? 'Validation request body/query' : 'Validation basique'}
- ${withRateLimit ? 'Rate limiting avec Redis/Upstash' : 'Pas de limites'}
- ${withCORS ? 'CORS pour cross-origin' : 'Same-origin seulement'}
- Responses JSON typées
- Gestion erreurs HTTP complète
- Logging des requêtes importantes`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const code = await this.api.chat(messages, { 
      temperature: 0.4,
      maxTokens: 3500 
    });

    return this.cleanCode(code);
  }

  async generateServerAction(actionName, description, options = {}) {
    const {
      withValidation = true,
      withRevalidation = true,
      withErrorHandling = true,
      withOptimisticUI = false
    } = options;

    const systemPrompt = `Tu es un expert Next.js 15 Server Actions.

${this.getStackContext()}

RÈGLES SERVER ACTIONS:
- "use server" directive
- Input validation avec Zod
- ${withRevalidation ? 'revalidatePath/Tag pour cache' : 'Pas de revalidation'}
- ${withErrorHandling ? 'Error handling structuré' : 'Erreurs basiques'}
- ${withOptimisticUI ? 'Support optimistic updates' : 'Pas de optimistic UI'}
- Return type { success: boolean; data?: any; error?: string }
- Async/await pour les opérations
- RETOURNE UNIQUEMENT LE CODE`;

    const userPrompt = `CRÉER SERVER ACTION: ${actionName}

DESCRIPTION: ${description}

FONCTIONNALITÉS:
- Validation ${withValidation ? 'Zod stricte' : 'basique'}
- ${withRevalidation ? 'Revalidation cache automatique' : 'Cache manuel'}
- ${withErrorHandling ? 'Gestion erreurs détaillée' : 'Erreurs simples'}
- ${withOptimisticUI ? 'Support UI optimiste' : 'UI standard'}
- Types TypeScript complets
- Performance optimisée
- Sécurité renforcée`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const code = await this.api.chat(messages, { 
      temperature: 0.3,
      maxTokens: 3000 
    });

    return this.cleanCode(code);
  }

  // === MÉTHODES AVANCÉES ===

  async generateComponentTests(componentName, componentCode) {
    const systemPrompt = `Tu es un expert tests React avec Jest et Testing Library.

${this.getStackContext()}

RÈGLES TESTS:
- Testing Library pour les tests utilisateur
- Mock Supabase et APIs externes
- Tests accessibilité
- Coverage des cas critiques
- Clean assertions
- RETOURNE UNIQUEMENT LE CODE`;

    const userPrompt = `GÉNÉRER TESTS POUR LE COMPOSANT: ${componentName}

CODE DU COMPOSANT:
${componentCode}

EXIGENCES TESTS:
- Render test de base
- Props testing
- User interactions
- Async operations mocking
- Error states
- Accessibility tests`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const tests = await this.api.chat(messages, { 
      temperature: 0.4,
      maxTokens: 3000 
    });

    return this.cleanCode(tests);
  }

  async generateComponentStory(componentName, componentCode) {
    const systemPrompt = `Tu es un expert Storybook avec Next.js.

${this.getStackContext()}

RÈGLES STORIES:
- Stories CSF 3.0
- Multiple variants
- Controls pour les props
- Documentation automatique
- RETOURNE UNIQUEMENT LE CODE`;

    const userPrompt = `GÉNÉRER STORYBOOK STORIES POUR: ${componentName}

CODE DU COMPOSANT:
${componentCode}

EXIGENCES STORIES:
- Story par défaut
- Variants principales
- Controls interactifs
- Documentation args
- Responsive testing`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const story = await this.api.chat(messages, { 
      temperature: 0.5,
      maxTokens: 2500 
    });

    return this.cleanCode(story);
  }

  async analyzeAndOptimize(code, context = {}) {
    const systemPrompt = `Tu es un expert performance Next.js.

${this.getStackContext()}

ANALYSE PERFORMANCE:
- Identifier les bottlenecks
- Optimiser les re-renders
- Améliorer le bundle size
- Optimiser les images
- Améliorer le Core Web Vitals
- RETOURNE UNIQUEMENT LE CODE OPTIMISÉ`;

    const userPrompt = `ANALYSER ET OPTIMISER LE CODE:

CODE ACTUEL:
${code}

CONTEXTE: ${JSON.stringify(context)}

OPTIMISATIONS DEMANDÉES:
- Performance
- Accessibilité  
- Maintenabilité
- Sécurité
- Best Practices Next.js 15`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const optimized = await this.api.chat(messages, { 
      temperature: 0.2,
      maxTokens: 4000 
    });

    return {
      optimizedCode: this.cleanCode(optimized),
      recommendations: await this.generateOptimizationRecommendations(code, optimized)
    };
  }

  async generateOptimizationRecommendations(original, optimized) {
    const systemPrompt = `Tu es un expert en revue de code Next.js.

${this.getStackContext()}

Génère des recommendations spécifiques d'optimisation.`;

    const userPrompt = `COMPARER ET RECOMMANDER:

CODE ORIGINAL:
${original}

CODE OPTIMISÉ:
${optimized}

GÉNÉRER:
- Liste des optimisations appliquées
- Métriques améliorées
- Recommendations supplémentaires
- Best practices spécifiques`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const recommendations = await this.api.chat(messages, { 
      temperature: 0.3,
      maxTokens: 2000 
    });

    return recommendations;
  }

  async createNextJSProject(projectName, features = [], options = {}) {
    const {
      withAuth = true,
      withDatabase = true,
      withTesting = true,
      withDeployment = true
    } = options;

    const systemPrompt = `Tu es un architecte Next.js 15 expert.

${this.getStackContext()}

Génère une structure de projet complète au format JSON.`;

    const userPrompt = `CRÉER PROJET NEXT.JS: ${projectName}

FEATURES: ${features.join(', ')}

CONFIGURATION:
- ${withAuth ? 'Authentication Supabase' : 'Pas de auth'}
- ${withDatabase ? 'Base de données Supabase' : 'Pas de DB'}
- ${withTesting ? 'Setup Jest + Testing Library' : 'Pas de tests'}
- ${withDeployment ? 'Configuration Vercel' : 'Pas de deployment'}

GÉNÉRER:
- Structure complète app/
- Configuration fichiers
- package.json avec dépendances
- Instructions setup
- Scripts de développement`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const projectStructure = await this.api.chat(messages, { 
      temperature: 0.5,
      maxTokens: 6000 
    });

    return this.parseProjectStructure(projectStructure);
  }

  parseProjectStructure(structure) {
    try {
      // Essayer de parser le JSON directement
      if (structure.trim().startsWith('{')) {
        return JSON.parse(structure);
      }

      // Extraire le JSON du markdown
      const jsonMatch = structure.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Fallback: retourner le texte brut
      return { raw: structure };
    } catch (error) {
      console.error('Error parsing project structure:', error);
      return { error: 'Failed to parse structure', raw: structure };
    }
  }

  cleanCode(code) {
    if (!code) return '';
    
    // Nettoyage avancé du code
    return code
      .replace(/```[\w]*\n?/g, '')
      .replace(/```$/g, '')
      .replace(/^json\s*\n/i, '')
      .replace(/^typescript\s*\n/i, '')
      .replace(/^tsx?\s*\n/i, '')
      .replace(/^javascript\s*\n/i, '')
      .replace(/^jsx?\s*\n/i, '')
      .replace(/^\/\/\s*AI[\s\S]*?(?=\n\n)/g, '') // Remove AI comments
      .trim();
  }

  // Méthodes utilitaires
  getPerformanceTips() {
    return this.bestPractices.performance;
  }

  getSecurityTips() {
    return this.bestPractices.security;
  }

  getAccessibilityTips() {
    return this.bestPractices.accessibility;
  }

  // Validation de code
  async validateCode(code, rules = []) {
    const systemPrompt = `Tu es un validateur de code Next.js 15.

${this.getStackContext()}

Valide le code selon les règles spécifiées.`;

    const userPrompt = `VALIDER LE CODE:

CODE:
${code}

RÈGLES DE VALIDATION:
${rules.length > 0 ? rules.join('\n') : 'Best practices Next.js 15'}

RAPPORT DE VALIDATION:
- Problèmes identifiés
- Severity (Error, Warning, Info)
- Recommendations de correction
- Score de qualité (0-100)`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const validation = await this.api.chat(messages, { 
      temperature: 0.2,
      maxTokens: 3000 
    });

    return validation;
  }
}

export default NextJSSpecialist;