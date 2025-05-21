import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const { seasonId } = req.query;

  if (!seasonId) {
    return res.status(400).json({ error: 'Missing seasonId parameter' });
  }

  const url = `https://s5.sir.sportradar.com/scigamingvirtuals/hu/1/season/${seasonId}/fixtures`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const rows = document.querySelectorAll('.table tbody tr');

    const matches = Array.from(rows).map(row => {
      const cols = row.querySelectorAll('td');
      const kickoff = cols[0]?.textContent?.trim();
      const home = cols[1]?.textContent?.trim();
      const away = cols[3]?.textContent?.trim();
      const roundText = document.querySelector('.h2')?.textContent || '';
      const roundMatch = roundText.match(/(\d+)/);
      const round = roundMatch ? parseInt(roundMatch[1]) : null;

      return {
        home,
        away,
        kickoff,
        seasonId: parseInt(seasonId),
        round
      };
    });

    res.status(200).json(matches);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
}
