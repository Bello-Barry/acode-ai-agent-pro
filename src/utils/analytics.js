class Analytics {
  constructor(options = {}) {
    // Configuration avancée
    this.config = {
      enabled: options.enabled !== false,
      debug: options.debug || false,
      maxEvents: options.maxEvents || 1000,
      batchSize: options.batchSize || 50,
      flushInterval: options.flushInterval || 30000, // 30 secondes
      sessionTimeout: options.sessionTimeout || 1800000, // 30 minutes
      privacyLevel: options.privacyLevel || 'medium', // 'minimal' | 'medium' | 'detailed'
      ...options
    };

    // État et données
    this.events = [];
    this.session = this.initSession();
    this.user = this.initUser();
    this.metrics = this.initMetrics();
    
    // Cache et stockage
    this.eventQueue = [];
    this.cache = new Map();
    this.storageKey = 'ai-agent-pro-analytics';
    
    // Performance monitoring
    this.performance = {
      trackTime: 0,
      flushTime: 0,
      errors: 0
    };

    // Initialisation
    this.init();
  }

  init() {
    // Charger les données existantes
    this.loadFromStorage();
    
    // Démarrer le flush automatique
    this.startAutoFlush();
    
    // Track session start
    this.trackSessionStart();
    
    // Performance monitoring
    this.startPerformanceMonitoring();
  }

  initSession() {
    const sessionId = this.generateId();
    return {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      eventsCount: 0,
      isNew: true
    };
  }

  initUser() {
    // User anonyme avec respect de la vie privée
    const userId = this.getUserId();
    return {
      id: userId,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      sessionCount: 1,
      featureUsage: {},
      preferences: {}
    };
  }

  initMetrics() {
    return {
      events: {
        total: 0,
        byType: {},
        byHour: {},
        failed: 0
      },
      performance: {
        responseTimes: [],
        memoryUsage: [],
        errors: []
      },
      features: {
        usage: {},
        successRate: {},
        averageTime: {}
      },
      sessions: {
        total: 0,
        averageDuration: 0,
        longestDuration: 0
      }
    };
  }

  // === CORE TRACKING METHODS ===

  async track(eventName, properties = {}, options = {}) {
    if (!this.config.enabled) return null;

    const startTime = performance.now();
    
    try {
      // Mettre à jour la session
      this.updateSession();

      // Préparer l'événement
      const event = this.prepareEvent(eventName, properties, options);
      
      // Appliquer les règles de confidentialité
      this.applyPrivacyRules(event);

      // Ajouter à la file d'attente
      this.eventQueue.push(event);
      
      // Mettre à jour les métriques en temps réel
      this.updateRealtimeMetrics(event);

      // Flush si nécessaire
      if (this.shouldFlush()) {
        await this.flush();
      }

      // Performance tracking
      this.performance.trackTime += performance.now() - startTime;

      if (this.config.debug) {
        console.log(`📊 [Analytics] ${eventName}`, {
          properties,
          session: this.session.id,
          user: this.user.id
        });
      }

      return event;

    } catch (error) {
      this.performance.errors++;
      console.error('Analytics tracking error:', error);
      return null;
    }
  }

  async trackFeatureUsage(featureName, success = true, duration = 0, metadata = {}) {
    return await this.track('feature_used', {
      feature: featureName,
      success,
      duration,
      ...metadata
    }, {
      category: 'feature',
      priority: 'high'
    });
  }

  async trackError(error, context = {}) {
    const errorEvent = await this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_type: error.name,
      ...context
    }, {
      category: 'error',
      priority: 'critical'
    });

    // Alertes pour les erreurs critiques
    if (this.isCriticalError(error)) {
      await this.sendAlert('critical_error', errorEvent);
    }

    return errorEvent;
  }

  async trackPerformance(metricName, value, metadata = {}) {
    return await this.track('performance_metric', {
      metric: metricName,
      value: value,
      ...metadata
    }, {
      category: 'performance',
      priority: 'medium'
    });
  }

  // === SESSION MANAGEMENT ===

  updateSession() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.session.lastActivity;

    // Nouvelle session si timeout dépassé
    if (timeSinceLastActivity > this.config.sessionTimeout) {
      this.startNewSession();
    } else {
      this.session.lastActivity = now;
      this.session.eventsCount++;
    }

    this.user.lastSeen = now;
  }

  startNewSession() {
    // Sauvegarder l'ancienne session
    this.finalizeSession();

    // Nouvelle session
    this.session = this.initSession();
    this.session.isNew = false;
    this.user.sessionCount++;
    
    this.track('session_start', {
      session_number: this.user.sessionCount,
      previous_session_duration: this.metrics.sessions.averageDuration
    });
  }

  finalizeSession() {
    const duration = Date.now() - this.session.startTime;
    
    // Mettre à jour les métriques des sessions
    this.metrics.sessions.total++;
    this.metrics.sessions.longestDuration = Math.max(
      this.metrics.sessions.longestDuration, 
      duration
    );
    
    // Calculer la durée moyenne
    const totalDuration = this.metrics.sessions.averageDuration * (this.metrics.sessions.total - 1) + duration;
    this.metrics.sessions.averageDuration = totalDuration / this.metrics.sessions.total;

    this.track('session_end', {
      duration,
      events_count: this.session.eventsCount,
      page_views: this.session.pageViews
    });
  }

  trackSessionStart() {
    this.track('session_start', {
      is_new_user: this.session.isNew,
      user_session_count: this.user.sessionCount
    });
  }

  // === EVENT PROCESSING ===

  prepareEvent(eventName, properties, options = {}) {
    const timestamp = Date.now();
    const eventId = this.generateId();

    const baseProperties = {
      // Identifiants
      event_id: eventId,
      session_id: this.session.id,
      user_id: this.user.id,
      
      // Contexte technique
      timestamp,
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Contexte applicatif
      app_version: this.getAppVersion(),
      screen_resolution: `${screen.width}x${screen.height}`,
      connection_type: this.getConnectionType(),
      
      // Performance
      memory_usage: this.getMemoryUsage(),
      device_memory: navigator.deviceMemory || 'unknown'
    };

    return {
      id: eventId,
      name: eventName,
      timestamp,
      session_id: this.session.id,
      user_id: this.user.id,
      properties: {
        ...baseProperties,
        ...properties
      },
      metadata: {
        category: options.category || 'general',
        priority: options.priority || 'normal',
        source: options.source || 'auto',
        version: '1.0'
      }
    };
  }

  applyPrivacyRules(event) {
    const rules = {
      minimal: () => {
        // Supprimer les données personnelles identifiables
        delete event.properties.user_agent;
        delete event.properties.platform;
        delete event.properties.language;
        delete event.properties.user_id;
      },
      medium: () => {
        // Anonymiser certaines données
        event.properties.user_id = this.anonymizeId(event.properties.user_id);
        event.properties.session_id = this.anonymizeId(event.properties.session_id);
      },
      detailed: () => {
        // Garder toutes les données
        // Mais hash les identifiants pour la cohérence
        event.properties.user_id = this.hashId(event.properties.user_id);
        event.properties.session_id = this.hashId(event.properties.session_id);
      }
    };

    const applyRule = rules[this.config.privacyLevel] || rules.medium;
    applyRule();
  }

  updateRealtimeMetrics(event) {
    // Métriques par type d'événement
    this.metrics.events.total++;
    this.metrics.events.byType[event.name] = (this.metrics.events.byType[event.name] || 0) + 1;
    
    // Métriques horaires
    const hour = new Date(event.timestamp).getHours();
    this.metrics.events.byHour[hour] = (this.metrics.events.byHour[hour] || 0) + 1;
    
    // Usage des features
    if (event.metadata.category === 'feature') {
      const featureName = event.properties.feature;
      if (featureName) {
        this.metrics.features.usage[featureName] = (this.metrics.features.usage[featureName] || 0) + 1;
        
        // Succès/échec
        if (event.properties.success !== undefined) {
          const key = `${featureName}_${event.properties.success ? 'success' : 'failure'}`;
          this.metrics.features.successRate[key] = (this.metrics.features.successRate[key] || 0) + 1;
        }
        
        // Temps d'exécution
        if (event.properties.duration) {
          if (!this.metrics.features.averageTime[featureName]) {
            this.metrics.features.averageTime[featureName] = {
              total: 0,
              count: 0,
              average: 0
            };
          }
          const metric = this.metrics.features.averageTime[featureName];
          metric.total += event.properties.duration;
          metric.count++;
          metric.average = metric.total / metric.count;
        }
      }
    }
  }

  // === STORAGE AND FLUSHING ===

  async flush() {
    if (this.eventQueue.length === 0) return;

    const flushStartTime = performance.now();
    const eventsToFlush = this.eventQueue.splice(0, this.config.batchSize);

    try {
      // Ajouter aux événements principaux
      this.events.push(...eventsToFlush);
      
      // Limiter la taille
      if (this.events.length > this.config.maxEvents) {
        this.events = this.events.slice(-this.config.maxEvents);
      }

      // Sauvegarder
      await this.saveToStorage();
      
      // Envoyer aux serveurs (si configuré)
      if (this.config.remoteEndpoint) {
        await this.sendToRemote(eventsToFlush);
      }

      this.performance.flushTime += performance.now() - flushStartTime;

      if (this.config.debug) {
        console.log(`📦 [Analytics] Flushed ${eventsToFlush.length} events`);
      }

    } catch (error) {
      this.performance.errors++;
      console.error('Analytics flush error:', error);
      
      // Re-add events to queue on failure
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  shouldFlush() {
    return this.eventQueue.length >= this.config.batchSize;
  }

  startAutoFlush() {
    this.flushInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  // === STORAGE MANAGEMENT ===

  async saveToStorage() {
    try {
      const appSettings = acode.require('settings');
      const data = {
        events: this.events.slice(-200), // Garder les 200 derniers
        user: this.user,
        session: this.session,
        metrics: this.metrics,
        lastUpdate: Date.now(),
        version: '2.0'
      };

      await appSettings.update(this.storageKey, data);
      
      if (this.config.debug) {
        console.log('💾 [Analytics] Saved to storage');
      }

    } catch (error) {
      console.warn('Impossible de sauvegarder les analytics:', error);
    }
  }

  async loadFromStorage() {
    try {
      const appSettings = acode.require('settings');
      const data = await appSettings.get(this.storageKey);

      if (data) {
        this.events = data.events || [];
        this.user = { ...this.user, ...data.user };
        this.metrics = { ...this.metrics, ...data.metrics };
        
        if (this.config.debug) {
          console.log('📂 [Analytics] Loaded from storage:', {
            events: this.events.length,
            user: this.user.id
          });
        }
      }
    } catch (error) {
      console.warn('Impossible de charger les analytics:', error);
    }
  }

  // === ANALYTICS AND INSIGHTS ===

  getComprehensiveStats() {
    const stats = this.getBasicStats();
    
    // Insights avancés
    stats.insights = {
      busiestHour: this.getBusiestHour(),
      mostUsedFeature: this.getMostUsedFeature(),
      userEngagement: this.calculateEngagementScore(),
      errorRate: this.calculateErrorRate(),
      performanceScore: this.calculatePerformanceScore()
    };

    // Tendances
    stats.trends = {
      dailyActivity: this.getDailyActivity(),
      featureAdoption: this.getFeatureAdoption(),
      userRetention: this.calculateRetention()
    };

    // Recommandations
    stats.recommendations = this.generateRecommendations();

    return stats;
  }

  getBasicStats() {
    const sessionDuration = Date.now() - this.session.startTime;
    
    return {
      user: {
        id: this.user.id,
        sessionCount: this.user.sessionCount,
        firstSeen: new Date(this.user.firstSeen).toISOString()
      },
      session: {
        id: this.session.id,
        duration: sessionDuration,
        events: this.session.eventsCount,
        pageViews: this.session.pageViews
      },
      events: {
        total: this.metrics.events.total,
        byType: this.metrics.events.byType,
        queue: this.eventQueue.length
      },
      features: {
        usage: this.metrics.features.usage,
        successRate: this.calculateFeatureSuccessRates(),
        performance: this.metrics.features.averageTime
      },
      performance: {
        trackTime: this.performance.trackTime,
        flushTime: this.performance.flushTime,
        errors: this.performance.errors
      }
    };
  }

  getMostUsedFeatures(limit = 10) {
    const features = Object.entries(this.metrics.features.usage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({
        name,
        count,
        successRate: this.calculateFeatureSuccessRate(name),
        averageTime: this.metrics.features.averageTime[name]?.average || 0
      }));

    return features;
  }

  getFeatureUsageTrend(featureName, days = 7) {
    // Analyser l'usage d'une feature sur une période
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const trend = [];

    for (let i = days - 1; i >= 0; i--) {
      const startTime = now - (i * dayInMs);
      const endTime = startTime + dayInMs;
      
      const dailyUsage = this.events.filter(event => 
        event.name === 'feature_used' &&
        event.properties.feature === featureName &&
        event.timestamp >= startTime &&
        event.timestamp < endTime
      ).length;

      trend.push({
        date: new Date(startTime).toISOString().split('T')[0],
        usage: dailyUsage
      });
    }

    return trend;
  }

  // === UTILITY METHODS ===

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    // Générer un ID utilisateur cohérent mais anonyme
    try {
      const appSettings = acode.require('settings');
      const existing = appSettings.get('ai-agent-user-id');
      if (existing) return existing;
      
      const newId = this.generateId();
      appSettings.update('ai-agent-user-id', newId);
      return newId;
    } catch (error) {
      return this.generateId();
    }
  }

  getAppVersion() {
    return '2.0.0'; // À synchroniser avec package.json
  }

  getConnectionType() {
    return navigator.connection ? navigator.connection.effectiveType : 'unknown';
  }

  getMemoryUsage() {
    return performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 'unknown';
  }

  anonymizeId(id) {
    // Anonymiser un ID tout en gardant la cohérence
    return btoa(id).substring(0, 8);
  }

  hashId(id) {
    // Hash simple pour la cohérence
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  isCriticalError(error) {
    const criticalPatterns = [
      /quota/i,
      /network/i,
      /timeout/i,
      /security/i,
      /authentication/i
    ];
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  // === PERFORMANCE MONITORING ===

  startPerformanceMonitoring() {
    this.performanceMonitor = setInterval(() => {
      this.trackPerformance('memory_usage', this.getMemoryUsage());
      this.trackPerformance('event_queue_size', this.eventQueue.length);
    }, 60000); // Toutes les minutes
  }

  // === ADVANCED ANALYTICS CALCULATIONS ===

  calculateEngagementScore() {
    const sessionDuration = Date.now() - this.session.startTime;
    const eventsPerMinute = this.session.eventsCount / (sessionDuration / 60000);
    
    return Math.min(100, eventsPerMinute * 10); // Score basé sur l'activité
  }

  calculateErrorRate() {
    const totalEvents = this.metrics.events.total;
    const errorEvents = this.metrics.events.byType['error_occurred'] || 0;
    
    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
  }

  calculateFeatureSuccessRate(featureName) {
    const success = this.metrics.features.successRate[`${featureName}_success`] || 0;
    const failure = this.metrics.features.successRate[`${featureName}_failure`] || 0;
    const total = success + failure;
    
    return total > 0 ? (success / total) * 100 : 100;
  }

  calculateFeatureSuccessRates() {
    const rates = {};
    Object.keys(this.metrics.features.usage).forEach(feature => {
      rates[feature] = this.calculateFeatureSuccessRate(feature);
    });
    return rates;
  }

  getBusiestHour() {
    return Object.entries(this.metrics.events.byHour)
      .sort((a, b) => b[1] - a[1])[0] || ['0', 0];
  }

  getMostUsedFeature() {
    const features = this.getMostUsedFeatures(1);
    return features[0] || { name: 'none', count: 0 };
  }

  calculatePerformanceScore() {
    // Score basé sur les temps de réponse et erreurs
    const errorPenalty = this.performance.errors * 10;
    const timeScore = Math.max(0, 100 - (this.performance.trackTime / 100));
    
    return Math.max(0, timeScore - errorPenalty);
  }

  // === DATA EXPORT AND MANAGEMENT ===

  exportData(format = 'json') {
    const data = {
      export_date: new Date().toISOString(),
      version: '2.0',
      user: this.user,
      session: this.session,
      metrics: this.metrics,
      events: this.events,
      stats: this.getComprehensiveStats()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      default:
        return data;
    }
  }

  convertToCSV(data) {
    // Conversion basique en CSV
    const events = data.events || [];
    if (events.length === 0) return '';
    
    const headers = ['timestamp', 'event_name', 'session_id', 'user_id'];
    const rows = events.map(event => [
      new Date(event.timestamp).toISOString(),
      event.name,
      event.session_id,
      event.user_id
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  clear() {
    this.events = [];
    this.eventQueue = [];
    this.metrics = this.initMetrics();
    this.saveToStorage();
  }

  disable() {
    this.config.enabled = false;
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
    }
  }

  enable() {
    this.config.enabled = true;
    this.startAutoFlush();
    this.startPerformanceMonitoring();
  }

  // === DESTRUCTOR ===

  destroy() {
    this.disable();
    this.finalizeSession();
    this.flush();
  }
}

export default Analytics;