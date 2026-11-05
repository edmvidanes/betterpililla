import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import Ajv from 'ajv';
import { loadDataPack } from './validate.ts';
import { publish } from './build-public.ts';
import { sha256 } from './normalize.ts';
import { lgu } from '../../src/config/lgu.ts';

test('Pililla publication withholds foreign records across downloads, hashes and search', async () => {
  const pack = await loadDataPack();
  const originalServices = await readFile(join(pack.root, 'services.json'), 'utf8');
  const temporary = await mkdtemp(join(tmpdir(), 'betterpililla-publication-'));
  const destination = join(temporary, 'data');
  try {
    const portal = await publish(pack, destination, lgu.withheldDatasets);
    const schema = JSON.parse(await readFile(join(destination, 'schemas/withheld.schema.json'), 'utf8'));
    const validate = new Ajv().compile(schema);
    for (const id of lgu.withheldDatasets) {
      const entry = portal.datasets.find(row => row.id === id)!;
      const bytes = await readFile(join(destination, entry.jsonUrl.slice('data/'.length)));
      const data = JSON.parse(bytes.toString());
      assert.equal(validate(data), true, JSON.stringify(validate.errors));
      assert.equal(entry.rowCount, 0);
      assert.equal(entry.sha256, sha256(bytes));
      assert.deepEqual(entry.sourceIds, []);
    }
    const search = JSON.parse(await readFile(join(destination, 'search-index.json'), 'utf8'));
    assert.equal(search.some((row: { type: string }) => ['service', 'legislation'].includes(row.type)), false);
    const details = JSON.parse(await readFile(join(destination, 'legislation/index.json'), 'utf8'));
    assert.deepEqual(details.records, []);
    assert.equal(await readFile(join(pack.root, 'services.json'), 'utf8'), originalServices);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
