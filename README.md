# 🚀 AI Agent Pro - Next.js 15 Edition

> Assistant IA ultra-intelligent spécialisé pour **Next.js 15, TypeScript, TailwindCSS, Supabase, Zustand, react-hook-form, Zod et shadcn/ui**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ⚡ Votre Stack = Ma Spécialité

Ce plugin est **expert dans votre stack exacte** :
- ✅ **Next.js 15** (App Router)
- ✅ **TypeScript** strict
- ✅ **TailwindCSS** pour le styling
- ✅ **Supabase** pour la base de données
- ✅ **Zustand** pour l'état global
- ✅ **react-hook-form** + **Zod** pour les formulaires
- ✅ **shadcn/ui** pour les composants
- ✅ **lucide-react** pour les icônes
- ✅ **react-toastify** pour les notifications

---

## 🎯 Fonctionnalités Next.js 15

### 🔷 Composants
```
Ctrl+Alt+N C → Générer un composant client
Ctrl+Alt+N S → Générer un composant serveur
```
- Composants clients avec "use client"
- Composants serveurs async
- Props TypeScript typées
- TailwindCSS intégré
- Icônes lucide-react

### 📄 Pages & Layouts
```
Ctrl+Alt+N P → Générer une page (App Router)
```
- Pages Next.js 15 avec metadata
- Server Components par défaut
- Suspense pour le loading
- SEO optimisé
- Layouts personnalisés

### 📝 Formulaires Avancés
```
Ctrl+Alt+N F → Générer un formulaire
```
- Schema Zod de validation
- react-hook-form intégré
- Types TypeScript automatiques
- Composants shadcn/ui (Input, Button, Form)
- Toast de feedback
- Gestion d'erreurs complète

### 🗄️ State Management
```
Ctrl+Alt+N Z → Générer un store Zustand
```
- Store Zustand TypeScript
- Persist middleware
- Actions typées
- Selectors optimisés

### 🔌 API Routes & Server Actions
```
Ctrl+Alt+N A → API Route
Ctrl+Alt+N X → Server Action
```
- Routes API Next.js 15
- Server Actions avec "use server"
- Validation Zod
- Types NextRequest/NextResponse
- Gestion d'erreurs HTTP

### 🗃️ Supabase
```
Ctrl+Alt+N B → Fonction Supabase
```
- Client Supabase (client/server)
- Types TypeScript Database
- Gestion d'erreurs complète
- RLS aware
- Queries optimisées

### 🎨 Composants shadcn/ui
- Génération/customisation de composants
- Variants personnalisés
- TailwindCSS classes
- Accessibilité (ARIA)
- Types TypeScript

### ⚡ Optimisations Production
```
Ctrl+Alt+N O → Optimiser le code
```
- Dynamic imports (code splitting)
- Image optimization (next/image)
- Font optimization (next/font)
- Memoization (useMemo, useCallback)
- Server Components où possible
- ISR/SSG configuration

### 🔄 Conversions Intelligentes
- Convertir Client → Server Component
- Corriger erreurs TypeScript
- Moderniser le code
- Refactoring intelligent

### 🏗️ Projet Complet
```
Ctrl+Alt+N N → Créer un projet Next.js 15
```
- Structure complète Next.js 15
- Configuration TypeScript
- TailwindCSS setup
- Supabase intégré
- Zustand stores
- Composants de base
- Types & utils
- README.md

---

## 🛠️ Installation

