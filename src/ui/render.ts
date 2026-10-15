import type { CityWeather } from '../types/weather';
import { formatDate, formatPercent, formatTemperature, formatWindSpeed } from '../utils/format';
import { getWeatherCondition } from '../utils/weatherCode';
import { getArrowRotation, getCardinalDirection } from '../utils/wind';
import { resultCard, searchButton, searchInput } from './elements';

// Cria um elemento com classe e texto (sempre via textContent, nunca innerHTML)
function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// Emoji decorativo: escondido de leitores de tela, sempre acompanhado de texto
function createEmoji(emoji: string, className: string): HTMLSpanElement {
  const element = createElement('span', className, emoji);
  element.setAttribute('aria-hidden', 'true');
  return element;
}

// Troca todo o conteúdo do card e define o modificador de estado
function setCardContent(state: string, busy: boolean, ...children: Node[]): void {
  resultCard.className = `card card--${state}`;
  resultCard.setAttribute('aria-busy', String(busy));
  resultCard.replaceChildren(...children);
}

function renderMessage(state: string, emoji: string, title: string, subtitle: string): void {
  const message = createElement('div', 'state');
  message.append(
    createEmoji(emoji, 'state__emoji'),
    createElement('h2', 'state__title', title),
    createElement('p', 'state__subtitle', subtitle)
  );
  setCardContent(state, false, message);
}

export function renderEmpty(): void {
  renderMessage('empty', '🌍', 'Busque uma cidade', 'Digite o nome de uma cidade para ver o clima atual');
}

export function renderLoading(): void {
  const loading = createElement('div', 'state');
  const spinner = createElement('span', 'spinner');
  spinner.setAttribute('aria-hidden', 'true');
  loading.append(spinner, createElement('p', 'state__subtitle', 'Buscando...'));
  setCardContent('loading', true, loading);
}

export function renderNotFound(term: string): void {
  renderMessage(
    'not-found',
    '🔍',
    'Nada encontrado',
    `Não encontramos informações para "${term}". Verifique o nome e tente novamente.`
  );
}

// Card de métrica: rótulo com emoji, valor em destaque e um detalhe opcional abaixo
function createMetric(emoji: string, label: string, value: string, detail?: HTMLElement): HTMLElement {
  const metric = createElement('div', 'metric');
  const title = createElement('h3', 'metric__label');
  title.append(createEmoji(emoji, 'metric__emoji'), label);
  metric.append(title, createElement('p', 'metric__value', value));
  if (detail) {
    metric.append(detail);
  }
  return metric;
}

function createWindDirection(deg: number, unit: string): HTMLElement {
  const direction = createElement('p', 'metric__detail');
  const arrow = createElement('span', 'metric__arrow', '↑');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.style.transform = `rotate(${getArrowRotation(deg)}deg)`;
  direction.append(arrow, `${getCardinalDirection(deg)} · ${Math.round(deg)}${unit}`);
  return direction;
}

export function renderResult(data: CityWeather): void {
  const { location, weather } = data;
  const { units } = weather;
  const condition = getWeatherCondition(weather.weatherCode, weather.isDay);

  const dayNight = createElement('p', 'sidebar__info');
  dayNight.append(createEmoji(weather.isDay ? '☀️' : '🌙', 'sidebar__info-emoji'), weather.isDay ? 'Dia' : 'Noite');

  const sidebar = createElement('section', 'sidebar');
  sidebar.setAttribute('aria-label', 'Resumo');
  sidebar.append(
    createEmoji(condition.emoji, 'sidebar__emoji'),
    createElement('p', 'sidebar__temperature', formatTemperature(weather.temperature, units.temperature)),
    createElement('h2', 'sidebar__city', `${location.name}, ${location.countryCode}`),
    createElement('p', 'sidebar__info', formatDate(weather.time)),
    dayNight,
    createElement('p', 'sidebar__info', condition.label)
  );

  const metrics = createElement('section', 'metrics');
  metrics.setAttribute('aria-label', 'Detalhes');
  metrics.append(
    createMetric('💧', 'Umidade', formatPercent(weather.relativeHumidity, units.relativeHumidity)),
    createMetric('🌡️', 'Sensação', formatTemperature(weather.apparentTemperature, units.apparentTemperature)),
    createMetric('☔', 'Precipitação', formatPercent(weather.precipitationProbability, units.precipitationProbability)),
    createMetric(
      '💨',
      'Vento',
      formatWindSpeed(weather.windSpeed, units.windSpeed),
      createWindDirection(weather.windDirection, units.windDirection)
    )
  );

  setCardContent('result', false, sidebar, metrics);
}

export function setFormDisabled(disabled: boolean): void {
  searchInput.disabled = disabled;
  searchButton.disabled = disabled;
}
