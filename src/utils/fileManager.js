const fs = acode.require('fs');

class FileManager {
  constructor(options = {}) {
    // Configuration avancée
    this.config = {
      enableCache: options.enableCache !== false,
      enableMonitoring: options.enableMonitoring !== false,
      enableBackup: options.enableBackup !== false,
      maxCacheSize: options.maxCacheSize || 100,
      autoRecovery: options.autoRecovery !== false,
      chunkSize: options.chunkSize || 1024 * 1024, // 1MB
      retryAttempts: options.retryAttempts || 3,
      timeout: options.timeout || 30000,
      ...options
    };

    // Cache intelligent
    this.cache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;

    // Monitoring et métriques
    this.metrics = {
      operations: {
        read: 0,
        write: 0,
        delete: 0,
        create: 0
      },
      performance: {
        averageReadTime: 0,
        averageWriteTime: 0,
        totalBytesRead: 0,
        totalBytesWritten: 0
      },
      errors: {
        total: 0,
        byType: {}
      }
    };

    // Système de backup
    this.backupHistory = new Map();
    this.maxBackups = options.maxBackups || 10;

    // File d'attente pour les opérations critiques
    this.operationQueue = [];
    this.isProcessingQueue = false;

    // Initialisation
    this.init();
  }

  init() {
    // Démarrer le monitoring si activé
    if (this.config.enableMonitoring) {
      this.startPerformanceMonitoring();
    }

    // Nettoyage périodique du cache
    this.startCacheCleanup();
  }

  // === CORE FILE OPERATIONS ===

  async createFile(path, content = '', options = {}) {
    const operationId = this.startOperation('create');
    
    try {
      this.validatePath(path);
      
      // Vérifier si le fichier existe déjà
      if (await this.exists(path) && !options.overwrite) {
        throw new Error(`Le fichier existe déjà: ${path}`);
      }

      // Créer les dossiers parents si nécessaire
      await this.ensureDirectoryExists(this.getParentPath(path));

      const fileName = this.getFileName(path);
      
      // Utiliser l'éditeur Acode pour les fichiers édités
      if (options.openInEditor !== false) {
        await editorManager.addNewFile(fileName, {
          text: content,
          uri: path,
          isUnsaved: false
        });
        await editorManager.activeFile.saveAs(path);
      } else {
        // Création directe via fs
        await this.retryOperation(() => fs(path).writeFile(content));
      }

      // Mettre en cache
      if (this.config.enableCache) {
        this.cache.set(path, {
          content,
          timestamp: Date.now(),
          size: content.length
        });
      }

      // Backup si activé
      if (this.config.enableBackup) {
        await this.createBackup(path, content, 'create');
      }

      this.recordSuccess('create', path, content.length);
      return this.wrapResult(true, { path, size: content.length });

    } catch (error) {
      this.recordError('create', error, path);
      throw this.enhanceError(error, 'create', path);
    } finally {
      this.endOperation(operationId);
    }
  }

  async createDirectory(path, options = {}) {
    const operationId = this.startOperation('create');
    
    try {
      this.validatePath(path);

      if (await this.exists(path)) {
        if (!options.overwrite) {
          throw new Error(`Le dossier existe déjà: ${path}`);
        }
        return this.wrapResult(true, { path, existing: true });
      }

      const parentPath = this.getParentPath(path);
      if (parentPath && !await this.exists(parentPath)) {
        await this.createDirectory(parentPath, { recursive: true });
      }

      await this.retryOperation(() => fs(parentPath).createDirectory(this.getFileName(path)));
      
      this.recordSuccess('create', path);
      return this.wrapResult(true, { path });

    } catch (error) {
      this.recordError('create', error, path);
      throw this.enhanceError(error, 'create', path);
    } finally {
      this.endOperation(operationId);
    }
  }

  async readFile(path, options = {}) {
    const operationId = this.startOperation('read');
    
    try {
      this.validatePath(path);

      // Vérifier le cache
      if (this.config.enableCache && !options.forceRefresh) {
        const cached = this.cache.get(path);
        if (cached && Date.now() - cached.timestamp < (options.cacheTTL || 300000)) {
          this.cacheHits++;
          this.recordSuccess('read', path, cached.size);
          return this.wrapResult(cached.content, { cached: true, size: cached.size });
        }
        this.cacheMisses++;
      }

      // Lecture du fichier
      const content = await this.retryOperation(() => fs(path).readFile('utf-8'));
      const size = content.length;

      // Mettre en cache
      if (this.config.enableCache) {
        this.cache.set(path, {
          content,
          timestamp: Date.now(),
          size
        });
      }

      this.recordSuccess('read', path, size);
      return this.wrapResult(content, { size, cached: false });

    } catch (error) {
      this.recordError('read', error, path);
      throw this.enhanceError(error, 'read', path);
    } finally {
      this.endOperation(operationId);
    }
  }

