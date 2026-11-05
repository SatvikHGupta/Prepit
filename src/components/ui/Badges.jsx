import { DIFFICULTY_LABEL } from '@/lib/data/normalize';

export function DifficultyBadge({ value }) {
  const key = DIFFICULTY_LABEL[value] ? value : 'medium';
  return <span className={`badge ${key}`}>{DIFFICULTY_LABEL[key]}</span>;
}

export function LevelBadge({ info }) {
  return <span className={`badge ${info.tone}`}>{info.badge}</span>;
}
