class MultiAIOrchestrator {
  constructor(apiKeys = {}, options = {}) {
    // Configuration des providers
    this.providers = this.initializeProviders(apiKeys);
    
    // Configuration avancée
    this.config = {
      enableSmartRouting: options.enableSmartRouting !== false,
      enableLoadBalancing: options.enableLoadBalancing !== false,
      enableFallback: options.enableFallback !== false,
      enableMetrics: options.enableMetrics !== false,
      enableCaching: options.enableCaching !== false,
      defaultTimeout: options.defaultTimeout || 30000,
      maxRetries: options.maxRetries || 2,
      ...options
    };

    // Métriques et analytics
    this.metrics = {
      requests: 0,
      errors: 0,
      providerUsage: {},
      responseTimes: {},
      cacheHits: 0,
      fallbacks: 0
    };

    // Cache intelligent
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 300000; // 5 minutes

    // Historique des performances
    this.performanceHistory = {
      deepseek: { success: 0, errors: 0, avgResponseTime: 0 },
      gemini: { success: 0, errors: 0, avgResponseTime: 0 },
      openai: { success: 0, errors: 0, avgResponseTime: 0 }
    };

    // Middleware pipeline
    this.middleware = {
      preRequest: [],
      postRequest: [],
      onError: [],
      providerSelect: []
    };

    // Initialisation
    this.initializeMetrics();
  }

  initializeProviders(apiKeys) {
    return {
      deepseek: {
        name: 'DeepSeek',
        available: !!apiKeys.deepseek,
        apiKey: apiKeys.deepseek,
        baseURL: 'https://api.deepseek.com/v1/chat/completions',
        models: {
          code: 'deepseek-coder',
          chat: 'deepseek-chat',
          default: 'deepseek-coder'
        },
        costPerToken: 0.00014, // $ per 1K tokens
        strengths: ['code generation', 'refactoring', 'technical explanations'],
        limitations: ['creative writing', 'long form content'],
        priority: 1 // Highest priority
      },
      gemini: {
        name: 'Google Gemini',
        available: !!apiKeys.gemini,
        apiKey: apiKeys.gemini,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
        models: {
          pro: 'gemini-pro',
          flash: 'gemini-flash',
          default: 'gemini-pro'
        },
        costPerToken: 0.000125,
        strengths: ['reasoning', 'multimodal', 'creative tasks'],
        limitations: ['code specificity', 'technical depth'],
        priority: 2
      },
      openai: {
        name: 'OpenAI',
        available: !!apiKeys.openai,
        apiKey: apiKeys.openai,
        baseURL: 'https://api.openai.com/v1/chat/completions',
        models: {
          smart: 'gpt-4',
          fast: 'gpt-3.5-turbo',
          default: 'gpt-4'
        },
        costPerToken: 0.00003,
        strengths: ['general purpose', 'conversation', 'documentation'],
        limitations: ['cost', 'rate limits'],
        priority: 3
      },
      // Provider additionnel pour Claude (si ajouté plus tard)
      claude: {
        name: 'Anthropic Claude',
        available: !!apiKeys.claude,
        apiKey: apiKeys.claude,
        baseURL: 'https://api.anthropic.com/v1/messages',
        models: {
          smart: 'claude-3-sonnet-20240229',
          fast: 'claude-3-haiku-20240307',
          default: 'claude-3-sonnet-20240229'
        },
        costPerToken: 0.000015,
        strengths: ['long context', 'reasoning', 'safety'],
        limitations: ['code generation speed'],
        priority: 2
      }
    };
  }

  initializeMetrics() {
    Object.keys(this.providers).forEach(provider => {
      this.metrics.providerUsage[provider] = 0;
      this.metrics.responseTimes[provider] = [];
    });
  }

  // === CORE ORCHESTRATION METHODS ===

