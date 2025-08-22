# Facebook Marketplace Deal Analyzer

A Chrome extension that analyzes Facebook Marketplace listings to help you determine if an item is a good deal by comparing prices across multiple platforms.

## Features

- **Automatic Price Analysis**: Analyzes listings as you browse Facebook Marketplace
- **Visual Deal Indicators**: Shows color-coded badges on listings (✓ Good Deal, ~ Fair Price, ✗ Overpriced)
- **Multi-Source Comparison**: Compares prices against eBay, Amazon, and Google Shopping
- **Detailed Analysis**: Click badges for breakdown of comparable prices and potential savings
- **Smart Caching**: Reduces API calls by caching recent price comparisons
- **Privacy-Focused**: Processes data locally with minimal data collection

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/dersyshore7/marketplace.git
   cd marketplace
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the marketplace directory

5. The extension should now appear in your extensions list

### Configuration

1. Click the extension icon in your browser toolbar
2. Configure your preferences in the popup
3. For enhanced price comparison, add API keys in the settings (optional)

## How It Works

### Price Analysis Process

1. **Item Detection**: The content script monitors Facebook Marketplace pages and detects new listings
2. **Data Extraction**: Extracts item title, price, images, and location from each listing
3. **Price Comparison**: Background script queries multiple sources for comparable prices:
   - eBay sold listings
   - Amazon marketplace
   - Google Shopping results
4. **Analysis**: Calculates market average and determines if the current price is a good deal
5. **Visual Feedback**: Displays color-coded badges on listings with deal assessment

### Deal Scoring

- **Good Deal (✓)**: 10%+ below market average
- **Fair Price (~)**: Within 10% of market average  
- **Overpriced (✗)**: 15%+ above market average
- **Unknown (?)**: Insufficient data for comparison

## File Structure

```
marketplace/
├── manifest.json          # Extension configuration
├── content.js             # Main content script for Facebook Marketplace
├── background.js          # Background service worker for API calls
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── styles.css             # Extension styles
├── icons/                 # Extension icons (16px, 48px, 128px)
└── README.md              # This file
```

## Technical Details

### Content Script (`content.js`)
- Monitors DOM changes to detect new listings
- Extracts listing data (title, price, images)
- Adds visual deal indicators to listings
- Handles user interactions with deal badges

### Background Script (`background.js`)
- Manages API calls to price comparison services
- Implements caching to reduce API usage
- Calculates deal scores based on market data
- Handles cross-origin requests

### Popup Interface (`popup.html/js`)
- Displays usage statistics
- Provides user controls and settings
- Shows analysis results summary

## API Integration

The extension supports integration with multiple price comparison APIs:

- **eBay Finding API**: For sold listing comparisons
- **Amazon Product Advertising API**: For Amazon marketplace prices
- **Google Shopping API**: For general market pricing

*Note: API keys are required for full functionality. The extension includes mock data for demonstration purposes.*

## Privacy & Security

- **Local Processing**: All analysis happens locally in your browser
- **Minimal Data Collection**: Only processes publicly visible marketplace data
- **No Personal Information**: Does not access or store personal Facebook data
- **Secure API Calls**: All external requests are made through the background script

## Development

### Prerequisites
- Chrome browser
- Basic knowledge of JavaScript and Chrome Extension APIs

### Local Development
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Deal Analyzer extension
4. Test changes on Facebook Marketplace

### Adding New Price Sources
1. Add new search function in `background.js`
2. Update the `analyzePricing` method to include the new source
3. Adjust the `calculateMarketAnalysis` method for the new data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Facebook Marketplace
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This extension is for educational and personal use only. It is not affiliated with Facebook, eBay, Amazon, or Google. Users should verify prices independently before making purchases.
