export function getScoreColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

export function getScoreColorClass(score: number): string {
  const color = getScoreColor(score);
  switch (color) {
    case 'green':
      return 'score-green';
    case 'yellow':
      return 'score-yellow';
    case 'red':
      return 'score-red';
  }
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}