  async chat(messages, options = {}) {
    this.metrics.requests++;

    // Générer une clé de cache
    const cacheKey = this.generateCacheKey(messages, options);
    
    // Vérifier le cache
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        return cached;
      }
    }

    // Exécuter le middleware pre-request
    await this.executeMiddleware('preRequest', { messages, options });

    // Sélectionner le meilleur provider
    const selectedProvider = await this.selectBestProvider(messages, options);
    
    if (!selectedProvider) {
      throw new Error('Aucun fournisseur d\'IA disponible. Vérifiez vos clés API.');
    }

    let lastError;
    let lastProvider = selectedProvider;

    // Retry logic avec fallback
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await this.callProvider(lastProvider, messages, options);
        const responseTime = Date.now() - startTime;

        // Mettre à jour les métriques
        this.updateProviderMetrics(lastProvider, true, responseTime);

        // Mettre en cache le résultat
        if (this.config.enableCaching) {
          this.setToCache(cacheKey, result);
        }

        // Exécuter le middleware post-request
        await this.executeMiddleware('postRequest', {
          provider: lastProvider,
          messages,
          options,
          result,
          responseTime,
          attempt
        });

        return result;

      } catch (error) {
        this.metrics.errors++;
        lastError = error;
        
        // Mettre à jour les métriques d'erreur
        this.updateProviderMetrics(lastProvider, false, 0);

        // Exécuter le middleware d'erreur
        await this.executeMiddleware('onError', {
          provider: lastProvider,
          error,
          attempt,
          messages,
          options
        });

        // Trouver un provider de fallback
        const fallbackProvider = this.getFallbackProvider(lastProvider, error);
        
        if (fallbackProvider && attempt < this.config.maxRetries) {
          this.metrics.fallbacks++;
          lastProvider = fallbackProvider;
          console.warn(`Fallback de ${lastProvider} vers ${fallbackProvider} après erreur:`, error.message);
          continue;
        }

        break;
      }
    }

    throw this.enhanceError(lastError, lastProvider);
  }

  async chatStream(messages, options = {}, onChunk = null) {
    const provider = await this.selectBestProvider(messages, { ...options, streaming: true });
    
    if (!provider) {
      throw new Error('Aucun fournisseur supportant le streaming disponible');
    }

    switch (provider) {
      case 'deepseek':
        return await this.callDeepSeekStream(messages, options, onChunk);
      case 'openai':
        return await this.callOpenAIStream(messages, options, onChunk);
      case 'gemini':
        return await this.callGeminiStream(messages, options, onChunk);
      default:
        throw new Error(`Streaming non supporté pour ${provider}`);
    }
  }

  // === PROVIDER SELECTION INTELLIGENTE ===

  async selectBestProvider(messages, options = {}) {
    // Exécuter le middleware de sélection
    const middlewareResult = await this.executeProviderSelectMiddleware(messages, options);
    if (middlewareResult) return middlewareResult;

    // Provider forcé par l'utilisateur
    if (options.provider && this.isProviderAvailable(options.provider)) {
      return options.provider;
    }

    // Sélection intelligente basée sur le contexte
    return this.intelligentProviderSelection(messages, options);
  }

  intelligentProviderSelection(messages, options) {
    const availableProviders = this.getAvailableProviders();
    if (availableProviders.length === 0) return null;

    // Analyser le contenu des messages
    const content = messages.map(m => m.content).join(' ').toLowerCase();
    
    // Règles de sélection basées sur le contenu
    const selectionRules = [
      {
        condition: () => content.includes('code') || content.includes('function') || content.includes('class'),
        providers: ['deepseek', 'openai', 'gemini'],
        score: { deepseek: 10, openai: 8, gemini: 6 }
      },
      {
        condition: () => content.includes('explain') || content.includes('how to') || content.includes('tutorial'),
        providers: ['openai', 'gemini', 'deepseek'],
        score: { openai: 10, gemini: 9, deepseek: 7 }
      },
      {
        condition: () => content.includes('refactor') || content.includes('optimize') || content.includes('debug'),
        providers: ['deepseek', 'openai'],
        score: { deepseek: 10, openai: 8 }
      },
      {
        condition: () => content.length > 1000,
        providers: ['claude', 'openai', 'gemini'],
        score: { claude: 10, openai: 8, gemini: 7 }
      },
      {
        condition: () => options.streaming,
        providers: ['openai', 'deepseek'],
        score: { openai: 10, deepseek: 9 }
      }
    ];

    // Appliquer les règles
    let providerScores = {};
    availableProviders.forEach(provider => providerScores[provider] = 0);

    selectionRules.forEach(rule => {
      if (rule.condition()) {
        availableProviders.forEach(provider => {
          providerScores[provider] += rule.score[provider] || 0;
        });
      }
    });

    // Ajouter le score basé sur les performances historiques
    availableProviders.forEach(provider => {
      const perf = this.performanceHistory[provider];
      if (perf && perf.success > 0) {
        const successRate = perf.success / (perf.success + perf.errors);
        providerScores[provider] += Math.round(successRate * 5);
      }
    });

    // Sélectionner le provider avec le score le plus élevé
    const bestProvider = availableProviders.reduce((best, current) => 
      providerScores[current] > providerScores[best] ? current : best
    );

    return bestProvider || availableProviders[0];
  }

  getFallbackProvider(failedProvider, error) {
    const availableProviders = this.getAvailableProviders().filter(p => p !== failedProvider);
    
    // Prioriser les providers par fiabilité historique
    return availableProviders.sort((a, b) => {
      const perfA = this.performanceHistory[a];
      const perfB = this.performanceHistory[b];
      
      const scoreA = perfA ? perfA.success / (perfA.success + perfA.errors) : 0;
      const scoreB = perfB ? perfB.success / (perfB.success + perfB.errors) : 0;
      
      return scoreB - scoreA;
    })[0];
  }

  // === PROVIDER API CALLS ===

  async callProvider(provider, messages, options) {
    switch (provider) {
      case 'deepseek':
        return await this.callDeepSeek(messages, options);
      case 'gemini':
        return await this.callGemini(messages, options);
      case 'openai':
        return await this.callOpenAI(messages, options);
      case 'claude':
        return await this.callClaude(messages, options);
      default:
        throw new Error(`Provider non supporté: ${provider}`);
    }
  }

  async callDeepSeek(messages, options) {
    const provider = this.providers.deepseek;
    const model = options.model || provider.models.default;

    const response = await this.makeRequest(provider.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: this.formatMessagesForProvider('deepseek', messages),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        stream: false
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callDeepSeekStream(messages, options, onChunk) {
    const provider = this.providers.deepseek;
    
    const response = await fetch(provider.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || provider.models.default,
        messages: this.formatMessagesForProvider('deepseek', messages),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        stream: true
      })
    });

    return await this.handleStreamResponse(response, onChunk);
  }

  async callGemini(messages, options) {
    const provider = this.providers.gemini;
    const model = options.model || provider.models.default;

    // Conversion du format de messages pour Gemini
    const contents = this.formatMessagesForProvider('gemini', messages);

    const response = await this.makeRequest(
      `${provider.baseURL}/${model}:generateContent?key=${provider.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 4096
          }
        })
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callOpenAI(messages, options) {
    const provider = this.providers.openai;
    const model = options.model || provider.models.default;

    const response = await this.makeRequest(provider.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: this.formatMessagesForProvider('openai', messages),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        stream: false
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callOpenAIStream(messages, options, onChunk) {
    const provider = this.providers.openai;
    
    const response = await fetch(provider.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || provider.models.default,
        messages: this.formatMessagesForProvider('openai', messages),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        stream: true
      })
    });

    return await this.handleStreamResponse(response, onChunk);
  }

  async callClaude(messages, options) {
    const provider = this.providers.claude;
    const model = options.model || provider.models.default;

    const response = await this.makeRequest(provider.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: this.formatMessagesForProvider('claude', messages),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096
      })
    });

    const data = await response.json();
    return data.content[0].text;
  }

  async callGeminiStream(messages, options, onChunk) {
    // Implémentation du streaming Gemini
    // Note: Gemini a un support streaming différent
    console.warn('Streaming non entièrement supporté pour Gemini, utilisation du mode normal');
    return await this.callGemini(messages, options);
  }

  // === FORMATAGE DES MESSAGES ===

  formatMessagesForProvider(provider, messages) {
    switch (provider) {
      case 'gemini':
        // Gemini utilise un format différent
        return messages.map(message => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }]
        }));
      
      case 'claude':
        // Claude utilise un format similaire mais avec des restrictions
        return messages.filter(msg => 
          msg.role === 'user' || msg.role === 'assistant'
        ).map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      default:
        // DeepSeek et OpenAI utilisent le même format
        return messages;
    }
  }

  // === UTILITY METHODS ===

  async makeRequest(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.defaultTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async handleStreamResponse(response, onChunk) {
    if (!response.ok) {
      throw await this.handleErrorResponse(response);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              const content = this.extractContentFromStream(data);
              
              if (content) {
                fullContent += content;
                if (onChunk) {
                  onChunk(content, fullContent);
                }
              }
            } catch (e) {
              console.warn('Erreur parsing stream chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  extractContentFromStream(data) {
    // Extraire le contenu selon le provider
    if (data.choices?.[0]?.delta?.content) {
      return data.choices[0].delta.content; // OpenAI/DeepSeek
    }
    if (data.content) {
      return data.content; // Claude
    }
    return '';
  }

  async handleErrorResponse(response) {
    let errorData;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: 'Unable to parse error response' } };
    }

    const statusMessages = {
      400: 'Requête invalide',
      401: 'Clé API invalide',
      403: 'Accès refusé',
      429: 'Rate limit dépassé',
      500: 'Erreur serveur',
      502: 'Bad Gateway',
      503: 'Service indisponible'
    };

    const message = errorData.error?.message || 
                   statusMessages[response.status] || 
                   `Erreur HTTP ${response.status}`;

    return new Error(message);
  }

  // === CACHE MANAGEMENT ===

  generateCacheKey(messages, options) {
    return JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      provider: options.provider,
      model: options.model,
      temperature: options.temperature
    });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setToCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Cleanup occasionnel
    if (this.cache.size > 1000) {
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

  // === METRICS AND ANALYTICS ===

  updateProviderMetrics(provider, success, responseTime) {
    this.metrics.providerUsage[provider] = (this.metrics.providerUsage[provider] || 0) + 1;
    
    if (success) {
      this.performanceHistory[provider].success++;
      this.metrics.responseTimes[provider].push(responseTime);
      
      // Mettre à jour la moyenne des temps de réponse
      const times = this.metrics.responseTimes[provider];
      this.performanceHistory[provider].avgResponseTime = 
        times.reduce((a, b) => a + b, 0) / times.length;
    } else {
      this.performanceHistory[provider].errors++;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      availableProviders: this.getAvailableProviders().length,
      performanceHistory: this.performanceHistory,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.requests > 0 ? 
        (this.metrics.cacheHits / this.metrics.requests) * 100 : 0
    };
  }

  getProviderStatus() {
    const status = {};
    Object.keys(this.providers).forEach(provider => {
      status[provider] = {
        available: this.providers[provider].available,
        usage: this.metrics.providerUsage[provider] || 0,
        performance: this.performanceHistory[provider]
      };
    });
    return status;
  }

  // === MIDDLEWARE SYSTEM ===

  addMiddleware(type, middleware) {
    if (this.middleware[type]) {
      this.middleware[type].push(middleware);
    }
  }

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

  async executeProviderSelectMiddleware(messages, options) {
    for (const middleware of this.middleware.providerSelect) {
      try {
        const result = await middleware({ messages, options });
        if (result && this.isProviderAvailable(result)) {
          return result;
        }
      } catch (error) {
        console.warn('Provider select middleware error:', error);
      }
    }
    return null;
  }

  // === UTILITY METHODS ===

  getAvailableProviders() {
    return Object.keys(this.providers).filter(
      provider => this.providers[provider].available
    );
  }

  isProviderAvailable(provider) {
    return this.providers[provider]?.available || false;
  }

  enhanceError(error, provider) {
    if (error.name === 'AbortError') {
      return new Error(`Timeout de la requête ${provider} (${this.config.defaultTimeout}ms)`);
    }
    
    if (error.message.includes('rate limit')) {
      return new Error(`Rate limit dépassé pour ${provider}. Réessayez dans quelques minutes.`);
    }
    
    if (error.message.includes('quota')) {
      return new Error(`Quota épuisé pour ${provider}. Vérifiez votre compte.`);
    }

    return new Error(`${provider} Error: ${error.message}`);
  }

  // === COMPATIBILITY METHODS ===

  async generateCode(prompt, language = 'javascript', context = '', options = {}) {
    const systemPrompt = `Tu es un expert développeur ${language}. Génère du code propre et professionnel.`;
    
    return await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${context ? context + '\n\n' : ''}${prompt}` }
    ], { ...options, provider: options.provider || 'deepseek' });
  }

  async correctCode(code, language = 'javascript', options = {}) {
    const systemPrompt = `Tu es un expert en correction de code ${language}.`;
    
    return await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Corrige et améliore ce code:\n\n${code}` }
    ], options);
  }

  // ... autres méthodes de compatibilité

  // === CONFIGURATION ===

  updateApiKeys(newApiKeys) {
    Object.keys(newApiKeys).forEach(provider => {
      if (this.providers[provider]) {
        this.providers[provider].apiKey = newApiKeys[provider];
        this.providers[provider].available = !!newApiKeys[provider];
      }
    });
    this.clearCache();
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  clearCache() {
    this.cache.clear();
  }

  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      providerUsage: {},
      responseTimes: {},
      cacheHits: 0,
      fallbacks: 0
    };
    this.initializeMetrics();
  }

  // === DESTRUCTOR ===

  destroy() {
    this.clearCache();
    this.middleware = {
      preRequest: [],
      postRequest: [],
      onError: [],
      providerSelect: []
    };
  }
}

export default MultiAIOrchestrator;