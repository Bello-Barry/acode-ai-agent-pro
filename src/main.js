import plugin from '../plugin.json';
import DeepSeekAPI from './api/deepseek.js';
import CodeGenerator from './features/codeGenerator.js';
import CodeCorrector from './features/codeCorrector.js';
import ProjectCreator from './features/projectCreator.js';
import CodeSuggester from './features/codeSuggester.js';
import ContextAnalyzer from './features/contextAnalyzer.js';
import MultiAIOrchestrator from './api/multiAIOrchestrator.js';
import Sidebar from './ui/sidebar.js';
import Dialogs from './ui/dialogs.js';
import Analytics from './utils/analytics.js';

const appSettings = acode.require('settings');
const fs = acode.require('fs');

class AIAgentPlugin {
  constructor() {
    this.id = plugin.id;
    this.version = plugin.version;
    this.baseUrl = null;
    this.apiKey = null;
    this.deepseek = null;
    this.multiAI = null;
    this.codeGenerator = null;
    this.codeCorrector = null;
    this.projectCreator = null;
    this.codeSuggester = null;
    this.contextAnalyzer = new ContextAnalyzer();
    this.analytics = new Analytics();
    this.sidebar = null;
    this.dialogs = null;
    this.commandsAdded = false;
    this.isInitialized = false;
    
    // Configuration avancée
    this.config = {
      enableAutoSuggestions: true,
      enableCodeAnalysis: true,
      enableMultiAI: false,
      preferredAI: 'deepseek',
      maxFileSize: 100000, // 100KB
      cacheResponses: true,
      languagePreferences: {}
    };
  }

  async init($page, cacheFile, cacheFileUrl) {
    if (this.isInitialized) {
      console.log('AI Agent Pro: Déjà initialisé');
      return;
    }

    try {
      // Charger les paramètres étendus
      await this.loadSettings();

      // Initialiser le système multi-IA
      this.multiAI = new MultiAIOrchestrator({
        deepseek: this.apiKey,
        gemini: this.geminiKey,
        openai: this.openaiKey
      });

      // Initialiser les modules avec dépendances
      this.initializeModules();

      // Configuration de l'interface
      await this.setupInterface();

      // Démarrer les services en arrière-plan
      this.startBackgroundServices();

      // Analytics
      await this.analytics.track('plugin_initialized', {
        version: this.version,
        hasApiKey: !!this.apiKey,
        features: Object.keys(this.config).filter(k => this.config[k])
      });

      console.log(`AI Agent Pro v${this.version} initialisé avec succès 🚀`);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('AI Agent Pro: Erreur d\'initialisation', error);
      await this.handleInitializationError(error);
    }
  }

  initializeModules() {
    // Initialiser avec l'orchestrateur multi-IA ou DeepSeek seul
    const aiProvider = this.config.enableMultiAI ? this.multiAI : this.deepseek;
    
    this.codeGenerator = new CodeGenerator(aiProvider, this.contextAnalyzer);
    this.codeCorrector = new CodeCorrector(aiProvider, this.contextAnalyzer);
    this.projectCreator = new ProjectCreator(aiProvider, this.contextAnalyzer);
    this.codeSuggester = new CodeSuggester(aiProvider, this.contextAnalyzer);
    this.dialogs = new Dialogs();
    this.sidebar = new Sidebar(this);
  }

  async setupInterface() {
    // Ajouter les commandes avancées
    this.addEnhancedCommands();

    // Initialiser la sidebar avec onglets multiples
    await this.sidebar.initialize();

    // Ajouter les styles personnalisés
    this.injectCustomStyles();

    // Message de bienvenue contextuel
    await this.showContextualWelcome();
  }

  startBackgroundServices() {
    // Service d'analyse de code en temps réel
    if (this.config.enableCodeAnalysis) {
      this.startCodeAnalysisService();
    }

    // Service de suggestions automatiques
    if (this.config.enableAutoSuggestions) {
      this.startAutoSuggestionService();
    }

    // Service de mise à jour des modèles
    this.startModelUpdateService();
  }

