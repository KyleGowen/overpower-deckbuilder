/** Recharts color palette aligned with STYLE_GUIDE_V2 tokens. */
export const CHART_BAR_COLORS = [
  '#00e5ff',
  '#3aa0ff',
  '#4bd07b',
  '#f6a623',
  '#b06bff',
  '#ef4d5a',
  '#1c7d92',
];

export const CHART_THEME = {
  gridStroke: '#1d2c47',
  axisTick: '#a8b8d8',
  axisTickFontSize: 10,
  tooltipBg: '#141f35',
  tooltipBorder: '#2a3e63',
  tooltipText: '#e8edf7',
  pieStroke: '#0f1928',
};

export function barColorAt(index: number): string {
  return CHART_BAR_COLORS[index % CHART_BAR_COLORS.length] ?? CHART_BAR_COLORS[0];
}
