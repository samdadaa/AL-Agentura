const { spawnSync } = require('node:child_process');
const result = spawnSync(process.execPath, [require.resolve('../tests/run-host.cjs')], {
  stdio:'inherit', env:{...process.env, AL_EXTENSION_HOST_SUITE: process.argv[2]}
});
process.exitCode = result.status ?? 1;
