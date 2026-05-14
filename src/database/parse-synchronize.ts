/**
 * TYPEORM_SYNCHRONIZE=true only for explicit throwaway dev.
 * Any other value (including unset) => false.
 */
export function parseSynchronizeFlag(value: string | undefined): boolean {
  return value === 'true';
}
