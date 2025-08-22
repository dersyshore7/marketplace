
class MarketplaceDealAnalyzer {
  constructor() {
    this.processedListings = new Set();
    this.priceCache = new Map();
    this.init();
  }

  init() {
    console.log('Deal Analyzer: Initializing on Facebook Marketplace');
    this.observeListings();
    this.processExistingListings();
  }

  observeListings() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNewListings(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processExistingListings() {
    const listings = this.findListings();
    listings.forEach(listing => this.analyzeListing(listing));
  }

  processNewListings(node) {
    const listings = node.querySelectorAll ? node.querySelectorAll('[data-testid="marketplace-item"]') : [];
    listings.forEach(listing => this.analyzeListing(listing));
  }

  findListings() {
    return document.querySelectorAll('[data-testid="marketplace-item"], .x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.xt0b8zv.xo1l8bm');
  }

  async analyzeListing(listingElement) {
    if (!listingElement || this.processedListings.has(listingElement)) {
      return;
    }

    this.processedListings.add(listingElement);

    try {
      const listingData = this.extractListingData(listingElement);
      if (!listingData) return;

      console.log('Analyzing listing:', listingData);

      const priceAnalysis = await this.getPriceComparison(listingData);
      
      this.addDealIndicator(listingElement, priceAnalysis);

    } catch (error) {
      console.error('Error analyzing listing:', error);
    }
  }

  extractListingData(element) {
    try {
      const titleElement = element.querySelector('[data-testid="marketplace-item-title"]') || 
                          element.querySelector('span[dir="auto"]') ||
                          element.querySelector('a span');
      const title = titleElement?.textContent?.trim();

      const priceElement = element.querySelector('[data-testid="marketplace-item-price"]') ||
                          element.querySelector('span[dir="auto"]') ||
                          element.querySelector('span');
      const priceText = priceElement?.textContent?.trim();
      const price = this.parsePrice(priceText);

      const imageElement = element.querySelector('img');
      const imageUrl = imageElement?.src;

      const locationElement = element.querySelector('[data-testid="marketplace-item-location"]');
      const location = locationElement?.textContent?.trim();

      if (!title || !price) {
        return null;
      }

      return {
        title,
        price,
        priceText,
        imageUrl,
        location,
        element
      };
    } catch (error) {
      console.error('Error extracting listing data:', error);
      return null;
    }
  }

  parsePrice(priceText) {
    if (!priceText) return null;
    
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return null;
  }

  async getPriceComparison(listingData) {
    const cacheKey = `${listingData.title}-${listingData.price}`;
    if (this.priceCache.has(cacheKey)) {
      return this.priceCache.get(cacheKey);
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzePricing',
        data: listingData
      });

      const analysis = response || this.getBasicAnalysis(listingData);
      this.priceCache.set(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error getting price comparison:', error);
      return this.getBasicAnalysis(listingData);
    }
  }

  getBasicAnalysis(listingData) {
    const price = listingData.price;
    
    let dealScore = 'unknown';
    let confidence = 'low';
    
    if (price < 50) {
      dealScore = 'good';
      confidence = 'medium';
    } else if (price > 500) {
      dealScore = 'check';
      confidence = 'low';
    }

    return {
      dealScore,
      confidence,
      marketPrice: null,
      savings: null,
      sources: []
    };
  }

  addDealIndicator(element, analysis) {
    const existingIndicator = element.querySelector('.deal-analyzer-badge');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    const badge = document.createElement('div');
    badge.className = 'deal-analyzer-badge';
    
    let badgeText = '?';
    let badgeColor = '#gray';
    
    switch (analysis.dealScore) {
      case 'good':
        badgeText = '✓';
        badgeColor = '#4CAF50';
        break;
      case 'fair':
        badgeText = '~';
        badgeColor = '#FF9800';
        break;
      case 'poor':
        badgeText = '✗';
        badgeColor = '#F44336';
        break;
      default:
        badgeText = '?';
        badgeColor = '#9E9E9E';
    }

    badge.innerHTML = `
      <div style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: ${badgeColor};
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        cursor: pointer;
      " title="Deal Analysis: ${analysis.dealScore}">
        ${badgeText}
      </div>
    `;

    element.style.position = 'relative';
    element.appendChild(badge);

    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showDetailedAnalysis(analysis);
    });
  }

  showDetailedAnalysis(analysis) {
    const modal = document.createElement('div');
    modal.className = 'deal-analyzer-modal';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
          <h3 style="margin: 0 0 15px 0;">Deal Analysis</h3>
          <p><strong>Deal Score:</strong> ${analysis.dealScore}</p>
          <p><strong>Confidence:</strong> ${analysis.confidence}</p>
          ${analysis.marketPrice ? `<p><strong>Market Price:</strong> $${analysis.marketPrice}</p>` : ''}
          ${analysis.savings ? `<p><strong>Potential Savings:</strong> $${analysis.savings}</p>` : ''}
          <p style="font-size: 12px; color: #666; margin-top: 15px;">
            Analysis based on comparable listings and market data.
          </p>
          <button onclick="this.closest('.deal-analyzer-modal').remove()" style="
            background: #1877f2;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
          ">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MarketplaceDealAnalyzer();
  });
} else {
  new MarketplaceDealAnalyzer();
}
