import fs from 'fs';
import { execSync } from 'child_process';
import { TESTCONTAINER_STATE_FILE } from './testcontainer.state.js';

type ContainerState = {
  containerId: string;
};

export default async function globalTeardown() {
  if (!fs.existsSync(TESTCONTAINER_STATE_FILE)) {
    return;
  }

  const state: ContainerState = JSON.parse(
    fs.readFileSync(TESTCONTAINER_STATE_FILE, 'utf-8'),
  );

  try {
    execSync(`docker rm -f ${state.containerId}`, { stdio: 'ignore' });
  } catch {
    // Container may already be stopped or removed.
  }

  try {
    fs.unlinkSync(TESTCONTAINER_STATE_FILE);
  } catch {
    // Ignore missing file cleanup failures.
  }
}