### Prérequis
- Acode v1.8+
- Connexion Internet
- Clé API DeepSeek ([obtenir ici](https://platform.deepseek.com))

### Installation
1. Ouvrir Acode
2. Menu → Plugins
3. Rechercher "AI Agent Pro"
4. Installer

---

## ⚙️ Configuration Rapide

1. **Première utilisation**
   - Le plugin s'ouvre automatiquement
   - Entrer votre clé API DeepSeek
   - Choisir le modèle `deepseek-coder`
   - Activer le mode Next.js

2. **Paramètres recommandés**
   ```
   Modèle: deepseek-coder
   Température: 0.6 (équilibre créativité/précision)
   Max Tokens: 4096
   Mode Next.js: Activé ✓
   ```

---

## 📖 Guide d'Utilisation

### Exemple 1 : Créer un Formulaire de Contact

**Commande** : `Ctrl+Alt+N F`

**Prompt** :
```
Nom: ContactForm
Champs: nom, email, message, accepte conditions
```

**Résultat** :
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-toastify';

const schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  message: z.string().min(10, 'Message trop court'),
  accepteConditions: z.boolean().refine(val => val === true)
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Votre logique ici
      toast.success('Message envoyé !');
    } catch (error) {
      toast.error('Erreur d\'envoi');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('nom')} placeholder="Nom" />
      {errors.nom && <p className="text-red-500">{errors.nom.message}</p>}
      
      <Input {...register('email')} type="email" placeholder="Email" />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      
      <Textarea {...register('message')} placeholder="Message" />
      {errors.message && <p className="text-red-500">{errors.message.message}</p>}
      
      <div className="flex items-center gap-2">
        <Checkbox {...register('accepteConditions')} />
        <label>J'accepte les conditions</label>
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Envoi...' : 'Envoyer'}
      </Button>
    </form>
  );
}
```

### Exemple 2 : Store Zustand pour Auth

**Commande** : `Ctrl+Alt+N Z`

**Prompt** :
```
Nom: useAuthStore
State: user (User | null), token (string), isAuthenticated, login, logout
```

**Résultat** :
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      })
    }),
    {
      name: 'auth-storage'
    }
  )
);
```

### Exemple 3 : API Route avec Supabase

**Commande** : `Ctrl+Alt+N A`

**Prompt** :
```
Route: posts
Description: CRUD pour les posts (GET tous, POST créer)
```

**Résultat** :
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10)
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ posts: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = postSchema.parse(body);
    
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from('posts')
      .insert([validated])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Alt+N C` | Composant Client |
| `Ctrl+Alt+N S` | Composant Server |
| `Ctrl+Alt+N P` | Page Next.js |
| `Ctrl+Alt+N F` | Formulaire |
| `Ctrl+Alt+N Z` | Store Zustand |
| `Ctrl+Alt+N A` | API Route |
| `Ctrl+Alt+N X` | Server Action |
| `Ctrl+Alt+N B` | Fonction Supabase |
| `Ctrl+Alt+N O` | Optimiser |
| `Ctrl+Alt+N N` | Projet complet |
| `Ctrl+Alt+G` | Générer code |
| `Ctrl+Alt+C` | Corriger code |

---

## 🔥 Tips & Astuces

### 1. Descriptions Précises
Plus vous êtes précis, meilleur est le résultat :
```
❌ "un formulaire"
✅ "formulaire d'inscription avec nom, email, mot de passe, 
   confirmation mot de passe, validation Zod, affichage 
   erreurs, bouton désactivé pendant submit"
