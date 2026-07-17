import { Info } from 'lucide-react'
import { IS_DEMO } from '../lib/supabase'

/** 데모 모드 경고 배너. 이 기기에서만 저장된다는 점을 명확히 알린다. */
export function DemoBanner() {
  if (!IS_DEMO) return null
  return (
    <div className="demo-banner" role="note">
      <Info size={15} aria-hidden="true" />
      현재 데모 모드입니다. 투표가 이 기기에만 저장돼요. (가족 공유 전 Supabase 연결 필요)
    </div>
  )
}
