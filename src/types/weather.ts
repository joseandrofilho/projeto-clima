export interface CityLocation {
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;   // country_code
  timezone: string;
}

export interface WeatherUnits {
  temperature: string;            // temperature_2m
  relativeHumidity: string;       // relative_humidity_2m
  apparentTemperature: string;    // apparent_temperature
  windSpeed: string;              // wind_speed_10m
  windDirection: string;          // wind_direction_10m
  precipitationProbability: string;
}

export interface CurrentWeather {
  time: string;                   // ISO local da cidade, ex. "2026-06-17T09:45"
  temperature: number;
  relativeHumidity: number;
  apparentTemperature: number;
  isDay: boolean;                 // is_day === 1
  windSpeed: number;
  windDirection: number;
  precipitationProbability: number;
  precipitation?: number;         // opcional, não exibido
  weatherCode: number;
  units: WeatherUnits;
}

export interface CityWeather {
  location: CityLocation;
  weather: CurrentWeather;
}
