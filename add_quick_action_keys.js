const fs = require('fs');
const path = require('path');

// List of all language directories
const languages = [
  'cs-CZ', 'de-DE', 'es-ES', 'es-MX', 'fa-IR', 'fi-FI',
  'fr-FR', 'hi-IN', 'hu-HU', 'ja-JP', 'ko-KR', 'no-NO', 'pl-PL',
  'pt-BR', 'ro-RO', 'ru-RU', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN',
  'zh-CN', 'zh-HK'
];

// Keys to add with English defaults
const keysToAdd = {
  "documentation": "Documentation",
  "documentationDesc": "Browse guides and tutorials",
  "purchaseSubscriptionDesc": "Buy new subscriptions",
  "support": "Support",
  "supportDesc": "Get help and contact us"
};

languages.forEach(lang => {
  const filePath = path.join('apps/user/locales', lang, 'dashboard.json');

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Check if keys are missing
      let needsUpdate = false;
      Object.keys(keysToAdd).forEach(key => {
        if (!(key in data)) {
          data[key] = keysToAdd[key];
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        // Write back with proper formatting
        fs.writeFileSync(filePath, JSON.stringify(data, Object.keys(data).sort(), 2) + '\n');
        console.log(`Updated ${lang}/dashboard.json`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
});

console.log('Done processing all language files');

