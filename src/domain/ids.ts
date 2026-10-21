/** Source spellings are not aliases: Mahipon and Mahipon-Lumot remain separate IDs. */
export function barangayId(name: string): string {
  return `barangay:${name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
