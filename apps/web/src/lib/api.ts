export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, init);
}
