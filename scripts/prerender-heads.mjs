import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const SITE = 'https://teslalightshows.com';

const routes = [
  ['tesla-light-show-generator', 'Tesla Light Show Generator | Create Custom Light Shows from Any Song', 'Generate custom Tesla light show files from any music. AI-powered FSEQ generator for Model S, 3, X, Y, and Cybertruck. Upload your song and download in seconds.'],
  ['tesla-light-show-downloads', 'Tesla Light Show Downloads | Custom FSEQ Files from Any Song', 'Download a custom Tesla light show made from your own MP3 or WAV. Get Tesla-ready FSEQ files, matching audio, setup instructions, and a free 20-second sample option.'],
  ['how-to-add-custom-light-show-to-tesla', 'How to Add a Custom Light Show to Your Tesla | USB Setup Guide', 'Learn how to add a custom Tesla light show using a USB drive, LightShow folder, FSEQ file, and matching MP3 or WAV audio. Or generate Tesla-ready files automatically.'],
  ['best-tesla-light-show-software', 'Best Tesla Light Show Software | Generator vs xLights vs Downloads', 'Compare Tesla light show software options including TeslaLightShows.com, xLights, free download sites, and manual FSEQ creation. Find the best option for custom Tesla light shows.'],
  ['tesla-light-show-not-working', 'Tesla Light Show Not Working? Fix USB, File, and Folder Issues', 'Fix a Tesla custom light show that is not showing or not working. Check your USB format, LightShow folder, FSEQ file, matching MP3 or WAV, and vehicle setup.'],
  ['tesla-light-show-usb-setup', 'Tesla Light Show USB Setup | Folder, FSEQ, MP3 and WAV Guide', 'Set up a USB drive for a custom Tesla light show. Learn the LightShow folder name, FSEQ file requirements, audio file matching, and common USB mistakes.'],
  ['tesla-light-show-gallery', 'Tesla Light Show Gallery | Example Custom Shows', 'Watch examples of custom Tesla light shows created with TeslaLightShows.com, synced to real songs on Model 3, Model Y, Cybertruck, Model S, and Model X.'],
  ['tesla-light-show-models', 'Tesla Light Show Compatibility by Model | Model 3, Model Y, Cybertruck, S and X', 'Learn which Tesla vehicles support custom light shows and create downloadable FSEQ files for Model 3, Model Y, Cybertruck, Model S, and Model X.'],
  ['tesla-model-y-light-show', 'Tesla Model Y Light Show Generator | Custom MP3 and WAV Shows', 'Create a custom Tesla Model Y light show from your own MP3 or WAV. Generate downloadable FSEQ files and setup instructions for your Model Y.'],
  ['tesla-model-3-light-show', 'Tesla Model 3 Light Show Generator | Custom FSEQ Files', 'Create a custom Tesla Model 3 light show from your own MP3 or WAV. Generate Tesla-ready FSEQ files, download your show, and play it from USB.'],
  ['cybertruck-light-show', 'Cybertruck Light Show Generator | Custom Tesla Light Shows', 'Create a custom Cybertruck light show from your own MP3 or WAV. Generate Tesla-ready FSEQ files and download a custom light show package.'],
  ['tesla-model-s-model-x-light-show', 'Tesla Model S and Model X Light Show Generator | Custom FSEQ Files', 'Create custom Tesla Model S and Model X light shows from MP3 or WAV files. Generate Tesla-ready FSEQ files and download setup instructions.'],
  ['tesla-halloween-light-show', 'Tesla Halloween Light Show Generator | Custom Spooky Light Shows', 'Create a Tesla Halloween light show from your own MP3 or WAV. Generate spooky custom FSEQ files and download a Tesla-ready light show package.'],
  ['tesla-christmas-light-show', 'Tesla Christmas Light Show Generator | Custom Holiday Shows', 'Create a Tesla Christmas light show from your own holiday music. Generate Tesla-ready FSEQ files from MP3 or WAV and download your custom show.'],
  ['tesla-birthday-light-show', 'Tesla Birthday Light Show Generator | Custom Birthday Shows', 'Create a custom Tesla birthday light show from your own song. Generate a Tesla-ready FSEQ package for birthday surprises, parties, and celebrations.'],
  ['tesla-new-year-light-show', 'Tesla New Year Light Show Generator | Custom Countdown Shows', 'Create a custom Tesla New Year light show from your own MP3 or WAV. Generate countdown, celebration, and party-style Tesla light show files.'],
  ['tesla-light-show-faq', 'Tesla Light Show FAQ | Generator, Downloads, USB Setup and FSEQ Files', 'Answers to common Tesla light show questions about generators, downloads, FSEQ files, MP3 and WAV audio, USB setup, Model Y, Model 3, Cybertruck, and troubleshooting.'],
  ['custom-tesla-light-show', 'Custom Tesla Light Show | Create a Show from Your Song', 'Create a custom Tesla light show from your own MP3 or WAV. Generate synced FSEQ files, preview options, and download a Tesla-ready light show package.'],
  ['tesla-light-show-ideas', 'Tesla Light Show Ideas | Songs, Holidays, Birthdays and Events', 'Explore Tesla light show ideas for holidays, birthdays, parties, weddings, car meets, New Year, Halloween, Christmas, and custom songs.'],
  ['about', 'About TeslaLightShows.com | Independent Tesla Light Show Generator', 'Learn about TeslaLightShows.com, an independent web app that generates custom Tesla light show FSEQ files from any song. Not affiliated with Tesla, Inc.'],
  ['contact', 'Contact TeslaLightShows.com | Support and Questions', 'Contact TeslaLightShows.com for help with light show generation, downloads, USB setup, orders, or general questions.'],
  ['terms', 'Terms of Service | TeslaLightShows.com', 'Read the Terms of Service for TeslaLightShows.com, covering accounts, purchases, downloads, and acceptable use.'],
  ['privacy', 'Privacy Policy | TeslaLightShows.com', 'Read the Privacy Policy for TeslaLightShows.com, covering what data we collect, how it is used, and your privacy choices.'],
  ['faq', 'Frequently Asked Questions | TeslaLightShows.com', 'Answers about TeslaLightShows.com: Tesla affiliation, what we create, music rights, refunds, vehicle compatibility, and support.'],
  ['pricing', 'Pricing — Custom Tesla Light Shows from $1.50 | TeslaLightShows.com', 'See pricing for custom Tesla light shows. Turn any song into a light show file for your Tesla. Free 20-second preview, credits from $1.50 per show.'],
  ['independent-service-disclaimer', 'Independent Service Disclaimer | TeslaLightShows.com', 'TeslaLightShows.com is an independent service and is not affiliated with, endorsed by, or sponsored by Tesla, Inc.'],
  ['refund-policy', 'Refund Policy | TeslaLightShows.com', 'Read the refund policy for TeslaLightShows.com digital light show purchases, including when refunds are available.'],
  ['copyright-music-upload-policy', 'Copyright and Music Upload Policy | TeslaLightShows.com', 'Read the copyright and music upload policy for TeslaLightShows.com. Users must own or have rights to the music they upload.'],
];

