import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Writable } from 'node:stream';
import App from './App';

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const collector = new Writable({
      write(chunk, _enc, cb) { html += chunk; cb(); },
      final(cb) { resolve(html); cb(); },
    });
    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() { pipe(collector); },
        onError(err) { reject(err); },
      }
    );
  });
}
