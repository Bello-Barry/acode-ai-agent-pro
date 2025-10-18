class Dialogs {
  async prompt(title, message, defaultValue = '', type = 'text') {
    return new Promise((resolve) => {
      window.prompt(title, message, defaultValue, type).then(resolve);
    });
  }

  async confirm(title, message) {
    return new Promise((resolve) => {
      window.confirm(title, message).then(resolve);
    });
  }

  async alert(title, message) {
    return new Promise((resolve) => {
      window.alert(title, message).then(resolve);
    });
  }

  async showCode(title, code, language = 'javascript') {
    const dialog = document.createElement('div');
    dialog.className = 'ai-agent-dialog-overlay';
    
    dialog.innerHTML = `
      <style>
        .ai-agent-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .ai-agent-dialog {
          background: #1e1e1e;
          border-radius: 12px;
          max-width: 90%;
          max-height: 80%;
          width: 800px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s;
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .ai-agent-dialog-header {
          padding: 20px;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .ai-agent-dialog-title {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }
        
        .ai-agent-dialog-close {
          background: none;
          border: none;
          color: #999;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.3s;
        }
        
        .ai-agent-dialog-close:hover {
          background: #333;
          color: #fff;
        }
        
        .ai-agent-dialog-content {
          padding: 20px;
          overflow: auto;
          flex: 1;
        }
        
        .ai-agent-code-block {
          background: #2d2d2d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 15px;
          overflow: auto;
          max-height: 400px;
        }
        
        .ai-agent-code-block pre {
          margin: 0;
          color: #d4d4d4;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        
        .ai-agent-dialog-actions {
          padding: 15px 20px;
          border-top: 1px solid #333;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .ai-agent-btn-dialog {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .ai-agent-btn-dialog.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
        
        .ai-agent-btn-dialog.primary:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6a4191 100%);
          transform: translateY(-2px);
        }
        
        .ai-agent-btn-dialog.secondary {
          background: #2d2d2d;
          color: #fff;
        }
        
        .ai-agent-btn-dialog.secondary:hover {
          background: #3d3d3d;
        }
      </style>
      
      <div class="ai-agent-dialog">
        <div class="ai-agent-dialog-header">
          <div class="ai-agent-dialog-title">${title}</div>
          <button class="ai-agent-dialog-close">×</button>
        </div>
        <div class="ai-agent-dialog-content">
          <div class="ai-agent-code-block">
            <pre>${this.escapeHtml(code)}</pre>
          </div>
        </div>
        <div class="ai-agent-dialog-actions">
          <button class="ai-agent-btn-dialog secondary" data-action="copy">
            📋 Copier
          </button>
          <button class="ai-agent-btn-dialog primary" data-action="insert">
            ✅ Insérer
          </button>
          <button class="ai-agent-btn-dialog secondary" data-action="close">
            Fermer
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    return new Promise((resolve) => {
      // Fermer en cliquant sur l'overlay
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          dialog.remove();
          resolve(null);
        }
      });

      // Bouton fermer
      const closeBtn = dialog.querySelector('.ai-agent-dialog-close');
      closeBtn.addEventListener('click', () => {
        dialog.remove();
        resolve(null);
      });

      // Actions
      const copyBtn = dialog.querySelector('[data-action="copy"]');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code);
          window.toast('Code copié ! ✓', 2000);
        } catch (error) {
          window.toast('Erreur de copie', 2000);
        }
      });

      const insertBtn = dialog.querySelector('[data-action="insert"]');
      insertBtn.addEventListener('click', () => {
        dialog.remove();
        resolve('insert');
        editorManager.editor.insert(code);
      });

      const closeBtnAction = dialog.querySelector('[data-action="close"]');
      closeBtnAction.addEventListener('click', () => {
        dialog.remove();
        resolve(null);
      });
    });
  }

  async showExplanation(title, explanation) {
    const dialog = document.createElement('div');
    dialog.className = 'ai-agent-dialog-overlay';
    
    dialog.innerHTML = `
      <div class="ai-agent-dialog">
        <div class="ai-agent-dialog-header">
          <div class="ai-agent-dialog-title">${title}</div>
          <button class="ai-agent-dialog-close">×</button>
        </div>
        <div class="ai-agent-dialog-content">
          <div style="color: #d4d4d4; line-height: 1.8; white-space: pre-wrap;">
            ${this.escapeHtml(explanation)}
          </div>
        </div>
        <div class="ai-agent-dialog-actions">
          <button class="ai-agent-btn-dialog primary" data-action="close">
            Fermer
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    return new Promise((resolve) => {
      const close = () => {
        dialog.remove();
        resolve();
      };

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) close();
      });

      dialog.querySelector('.ai-agent-dialog-close').addEventListener('click', close);
      dialog.querySelector('[data-action="close"]').addEventListener('click', close);
    });
  }

  async selectProjectType() {
    const types = [
      { value: 'html-css-js', label: '🌐 Site Web (HTML/CSS/JS)' },
      { value: 'react', label: '⚛️ Application React' },
      { value: 'nodejs', label: '🟢 API Node.js' },
      { value: 'express', label: '🚀 Express.js API' },
      { value: 'python-flask', label: '🐍 API Flask (Python)' },
      { value: 'acode-plugin', label: '🔌 Plugin Acode' }
    ];

    const dialog = document.createElement('div');
    dialog.className = 'ai-agent-dialog-overlay';
    
    const options = types.map(type => `
      <button class="ai-agent-project-option" data-type="${type.value}">
        <span style="font-size: 24px; margin-right: 10px;">${type.label.split(' ')[0]}</span>
        <span>${type.label.substring(type.label.indexOf(' ') + 1)}</span>
      </button>
    `).join('');
    
    dialog.innerHTML = `
      <style>
        .ai-agent-project-option {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 15px 20px;
          margin: 10px 0;
          background: #2d2d2d;
          border: 2px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .ai-agent-project-option:hover {
          background: #3d3d3d;
          border-color: #667eea;
          transform: translateX(5px);
        }
      </style>
      
      <div class="ai-agent-dialog">
        <div class="ai-agent-dialog-header">
          <div class="ai-agent-dialog-title">Choisir le type de projet</div>
          <button class="ai-agent-dialog-close">×</button>
        </div>
        <div class="ai-agent-dialog-content">
          ${options}
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    return new Promise((resolve) => {
      const close = (value = null) => {
        dialog.remove();
        resolve(value);
      };

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) close();
      });

      dialog.querySelector('.ai-agent-dialog-close').addEventListener('click', () => close());

      dialog.querySelectorAll('.ai-agent-project-option').forEach(btn => {
        btn.addEventListener('click', () => {
          close(btn.dataset.type);
        });
      });
    });
  }

  async showSettings(currentSettings) {
    const dialog = document.createElement('div');
    dialog.className = 'ai-agent-dialog-overlay';
    
    dialog.innerHTML = `
      <style>
        .ai-agent-settings-group {
          margin-bottom: 20px;
        }
        
        .ai-agent-settings-label {
          display: block;
          color: #999;
          font-size: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .ai-agent-settings-input {
          width: 100%;
          padding: 12px;
          background: #2d2d2d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
          font-family: 'Consolas', 'Monaco', monospace;
        }
        
        .ai-agent-settings-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .ai-agent-settings-select {
          width: 100%;
          padding: 12px;
          background: #2d2d2d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }
      </style>
      
      <div class="ai-agent-dialog">
        <div class="ai-agent-dialog-header">
          <div class="ai-agent-dialog-title">⚙️ Paramètres AI Agent</div>
          <button class="ai-agent-dialog-close">×</button>
        </div>
        <div class="ai-agent-dialog-content">
          <div class="ai-agent-settings-group">
            <label class="ai-agent-settings-label">Clé API DeepSeek</label>
            <input type="password" class="ai-agent-settings-input" id="apiKey" value="${currentSettings.apiKey || ''}" placeholder="sk-...">
          </div>
          
          <div class="ai-agent-settings-group">
            <label class="ai-agent-settings-label">Modèle</label>
            <select class="ai-agent-settings-select" id="model">
              <option value="deepseek-coder" ${currentSettings.model === 'deepseek-coder' ? 'selected' : ''}>DeepSeek Coder</option>
              <option value="deepseek-chat" ${currentSettings.model === 'deepseek-chat' ? 'selected' : ''}>DeepSeek Chat</option>
            </select>
          </div>
          
          <div class="ai-agent-settings-group">
            <label class="ai-agent-settings-label">Température (${currentSettings.temperature || 0.7})</label>
            <input type="range" class="ai-agent-settings-input" id="temperature" min="0" max="1" step="0.1" value="${currentSettings.temperature || 0.7}">
          </div>
          
          <div class="ai-agent-settings-group">
            <label class="ai-agent-settings-label">Max Tokens</label>
            <input type="number" class="ai-agent-settings-input" id="maxTokens" value="${currentSettings.maxTokens || 4096}" min="256" max="8192" step="256">
          </div>
        </div>
        <div class="ai-agent-dialog-actions">
          <button class="ai-agent-btn-dialog secondary" data-action="cancel">Annuler</button>
          <button class="ai-agent-btn-dialog primary" data-action="save">💾 Sauvegarder</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    return new Promise((resolve) => {
      const close = (settings = null) => {
        dialog.remove();
        resolve(settings);
      };

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) close();
      });

      dialog.querySelector('.ai-agent-dialog-close').addEventListener('click', () => close());
      dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => close());

      // Update temperature label
      const tempInput = dialog.querySelector('#temperature');
      const tempLabel = dialog.querySelector('.ai-agent-settings-label');
      tempInput.addEventListener('input', (e) => {
        tempLabel.textContent = `Température (${e.target.value})`;
      });

      dialog.querySelector('[data-action="save"]').addEventListener('click', () => {
        const settings = {
          apiKey: dialog.querySelector('#apiKey').value,
          model: dialog.querySelector('#model').value,
          temperature: parseFloat(dialog.querySelector('#temperature').value),
          maxTokens: parseInt(dialog.querySelector('#maxTokens').value)
        };
        close(settings);
      });
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default Dialogs;