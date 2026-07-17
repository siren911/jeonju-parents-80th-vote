import type { Restaurant } from '../types'

/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ 식당 정보 단일 원본 (Single Source of Truth)                          │
 * │                                                                      │
 * │ 데모 모드 화면과 supabase/seed.sql 이 모두 이 파일에서 나온다.        │
 * │ 식당 정보를 고칠 때는 이 파일만 수정한 뒤 아래 명령을 실행한다.        │
 * │                                                                      │
 * │   npm run gen:seed                                                   │
 * │                                                                      │
 * │ 두 곳에 따로 적어두면 반드시 불일치가 생기므로 직접 seed.sql을        │
 * │ 손으로 수정하지 않는다.                                              │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * 아래 정보는 2026-07-17 기준 웹에서 확인한 "초기 후보 데이터"다.
 * 영업시간, 가격, 룸 수용 인원, 주차, 엘리베이터는 바뀔 수 있으므로
 * 모든 항목의 확정 여부를 StatusLevel 3단계로만 표시하고, 임의의 별점을 만들지 않는다.
 */

/** 웹에서 정보를 확인한 날짜 */
export const LAST_VERIFIED = '2026-07-17'

/** 모든 후보의 기본 확인 메모 */
export const DEFAULT_VERIFICATION_NOTE = '예약 전 전화 재확인 필요'

/** 앱 전체에서 보여주는 정보 주의 문구 */
export const INFO_DISCLAIMER =
  '후보 비교를 위한 참고 정보입니다. 실제 예약 전 16명 독립룸, 메뉴 가격, 주차, 엘리베이터와 입식 좌석을 식당에 전화로 확인해 주세요.'

/** 지도 링크는 이름+주소 검색으로 만든다. 별도 지도 API 키가 필요 없다. */
const naverMap = (query: string) => `https://map.naver.com/p/search/${encodeURIComponent(query)}`
const kakaoMap = (query: string) => `https://map.kakao.com/link/search/${encodeURIComponent(query)}`

interface Seed extends Omit<Restaurant, 'naverMapUrl' | 'kakaoMapUrl' | 'lastVerified' | 'verificationNote'> {}

