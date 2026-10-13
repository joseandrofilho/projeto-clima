const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

// Arredonda evitando "-0" (ex.: Math.round(-0.4) === -0)
function roundToInteger(value: number): number {
  return Math.round(value) + 0;
}

export function formatTemperature(value: number, unit: string): string {
  return `${roundToInteger(value)}${unit}`;
}

export function formatPercent(value: number, unit: string): string {
  return `${roundToInteger(value)}${unit}`;
}

export function formatWindSpeed(value: number, unit: string): string {
  const speed = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${speed} ${unit}`;
}

// isoLocal já vem no horário local da cidade, sem offset (ex.: "2026-10-13T09:45").
// Lê ano/mês/dia da string e formata em UTC para não depender do fuso do navegador.
export function formatDate(isoLocal: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoLocal);
  if (!match) {
    return '';
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const formatted = dateFormatter.format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
