import { mkdir, rm, writeFile, cp } from 'node:fs/promises';
import { build } from 'esbuild';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  outfile: 'dist/raycast-lab.js',
});
await writeFile('dist/index.html', [
  '<!DOCTYPE html>',
  '<html lang="es">',
  '  <head>',
  '    <meta charset="UTF-8" />',
  '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  '    <title>Raycast Lab</title>',
  '    <link rel="icon" href="./favicon.svg" type="image/svg+xml" />',
  '    <link rel="stylesheet" href="./style.css" />',
  '  </head>',
  '  <body>',
  '    <div id="app"></div>',
  '    <script src="./raycast-lab.js"></script>',
  '  </body>',
  '</html>',
  '',
].join('\n'));
await cp('src/style.css', 'dist/style.css');
await cp('favicon.svg', 'dist/favicon.svg');