const SEED: Seed[] = [
  {
    id: 'd1000000-0000-4000-a000-000000000001',
    category: 'korean',
    name: '호남각',
    summary: '전주 전통 한옥 분위기와 한정식 상차림을 함께 즐기기 좋은 가족행사형 식당',
    description:
      '전주 덕진구에 자리한 한옥 분위기의 한정식 식당입니다. 룸과 단체행사 운영 정보가 있어 가족 모임 후보로 검토할 만합니다. 팔순 기념 사진을 남기기 좋은 공간 분위기가 장점으로 언급됩니다.',
    address: '전북특별자치도 전주시 덕진구 송천동2가 560-3',
    phone: '063-278-8150',
    priceMin: 35000,
    priceMax: 70000,
    recommendedMenu: '한정식 코스 (구성은 인원과 예산에 맞춰 상담 필요)',
    capacityNote: '룸과 단체행사 운영 정보가 있으나, 16명이 한 공간에 앉을 수 있는지는 전화 확인이 필요합니다.',
    fit: {
      room: 'call',
      access: 'unknown',
      parking: 'call',
      menu: 'ok',
      atmosphere: 'call',
      budget: 'ok',
    },
    pros: [
      '한옥 분위기라 팔순 기념 사진을 남기기 좋습니다.',
      '한정식 상차림이라 어르신과 아이 모두 무난하게 드실 수 있습니다.',
      '가격대가 1인 10만 원 예산 안에 들어옵니다.',
    ],
    checkPoints: [
      '16명이 한 공간(독립룸)에 앉을 수 있는지',
      '입식 테이블인지, 좌식만 있는지',
      '입구 계단과 문턱, 화장실까지의 이동 동선',
      '주차 가능 대수와 인근 주차 대안',
    ],
    sourceUrl: 'https://www.honamgak.com/',
    imagePath: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000002',
    category: 'korean',
    name: '고궁담',
    summary: '전주비빔밥의 전통을 현대적인 코스와 룸 공간으로 구성한 가족모임 후보',
    description:
      '전주비빔밥을 중심으로 한 한정식을 현대적인 코스로 구성한 곳입니다. 4인실부터 대형 룸까지 운영 정보가 있어 16명 가족 행사 구성 가능성이 높은 후보입니다. 엘리베이터 이용 정보가 있어 어르신 이동 측면에서도 검토할 만합니다.',
    address: '전북특별자치도 전주시 완산구 유연로 170',
    phone: '063-228-3711',
    priceMin: 19000,
    priceMax: 54000,
    recommendedMenu: '런치 한상 · 코스 (구성에 따라 가격 변동)',
    capacityNote: '4인실부터 대형 룸까지 운영 정보가 있어 16명 구성 가능성이 높습니다. 룸 배정은 예약 시 확인이 필요합니다.',
    fit: {
      room: 'call',
      access: 'call',
      parking: 'unknown',
      menu: 'ok',
      atmosphere: 'call',
      budget: 'ok',
    },
    pros: [
      '소규모 룸부터 대형 룸까지 있어 16명 독립 공간 확보 가능성이 높습니다.',
      '엘리베이터 이용 정보가 있어 어르신 이동 부담이 적을 수 있습니다.',
      '가격대가 넓어 1인 10만 원 예산 안에서 구성하기 수월합니다.',
      '전주비빔밥이라는 지역 상징성이 팔순 자리에 어울립니다.',
    ],
    checkPoints: [
      '16명이 들어가는 룸이 완전히 독립된 공간인지',
      '건물 지하주차장 이용 가능 여부와 주차 대수',
      '엘리베이터가 식당 층까지 바로 연결되는지',
      '팔순 상차림과 케이크 반입이 가능한지',
    ],
    sourceUrl: 'https://app.catchtable.co.kr/ct/shop/dam',
    imagePath: null,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000003',
    category: 'korean',
    name: '전라도음식이야기',
    summary: '전라도식 다채로운 한정식 코스를 넓은 단체 공간에서 즐길 수 있는 행사형 후보',
    description:
      '전라도식 한정식 코스를 중심으로 한 식당으로, 대규모 가족행사가 가능하다는 정보가 있습니다. 단체석과 행사 공간 운영 정보가 있어 16명 규모 모임 후보로 볼 수 있습니다.',
    address: '전북특별자치도 전주시 덕진구 아중6길 14-6',
    phone: '063-244-4477',
    priceMin: 30000,
    priceMax: 70000,
    recommendedMenu: '전라도 한정식 코스 (코스에 따라 가격 변동)',
    capacityNote: '단체석과 행사 공간 정보가 있습니다. 16명 독립 배치 여부는 전화 확인이 필요합니다.',
    fit: {
      room: 'call',
      access: 'unknown',
      parking: 'unknown',
      menu: 'ok',
      atmosphere: 'call',
      budget: 'ok',
    },
    pros: [
      '대규모 가족행사 진행 정보가 있어 16명 수용에 무리가 적을 수 있습니다.',
      '전라도 한정식이라 어르신 취향에 맞을 가능성이 높습니다.',
      '가격대가 1인 10만 원 예산 안에 들어옵니다.',
    ],
    checkPoints: [
      '16명 단체석이 독립된 공간인지, 홀 한쪽인지',
      '차량 6~8대 주차가 가능한지',
      '입식 좌석 여부와 휠체어·보행 보조 이동 동선',
      '엘리베이터 또는 무단차 진입이 가능한지',
    ],
    sourceUrl: 'https://www.tripinfo.co.kr/info.html?content_id=2840571&content_type_id=39',
    imagePath: null,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000004',
    category: 'korean',
    name: '한식다이닝 늘채움',
    summary: '전통 한식을 현대적인 코스로 풀어낸 조용하고 품격 있는 기념일형 식당',
    description:
      '전통 한식을 코스로 구성한 조용한 분위기의 식당입니다. 2층 단독홀이 최대 약 30~34명까지 안내되고 있어 16명 가족 행사를 단독으로 진행할 수 있는지 검토할 만합니다. 다만 2층 이동 방식은 반드시 확인이 필요합니다.',
    address: '전북특별자치도 전주시 덕진구 덕진연못3길 6',
    phone: null,
    priceMin: 29000,
    priceMax: 65000,
    recommendedMenu: '한식 코스 (예약 페이지에서 최신 구성 확인)',
    capacityNote: '2층 단독홀 최대 약 30~34명 안내, 룸은 6인 이상 예약 안내가 있습니다. 16명 단독홀 사용 조건은 확인이 필요합니다.',
    fit: {
      room: 'call',
      access: 'unknown',
      parking: 'unknown',
      menu: 'ok',
      atmosphere: 'call',
      budget: 'ok',
    },
    pros: [
      '2층 단독홀을 쓰면 가족만의 조용한 자리를 만들 수 있습니다.',
      '기념일형 코스 구성이라 팔순 자리 분위기에 어울립니다.',
      '가격대가 1인 10만 원 예산 안에 들어옵니다.',
    ],
    checkPoints: [
      '★ 2층까지 엘리베이터가 있는지, 계단만 있는지 (부모님 이동에 가장 중요)',
      '16명이 2층 단독홀을 사용할 때의 최소 금액 조건',
      '대표 전화번호와 예약 방법 (공개된 대표번호가 확인되지 않음)',
      '주차 가능 대수와 인근 공영주차장 위치',
    ],
    sourceUrl: 'https://app.catchtable.co.kr/ct/shop/always_filling_up',
    imagePath: null,
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000005',
    category: 'chinese',
    name: '아서원1920 전주본점',
    summary: '프라이빗룸과 대형 연회 공간, 중식 코스를 갖춘 팔순 가족모임 유력 후보',
    description:
      '프라이빗룸과 대형 연회장을 함께 운영하는 중식당입니다. 16명 룸과 대형 연회가 가능하다는 정보가 있어 팔순 가족 모임 후보로 유력합니다. 상가 건물 3층에 있어 엘리베이터 이용 가능 여부를 확인하면 어르신 이동도 수월할 수 있습니다.',
    address: '전북특별자치도 전주시 덕진구 송천중앙로 225 파인트리몰 3층',
    phone: '063-272-1788',
    priceMin: 18000,
    priceMax: 120000,
    recommendedMenu: '런치 · 디너 중식 코스 (1인 10만 원 상한으로 구성 요청 필요)',
    capacityNote: 'VIP룸, 소규모룸, 연회장 정보가 있으며 16명 룸 이용이 가능하다는 안내가 있습니다.',
    fit: {
      room: 'call',
      access: 'call',
      parking: 'call',
      menu: 'ok',
      atmosphere: 'call',
      budget: 'call',
    },
    pros: [
      '16명 룸과 대형 연회 운영 정보가 있어 인원 수용이 가장 확실한 편입니다.',
      '상가 건물이라 엘리베이터로 이동할 수 있을 가능성이 높습니다.',
      '건물 지하주차장이 있어 차량 여러 대 주차가 수월할 수 있습니다.',
      '중식 코스는 어르신과 아이 모두 무난하게 드실 수 있습니다.',
    ],
    checkPoints: [
      '★ 코스 상한이 1인 12만 원까지 있으므로, 10만 원 이내 코스 구성이 가능한지',
      '16명 룸이 완전히 독립된 공간인지, 연회장 일부인지',
      '지하주차장 주차 등록 방식과 무료 시간',
      '3층까지 엘리베이터가 식당 입구와 바로 연결되는지',
    ],
    sourceUrl: 'https://www.instagram.com/aseowon1920/',
    imagePath: null,
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000006',
    category: 'chinese',
    name: '마천루',
    summary: '4인부터 대형 단체룸까지 운영 정보가 있는 전주 서곡의 중식 가족모임 후보',
    description:
      '전주 서곡 지역의 중식당으로 4인, 10인, 20인, 40인 이상 룸 운영 안내가 있습니다. 16명 구성 가능성이 높은 편이며 식사 메뉴 가격대가 낮아 예산 여유가 큽니다. 다만 코스 가격은 별도 확인이 필요합니다.',
    address: '전북특별자치도 전주시 완산구 서곡2길 14-9',
    phone: '063-255-3168',
    priceMin: 7000,
    priceMax: null,
    recommendedMenu: '중식 코스 (코스 가격은 전화 확인 필요)',
    capacityNote: '4인, 10인, 20인, 40인 이상 룸 운영 안내가 있어 16명 구성 가능성이 높습니다.',
    fit: {
      room: 'call',
      access: 'unknown',
      parking: 'call',
      menu: 'ok',
      atmosphere: 'unknown',
      budget: 'ok',
    },
    pros: [
      '다양한 규모의 룸을 운영해 16명 구성이 수월할 수 있습니다.',
      '식사 메뉴 가격대가 낮아 예산 여유가 큽니다.',
      '건물 뒤편 주차 정보가 있습니다.',
    ],
    checkPoints: [
      '팔순 자리에 맞는 코스 구성과 1인 가격',
      '16명 룸이 입식인지, 무단차로 들어갈 수 있는지',
      '주차 가능 대수 (차량 6~8대 기준)',
      '팔순 상차림과 케이크 반입 가능 여부',
      '지도에서 최신 전화번호 재확인',
    ],
    sourceUrl: 'https://www.instagram.com/motianlou88/',
    imagePath: null,
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000007',
    category: 'japanese',
    name: '한참치',
    summary: '개별룸 16실과 최대 40명 단체룸 조절 정보가 있는 참치·일식 코스 식당',
    description:
      '참치와 일식 코스를 중심으로 하는 식당입니다. 개별룸을 다수 운영하며 최대 40명까지 단체룸 조절이 가능하다는 정보가 있어 16명 가족 행사도 검토할 수 있습니다. 다만 회를 선호하지 않는 가족이 있다면 대체 메뉴 확인이 필요합니다.',
    address: '전북특별자치도 전주시 완산구 홍산남로 16 201호',
    phone: '063-221-3737',
    priceMin: null,
    priceMax: null,
    recommendedMenu: '정식 · 회정식 · 참치 코스 (1인 10만 원 예산 내 구성 요청 필요)',
    capacityNote: '개별룸을 다수 운영하며 최대 40명 단체룸 조절이 가능하다는 정보가 있습니다.',
    fit: {
      room: 'call',
      access: 'unknown',
      parking: 'unknown',
      menu: 'call',
      atmosphere: 'call',
      budget: 'unknown',
    },
    pros: [
      '단체룸 조절이 가능해 16명이 한 공간에 앉을 가능성이 높습니다.',
      '개별룸이 많아 조용한 가족 자리를 만들기 좋습니다.',
      '참치 코스는 팔순 자리의 특별한 상차림이 될 수 있습니다.',
    ],
    checkPoints: [
      '★ 회·날것을 못 드시는 가족을 위한 대체 메뉴(구이·조림 등)가 있는지',
      '1인 10만 원 이내 코스 구성이 가능한지 (공개 가격 정보 없음)',
      '2층까지 엘리베이터가 있는지와 화장실 동선',
      '건물 주차 가능 여부와 무료 주차 시간',
    ],
    sourceUrl: 'https://www.siksinhot.com/P/1089977',
    imagePath: null,
    displayOrder: 7,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000008',
    category: 'japanese',
    name: '송림일식',
    summary: '오랜 업력의 회정식·일식 코스를 중심으로 한 전주 구도심 일식 후보',
    description:
      '전주 구도심에 있는 오랜 업력의 일식당입니다. 회정식과 코스를 중심으로 운영하며 룸 운영 정보가 있습니다. 다만 16명 단체 구성과 2층 이동에 대한 정보가 공개되어 있지 않아 확인이 가장 많이 필요한 후보입니다.',
    address: '전북특별자치도 전주시 완산구 전라감영3길 12-9 2층',
    phone: '063-284-1845',
    priceMin: null,
    priceMax: null,
    recommendedMenu: '회정식 · 일식 코스 (가격 전화 확인 필요)',
    capacityNote: '룸 운영 정보는 있으나 16명 단체룸 연결 가능 여부는 확인되지 않았습니다.',
    fit: {
      room: 'unknown',
      access: 'unknown',
      parking: 'unknown',
      menu: 'call',
      atmosphere: 'call',
      budget: 'unknown',
    },
    pros: [
      '오랜 업력의 일식당으로 코스 상차림의 완성도를 기대할 수 있습니다.',
      '전주 구도심에 있어 행사 전후 이동과 산책이 수월합니다.',
    ],
    checkPoints: [
      '★ 16명이 한 공간에 앉을 수 있는지 (룸 연결 가능 여부 정보 없음)',
      '★ 2층 엘리베이터 유무와 계단 동선 (부모님 이동에 가장 중요)',
      '회·날것을 못 드시는 가족을 위한 대체 메뉴가 있는지',
      '1인 10만 원 이내 구성이 가능한지 (공개 가격 정보 없음)',
      '인근 제휴 주차장 또는 공영주차장 조건',
    ],
    sourceUrl: 'https://tabling.co.kr/place/677cd22666de5f0698892ddd',
    imagePath: null,
    displayOrder: 8,
    isActive: true,
  },
  {
    id: 'd1000000-0000-4000-a000-000000000009',
    category: 'beef',
    name: '아월 Awor',
    summary: '전 좌석 프라이빗룸과 기지제 전망이 특징인 프리미엄 한우 가족행사 후보',
    description:
      '전 좌석을 프라이빗룸으로 운영하는 한우 전문점입니다. 2~28인 프라이빗룸 안내가 있어 16명 가족 행사를 한 공간에서 진행하기 좋습니다. 엘리베이터와 지하주차장 정보도 있어 어르신 이동과 주차 측면이 다른 후보보다 안정적입니다. 다만 한우 특성상 예산 관리가 가장 중요합니다.',
    address: '전북특별자치도 전주시 덕진구 중동로 104-10 2층 201-202호',
    phone: '063-213-1020',
    priceMin: null,
    priceMax: null,
    recommendedMenu: '한우 부위별 · 코스 (1인 10만 원 상한 사전 견적 필수)',
    capacityNote: '2~28인 프라이빗룸 안내가 있어 16명 단독 사용이 가능할 것으로 보입니다.',
    fit: {
      room: 'call',
      access: 'call',
      parking: 'call',
      menu: 'ok',
      atmosphere: 'ok',
      budget: 'unknown',
    },
    pros: [
      '전 좌석 프라이빗룸이라 가족만의 독립된 자리를 만들 수 있습니다.',
      '2~28인 룸 안내가 있어 16명이 한 공간에 앉기 좋습니다.',
      '엘리베이터 이동 정보가 있어 부모님 이동 부담이 적습니다.',
      '건물 지하주차장이 있어 차량 여러 대 주차가 수월합니다.',
      '기지제 전망이 있어 팔순 자리 분위기가 좋습니다.',
    ],
    checkPoints: [
      '★ 1인 10만 원 이내로 16명 상차림이 가능한지 사전 견적 (한우는 예산 초과 위험이 가장 큼)',
      '16명 룸의 최소 주문 금액 조건',
      '엘리베이터가 2층 식당 입구와 바로 연결되는지',
      '팔순 상차림과 케이크 반입 가능 여부',
      '예약금과 취소 규정',
    ],
    sourceUrl: 'https://www.instagram.com/awor_hanwoo/',
    imagePath: null,
    displayOrder: 9,
    isActive: true,
  },
]

/** 화면과 seed.sql이 함께 사용하는 최종 식당 목록 */
export const RESTAURANTS: Restaurant[] = SEED.map((r) => {
  const query = `${r.name} ${r.address}`
  return {
    ...r,
    naverMapUrl: naverMap(query),
    kakaoMapUrl: kakaoMap(query),
    lastVerified: LAST_VERIFIED,
    verificationNote: DEFAULT_VERIFICATION_NOTE,
  }
})
