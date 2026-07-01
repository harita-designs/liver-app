const NORMS = {
  alt:  { lo: 7,   hi: 40,  label: 'ALT (SGPT)',       unit: 'U/L',   meaning: 'liver cell damage or inflammation' },
  ast:  { lo: 10,  hi: 40,  label: 'AST (SGOT)',       unit: 'U/L',   meaning: 'liver injury or strain' },
  tb:   { lo: 0.2, hi: 1.2, label: 'Total Bilirubin',  unit: 'mg/dL', meaning: 'liver dysfunction or bile obstruction' },
  db:   { lo: 0,   hi: 0.3, label: 'Direct Bilirubin', unit: 'mg/dL', meaning: 'impaired bile flow or liver function' },
  alkp: { lo: 44,  hi: 147, label: 'Alk. Phosphatase', unit: 'IU/L',  meaning: 'bile duct issues or liver inflammation' },
  tp:   { lo: 6.0, hi: 8.3, label: 'Total Protein',    unit: 'g/dL',  meaning: null },
  alb:  { lo: 3.5, hi: 5.0, label: 'Albumin',          unit: 'g/dL',  meaning: 'impaired liver synthesis' },
};

export function predict(p) {
  let score = 0;
  const markers = [];

  for (const [key, n] of Object.entries(NORMS)) {
    const val = p[key];
    if (val == null) continue;
    if (val > n.hi) {
      const pct = Math.round(((val - n.hi) / n.hi) * 100);
      score += Math.min(25, pct * 0.3);
      markers.push({ key, label: n.label, val, unit: n.unit, pct, dir: 'high', meaning: n.meaning, danger: pct > 80 });
    } else if (val < n.lo && n.meaning) {
      const pct = Math.round(((n.lo - val) / n.lo) * 100);
      score += Math.min(10, pct * 0.15);
      markers.push({ key, label: n.label, val, unit: n.unit, pct, dir: 'low', meaning: n.meaning, danger: false });
    }
  }

  if (p.age > 50) score += 5;
  if (p.age > 65) score += 5;

  score = Math.round(Math.max(4, Math.min(96, score)));
  markers.sort((a, b) => b.pct - a.pct);

  const level =
    score < 25 ? 'Low Risk' :
    score < 50 ? 'Moderate Risk' :
    score < 70 ? 'High Risk' : 'Elevated Risk';

  const color =
    score < 25 ? 'var(--ok)' :
    score < 50 ? 'var(--warn)' :
    'var(--danger)';

  return { score, level, color, markers, topMarkers: markers.slice(0, 3) };
}
