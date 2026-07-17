/** 식당 장르 */
export type Category = 'korean' | 'chinese' | 'japanese' | 'beef'

/**
 * 정보 확인 상태 3단계.
 * 확인되지 않은 항목을 임의의 별점으로 만들지 않는다.
 *  - ok      : 출처에 명확히 안내된 내용 → "가능"
 *  - call    : 정황상 유력하지만 예약 전 확인 필요 → "전화 확인"
 *  - unknown : 공개된 정보가 없음 → "미확인"
 */
export type StatusLevel = 'ok' | 'call' | 'unknown'

/** 팔순 행사 관점의 평가 6항목 (지시서 10장) */
export interface EventFit {
  /** 1. 16명 독립공간 */
  room: StatusLevel
  /** 2. 어르신 이동 편의 */
  access: StatusLevel
  /** 3. 주차 편의 */
  parking: StatusLevel
  /** 4. 메뉴 호불호 */
  menu: StatusLevel
  /** 5. 행사 분위기 */
  atmosphere: StatusLevel
  /** 6. 인당 10만 원 예산 적합성 */
  budget: StatusLevel
}

export interface Restaurant {
  id: string
  category: Category
  name: string
  /** 한 줄 추천 이유 */
  summary: string
  /** 식당 소개 */
  description: string
  address: string
  /** 공개된 대표번호가 없으면 null */
  phone: string | null
  /** 가격 정보가 공개되지 않았으면 null */
  priceMin: number | null
  priceMax: number | null
  recommendedMenu: string
  capacityNote: string
  fit: EventFit
  /** 부모님 팔순 행사 관점의 장점 */
  pros: string[]
  /** 예약 전 반드시 확인해야 할 사항 */
  checkPoints: string[]
  naverMapUrl: string
  kakaoMapUrl: string
  sourceUrl: string
  /** YYYY-MM-DD */
  lastVerified: string
  verificationNote: string
  imagePath: string | null
  displayOrder: number
  isActive: boolean
}

/** 행사 공개 정보 — access_code_hash 등 내부 값은 절대 포함하지 않는다 */
export interface PublicEvent {
  slug: string
  title: string
  subtitle: string | null
  eventDate: string | null
  voteDeadline: string | null
  expectedGuests: number
  budgetPerPerson: number
  maxChoices: number
  isOpen: boolean
  showLiveResults: boolean
}

/** 투표함에 담은 선택 (순서가 곧 순위) */
export interface Choice {
  restaurantId: string
  rank: number
}

export interface BallotInput {
  voterName: string
  pin: string
  comment: string
  choices: Choice[]
}

/** 집계 결과 한 줄 */
export interface ResultRow {
  restaurantId: string
  name: string
  category: Category
  totalScore: number
  firstChoiceCount: number
  selectedCount: number
  rank: number
  /** 같은 순위가 둘 이상인지 */
  isTied: boolean
}

export interface ResultsPayload {
  participantCount: number
  rows: ResultRow[]
  comments: string[]
}

/** 데모 모드에서 localStorage에 저장되는 형태 */
export interface StoredBallot {
  voterKey: string
  voterName: string
  comment: string
  choices: Choice[]
  updatedAt: string
}
