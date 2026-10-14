import type { CityLocation, CityWeather, CurrentWeather } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = [
  'precipitation_probability',
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'wind_speed_10m',
  'wind_direction_10m',
  'precipitation',
  'weather_code',
].join(',');

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

// Lê uma unidade de current_units, usando o fallback se ela faltar
function readUnit(units: JsonObject, key: string, fallback: string): string {
  const value = units[key];
  return isNonEmptyString(value) ? value : fallback;
}

// Faz a requisição e devolve o JSON; qualquer falha (rede, HTTP, JSON inválido) vira null
async function fetchJson(url: URL): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getCityLocation(name: string): Promise<CityLocation | null> {
  if (!isNonEmptyString(name)) return null;

  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name: name.trim(),
    count: '1',
    language: 'pt',
    format: 'json',
  }).toString();

  const data = await fetchJson(url);
  if (!isObject(data) || !Array.isArray(data.results) || data.results.length === 0) return null;

  const result: unknown = data.results[0];
  if (
    !isObject(result) ||
    !isNonEmptyString(result.name) ||
    !isFiniteNumber(result.latitude) ||
    !isFiniteNumber(result.longitude) ||
    !isNonEmptyString(result.country_code) ||
    !isNonEmptyString(result.timezone)
  ) {
    return null;
  }

  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    countryCode: result.country_code,
    timezone: result.timezone,
  };
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  timezone: string
): Promise<CurrentWeather | null> {
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude) || !isNonEmptyString(timezone)) {
    return null;
  }

  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS,
    timezone,
  }).toString();

  const data = await fetchJson(url);
  if (!isObject(data) || !isObject(data.current)) return null;

  const current = data.current;
  if (
    typeof current.time !== 'string' ||
    typeof current.temperature_2m !== 'number' ||
    typeof current.relative_humidity_2m !== 'number' ||
    typeof current.apparent_temperature !== 'number' ||
    typeof current.is_day !== 'number' ||
    typeof current.wind_speed_10m !== 'number' ||
    typeof current.wind_direction_10m !== 'number' ||
    typeof current.precipitation_probability !== 'number' ||
    typeof current.weather_code !== 'number'
  ) {
    return null;
  }

  const units = isObject(data.current_units) ? data.current_units : {};

  return {
    time: current.time,
    temperature: current.temperature_2m,
    relativeHumidity: current.relative_humidity_2m,
    apparentTemperature: current.apparent_temperature,
    isDay: current.is_day === 1,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    precipitationProbability: current.precipitation_probability,
    precipitation: typeof current.precipitation === 'number' ? current.precipitation : undefined,
    weatherCode: current.weather_code,
    units: {
      temperature: readUnit(units, 'temperature_2m', '°C'),
      relativeHumidity: readUnit(units, 'relative_humidity_2m', '%'),
      apparentTemperature: readUnit(units, 'apparent_temperature', '°C'),
      windSpeed: readUnit(units, 'wind_speed_10m', 'km/h'),
      windDirection: readUnit(units, 'wind_direction_10m', '°'),
      precipitationProbability: readUnit(units, 'precipitation_probability', '%'),
    },
  };
}

// Orquestra geocodificação + clima; é a função usada pela UI
export async function searchCityWeather(name: string): Promise<CityWeather | null> {
  const location = await getCityLocation(name);
  if (!location) return null;

  const weather = await getCurrentWeather(location.latitude, location.longitude, location.timezone);
  if (!weather) return null;

  return { location, weather };
}
