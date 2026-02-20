// App constants and configuration

// Logo URL from Supabase storage bucket - using file-bucket with IE-logo.png
export const LOGO_URL = 'https://uyppwtvedirsgcshzrwi.databasepad.com/storage/v1/object/public/file-bucket/IE-logo.png';

// App branding
export const APP_NAME = 'Intimate Escapes';
export const APP_TAGLINE = 'Fort Lauderdale';


export const ESCAPE_PASS_PRICES = {
  'escape_1_3': 20.00,
  'escape_4_6': 40.00,
  'escape_7_10': 60.00,
} as const;

export const GAME_PASS_PRICES = {
  'game_24h': 10.00,
  'game_14d': 20.00,
  'game_30d_free': 0.00,
} as const;

// Pass durations (in days)
export const PASS_DURATIONS = {
  'escape_1_3': 30,
  'escape_4_6': 30,
  'escape_7_10': 30,
  'game_24h': 1,
  'game_14d': 14,
  'game_30d_free': 30,
  'day': 1,
  'weekend': 2,
  'annual': 365,
} as const;

// Escape counts per pass type
export const ESCAPE_COUNTS = {
  'escape_1_3': { min: 1, max: 3 },
  'escape_4_6': { min: 4, max: 6 },
  'escape_7_10': { min: 7, max: 10 },
} as const;
