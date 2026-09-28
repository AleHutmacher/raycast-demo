// Mini test runner sin dependencias (reemplaza a vitest).
// API compatible con lo que usaban los tests: describe / it / expect(...).toBe / toEqual / toBeNull.
(function (global) {
  'use strict';

  const tests = [];
  let suite = '';

  function describe(name, fn) {
    const parent = suite;
    suite = parent ? `${parent} › ${name}` : name;
    fn();
    suite = parent;
  }

  function it(name, fn) {
    tests.push({ name: suite ? `${suite} › ${name}` : name, fn });
  }

  function format(value) {
    return value === undefined ? 'undefined' : JSON.stringify(value);
  }

  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  function expect(actual) {
    const fail = (expected) => { throw new Error(`Se esperaba ${expected} y se obtuvo ${format(actual)}`); };
    return {
      toBe(expected) { if (!Object.is(actual, expected)) fail(format(expected)); },
      toEqual(expected) { if (!deepEqual(actual, expected)) fail(format(expected)); },
      toBeNull() { if (actual !== null) fail('null'); },
    };
  }

  function run(outputElement) {
    const results = tests.map(({ name, fn }) => {
      try { fn(); return { name, ok: true }; } catch (error) { return { name, ok: false, error }; }
    });
    const failed = results.filter(r => !r.ok).length;

    for (const r of results) {
      if (r.ok) console.log(`✓ ${r.name}`); else console.error(`✗ ${r.name}\n  ${r.error.message}`);
    }

    if (outputElement) {
      outputElement.innerHTML = '';
      for (const r of results) {
        const li = document.createElement('li');
        li.className = r.ok ? 'pass' : 'fail';
        li.textContent = `${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ` — ${r.error.message}`}`;
        outputElement.appendChild(li);
      }
      const summary = document.createElement('p');
      summary.className = failed ? 'summary fail' : 'summary pass';
      summary.textContent = `${results.length - failed} de ${results.length} tests pasaron`;
      outputElement.after(summary);
    }
    return { total: results.length, failed };
  }

  global.RaycastTest = { describe, it, expect, run };
})(window);
