import { greeting } from './greeting';

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>{greeting('new-project-ai')}</h1>
      <p>A learning playground for agentic engineering with Vite + React + TypeScript.</p>
    </main>
  );
}
