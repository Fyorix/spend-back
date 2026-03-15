import path from 'path';
import os from 'os';

export const TESTCONTAINER_STATE_FILE = path.join(
  os.tmpdir(),
  'user-service-int-postgres.json',
);