  async writeFile(path, content, options = {}) {
    const operationId = this.startOperation('write');
    
    try {
      this.validatePath(path);

      // Backup avant écriture
      let backupContent = null;
      if (this.config.enableBackup && await this.exists(path)) {
        try {
          backupContent = await this.readFile(path, { cache: false });
        } catch (error) {
          console.warn('Impossible de sauvegarder avant écriture:', error);
        }
      }

      // Écriture du fichier
      await this.retryOperation(() => fs(path).writeFile(content));

      // Mettre à jour le cache
      if (this.config.enableCache) {
        this.cache.set(path, {
          content,
          timestamp: Date.now(),
          size: content.length
        });
      }

      // Sauvegarder le backup
      if (backupContent) {
        await this.createBackup(path, backupContent, 'modify');
      }

      this.recordSuccess('write', path, content.length);
      return this.wrapResult(true, { path, size: content.length });

    } catch (error) {
      // Tentative de récupération
      if (this.config.autoRecovery && options.backupContent) {
        await this.recoverFile(path, options.backupContent);
      }
      
      this.recordError('write', error, path);
      throw this.enhanceError(error, 'write', path);
    } finally {
      this.endOperation(operationId);
    }
  }

  async deleteFile(path, options = {}) {
    const operationId = this.startOperation('delete');
    
    try {
      this.validatePath(path);

      if (!await this.exists(path)) {
        if (!options.force) {
          throw new Error(`Fichier non trouvé: ${path}`);
        }
        return this.wrapResult(true, { path, existed: false });
      }

      // Backup avant suppression
      if (this.config.enableBackup && options.backup !== false) {
        try {
          const content = await this.readFile(path, { cache: false });
          await this.createBackup(path, content, 'delete');
        } catch (error) {
          console.warn('Impossible de sauvegarder avant suppression:', error);
        }
      }

      await this.retryOperation(() => fs(path).delete());

      // Supprimer du cache
      if (this.config.enableCache) {
        this.cache.delete(path);
      }

      this.recordSuccess('delete', path);
      return this.wrapResult(true, { path });

    } catch (error) {
      this.recordError('delete', error, path);
      throw this.enhanceError(error, 'delete', path);
    } finally {
      this.endOperation(operationId);
    }
  }

  // === ADVANCED FILE OPERATIONS ===

  async copyFile(sourcePath, targetPath, options = {}) {
    const operationId = this.startOperation('copy');
    
    try {
      this.validatePath(sourcePath);
      this.validatePath(targetPath);

      const content = await this.readFile(sourcePath, { cache: false });
      await this.createFile(targetPath, content, { overwrite: options.overwrite });

      this.recordSuccess('copy', `${sourcePath} -> ${targetPath}`);
      return this.wrapResult(true, { source: sourcePath, target: targetPath });

    } catch (error) {
      this.recordError('copy', error, `${sourcePath} -> ${targetPath}`);
      throw this.enhanceError(error, 'copy', `${sourcePath} -> ${targetPath}`);
    } finally {
      this.endOperation(operationId);
    }
  }

  async moveFile(sourcePath, targetPath, options = {}) {
    const operationId = this.startOperation('move');
    
    try {
      await this.copyFile(sourcePath, targetPath, options);
      await this.deleteFile(sourcePath, { backup: false });

      this.recordSuccess('move', `${sourcePath} -> ${targetPath}`);
      return this.wrapResult(true, { source: sourcePath, target: targetPath });

    } catch (error) {
      // Tentative de rollback
      if (await this.exists(targetPath)) {
        await this.deleteFile(targetPath, { backup: false });
      }
      
      this.recordError('move', error, `${sourcePath} -> ${targetPath}`);
      throw this.enhanceError(error, 'move', `${sourcePath} -> ${targetPath}`);
    } finally {
      this.endOperation(operationId);
    }
  }

  async readLargeFile(path, options = {}) {
    const operationId = this.startOperation('read_large');
    
    try {
      this.validatePath(path);

      const chunkSize = options.chunkSize || this.config.chunkSize;
      const fileSize = await this.getFileSize(path);
      const chunks = [];
      let bytesRead = 0;

      // Lecture par chunks pour les gros fichiers
      while (bytesRead < fileSize) {
        // Note: Acode fs n'a pas de lecture par chunks native
        // On lit le fichier en entier mais on simule le chunking
        const content = await this.readFile(path);
        chunks.push(content);
        bytesRead = fileSize;
        
        // Pour une vraie implémentation, il faudrait une API fs avancée
        break;
      }

      const result = chunks.join('');
      this.recordSuccess('read_large', path, fileSize);
      return this.wrapResult(result, { size: fileSize, chunks: chunks.length });

    } catch (error) {
      this.recordError('read_large', error, path);
      throw this.enhanceError(error, 'read_large', path);
    } finally {
      this.endOperation(operationId);
    }
  }

