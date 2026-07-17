import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, Type } from 'lucide-react'
import { shareEvent } from '../lib/share'
import { useToast } from '../hooks/useToast'
import { useTextSize } from '../hooks/useTextSize'

interface AppHeaderProps {
  title: string
  back?: string
  showShare?: boolean
}

export function AppHeader({ title, back, showShare }: AppHeaderProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const { large, toggle } = useTextSize()

  const onShare = async () => {
    const r = await shareEvent()
    if (r === 'copied') toast.show('링크를 복사했어요. 가족 단체방에 붙여넣어 주세요.')
    else if (r === 'failed') toast.show('공유하지 못했어요. 주소창의 링크를 복사해 주세요.')
  }

  return (
    <header className="header">
      <div className="wrap header__inner">
        {back !== undefined ? (
          <button className="header__back" onClick={() => navigate(back)} aria-label="뒤로 가기">
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
        ) : null}
        <h1 className="header__title">{title}</h1>
        <button
          className="header__action"
          onClick={toggle}
          aria-pressed={large}
          aria-label={large ? '글자 크기 보통으로' : '글자 크게 보기'}
          title="글자 크게 보기"
        >
          <Type size={20} aria-hidden="true" />
        </button>
        {showShare && (
          <button className="header__action" onClick={onShare} aria-label="공유하기">
            <Share2 size={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  )
}
