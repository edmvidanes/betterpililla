import type { DataPack } from './validate.ts';
import { collectSourceIds } from './normalize.ts';

export const withheldSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object', required: ['schemaVersion', 'publicationStatus', 'publicationNote', 'capturedAt'],
  properties: {
    schemaVersion: { const: 'civic-withheld/v1' },
    publicationStatus: { const: 'not-collected' },
    publicationNote: { type: 'string' }, capturedAt: { type: 'string' },
    records: { type: 'array', maxItems: 0 }, services: { type: 'array', maxItems: 0 },
    sectors: { type: 'array', maxItems: 0 }, observations: { type: 'array', maxItems: 0 },
    serviceLegislationLeads: { type: 'array', maxItems: 0 },
  },
};

/** Withhold foreign template records without editing the retained source snapshot. */
export function publicationDocuments(pack: DataPack, withheld: readonly string[]) {
  const documents = { ...pack.documents };
  const rewritten = new Set<string>();
  const note = 'Not collected for Pililla. Foreign template records are withheld pending Pililla source documents.';
  for (const id of withheld) {
    const original = documents[id];
    if (!original) throw new Error(`Unknown withheld dataset: ${id}`);
    documents[id] = {
      schemaVersion: 'civic-withheld/v1',
      municipality: pack.documents['dataset-manifest'].municipality,
      capturedAt: original.capturedAt ?? original.retrievedAt,
      publicationStatus: 'not-collected', publicationNote: note,
      records: [], services: [], sectors: [], observations: [], serviceLegislationLeads: [],
    };
    rewritten.add(id);
  }
  if (withheld.length) {
    const municipality = documents['municipality'];
    const pending = { publicationStatus: 'WorkInProgress', notes: 'Unverified source content is withheld pending review.' };
    documents['municipality'] = { ...municipality, psgcMunicipalityCode: pending, incomeClass: pending,
      annualRegularIncome: { ...pending, records: [] }, geography: { ...pending, boundaryGeometry: municipality.geography?.boundaryGeometry } };
    documents['officials'] = { ...documents['officials'], records: [], publicationStatus: 'WorkInProgress',
      publicationNote: 'Official names and terms are withheld until Pililla source records are verified.' };
    rewritten.add('municipality');
    rewritten.add('officials');
    const manifest = documents['dataset-manifest'];
    documents['dataset-manifest'] = { ...manifest,
      datasets: manifest.datasets.map((entry: Record<string, any>) => withheld.includes(entry.id)
        ? { ...entry, recordCount: 0, sourceIds: [], status: note } : entry),
      globalLimitations: [...manifest.globalLimitations, note],
    };
    const allowed = new Set(Object.entries(documents).filter(([id]) => id !== 'source-register')
      .flatMap(([, document]) => collectSourceIds(document)));
    documents['source-register'] = { ...documents['source-register'],
      sources: documents['source-register'].sources.filter((source: { id: string }) => allowed.has(source.id)),
    };
    rewritten.add('dataset-manifest');
    rewritten.add('source-register');
  }
  return { documents, rewritten };
}
