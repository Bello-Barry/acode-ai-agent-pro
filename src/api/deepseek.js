class DeepSeekAPI {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.deepseek.com/v1';
    this.defaultModel = options.model || 'deepseek-coder';
    this.timeout = options.timeout || 60000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Cache avancé
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes
    
    // Métriques et analytics
    this.metrics = {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      totalTokens: 0
    };
    
    // Configuration avancée
    this.config = {
      enableStreaming: options.enableStreaming || false,
      enableCache: options.enableCache !== false,
      enableMetrics: options.enableMetrics !== false,
      autoRetry: options.autoRetry !== false,
      fallbackModels: options.fallbackModels || ['deepseek-coder', 'deepseek-chat']
    };

    // Middleware pipeline
    this.middleware = {
      preRequest: [],
      postRequest: [],
      onError: []
    };
  }

  // === CORE API METHODS ===

  async chat(messages, options = {}) {
    if (!this.apiKey?.trim()) {
      throw new Error('API Key non configurée. Veuillez configurer votre clé DeepSeek.');
    }

    // Générer une clé de cache
    const cacheKey = this.generateCacheKey(messages, options);
    
    // Vérifier le cache
    if (this.config.enableCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        return cached;
      }
    }

    // Exécuter le middleware pre-request
    await this.executeMiddleware('preRequest', { messages, options });

    const requestBody = this.buildRequestBody(messages, options);
    let lastError;

    // Retry logic avec backoff exponentiel
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(requestBody, options);
        const result = this.processResponse(response);
        
        // Mettre en cache le résultat
        if (this.config.enableCache) {
          this.setToCache(cacheKey, result);
        }

        // Middleware post-request
        await this.executeMiddleware('postRequest', { 
          messages, 
          options, 
          response: result,
          attempt 
        });

        return result;

      } catch (error) {
        lastError = error;
        
        // Middleware error
        await this.executeMiddleware('onError', { 
          error, 
          attempt, 
          messages, 
          options 
        });

        // Vérifier si on doit réessayer
        if (!this.shouldRetry(error, attempt)) {
          break;
        }

        // Attendre avant de réessayer (backoff exponentiel)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        }
      }
    }

    throw this.enhanceError(lastError);
  }

  async chatStream(messages, options = {}, onChunk = null) {
    if (!this.config.enableStreaming) {
      throw new Error('Streaming non activé dans la configuration');
    }

    const requestBody = {
      ...this.buildRequestBody(messages, options),
      stream: true
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') continue;
          if (trimmedLine === 'data: [DONE]') break;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              const content = data.choices[0]?.delta?.content || '';
              
              if (content) {
                fullContent += content;
                if (onChunk) {
                  onChunk(content, fullContent);
                }
              }
            } catch (e) {
              console.warn('Erreur parsing chunk:', e);
            }
          }
        }
      }

      return fullContent;

    } catch (error) {
      throw this.enhanceError(error);
    }
  }

  // === SPECIALIZED METHODS ===

  async generateCode(prompt, language = 'javascript', context = '', options = {}) {
    const systemPrompt = `Tu es un expert développeur ${language}. 

RÈGLES STRICTES DE GÉNÉRATION:
- Génère UNIQUEMENT du code fonctionnel et complet
- Pas d'explications, commentaires ou texte superflu
- Code prêt pour la production
- Respecte les standards et best practices du langage
- Inclus tous les imports nécessaires
- Gestion d'erreurs appropriée
- ${context ? `Contexte spécifique: ${context}` : ''}

Retourne uniquement le code sans aucun formatage markdown.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Génère: ${prompt}` }
    ];

    return await this.chat(messages, {
      temperature: 0.3,
      maxTokens: 4000,
      ...options
    });
  }

  async correctCode(code, language = 'javascript', options = {}) {
    const systemPrompt = `Tu es un expert en correction et optimisation de code ${language}.

RÈGLES DE CORRECTION:
1. Corrige toutes les erreurs de syntaxe et sémantiques
2. Améliore les performances et l'efficacité
3. Applique les security best practices
4. Optimise la lisibilité et maintenabilité
5. Respecte les conventions du langage

Retourne UNIQUEMENT le code corrigé sans explications.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Corrige et optimise ce code:\n\n${code}` }
    ];

    return await this.chat(messages, {
      temperature: 0.2,
      maxTokens: 4096,
      ...options
    });
  }

  async explainCode(code, language = 'javascript', depth = 'detailed') {
    const depthPrompts = {
      brief: 'Explique brièvement en 2-3 phrases',
      detailed: 'Donne une explication détaillée avec exemples',
      comprehensive: 'Analyse complète avec bonnes pratiques et pièges'
    };

    const systemPrompt = `Tu es un expert pédagogue en ${language}.

${depthPrompts[depth] || depthPrompts.detailed}

Structure ton explication:
1. Fonctionnalité globale
2. Points techniques importants
3. Bonnes pratiques identifiées
4. Éventuels problèmes ou améliorations`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Code à expliquer:\n\n${code}` }
    ];

    return await this.chat(messages, {
      temperature: 0.5,
      maxTokens: 2000
    });
  }

  async refactorCode(code, language = 'javascript', goals = []) {
    const goalsText = goals.length > 0 
      ? `Objectifs spécifiques: ${goals.join(', ')}`
      : 'Améliore la qualité générale du code';

    const systemPrompt = `Tu es un architecte logiciel expert en refactoring ${language}.

PRINCIPES DE REFACTORING:
- Maintenir la même fonctionnalité
- Améliorer la lisibilité
- Réduire la complexité cyclomatique
- Éliminer la duplication
- Appliquer les principes SOLID
- Optimiser les performances

${goalsText}

Retourne UNIQUEMENT le code refactorisé.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Refactorise ce code:\n\n${code}` }
    ];

    return await this.chat(messages, {
      temperature: 0.3,
      maxTokens: 4096
    });
  }

  async generateTests(code, language = 'javascript', framework = 'auto') {
    const testFrameworks = {
      javascript: 'Jest avec Testing Library',
      typescript: 'Jest avec Testing Library',
      python: 'pytest',
      java: 'JUnit 5 avec Mockito',
      csharp: 'xUnit avec Moq',
      php: 'PHPUnit',
      ruby: 'RSpec',
      go: 'testing package avec testify'
    };

    const selectedFramework = framework === 'auto' 
      ? testFrameworks[language] || 'framework standard'
      : framework;

    const systemPrompt = `Tu es un expert en tests ${language} avec ${selectedFramework}.

RÈGLES DE GÉNÉRATION DE TESTS:
- Couverture des cas heureux et malheureux
- Tests isolés et indépendants
- Mocking des dépendances externes
- Noms de tests descriptifs
- Assertions claires et significatives
- Respect des conventions du framework

Retourne UNIQUEMENT le code de test complet.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Génère des tests pour:\n\n${code}` }
    ];

    return await this.chat(messages, {
      temperature: 0.4,
      maxTokens: 4000
    });
  }

  async generateDocumentation(code, language = 'javascript', format = 'markdown') {
    const formatTemplates = {
      markdown: 'Documentation Markdown avec en-têtes, code blocks et exemples',
      jsdoc: 'JSDoc comments pour JavaScript/TypeScript',
      docstring: 'Docstrings Python avec Google/NumPy style',
      javadoc: 'JavaDoc comments pour Java'
    };

    const systemPrompt = `Tu es un expert en documentation technique ${language}.

Génère une documentation ${formatTemplates[format] || format}:

STRUCTURE:
- Description générale
- Paramètres et retour
- Exemples d'utilisation
- Notes importantes
- Bonnes pratiques

Sois complet mais concis.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Documente ce code:\n\n${code}` }
    ];

    return await this.chat(messages, {
      temperature: 0.5,
      maxTokens: 3000
    });
  }

  async analyzeCodeQuality(code, language = 'javascript') {
    const systemPrompt = `Tu es un expert en analyse de qualité de code ${language}.

Fournis une analyse détaillée avec:
1. Score de qualité (0-100)
2. Points forts
3. Problèmes identifiés
4. Recommendations d'amélioration
5. Risques de sécurité
6. Optimisations potentielles

Sois constructif et spécifique.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyse la qualité de ce code:\n\n${code}` }
    ];

    return await this.chat(messages, {
      temperature: 0.3,
      maxTokens: 2500
    });
  }

  // === ADVANCED FEATURES ===

  async batchProcess(requests, options = {}) {
    const results = [];
    const concurrency = options.concurrency || 3;
    
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchPromises = batch.map(req => 
        this.chat(req.messages, req.options).catch(error => ({
          error: error.message,
          input: req
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Petit délai entre les batches pour éviter rate limiting
      if (i + concurrency < requests.length) {
        await this.delay(100);
      }
    }
    
    return results;
  }

  addMiddleware(type, middleware) {
    if (this.middleware[type]) {
      this.middleware[type].push(middleware);
    }
  }

  // === UTILITY METHODS ===

  buildRequestBody(messages, options) {
    return {
      model: options.model || this.defaultModel,
      messages: this.validateMessages(messages),
      temperature: Math.max(0.1, Math.min(1.0, options.temperature || 0.7)),
      max_tokens: options.maxTokens || 4096,
      top_p: options.topP || 0.9,
      frequency_penalty: options.frequencyPenalty || 0,
      presence_penalty: options.presencePenalty || 0,
      stream: options.stream || false
    };
  }

  validateMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    return messages.map(msg => {
      if (!msg.role || !msg.content) {
        throw new Error('Each message must have role and content');
      }
      
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        throw new Error('Message role must be system, user, or assistant');
      }

      return {
        role: msg.role,
        content: String(msg.content).substring(0, 10000) // Limit content length
      };
    });
  }

  async makeRequest(requestBody, options) {
    this.metrics.requests++;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'AI-Agent-Plugin/1.0'
    };
  }

  async processResponse(response) {
    const data = await response.json();
    
    // Track tokens usage
    if (data.usage) {
      this.metrics.totalTokens += data.usage.total_tokens || 0;
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse API invalide: structure de données incorrecte');
    }

    return data.choices[0].message.content;
  }

  async handleErrorResponse(response) {
    let errorData;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: 'Unable to parse error response' } };
    }

    const errorMap = {
      400: 'Requête invalide - vérifiez les paramètres',
      401: 'Clé API invalide ou expirée',
      403: 'Accès refusé - vérifiez vos permissions',
      429: 'Rate limit dépassé - réessayez plus tard',
      500: 'Erreur interne du serveur',
      502: 'Bad Gateway - réessayez',
      503: 'Service indisponible - maintenance en cours'
    };

    const message = errorData.error?.message || errorMap[response.status] || `Erreur HTTP ${response.status}`;
    
    return new Error(`${message} | Status: ${response.status}`);
  }

  shouldRetry(error, attempt) {
    if (!this.config.autoRetry) return false;
    if (attempt >= this.maxRetries) return false;

    // Retry sur les erreurs réseau et rate limits
    const retryableErrors = [
      'network',
      'timeout', 
      'rate limit',
      'server error',
      'gateway'
    ];

    return retryableErrors.some(retryable => 
      error.message.toLowerCase().includes(retryable)
    );
  }

  enhanceError(error) {
    if (error.name === 'AbortError') {
      return new Error(`Délai de requête dépassé (${this.timeout}ms). Vérifiez votre connexion.`);
    }

    if (error.message.includes('rate limit')) {
      return new Error('Limite de requêtes atteinte. Veuillez réessayer dans quelques minutes.');
    }

    if (error.message.includes('quota')) {
      return new Error('Quota API épuisé. Vérifiez votre compte DeepSeek.');
    }

    return error;
  }

  // === CACHE MANAGEMENT ===

  generateCacheKey(messages, options) {
    const keyData = {
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      model: options.model || this.defaultModel,
      temperature: options.temperature || 0.7
    };
    
    return JSON.stringify(keyData);
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key); // Expired cache
    }
    
    return null;
  }

  setToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Cleanup expired cache entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }

  // === METRICS AND ANALYTICS ===

  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.requests > 0 
        ? (this.metrics.cacheHits / this.metrics.requests) * 100 
        : 0
    };
  }

  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      totalTokens: 0
    };
  }

  // === MIDDLEWARE SYSTEM ===

  async executeMiddleware(type, data) {
    if (!this.middleware[type]) return;

    for (const middleware of this.middleware[type]) {
      try {
        await middleware(data);
      } catch (error) {
        console.warn(`Middleware ${type} error:`, error);
      }
    }
  }

  // === CONFIGURATION METHODS ===

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.clearCache(); // Clear cache on API key change
  }

  setModel(model) {
    this.defaultModel = model;
  }

  setTimeout(timeout) {
    this.timeout = timeout;
  }

  // === UTILITY FUNCTIONS ===

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === DESTRUCTOR ===

  destroy() {
    this.clearCache();
    this.middleware = {
      preRequest: [],
      postRequest: [],
      onError: []
    };
  }
}

export default DeepSeekAPI;