  async searchInFiles(directory, searchTerm, options = {}) {
    const operationId = this.startOperation('search');
    
    try {
      this.validatePath(directory);

      const files = await this.listDirectory(directory, { recursive: true });
      const results = [];
      const searchRegex = new RegExp(searchTerm, options.caseSensitive ? '' : 'i');

      for (const file of files) {
        if (file.isFile && this.shouldSearchFile(file.name, options)) {
          try {
            const content = await this.readFile(file.url);
            const matches = content.match(searchRegex);
            
            if (matches) {
              results.push({
                file: file.name,
                path: file.url,
                matches: matches.length,
                preview: this.getSearchPreview(content, searchTerm, options)
              });
            }
          } catch (error) {
            console.warn(`Impossible de lire le fichier ${file.name}:`, error);
          }
        }
      }

      this.recordSuccess('search', directory, results.length);
      return this.wrapResult(results, { 
        term: searchTerm, 
        filesSearched: files.length,
        matchesFound: results.length 
      });

    } catch (error) {
      this.recordError('search', error, directory);
      throw this.enhanceError(error, 'search', directory);
    } finally {
      this.endOperation(operationId);
    }
  }

  // === DIRECTORY OPERATIONS ===

  async listDirectory(path, options = {}) {
    const operationId = this.startOperation('list');
    
    try {
      this.validatePath(path);

      if (!await this.exists(path)) {
        throw new Error(`Dossier non trouvé: ${path}`);
      }

      const items = await this.retryOperation(() => fs(path).lsDir());
      const result = items.map(item => ({
        name: item.name,
        path: `${path}/${item.name}`,
        isFile: item.isFile,
        isDirectory: !item.isFile,
        size: item.size,
        modified: item.modified
      }));

      // Filtrage
      let filteredResult = result;
      if (options.filter) {
        filteredResult = result.filter(item => options.filter(item));
      }

      // Tri
      if (options.sort) {
        filteredResult.sort(options.sort);
      }

      // Recherche récursive
      if (options.recursive) {
        for (const item of result.filter(i => i.isDirectory)) {
          const subItems = await this.listDirectory(item.path, options);
          filteredResult.push(...subItems);
        }
      }

      this.recordSuccess('list', path, filteredResult.length);
      return this.wrapResult(filteredResult, { total: filteredResult.length });

    } catch (error) {
      this.recordError('list', error, path);
      throw this.enhanceError(error, 'list', path);
    } finally {
      this.endOperation(operationId);
    }
  }

  async createDirectoryStructure(structure, basePath = '') {
    const operationId = this.startOperation('create_structure');
    
    try {
      for (const [name, content] of Object.entries(structure)) {
        const fullPath = basePath ? `${basePath}/${name}` : name;

        if (content === true || typeof content === 'string') {
          // C'est un fichier
          const fileContent = typeof content === 'string' ? content : '';
          await this.createFile(fullPath, fileContent);
        } else if (typeof content === 'object') {
          // C'est un dossier
          await this.createDirectory(fullPath);
          await this.createDirectoryStructure(content, fullPath);
        }
      }

      this.recordSuccess('create_structure', basePath);
      return this.wrapResult(true, { basePath });

    } catch (error) {
      this.recordError('create_structure', error, basePath);
      throw this.enhanceError(error, 'create_structure', basePath);
    } finally {
      this.endOperation(operationId);
    }
  }

  // === UTILITY METHODS ===

  async exists(path) {
    try {
      return await fs(path).exists();
    } catch (error) {
      return false;
    }
  }

  async getFileInfo(path) {
    try {
      if (!await this.exists(path)) {
        throw new Error(`Fichier non trouvé: ${path}`);
      }

      const stats = await fs(path).stat();
      return {
        path,
        name: this.getFileName(path),
        extension: this.getFileExtension(path),
        size: stats.size,
        modified: stats.modified,
        isFile: true,
        isDirectory: false,
        permissions: this.getPermissions(stats)
      };
    } catch (error) {
      throw this.enhanceError(error, 'stat', path);
    }
  }

  async getFileSize(path) {
    try {
      const info = await this.getFileInfo(path);
      return info.size;
    } catch (error) {
      throw this.enhanceError(error, 'get_size', path);
    }
  }

