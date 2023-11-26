const { Telegraf } = require('telegraf');
const OpenExchangeRatesAPI = require('open-exchange-rates');
const money = require('money');

// Set App ID (required):
OpenExchangeRatesAPI.set({
  app_id: '89abe6b4131e418ca583850055bf45c0',
});

const bot = new Telegraf('6912038962:AAHqxiLa08WIfbqq58I1MgksoafoQB-al-k');

// Handle the /start command
bot.start((ctx) => {
  ctx.reply('WACHA CV , Welcome to the Unit Converter Bot! Send me a value and the source and target units (e.g., "100 USD to EUR").');
});

// Handle text messages
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  const match = message.match(/(\d+)\s+(\w+)\s+to\s+(\w+)/);

  if (match) {
    const amount = parseFloat(match[1]); // Parse the amount as a float
    const sourceUnit = match[2].toUpperCase();
    const targetUnit = match[3].toUpperCase();

    try {
      // Call the Open Exchange Rates API for currency conversion
      const conversionResult = await convertUnits(amount, sourceUnit, targetUnit);

      ctx.reply(`${amount} ${sourceUnit} is approximately ${conversionResult.toFixed(2)} ${targetUnit}`);
    } catch (error) {
      console.error(error);
      ctx.reply('Error converting units. Please check your input and try again.');
    }
  } else {
    ctx.reply('Invalid input. Please use the format "value source_unit to target_unit" (e.g., "100 USD to EUR").');
  }
});

// Start the bot
bot.launch();

// Function to convert units using Open Exchange Rates API and money.js
async function convertUnits(amount, sourceUnit, targetUnit) {
  // Retrieve the latest exchange rates from Open Exchange Rates API
  const openExchangeRates = await new Promise((resolve, reject) => {
    OpenExchangeRatesAPI.latest((error) => {
      if (error) {
        reject(error);
      } else {
        resolve(OpenExchangeRatesAPI);
      }
    });
  });

  // Convert currency units to uppercase for case-insensitivity
  const sourceUnitUpperCase = sourceUnit.toUpperCase();
  const targetUnitUpperCase = targetUnit.toUpperCase();

  // Check if the provided units are supported
  if (!(sourceUnitUpperCase in openExchangeRates.rates) || !(targetUnitUpperCase in openExchangeRates.rates)) {
    throw new Error('Unsupported currency units');
  }

  // Set rates and base currency for money.js
  money.rates = openExchangeRates.rates;
  money.base = openExchangeRates.base;

  // Perform the currency conversion using money.js
  return money(amount).from(sourceUnitUpperCase).to(targetUnitUpperCase);
}
