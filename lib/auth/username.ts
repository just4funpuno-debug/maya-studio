const DOMINIO_INTERNO = "@mayastudio.local";

/** Normaliza username para almacenamiento y login (minúsculas, sin espacios). */
export function normalizarUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Traduce username visible → email interno de Supabase Auth. */
export function usernameToEmail(username: string): string {
  return `${normalizarUsername(username)}${DOMINIO_INTERNO}`;
}

export function esUsernameValido(username: string): boolean {
  const normalizado = normalizarUsername(username);
  return /^[a-z0-9][a-z0-9.]{2,31}$/.test(normalizado);
}
