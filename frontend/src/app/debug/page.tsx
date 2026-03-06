'use client';

/**
 * DIAGNOSTIC PAGE — visit http://localhost:3000/debug to verify your API config.
 * Delete this file once everything is working.
 */

import { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// For health check we need the root, strip /api suffix
const SERVER_ROOT = API_BASE.replace(/\/api$/, '');

const TEST_ROUTES = [
  { method: 'GET',  path: '/health',                               label: 'Server Health (no auth)',        body: null,                                              expectStatus: [200] },
  { method: 'POST', path: '/api/auth/login',                       label: 'Auth → Login',                   body: { email: 'test@test.com', password: 'wrong' },      expectStatus: [400, 401] },
  { method: 'POST', path: '/api/auth/register',                    label: 'Auth → Register',                body: { name:'T', email:'x', password:'x', role:'x' },   expectStatus: [400] },
  { method: 'GET',  path: '/api/hr/employees',                     label: 'HR → Employees',                 body: null,                                              expectStatus: [200, 401, 403] },
  { method: 'POST', path: '/api/hr/upload-excel',                  label: 'HR → Upload Excel',              body: null,                                              expectStatus: [400, 401, 403] },
  { method: 'GET',  path: '/api/manager/employees',                label: 'Manager → Employees',            body: null,                                              expectStatus: [200, 401, 403] },
  { method: 'POST', path: '/api/manager/appraisals',               label: 'Manager → Create Appraisal',     body: null,                                              expectStatus: [400, 401, 403] },
  { method: 'GET',  path: '/api/employee/my-report',               label: 'Employee → My Report',           body: null,                                              expectStatus: [200, 400, 401, 403] },
  { method: 'GET',  path: '/api/hr/analytics/department-performance', label: 'Analytics → Departments',     body: null,                                              expectStatus: [200, 401, 403] },
  { method: 'GET',  path: '/api/hr/analytics/top-performers',      label: 'Analytics → Top Performers',    body: null,                                              expectStatus: [200, 401, 403] },
  { method: 'GET',  path: '/api/hr/analytics/bias-cases',          label: 'Analytics → Bias Cases',        body: null,                                              expectStatus: [200, 401, 403] },
  { method: 'GET',  path: '/api/hr/analytics/average-sentiment',   label: 'Analytics → Avg Sentiment',     body: null,                                              expectStatus: [200, 401, 403] },
];

type TestResult = {
  label: string;
  path: string;
  status: number | 'ERROR';
  ok: boolean;
  response: unknown;
};

export default function DebugPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  async function runTests() {
    setRunning(true);
    setResults([]);
    const out: TestResult[] = [];

    for (const route of TEST_ROUTES) {
      try {
        const baseUrl = route.path.startsWith('/api') ? SERVER_ROOT : API_BASE;
        const res = await axios({
          method: route.method,
          url: `${baseUrl}${route.path}`,
          data: route.body || undefined,
          validateStatus: () => true, // don't throw on any status
        });
        out.push({
          label: route.label,
          path: `${route.method} ${API_BASE}${route.path}`,
          status: res.status,
          ok: route.expectStatus.includes(res.status),
          response: res.data,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        out.push({
          label: route.label,
          path: `${route.method} ${API_BASE}${route.path}`,
          status: 'ERROR',
          ok: false,
          response: msg,
        });
      }
    }

    setResults(out);
    setRunning(false);
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        🔧 API Route Diagnostics
      </h1>
      <p style={{ color: '#555', marginBottom: '1rem' }}>
        Base URL: <strong>{API_BASE}</strong>
        <br />
        <small>Expected responses: 400/401/403 = route exists (just needs auth). 404 = route missing or path wrong. ERROR = CORS or server down.</small>
      </p>

      <button
        onClick={runTests}
        disabled={running}
        style={{ padding: '0.6rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: running ? 'not-allowed' : 'pointer', marginBottom: '1.5rem' }}
      >
        {running ? 'Testing...' : 'Run All Tests'}
      </button>

      {results.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['Status', 'Route', 'Label', 'Response Preview'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold',
                    background: r.ok ? '#dcfce7' : r.status === 404 ? '#fee2e2' : r.status === 'ERROR' ? '#fee2e2' : '#fef9c3',
                    color: r.ok ? '#166534' : '#991b1b',
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', color: '#374151', fontSize: '0.8rem' }}>{r.path}</td>
                <td style={{ padding: '8px 12px' }}>{r.label}</td>
                <td style={{ padding: '8px 12px', color: '#6b7280', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.stringify(r.response).slice(0, 80)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {results.some(r => r.status === 'ERROR') && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
          <strong>❌ CORS or server unreachable.</strong> Fixes:
          <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Make sure your backend is running: <code>node server.js</code> or <code>nodemon</code></li>
            <li>Add CORS to your Express app: <code>app.use(require('cors')())</code></li>
            <li>Confirm your <code>.env.local</code> has the right <code>NEXT_PUBLIC_API_URL</code></li>
          </ol>
        </div>
      )}

      {results.some(r => r.status === 404) && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px' }}>
          <strong>⚠️ Some routes returned 404.</strong> This means the path is wrong. Check your backend <code>routes/</code> folder
          and update <code>NEXT_PUBLIC_API_URL</code> in <code>.env.local</code> accordingly.
        </div>
      )}
    </div>
  );
}
