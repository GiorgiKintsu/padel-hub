import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadMigrationFiles } from './migrator.js';

async function dirWith(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'migrations-'));
  for (const [name, sql] of Object.entries(files)) await writeFile(join(dir, name), sql);
  return dir;
}

describe('loadMigrationFiles', () => {
  it('sorts by name and detects the no-transaction marker', async () => {
    const dir = await dirWith({
      '0002_b.sql': 'SELECT 2;',
      '0001_a.sql': '-- migrate:no-transaction\nSELECT 1;',
    });
    const files = await loadMigrationFiles(dir);
    expect(files.map((f) => f.version)).toEqual(['0001', '0002']);
    expect(files[0]?.transactional).toBe(false);
    expect(files[1]?.transactional).toBe(true);
    expect(files[0]?.checksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rejects badly named files', async () => {
    const dir = await dirWith({ 'add_users.sql': 'SELECT 1;' });
    await expect(loadMigrationFiles(dir)).rejects.toThrow(/NNNN_description\.sql/);
  });

  it('rejects duplicate versions', async () => {
    const dir = await dirWith({ '0001_a.sql': 'SELECT 1;', '0001_b.sql': 'SELECT 2;' });
    await expect(loadMigrationFiles(dir)).rejects.toThrow(/Duplicate migration version 0001/);
  });

  it('the real migrations folder is valid', async () => {
    const files = await loadMigrationFiles(join(process.cwd(), 'migrations'));
    expect(files.length).toBeGreaterThan(0);
  });
});
