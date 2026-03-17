/**
 * Contract tests for DBV Special Cards Function header controls.
 */
import fs from 'fs';
import path from 'path';

describe('Special Cards Function header contract', () => {
  it('does not include a First Action Only toggle by design', () => {
    const indexPath = path.join(__dirname, '../..', 'public/index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    const functionHeaderSectionMatch = html.match(
      /<div class="special-function-filter-toggles"[\s\S]*?<\/div>/
    );
    expect(functionHeaderSectionMatch).toBeTruthy();

    const functionHeaderSection = functionHeaderSectionMatch?.[0] || '';
    expect(functionHeaderSection).not.toContain('data-icon-field="icon_first_action_only"');
  });
});