```

### 2. Contexte Projet
Le plugin analyse votre projet pour générer du code cohérent avec votre architecture.

### 3. Itération Rapide
Générez → Testez → Ajustez en redemandant avec plus de détails.

### 4. Optimisation
Utilisez `Ctrl+Alt+N O` sur du code existant pour l'optimiser automatiquement.

---

## 🐛 Dépannage

### Le plugin ne charge pas
1. Vérifier Acode v1.8+
2. Réinstaller le plugin
3. Redémarrer Acode

### Code incomplet
1. Augmenter Max Tokens (8000+)
2. Diviser la demande en plusieurs parties

### Erreurs TypeScript
Utiliser `Ctrl+Alt+N` + correction auto ou demander explicitement la correction.

---

## 📊 Statistiques d'Utilisation

Le plugin collecte anonymement des statistiques pour s'améliorer :
- Fonctionnalités les plus utilisées
- Types de code générés
- Temps de génération

Désactiver dans Paramètres → Analytics → Désactiver

---

## 🤝 Contribution

Contributions bienvenues ! Ouvrez une issue ou PR sur GitHub.

---

## 📄 Licence

MIT License - Utilisez librement !

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org) - Le framework
- [DeepSeek](https://deepseek.com) - L'IA
- [Acode](https://acode.app) - L'éditeur
- [shadcn/ui](https://ui.shadcn.com) - Les composants

---

## 📞 Support

- 🐛 Bugs : [GitHub Issues]
- 💬 Questions : [GitHub Discussions]
- 📧 Email : support@aiagent.com

---

**Créé avec ❤️ pour les développeurs Next.js**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Acode](https://img.shields.io/badge/Acode-v1.8%2B-orange)

---

## ✨ Fonctionnalités

### 🪄 Génération de Code
- Génération de code à partir de descriptions en langage naturel
- Support multi-langages (JavaScript, Python, Java, PHP, etc.)
- Génération contextuelle basée sur votre code existant
- Templates intelligents pour fonctions, classes et composants

### 🔧 Correction et Amélioration
- Correction automatique des erreurs de syntaxe
- Optimisation des performances
- Refactoring intelligent
- Détection et correction des mauvaises pratiques

### 💡 Explications
- Explications détaillées du code sélectionné
- Traduction code → langage naturel
- Documentation automatique
- Analyse de complexité

### 🧪 Tests
- Génération automatique de tests unitaires
- Support des frameworks de test populaires
- Tests complets avec cas limites

### 📁 Création de Projets
- Structures de projet complètes
- Templates prédéfinis :
  - Site Web (HTML/CSS/JS)
  - Application React
  - API Node.js / Express.js
  - API Flask (Python)
  - Plugin Acode

---

## 🚀 Installation

### Prérequis
- Acode v1.8 ou supérieur
- Connexion Internet
- Clé API DeepSeek ([obtenir une clé](https://platform.deepseek.com))

### Méthode 1 : Via Acode (Recommandé)
1. Ouvrir Acode
2. Menu → Plugins
3. Rechercher "AI Agent Pro"
4. Installer

### Méthode 2 : Installation Manuelle
1. Télécharger le plugin
2. Extraire dans `/storage/emulated/0/.acode/plugins/acode-ai-agent/`
3. Redémarrer Acode

---

## ⚙️ Configuration

### Première utilisation

1. **Ouvrir les paramètres**
   - Cliquer sur l'icône ⚙️ dans la sidebar
   - Ou : Menu → AI Agent → Configuration

2. **Configurer l'API Key**
   - Entrer votre clé API DeepSeek
   - Sélectionner le modèle (deepseek-coder recommandé)
   - Ajuster les paramètres si nécessaire

3. **Sauvegarder**
   - Cliquer sur "Sauvegarder"
   - Le plugin est prêt à l'emploi !

### Paramètres disponibles

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| API Key | Clé API DeepSeek | - |
| Modèle | deepseek-coder ou deepseek-chat | deepseek-coder |
| Température | Créativité (0-1) | 0.7 |
| Max Tokens | Longueur max des réponses | 4096 |

---

## 📖 Utilisation

### Sidebar (Panneau latéral)

Le plugin ajoute une sidebar à droite avec des boutons d'accès rapide :

- **✨ Générer** : Générer du code
- **🔧 Corriger** : Corriger le code sélectionné
- **💡 Expliquer** : Expliquer le code
- **🔄 Refactoriser** : Restructurer le code
- **🧪 Tests** : Générer des tests
- **📝 Documenter** : Générer la documentation
- **📁 Projet** : Créer un nouveau projet
- **⚙️ Paramètres** : Configuration

### Palette de commandes

Ouvrir la palette : `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)