function esc(s) { return s.replace(/&/g, '&amp;'); }

function buildPage(base, path, title, desc) {
  const url = SITE + '/' + path;
  let html = base;
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(title) + '</title>');
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + esc(title) + '$2');
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + url + '$2');
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + url + '$2');
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, '$1' + esc(title) + '$2');
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  return html;
}

export function prerenderHeads() {
  const dist = 'dist';
  const base = readFileSync(join(dist, 'index.html'), 'utf8');
  let count = 0;
  for (const [path, title, desc] of routes) {
    const dir = join(dist, path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), buildPage(base, path, title, desc));
    count++;
  }
  console.log('Prerendered ' + count + ' route heads into ' + dist);
}

export async function prerenderContent() {
  const ssrOutDir = resolve('.ssr-out');

  process.env.SSG_BUILD = '1';
  const { build } = await import('vite');
  await build({
    build: { ssr: 'src/entry-server.tsx', outDir: '.ssr-out', emptyOutDir: true },
    logLevel: 'warn',
  });

  const bundlePath = pathToFileURL(resolve(ssrOutDir, 'entry-server.js')).href;
  const { render } = await import(bundlePath);

  let count = 0;
  for (const [path] of routes) {
    const filePath = join('dist', path, 'index.html');
    try {
      const bodyHtml = await render('/' + path);
      let html = readFileSync(filePath, 'utf8');
      html = html.replace('<div id="root"></div>', '<div id="root">' + bodyHtml + '</div>');
      writeFileSync(filePath, html);
      count++;
    } catch (err) {
      console.warn('SSR failed for /' + path + ':', err.message || err);
    }
  }

  rmSync(ssrOutDir, { recursive: true, force: true });
  console.log('Injected prerendered content into ' + count + ' routes');
}
