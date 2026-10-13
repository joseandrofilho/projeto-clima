export interface WeatherCondition {
  emoji: string;
  label: string;
}

const WEATHER_CODES: Record<number, WeatherCondition> = {
  0: { emoji: '☀️', label: 'Céu limpo' },
  1: { emoji: '🌤️', label: 'Predominantemente limpo' },
  2: { emoji: '⛅', label: 'Parcialmente nublado' },
  3: { emoji: '☁️', label: 'Nublado' },
  45: { emoji: '🌫️', label: 'Neblina' },
  48: { emoji: '🌫️', label: 'Neblina com geada' },
  51: { emoji: '🌦️', label: 'Garoa fraca' },
  53: { emoji: '🌦️', label: 'Garoa moderada' },
  55: { emoji: '🌦️', label: 'Garoa intensa' },
  56: { emoji: '🌧️', label: 'Garoa congelante fraca' },
  57: { emoji: '🌧️', label: 'Garoa congelante intensa' },
  61: { emoji: '🌧️', label: 'Chuva fraca' },
  63: { emoji: '🌧️', label: 'Chuva moderada' },
  65: { emoji: '🌧️', label: 'Chuva forte' },
  66: { emoji: '🌧️', label: 'Chuva congelante fraca' },
  67: { emoji: '🌧️', label: 'Chuva congelante forte' },
  71: { emoji: '🌨️', label: 'Neve fraca' },
  73: { emoji: '🌨️', label: 'Neve moderada' },
  75: { emoji: '❄️', label: 'Neve forte' },
  77: { emoji: '🌨️', label: 'Grãos de neve' },
  80: { emoji: '🌦️', label: 'Pancadas de chuva fracas' },
  81: { emoji: '🌧️', label: 'Pancadas de chuva moderadas' },
  82: { emoji: '⛈️', label: 'Pancadas de chuva violentas' },
  85: { emoji: '🌨️', label: 'Pancadas de neve fracas' },
  86: { emoji: '❄️', label: 'Pancadas de neve fortes' },
  95: { emoji: '⛈️', label: 'Trovoada fraca ou moderada' },
  96: { emoji: '⛈️', label: 'Trovoada com granizo fraco' },
  99: { emoji: '⛈️', label: 'Trovoada com granizo forte' },
};

const UNKNOWN_CONDITION: WeatherCondition = { emoji: '🌡️', label: 'Condição desconhecida' };

// Códigos em que o sol vira lua durante a noite (PRD §4.4)
const NIGHT_MOON_CODES = [0, 1];

export function getWeatherCondition(code: number, isDay: boolean): WeatherCondition {
  const condition = WEATHER_CODES[code];
  if (!condition) {
    return { ...UNKNOWN_CONDITION };
  }

  if (!isDay && NIGHT_MOON_CODES.includes(code)) {
    return { emoji: '🌙', label: condition.label };
  }

  return { ...condition };
}
