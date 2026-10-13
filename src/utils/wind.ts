const CARDINAL_DIRECTIONS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];

// Normaliza qualquer ângulo (inclusive negativo) para o intervalo [0, 360)
function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function getCardinalDirection(deg: number): string {
  const index = Math.round(normalizeDegrees(deg) / 45) % 8;
  return CARDINAL_DIRECTIONS[index];
}

// wind_direction_10m indica de onde o vento vem; a seta aponta para onde ele vai
export function getArrowRotation(deg: number): number {
  return normalizeDegrees(deg + 180);
}
