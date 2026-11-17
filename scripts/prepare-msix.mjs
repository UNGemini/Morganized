import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8'));
const version = config.version;
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
  throw new Error('Store builds require a stable major.minor.patch version.');
}
const parts = version.split('.').map(Number);
if (parts[0] === 0 || parts.some(part => part > 65535)) {
  throw new Error('MSIX requires major > 0 and each version component <= 65535.');
}
const cargo = readFileSync('src-tauri/Cargo.toml', 'utf8');
const packageBlock = cargo.split('[package]')[1]?.split(/^\[/m)[0];
const cargoVersion = packageBlock?.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
if (cargoVersion !== version) throw new Error('Cargo.toml and tauri.conf.json versions must match.');
if (process.env.RELEASE_TAG && process.env.RELEASE_TAG !== `v${version}`) {
  throw new Error(`Release tag must be v${version}, matching the application version.`);
}
if (process.env.STORE_PUBLISH === 'true' && parts[0] === 1 && parts[1] === 0 && parts[2] === 0) {
  throw new Error('Version 1.0.0 is already published. Increment the app version before submitting an update.');
}
const manifestPath = 'msix/AppxManifest.xml';
const manifest = readFileSync(manifestPath, 'utf8');
if (!/<Identity\b[^>]*\bVersion="[^"]+"/.test(manifest)) throw new Error('MSIX Identity version missing.');
writeFileSync(manifestPath, manifest.replace(/(<Identity\b[^>]*\bVersion=")[^"]+"/, `$1${version}.0"`));
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
console.log(`Prepared Morganized ${version}.0 for Microsoft Store (9P90C0SFQ4BZ).`);