  async loadSettings() {
    try {
      const settings = await appSettings.get(this.id) || {};
      
      // Paramètres de base
      this.apiKey = settings.apiKey || '';
      this.geminiKey = settings.geminiKey || '';
      this.openaiKey = settings.openaiKey || '';
      
      // Paramètres des modèles
      this.model = settings.model || 'deepseek-coder';
      this.temperature = settings.temperature ?? 0.7;
      this.maxTokens = settings.maxTokens ?? 4096;
      this.topP = settings.topP ?? 0.9;
      
      // Configuration avancée
      this.config = {
        ...this.config,
        ...settings.config
      };

      // Initialiser DeepSeek même si multi-IA est activé
      if (this.apiKey) {
        this.deepseek = new DeepSeekAPI(this.apiKey, {
          model: this.model,
          temperature: this.temperature,
          maxTokens: this.maxTokens
        });
      }

    } catch (error) {
      console.error('Erreur de chargement des paramètres:', error);
      throw new Error(`Impossible de charger les paramètres: ${error.message}`);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        apiKey: this.apiKey,
        geminiKey: this.geminiKey,
        openaiKey: this.openaiKey,
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        topP: this.topP,
        config: this.config
      };

      await appSettings.update(this.id, settings);
      
      // Re-initialiser les modules si nécessaire
      if (this.isInitialized) {
        this.initializeModules();
      }
    } catch (error) {
      console.error('Erreur de sauvegarde des paramètres:', error);
      throw new Error(`Impossible de sauvegarder les paramètres: ${error.message}`);
    }
  }

  addEnhancedCommands() {
    if (this.commandsAdded) return;

    const enhancedCommands = [
      // Génération de code
      {
        name: 'AI Agent: Générer du code intelligent',
        description: 'Génération contextuelle avec analyse du projet',
        exec: () => this.generateSmartCode(),
        category: 'generation',
        shortcut: 'Ctrl+Alt+G'
      },
      {
        name: 'AI Agent: Générer à partir d\'un schéma',
        description: 'Créer du code à partir d\'un schéma ou mockup',
        exec: () => this.generateFromSchema(),
        category: 'generation'
      },

      // Correction et optimisation
      {
        name: 'AI Agent: Corriger et optimiser',
        description: 'Correction avancée avec optimisation des performances',
        exec: () => this.correctAndOptimize(),
        category: 'correction',
        shortcut: 'Ctrl+Alt+C'
      },
      {
        name: 'AI Agent: Audit de sécurité',
        description: 'Analyser les vulnérabilités de sécurité',
        exec: () => this.securityAudit(),
        category: 'correction'
      },

      // Analyse et documentation
      {
        name: 'AI Agent: Analyse complète',
        description: 'Analyse détaillée avec métriques et suggestions',
        exec: () => this.comprehensiveAnalysis(),
        category: 'analysis'
      },
      {
        name: 'AI Agent: Documentation interactive',
        description: 'Générer une documentation interactive',
        exec: () => this.generateInteractiveDocs(),
        category: 'documentation'
      },

      // Gestion de projet
      {
        name: 'AI Agent: Créer un projet avancé',
        description: 'Création de projet avec architecture moderne',
        exec: () => this.createAdvancedProject(),
        category: 'project'
      },
      {
        name: 'AI Agent: Migrer un projet',
        description: 'Migrer vers une nouvelle version/technologie',
        exec: () => this.migrateProject(),
        category: 'project'
      },

      // Tests et qualité
      {
        name: 'AI Agent: Suite de tests complète',
        description: 'Générer tests unitaires, d\'intégration et E2E',
        exec: () => this.generateTestSuite(),
        category: 'testing'
      },
      {
        name: 'AI Agent: Analyse de couverture',
        description: 'Analyser et améliorer la couverture de tests',
        exec: () => this.analyzeTestCoverage(),
        category: 'testing'
      },

      // Refactoring avancé
      {
        name: 'AI Agent: Refactoring intelligent',
        description: 'Refactoring avec préservation des fonctionnalités',
        exec: () => this.smartRefactor(),
        category: 'refactoring'
      },
      {
        name: 'AI Agent: Moderniser le code',
        description: 'Mettre à jour vers les standards modernes',
        exec: () => this.modernizeCode(),
        category: 'refactoring'
      },

      // Outils développeur
      {
        name: 'AI Agent: Debug intelligent',
        description: 'Aide au debugging avec analyse des erreurs',
        exec: () => this.smartDebug(),
        category: 'tools'
      },
      {
        name: 'AI Agent: Optimiser les performances',
        description: 'Analyse et optimisation des performances',
        exec: () => this.performanceOptimize(),
        category: 'tools'
      },
      {
        name: 'AI Agent: Générer des composants',
        description: 'Créer des composants réutilisables',
        exec: () => this.generateComponents(),
        category: 'tools'
      }
    ];

    // Ajouter les commandes au gestionnaire
    enhancedCommands.forEach(cmd => {
      try {
        editorManager.editor.commands.addCommand({
          name: cmd.name,
          description: cmd.description,
          exec: cmd.exec,
          bindKey: cmd.shortcut
        });
      } catch (error) {
        console.warn(`Impossible d'ajouter la commande ${cmd.name}:`, error);
      }
    });

    this.commandsAdded = true;
  }

  // === NOUVELLES FONCTIONNALITÉS AVANCÉES ===

  async generateSmartCode() {
    if (!this.checkAPIKey()) return;

    try {
      // Analyse contextuelle préalable
      const context = await this.analyzeCurrentContext();
      
      const prompt = await this.dialogs.smartPrompt(
        'Génération de code intelligent',
        'Décrivez la fonctionnalité souhaitée:',
        {
          context: context.summary,
          suggestions: this.getContextualSuggestions(context)
        }
      );

      if (!prompt) return;

      const loaderId = 'smart-generate';
      acode.loader.create(loaderId, '🧠 Analyse contextuelle et génération...');

      const result = await this.codeGenerator.generateSmart(
        prompt, 
        context,
        {
          includeTests: true,
          includeDocs: true,
          followPatterns: true
        }
      );

      acode.loader.destroy(loaderId);

      if (result) {
        await this.dialogs.showSmartResult('Code généré', result, {
          canApply: true,
          canEdit: true,
          showExplanation: true
        });
      }

      await this.analytics.track('smart_generation', {
        language: context.language,
        hasContext: !!context,
        success: !!result
      });

    } catch (error) {
      await this.handleFeatureError('generateSmartCode', error);
    }
  }

  async correctAndOptimize() {
    if (!this.checkAPIKey()) return;

    try {
      const selectedText = editorManager.editor.getSelectedText();
      const code = selectedText || editorManager.activeFile.session.getValue();

      if (!this.validateCodeInput(code)) return;

      const context = await this.analyzeCurrentContext();
      
      const loaderId = 'correct-optimize';
      acode.loader.create(loaderId, '🔧 Correction et optimisation avancée...');

      const result = await this.codeCorrector.correctAndOptimize(code, context, {
        fixErrors: true,
        optimizePerformance: true,
        improveReadability: true,
        applyBestPractices: true
      });

      acode.loader.destroy(loaderId);

      if (result) {
        await this.dialogs.showOptimizationResult('Résultat de l\'optimisation', result, {
          originalCode: code,
          context: context
        });
      }

    } catch (error) {
      await this.handleFeatureError('correctAndOptimize', error);
    }
  }

  async comprehensiveAnalysis() {
    if (!this.checkAPIKey()) return;

    try {
      const code = editorManager.activeFile.session.getValue();
      if (!this.validateCodeInput(code)) return;

      const loaderId = 'comprehensive-analysis';
      acode.loader.create(loaderId, '📊 Analyse complète du code...');

      const analysis = await this.codeCorrector.comprehensiveAnalysis(code, {
        quality: true,
        performance: true,
        security: true,
        maintainability: true,
        documentation: true
      });

      acode.loader.destroy(loaderId);

      if (analysis) {
        await this.dialogs.showAnalysisReport('Rapport d\'analyse complet', analysis);
      }

    } catch (error) {
      await this.handleFeatureError('comprehensiveAnalysis', error);
    }
  }

  async createAdvancedProject() {
    if (!this.checkAPIKey()) return;

    try {
      const projectConfig = await this.dialogs.advancedProjectSetup();
      if (!projectConfig) return;

      const loaderId = 'advanced-project';
      acode.loader.create(loaderId, `🚀 Création du projet ${projectConfig.type}...`);

      const result = await this.projectCreator.createAdvanced(projectConfig);

      acode.loader.destroy(loaderId);

      if (result.success) {
        await this.dialogs.showProjectResult('Projet créé', result, {
          showStructure: true,
          showNextSteps: true,
          canOpen: true
        });
      }

    } catch (error) {
      await this.handleFeatureError('createAdvancedProject', error);
    }
  }

  async generateTestSuite() {
    if (!this.checkAPIKey()) return;

    try {
      const code = editorManager.activeFile.session.getValue();
      if (!this.validateCodeInput(code)) return;

      const context = await this.analyzeCurrentContext();
      
      const testConfig = await this.dialogs.testSuiteConfiguration();
      if (!testConfig) return;

      const loaderId = 'test-suite';
      acode.loader.create(loaderId, '🧪 Génération de la suite de tests...');

      const testSuite = await this.codeGenerator.generateTestSuite(code, context, testConfig);

      acode.loader.destroy(loaderId);

      if (testSuite) {
        await this.dialogs.showTestSuite('Suite de tests générée', testSuite, {
          canCreateFiles: true,
          showCoverage: true
        });
      }

    } catch (error) {
      await this.handleFeatureError('generateTestSuite', error);
    }
  }

  async smartRefactor() {
    if (!this.checkAPIKey()) return;

    try {
      const selectedText = editorManager.editor.getSelectedText();
      if (!this.validateCodeInput(selectedText, 'Sélectionnez du code à refactoriser')) return;

      const context = await this.analyzeCurrentContext();
      const refactorOptions = await this.dialogs.refactorOptions();

      const loaderId = 'smart-refactor';
      acode.loader.create(loaderId, '🔄 Refactoring intelligent...');

      const result = await this.codeCorrector.smartRefactor(selectedText, context, refactorOptions);

      acode.loader.destroy(loaderId);

      if (result) {
        await this.dialogs.showRefactorResult('Refactoring terminé', result, {
          originalCode: selectedText,
          showMetrics: true
        });
      }

    } catch (error) {
      await this.handleFeatureError('smartRefactor', error);
    }
  }

  // === MÉTHODES UTILITAIRES AVANCÉES ===

  async analyzeCurrentContext() {
    const file = editorManager.activeFile;
    const code = file.session.getValue();
    const cursorPos = editorManager.editor.getCursorPosition();

    return await this.contextAnalyzer.analyzeContext({
      file,
      code,
      cursorPos,
      project: await this.getProjectContext()
    });
  }

  async getProjectContext() {
    try {
      // Analyser la structure du projet actuel
      const files = await this.getProjectFiles();
      return {
        fileCount: files.length,
        languages: this.analyzeProjectLanguages(files),
        frameworks: this.detectProjectFrameworks(files),
        structure: this.analyzeProjectStructure(files)
      };
    } catch (error) {
      console.warn('Impossible d\'analyser le projet:', error);
      return {};
    }
  }

  validateCodeInput(code, message = 'Le code est vide ou trop volumineux') {
    if (!code || code.trim() === '') {
      window.toast(message, 3000);
      return false;
    }

    if (code.length > this.config.maxFileSize) {
      window.toast('Le code est trop volumineux pour l\'analyse', 3000);
      return false;
    }

    return true;
  }

  async handleFeatureError(feature, error) {
    console.error(`Erreur dans ${feature}:`, error);
    
    const loaderId = feature.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();
    acode.loader.destroy(loaderId);

    // Gestion d'erreur avancée
    if (error.message.includes('API') || error.message.includes('network')) {
      await this.dialogs.showError(
        'Erreur de connexion',
        'Vérifiez votre connexion internet et votre clé API',
        error.message
      );
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      await this.dialogs.showError(
        'Limite atteinte',
        'Vous avez atteint la limite d\'utilisation. Essayez plus tard ou utilisez une autre clé API.',
        error.message
      );
    } else {
      await this.dialogs.showError(
        'Erreur inattendue',
        'Une erreur est survenue lors de l\'exécution',
        error.message
      );
    }

    await this.analytics.track('feature_error', {
      feature,
      error: error.message,
      timestamp: Date.now()
    });
  }

  async handleInitializationError(error) {
    const errorMessage = error.message || 'Erreur inconnue';
    
    await this.dialogs.showError(
      'Erreur d\'initialisation',
      'Le plugin n\'a pas pu être initialisé correctement',
      errorMessage
    );

    // Tentative de récupération
    if (errorMessage.includes('settings')) {
      await this.resetSettings();
    }
  }

  async resetSettings() {
    try {
      await appSettings.update(this.id, {});
      this.apiKey = '';
      this.config = this.getDefaultConfig();
      window.toast('Paramètres réinitialisés. Redémarrez le plugin.', 4000);
    } catch (error) {
      console.error('Erreur de réinitialisation:', error);
    }
  }

  getDefaultConfig() {
    return {
      enableAutoSuggestions: true,
      enableCodeAnalysis: true,
      enableMultiAI: false,
      preferredAI: 'deepseek',
      maxFileSize: 100000,
      cacheResponses: true,
      languagePreferences: {}
    };
  }

  injectCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .ai-agent-pro {
        --primary-color: #6366f1;
        --success-color: #10b981;
        --warning-color: #f59e0b;
        --error-color: #ef4444;
      }
      
      .ai-agent-sidebar {
        border-left: 2px solid var(--primary-color);
      }
      
      .ai-agent-suggestion {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
      }
    `;
    document.head.appendChild(style);
  }

  async showContextualWelcome() {
    if (!this.apiKey) {
      const setup = await this.dialogs.showWelcome({
        version: this.version,
        features: this.getAvailableFeatures()
      });
      
      if (setup && setup.configureNow) {
        await this.showEnhancedSettings();
      }
    } else {
      window.toast(`AI Agent Pro v${this.version} activé ! 🚀`, 3000);
    }
  }

  getAvailableFeatures() {
    return {
      generation: ['smart_code', 'from_schema', 'components'],
      correction: ['optimize', 'security', 'refactor'],
      analysis: ['comprehensive', 'performance', 'coverage'],
      project: ['advanced', 'migration', 'scaffolding'],
      testing: ['suite', 'coverage', 'mocks']
    };
  }

  // === MÉTHODES EXISTANTES AMÉLIORÉES ===

  async showEnhancedSettings() {
    const settings = await this.dialogs.showEnhancedSettings({
      apiKeys: {
        deepseek: this.apiKey,
        gemini: this.geminiKey,
        openai: this.openaiKey
      },
      modelConfig: {
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        topP: this.topP
      },
      features: this.config
    });

    if (settings) {
      // Mettre à jour les clés API
      this.apiKey = settings.apiKeys.deepseek;
      this.geminiKey = settings.apiKeys.gemini;
      this.openaiKey = settings.apiKeys.openai;
      
      // Mettre à jour la configuration des modèles
      this.model = settings.modelConfig.model;
      this.temperature = settings.modelConfig.temperature;
      this.maxTokens = settings.modelConfig.maxTokens;
      this.topP = settings.modelConfig.topP;
      
      // Mettre à jour les fonctionnalités
      this.config = { ...this.config, ...settings.features };

      await this.saveSettings();
      
      // Re-initialiser les services
      this.initializeModules();
      
      window.toast('Configuration avancée sauvegardée ! ✅', 3000);
    }
  }

  checkAPIKey() {
    if (!this.apiKey && !this.geminiKey && !this.openaiKey) {
      this.dialogs.showNoAPIKey({
        onConfigure: () => this.showEnhancedSettings(),
        onLearnMore: () => this.showAPIDocumentation()
      });
      return false;
    }
    return true;
  }

  async destroy() {
    try {
      this.isInitialized = false;
      
      if (this.sidebar) {
        this.sidebar.destroy();
      }

      // Arrêter les services en arrière-plan
      this.backgroundServices.forEach(service => {
        if (service.stop) service.stop();
      });

      // Nettoyer les ressources
      this.cleanupResources();

      console.log('AI Agent Pro: Plugin désactivé proprement');
    } catch (error) {
      console.error('Erreur lors de la destruction:', error);
    }
  }

  cleanupResources() {
    // Nettoyer le cache
    if (this.codeSuggester?.cache) {
      this.codeSuggester.cache.clear();
    }
    
    // Supprimer les styles
    const styles = document.querySelectorAll('style[data-ai-agent]');
    styles.forEach(style => style.remove());
    
    // Nettoyer les écouteurs d'événements
    window.removeEventListener('ai-agent-custom', this.customEventHandler);
  }
}

// Initialisation globale améliorée
if (typeof window !== 'undefined' && window.acode) {
  const pluginInstance = new AIAgentPlugin();
  
  // Enregistrement avec gestion d'erreur améliorée
  try {
    acode.setPluginInit(
      pluginInstance.id,
      async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
        if (!baseUrl.endsWith('/')) baseUrl += '/';
        pluginInstance.baseUrl = baseUrl;
        await pluginInstance.init($page, cacheFile, cacheFileUrl);
      }
    );

    acode.setPluginUnmount(pluginInstance.id, () => {
      pluginInstance.destroy();
    });

    // Exposer l'instance pour le débogage
    window.aiAgentPro = pluginInstance;

  } catch (error) {
    console.error('Échec de l\'enregistrement du plugin:', error);
  }
}

export default AIAgentPlugin;