import type { ResultRow } from '../types'
import { categoryLabel } from '../data/categories'

interface ResultBarProps {
  row: ResultRow
  maxScore: number
}

/** 결과 막대 (CSS만 사용, 차트 라이브러리 없음) */
export function ResultBar({ row, maxScore }: ResultBarProps) {
  const pct = maxScore > 0 ? Math.round((row.totalScore / maxScore) * 100) : 0
  const isTop = row.rank === 1

  return (
    <div className={`resultbar ${isTop ? 'resultbar--top' : ''}`}>
      <div className="resultbar__head">
        <span className="resultbar__rank">
          {row.rank}위{row.isTied ? ' (공동)' : ''}
        </span>
        <span className="resultbar__name">
          {row.name}
          <span style={{ color: 'var(--c-ink-faint)', fontWeight: 500, fontSize: 'var(--fs-caption)' }}>
            {' '}
            · {categoryLabel(row.category)}
          </span>
        </span>
        <span className="resultbar__score">{row.totalScore}점</span>
      </div>
      <div
        className="resultbar__track"
        role="progressbar"
        aria-valuenow={row.totalScore}
        aria-valuemin={0}
        aria-valuemax={maxScore}
        aria-label={`${row.name} ${row.totalScore}점`}
      >
        <div className="resultbar__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="resultbar__meta">
        <span>1순위 {row.firstChoiceCount}표</span>
        <span>전체 선택 {row.selectedCount}회</span>
      </div>
    </div>
  )
}
