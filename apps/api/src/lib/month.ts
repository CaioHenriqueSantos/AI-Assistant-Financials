/** Gera "2026-03" a partir de qualquer Date */
export function toReferenceMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Retorna o início do mês (para filtro gte) */
export function startOfMonth(referenceMonth: string): Date {
  const [y, m] = referenceMonth.split("-").map(Number);
  return new Date(y!, m! - 1, 1);
}

/** Retorna o início do mês seguinte (para filtro lt) */
export function startOfNextMonth(referenceMonth: string): Date {
  const [y, m] = referenceMonth.split("-").map(Number);
  return new Date(y!, m!, 1);
}
