import fs from 'fs';
import path from 'path';
import { getTournamentCharacterMosaicColumns } from '../../../../frontend/src/components/TournamentCharts/tournamentCharacterMosaic';

describe('tournament character mosaic', () => {
  it('uses the full art width for a single character', () => {
    expect(getTournamentCharacterMosaicColumns(1)).toBe(1);
  });

  it('uses vertical slices for multi-character mosaics', () => {
    expect(getTournamentCharacterMosaicColumns(2)).toBe(2);
    expect(getTournamentCharacterMosaicColumns(8)).toBe(2);
    expect(getTournamentCharacterMosaicColumns(9)).toBe(3);
  });

  it('anchors mosaic artwork to the left edge', () => {
    const css = fs.readFileSync(
      path.join(__dirname, '../../../../frontend/src/components/TournamentCharts/TournamentCharts.css'),
      'utf8',
    );

    expect(css).toMatch(
      /\.tournament-character-roster__mosaic-item \.card-image__img\s*\{[^}]*object-position: left 28%;[^}]*transform-origin: left center;/s,
    );
  });
});
