
class PopupController {
  constructor() {
    this.stats = {
      itemsAnalyzed: 0,
      goodDeals: 0,
      totalSavings: 0
    };
    
    this.settings = {
      enabled: true,
      showBadges: true,
      autoAnalyze: true
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadStats();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['dealAnalyzerSettings']);
      if (result.dealAnalyzerSettings) {
        this.settings = { ...this.settings, ...result.dealAnalyzerSettings };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async loadStats() {
    try {
      const result = await chrome.storage.local.get(['dealAnalyzerStats']);
      if (result.dealAnalyzerStats) {
        this.stats = { ...this.stats, ...result.dealAnalyzerStats };
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ dealAnalyzerSettings: this.settings });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async saveStats() {
    try {
      await chrome.storage.local.set({ dealAnalyzerStats: this.stats });
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('enableToggle').addEventListener('click', () => {
      this.settings.enabled = !this.settings.enabled;
      this.saveSettings();
      this.updateUI();
      this.notifyContentScript();
    });

    document.getElementById('badgeToggle').addEventListener('click', () => {
      this.settings.showBadges = !this.settings.showBadges;
      this.saveSettings();
      this.updateUI();
      this.notifyContentScript();
    });

    document.getElementById('autoToggle').addEventListener('click', () => {
      this.settings.autoAnalyze = !this.settings.autoAnalyze;
      this.saveSettings();
      this.updateUI();
      this.notifyContentScript();
    });

    document.getElementById('analyzeNow').addEventListener('click', () => {
      this.analyzeCurrentPage();
    });

    document.getElementById('clearCache').addEventListener('click', () => {
      this.clearCache();
    });

    document.getElementById('openOptions').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  updateUI() {
    document.getElementById('itemsAnalyzed').textContent = this.stats.itemsAnalyzed;
    document.getElementById('goodDeals').textContent = this.stats.goodDeals;
    
    const avgSavings = this.stats.itemsAnalyzed > 0 
      ? Math.round(this.stats.totalSavings / this.stats.itemsAnalyzed)
      : 0;
    document.getElementById('avgSavings').textContent = `$${avgSavings}`;

    this.updateToggle('enableToggle', this.settings.enabled);
    this.updateToggle('badgeToggle', this.settings.showBadges);
    this.updateToggle('autoToggle', this.settings.autoAnalyze);

    const analyzeButton = document.getElementById('analyzeNow');
    analyzeButton.disabled = !this.settings.enabled;
    analyzeButton.style.opacity = this.settings.enabled ? '1' : '0.5';
  }

  updateToggle(toggleId, isActive) {
    const toggle = document.getElementById(toggleId);
    if (isActive) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  async analyzeCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('facebook.com/marketplace')) {
        this.showMessage('Please navigate to Facebook Marketplace first.');
        return;
      }

      await chrome.tabs.sendMessage(tab.id, {
        action: 'analyzeCurrentPage'
      });

      this.showMessage('Analysis started!');
    } catch (error) {
      console.error('Error analyzing current page:', error);
      this.showMessage('Error: Please refresh the page and try again.');
    }
  }

  async clearCache() {
    try {
      await chrome.storage.local.clear();
      this.stats = {
        itemsAnalyzed: 0,
        goodDeals: 0,
        totalSavings: 0
      };
      this.updateUI();
      this.showMessage('Cache cleared!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.showMessage('Error clearing cache.');
    }
  }

  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('facebook.com/marketplace')) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: this.settings
        });
      }
    } catch (error) {
      console.log('Content script not available:', error);
    }
  }

  showMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #1877f2;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
    `;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
