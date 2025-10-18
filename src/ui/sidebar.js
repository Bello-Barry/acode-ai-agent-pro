class Sidebar {
  constructor(plugin) {
    this.plugin = plugin;
    this.container = null;
    this.isVisible = false;
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
      return;
    }

    this.container = this.create();
    document.body.appendChild(this.container);
    this.isVisible = true;
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  create() {
    const sidebar = document.createElement('div');
    sidebar.id = 'ai-agent-sidebar';
    sidebar.className = 'ai-agent-sidebar';
    
    sidebar.innerHTML = `
      <style>
        .ai-agent-sidebar {
          position: fixed;
          right: 0;
          top: 50px;
          width: 60px;
          height: calc(100% - 50px);
          background: #1e1e1e;
          border-left: 1px solid #333;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 0;
          z-index: 1000;
          box-shadow: -2px 0 10px rgba(0,0,0,0.3);
        }
        
        .ai-agent-btn {
          width: 45px;
          height: 45px;
          margin: 8px 0;
          border: none;
          border-radius: 8px;
          background: #2d2d2d;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s;
          position: relative;
        }
        
        .ai-agent-btn:hover {
          background: #3d3d3d;
          transform: translateX(-3px);
        }
        
        .ai-agent-btn:active {
          transform: translateX(-1px) scale(0.95);
        }
        
        .ai-agent-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .ai-agent-btn.primary:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6a4191 100%);
        }
        
        .ai-agent-tooltip {
          position: absolute;
          right: 55px;
          background: #333;
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        
        .ai-agent-btn:hover .ai-agent-tooltip {
          opacity: 1;
        }
        
        .ai-agent-divider {
          width: 80%;
          height: 1px;
          background: #333;
          margin: 10px 0;
        }
      </style>
      
      <button class="ai-agent-btn primary" data-action="generate">
        ✨
        <span class="ai-agent-tooltip">Générer du code</span>
      </button>
      
      <button class="ai-agent-btn" data-action="correct">
        🔧
        <span class="ai-agent-tooltip">Corriger le code</span>
      </button>
      
      <button class="ai-agent-btn" data-action="explain">
        💡
        <span class="ai-agent-tooltip">Expliquer</span>
      </button>
      
      <div class="ai-agent-divider"></div>
      
      <button class="ai-agent-btn" data-action="refactor">
        🔄
        <span class="ai-agent-tooltip">Refactoriser</span>
      </button>
      
      <button class="ai-agent-btn" data-action="test">
        🧪
        <span class="ai-agent-tooltip">Générer tests</span>
      </button>
      
      <button class="ai-agent-btn" data-action="document">
        📝
        <span class="ai-agent-tooltip">Documenter</span>
      </button>
      
      <div class="ai-agent-divider"></div>
      
      <button class="ai-agent-btn" data-action="project">
        📁
        <span class="ai-agent-tooltip">Nouveau projet</span>
      </button>
      
      <button class="ai-agent-btn" data-action="settings">
        ⚙️
        <span class="ai-agent-tooltip">Paramètres</span>
      </button>
    `;

    // Attacher les événements
    this.attachEvents(sidebar);

    return sidebar;
  }

  attachEvents(sidebar) {
    const buttons = sidebar.querySelectorAll('.ai-agent-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        await this.handleAction(action);
      });
    });
  }

  async handleAction(action) {
    const actions = {
      'generate': () => this.plugin.generateCode(),
      'correct': () => this.plugin.correctCode(),
      'explain': () => this.plugin.explainCode(),
      'refactor': () => this.plugin.refactorCode(),
      'test': () => this.plugin.generateTests(),
      'document': () => this.plugin.documentCode(),
      'project': () => this.plugin.createProject(),
      'settings': () => this.plugin.showSettings()
    };

    const handler = actions[action];
    if (handler) {
      await handler();
    }
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

export default Sidebar;