Commandes disponibles :
```
AI Agent: Générer du code
AI Agent: Corriger le code
AI Agent: Expliquer le code
AI Agent: Créer un projet
AI Agent: Générer des tests
AI Agent: Refactoriser
AI Agent: Documenter
AI Agent: Configuration
```

### Exemples d'utilisation

#### 1. Générer du code

```
Cliquer sur ✨ Générer
→ Entrer : "fonction de tri rapide en JavaScript"
→ Le code est inséré automatiquement
```

**Résultat :**
```javascript
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...quickSort(left), ...middle, ...quickSort(right)];
}
```

#### 2. Corriger du code

```
Sélectionner le code avec erreurs
→ Cliquer sur 🔧 Corriger
→ Confirmer ou visualiser les corrections
```

#### 3. Créer un projet

```
Cliquer sur 📁 Projet
→ Choisir "Application React"
→ Entrer "mon-app"
→ Entrer le chemin "/storage/emulated/0/"
→ Le projet est créé !
```

**Structure créée :**
```
mon-app/
├── package.json
├── index.html
└── src/
    ├── index.js
    ├── App.js
    ├── components/
    └── styles/
        └── App.css
```

#### 4. Générer des tests

```
Sélectionner une fonction
→ Cliquer sur 🧪 Tests
→ Les tests sont générés
```

---

## 🎯 Cas d'usage

### Débutants
- Apprendre en demandant des explications
- Corriger les erreurs rapidement
- Générer du code template

### Développeurs intermédiaires
- Refactoriser du code legacy
- Générer des tests unitaires
- Créer rapidement des projets

### Développeurs avancés
- Optimiser les performances
- Documenter automatiquement
- Analyser la complexité du code

---

## 🔒 Sécurité et Confidentialité

### Données envoyées
- Seul le code sélectionné ou le fichier actuel est envoyé
- Votre API Key est stockée localement et chiffrée
- Aucune donnée n'est conservée par le plugin

### Bonnes pratiques
- ❌ Ne partagez jamais votre API Key
- ✅ Utilisez des API Keys avec limitation de taux
- ✅ Vérifiez le code généré avant utilisation
- ✅ Ne pas envoyer de données sensibles (mots de passe, tokens)

---

## 🐛 Dépannage

### Le plugin ne se charge pas
1. Vérifier la version d'Acode (>= 1.8)
2. Réinstaller le plugin
3. Vérifier les permissions (Internet, Storage)

### Erreur "API Key non configurée"
1. Ouvrir les paramètres (⚙️)
2. Entrer une clé API valide
3. Sauvegarder

### Erreur "Délai d'attente dépassé"
1. Vérifier votre connexion Internet
2. Réessayer
3. Réduire Max Tokens dans les paramètres

### Le code généré n'est pas satisfaisant
1. Donner plus de détails dans la description
2. Ajuster la température (plus bas = plus précis)
3. Essayer un autre modèle

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✨ Version initiale
- 🪄 Génération de code
- 🔧 Correction et refactoring
- 💡 Explications de code
- 🧪 Génération de tests
- 📁 Création de projets
- 📝 Documentation automatique
- ⚙️ Interface de configuration

---

## 🤝 Contribution

Les contributions sont les bienvenues !

### Comment contribuer
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails

---

## 🙏 Remerciements

- [Acode](https://acode.app) - L'éditeur de code Android
- [DeepSeek](https://deepseek.com) - L'API IA
- La communauté Acode

---

## 📞 Support

- 🐛 **Bugs** : [Issues GitHub](https://github.com/votre-repo/issues)
- 💬 **Questions** : [Discussions GitHub](https://github.com/votre-repo/discussions)
- 📧 **Email** : support@aiagent.com

---

## 🌟 Donnez une étoile !

Si ce plugin vous a été utile, n'hésitez pas à donner une ⭐ sur GitHub !

---

**Fait avec ❤️ pour la communauté Acode**