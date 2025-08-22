
class PriceAnalysisService {
  constructor() {
    this.apiKeys = {
      ebay: null,
      amazon: null,
      googleShopping: null
    };
    
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'analyzePricing') {
        this.analyzePricing(request.data)
          .then(result => sendResponse(result))
          .catch(error => {
            console.error('Price analysis error:', error);
            sendResponse(null);
          });
        return true; // Keep message channel open for async response
      }
    });
  }

  async analyzePricing(listingData) {
    try {
      console.log('Analyzing pricing for:', listingData.title);

      const comparisons = await Promise.allSettled([
        this.searchEbay(listingData),
        this.searchAmazon(listingData),
        this.searchGoogleShopping(listingData)
      ]);

      const validComparisons = comparisons
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      if (validComparisons.length === 0) {
        return this.getBasicAnalysis(listingData);
      }

      const marketAnalysis = this.calculateMarketAnalysis(listingData, validComparisons);
      
      return marketAnalysis;

    } catch (error) {
      console.error('Error in price analysis:', error);
      return this.getBasicAnalysis(listingData);
    }
  }

  async searchEbay(listingData) {
    try {
      
      await this.delay(500); // Simulate API call
      
      return {
        source: 'eBay',
        averagePrice: listingData.price * (0.9 + Math.random() * 0.2),
        sampleSize: Math.floor(Math.random() * 50) + 10,
        url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(listingData.title)}`
      };
    } catch (error) {
      console.error('eBay search error:', error);
      return null;
    }
  }

  async searchAmazon(listingData) {
    try {
      await this.delay(300);
      
      return {
        source: 'Amazon',
        averagePrice: listingData.price * (0.95 + Math.random() * 0.1),
        sampleSize: Math.floor(Math.random() * 30) + 5,
        url: `https://www.amazon.com/s?k=${encodeURIComponent(listingData.title)}`
      };
    } catch (error) {
      console.error('Amazon search error:', error);
      return null;
    }
  }

  async searchGoogleShopping(listingData) {
    try {
      await this.delay(400);
      
      return {
        source: 'Google Shopping',
        averagePrice: listingData.price * (0.85 + Math.random() * 0.3),
        sampleSize: Math.floor(Math.random() * 100) + 20,
        url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(listingData.title)}`
      };
    } catch (error) {
      console.error('Google Shopping search error:', error);
      return null;
    }
  }

  calculateMarketAnalysis(listingData, comparisons) {
    if (comparisons.length === 0) {
      return this.getBasicAnalysis(listingData);
    }

    const totalSamples = comparisons.reduce((sum, comp) => sum + comp.sampleSize, 0);
    const weightedPrice = comparisons.reduce((sum, comp) => {
      const weight = comp.sampleSize / totalSamples;
      return sum + (comp.averagePrice * weight);
    }, 0);

    const currentPrice = listingData.price;
    const priceDifference = weightedPrice - currentPrice;
    const percentageDifference = (priceDifference / weightedPrice) * 100;

    let dealScore = 'fair';
    let confidence = 'medium';

    if (percentageDifference > 20) {
      dealScore = 'good';
      confidence = 'high';
    } else if (percentageDifference > 10) {
      dealScore = 'good';
      confidence = 'medium';
    } else if (percentageDifference < -15) {
      dealScore = 'poor';
      confidence = 'high';
    } else if (percentageDifference < -5) {
      dealScore = 'poor';
      confidence = 'medium';
    }

    if (totalSamples < 10) {
      confidence = 'low';
    } else if (totalSamples > 50) {
      confidence = confidence === 'medium' ? 'high' : confidence;
    }

    return {
      dealScore,
      confidence,
      marketPrice: Math.round(weightedPrice),
      currentPrice: currentPrice,
      savings: Math.round(priceDifference),
      percentageSavings: Math.round(percentageDifference),
      sources: comparisons,
      sampleSize: totalSamples
    };
  }

  getBasicAnalysis(listingData) {
    return {
      dealScore: 'unknown',
      confidence: 'low',
      marketPrice: null,
      currentPrice: listingData.price,
      savings: null,
      percentageSavings: null,
      sources: [],
      sampleSize: 0
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

new PriceAnalysisService();