  getFileExtension(filename) {
    const name = this.getFileName(filename);
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  getFileName(path) {
    return path.split('/').pop();
  }

  getParentPath(path) {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : '';
  }

  async ensureDirectoryExists(path) {
    if (!path || await this.exists(path)) return;
    
    const parentPath = this.getParentPath(path);
    if (parentPath && !await this.exists(parentPath)) {
      await this.ensureDirectoryExists(parentPath);
    }
    
    await this.createDirectory(path);
  }

  // === CACHE MANAGEMENT ===

  clearCache(path = null) {
    if (path) {
      this.cache.delete(path);
    } else {
      this.cache.clear();
    }
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits + this.cacheMisses > 0 
        ? (this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100 
        : 0
    };
  }

  startCacheCleanup() {
    this.cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [path, entry] of this.cache.entries()) {
        if (now - entry.timestamp > 3600000) { // 1 heure
          this.cache.delete(path);
        }
      }
    }, 600000); // 10 minutes
  }

  // === BACKUP AND RECOVERY ===

  async createBackup(path, content, operation) {
    const backupId = this.generateBackupId(path, operation);
    const backup = {
      id: backupId,
      path,
      content,
      operation,
      timestamp: Date.now(),
      size: content.length
    };

    // Garder un historique limité
    if (!this.backupHistory.has(path)) {
      this.backupHistory.set(path, []);
    }

    const backups = this.backupHistory.get(path);
    backups.push(backup);

    // Limiter le nombre de backups
    if (backups.length > this.maxBackups) {
      backups.shift();
    }
  }

  async recoverFile(path, backupContent = null) {
    try {
      if (backupContent) {
        await this.writeFile(path, backupContent, { backup: false });
        return true;
      }

      const backups = this.backupHistory.get(path);
      if (backups && backups.length > 0) {
        const latestBackup = backups[backups.length - 1];
        await this.writeFile(path, latestBackup.content, { backup: false });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Recovery failed:', error);
      return false;
    }
  }

  // === ERROR HANDLING AND RETRY ===

  async retryOperation(operation, attempts = this.config.retryAttempts) {
    let lastError;
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < attempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError;
  }

  enhanceError(error, operation, path) {
    const enhancedError = new Error(`${operation} operation failed for ${path}: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.operation = operation;
    enhancedError.path = path;
    enhancedError.timestamp = Date.now();
    
    return enhancedError;
  }

  validatePath(path) {
    if (!path || typeof path !== 'string') {
      throw new Error('Chemin invalide');
    }

    // Protection contre les paths malveillants
    if (path.includes('..') || path.includes('//')) {
      throw new Error('Chemin non autorisé');
    }
  }

  // === MONITORING AND METRICS ===

  startOperation(type) {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.operations[type] = (this.metrics.operations[type] || 0) + 1;
    return { id, type, startTime: performance.now() };
  }

  endOperation(operation) {
    const duration = performance.now() - operation.startTime;
    
    if (operation.type.includes('read')) {
      this.updateAverage('averageReadTime', duration);
    } else if (operation.type.includes('write')) {
      this.updateAverage('averageWriteTime', duration);
    }
  }

  updateAverage(metric, newValue) {
    const current = this.metrics.performance[metric] || 0;
    const count = this.metrics.operations.total || 1;
    this.metrics.performance[metric] = (current * (count - 1) + newValue) / count;
  }

  recordSuccess(operation, path, size = 0) {
    if (operation.includes('read')) {
      this.metrics.performance.totalBytesRead += size;
    } else if (operation.includes('write')) {
      this.metrics.performance.totalBytesWritten += size;
    }
  }

  recordError(operation, error, path) {
    this.metrics.errors.total++;
    const errorType = error.message.split(':')[0] || 'unknown';
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
  }

  startPerformanceMonitoring() {
    this.performanceMonitor = setInterval(() => {
      // Monitoring périodique des performances
      console.log('📊 FileManager Metrics:', this.getMetrics());
    }, 300000); // 5 minutes
  }

  getMetrics() {
    return {
      ...this.metrics,
      cache: this.getCacheStats(),
      backups: {
        total: Array.from(this.backupHistory.values()).reduce((sum, backups) => sum + backups.length, 0),
        byPath: Object.fromEntries(this.backupHistory)
      }
    };
  }

  // === UTILITY FUNCTIONS ===

  wrapResult(data, metadata = {}) {
    return {
      success: true,
      data,
      metadata: {
        timestamp: Date.now(),
        ...metadata
      }
    };
  }

  generateBackupId(path, operation) {
    return `${operation}_${this.getFileName(path)}_${Date.now()}`;
  }

  getPermissions(stats) {
    // Acode ne fournit pas les permissions, on simule
    return 'rw-r--r--';
  }

  shouldSearchFile(filename, options) {
    const extension = this.getFileExtension(filename);
    const allowedExtensions = options.extensions || ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'md'];
    
    return !options.extensions || allowedExtensions.includes(extension);
  }

  getSearchPreview(content, searchTerm, options) {
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + searchTerm.length + 20);
    return content.substring(start, end).replace(/\n/g, ' ');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === DESTRUCTOR ===

  destroy() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
    }
    this.clearCache();
    this.backupHistory.clear();
  }
}

export default FileManager;