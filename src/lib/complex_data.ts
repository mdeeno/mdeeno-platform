// src/lib/complex_data.ts
// 재건축·재개발 주요 단지 데이터셋
// Fields:
//   complex_name      — 단지명
//   location          — 지역 (시군구)
//   avg_asset_value   — 평균 종전자산 평가액 (억원)
//   stage             — 사업 단계 (planning | approval | management | construction)
//   expected_cost     — 예상 평당 공사비 (만원/평)

export type ComplexStage = 'planning' | 'approval' | 'management' | 'construction';

export interface ComplexData {
  complex_name: string;
  location: string;
  avg_asset_value: number;   // 억원
  stage: ComplexStage;
  expected_cost: number;     // 만원/평
}

export const COMPLEX_DATASET: ComplexData[] = [
  // ── 강남구 ────────────────────────────────────────────────
  {
    complex_name: '압구정현대1차',
    location: '서울 강남구',
    avg_asset_value: 28.0,
    stage: 'approval',
    expected_cost: 1250,
  },
  {
    complex_name: '압구정현대7차',
    location: '서울 강남구',
    avg_asset_value: 25.5,
    stage: 'planning',
    expected_cost: 1200,
  },
  {
    complex_name: '개포주공1단지',
    location: '서울 강남구',
    avg_asset_value: 18.0,
    stage: 'construction',
    expected_cost: 1050,
  },
  {
    complex_name: '대치쌍용1차',
    location: '서울 강남구',
    avg_asset_value: 15.5,
    stage: 'approval',
    expected_cost: 980,
  },

  // ── 강동구 ────────────────────────────────────────────────
  {
    complex_name: '둔촌주공아파트',
    location: '서울 강동구',
    avg_asset_value: 10.5,
    stage: 'construction',
    expected_cost: 970,
  },
  {
    complex_name: '고덕주공4단지',
    location: '서울 강동구',
    avg_asset_value: 9.0,
    stage: 'management',
    expected_cost: 940,
  },

  // ── 송파구 ────────────────────────────────────────────────
  {
    complex_name: '잠실주공5단지',
    location: '서울 송파구',
    avg_asset_value: 20.0,
    stage: 'approval',
    expected_cost: 1100,
  },
  {
    complex_name: '올림픽선수기자촌',
    location: '서울 송파구',
    avg_asset_value: 12.0,
    stage: 'planning',
    expected_cost: 950,
  },

  // ── 영등포구 (여의도) ──────────────────────────────────────
  {
    complex_name: '시범아파트',
    location: '서울 영등포구',
    avg_asset_value: 14.0,
    stage: 'approval',
    expected_cost: 1080,
  },
  {
    complex_name: '한양아파트',
    location: '서울 영등포구',
    avg_asset_value: 13.0,
    stage: 'planning',
    expected_cost: 1020,
  },
  {
    complex_name: '목화아파트',
    location: '서울 영등포구',
    avg_asset_value: 11.5,
    stage: 'planning',
    expected_cost: 990,
  },

  // ── 양천구 (목동) ─────────────────────────────────────────
  {
    complex_name: '목동신시가지1단지',
    location: '서울 양천구',
    avg_asset_value: 11.0,
    stage: 'planning',
    expected_cost: 960,
  },
  {
    complex_name: '목동신시가지5단지',
    location: '서울 양천구',
    avg_asset_value: 10.5,
    stage: 'planning',
    expected_cost: 950,
  },
  {
    complex_name: '목동신시가지14단지',
    location: '서울 양천구',
    avg_asset_value: 9.5,
    stage: 'approval',
    expected_cost: 930,
  },

  // ── 마포구 ────────────────────────────────────────────────
  {
    complex_name: '성산시영아파트',
    location: '서울 마포구',
    avg_asset_value: 8.5,
    stage: 'management',
    expected_cost: 910,
  },
  {
    complex_name: '망원한강타운',
    location: '서울 마포구',
    avg_asset_value: 7.5,
    stage: 'planning',
    expected_cost: 880,
  },

  // ── 용산구 ────────────────────────────────────────────────
  {
    complex_name: '한강맨션',
    location: '서울 용산구',
    avg_asset_value: 22.0,
    stage: 'approval',
    expected_cost: 1150,
  },
  {
    complex_name: '이촌동 한가람아파트',
    location: '서울 용산구',
    avg_asset_value: 16.0,
    stage: 'planning',
    expected_cost: 1050,
  },

  // ── 노원구 ────────────────────────────────────────────────
  {
    complex_name: '상계주공3단지',
    location: '서울 노원구',
    avg_asset_value: 5.0,
    stage: 'approval',
    expected_cost: 870,
  },
  {
    complex_name: '월계시영아파트',
    location: '서울 노원구',
    avg_asset_value: 4.5,
    stage: 'planning',
    expected_cost: 855,
  },

  // ── 은평구 ────────────────────────────────────────────────
  {
    complex_name: '불광동 미성아파트',
    location: '서울 은평구',
    avg_asset_value: 5.5,
    stage: 'planning',
    expected_cost: 860,
  },

  // ── 성북구 ────────────────────────────────────────────────
  {
    complex_name: '장위1구역',
    location: '서울 성북구',
    avg_asset_value: 4.8,
    stage: 'management',
    expected_cost: 875,
  },

  // ── 동대문구 ──────────────────────────────────────────────
  {
    complex_name: '전농답십리뉴타운',
    location: '서울 동대문구',
    avg_asset_value: 5.2,
    stage: 'construction',
    expected_cost: 890,
  },

  // ── 성동구 ────────────────────────────────────────────────
  {
    complex_name: '금호벽산아파트',
    location: '서울 성동구',
    avg_asset_value: 9.0,
    stage: 'approval',
    expected_cost: 945,
  },

  // ── 동작구 ────────────────────────────────────────────────
  {
    complex_name: '흑석뉴타운3구역',
    location: '서울 동작구',
    avg_asset_value: 7.0,
    stage: 'construction',
    expected_cost: 920,
  },

  // ── 관악구 ────────────────────────────────────────────────
  {
    complex_name: '봉천13구역',
    location: '서울 관악구',
    avg_asset_value: 4.2,
    stage: 'planning',
    expected_cost: 845,
  },
];

// ── Lookup helpers ─────────────────────────────────────────

export function findComplex(name: string): ComplexData | undefined {
  return COMPLEX_DATASET.find(
    (c) => c.complex_name === name || c.complex_name === decodeURIComponent(name),
  );
}

export function getComplexesByLocation(location: string): ComplexData[] {
  return COMPLEX_DATASET.filter((c) => c.location.includes(location));
}

export const STAGE_LABELS: Record<ComplexStage, string> = {
  planning:     '기본계획 수립',
  approval:     '사업시행인가',
  management:   '관리처분인가',
  construction: '착공 / 공사 중',
};
