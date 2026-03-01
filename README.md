# 📊 M-DEENO Prop-Logic™

> **"정비사업 사업성 리스크를 정량화하는 데이터 분석 엔진"** > 도시공학 시나리오와 공사비 변수를 결합한 실시간 사업성 시뮬레이션 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-DB-green?logo=supabase)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Backend-Render-blue?logo=render)](https://render.com/)

---

## 🚀 프로젝트 개요

**Prop-Logic**은 정비사업(재건축/재개발) 과정에서 조합원이 겪는 분담금 불확실성을 해결하기 위한 도구입니다. 복잡한 수식을 배제하고 핵심 변수인 **'공사비'**와 **'자산가치'**를 제어하여 누구나 직관적으로 사업 안정성을 점검할 수 있도록 설계되었습니다.
본 플랫폼은 조합원 단위 리스크 진단과 동시에, 단지 단위 구조 데이터를 축적하는 민간 데이터 레이어 구축을 목표로 합니다.

### 🧪 주요 기능

- **실시간 구조 분석 엔진**: 슬라이더를 통해 평당 공사비 변화에 따른 사업 안정성(Prop-Logic Index) 실시간 산출
- **시장 환경 시나리오**: 현재 평균, 최악 가정, 최고 구간 등 3가지 거시경제 시나리오 적용
- **데이터 기반 리드 수집**: 분석 결과를 바탕으로 전문가 정밀 검증 보고서 신청 프로세스 구현
- **반응형 UX**: 모바일과 데스크탑 어디서든 쾌적하게 시뮬레이션 가능한 대시보드 UI

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Styling**: CSS Modules (Custom Laboratory Theme)
- **Deployment**: Vercel

### Backend & Database

- **Logic Engine**: Python FastAPI (Deployed on Render)
- **Database**: Supabase (PostgreSQL)
- **Authentication/Security**: Supabase RLS (Row Level Security)

---

## 🏗 아키텍처 및 보안 (Architecture & Security)

### 1. API Route Proxying

브라우저의 CORS 이슈를 방지하고 백엔드 보안을 강화하기 위해 Next.js 내부 API Route를 프록시로 사용하여 서버 간 통신(S2S) 구조를 구축했습니다.

### 2. Debouncing Optimization

사용자의 빈번한 입력 변화(Slider 드래그 등)로 인한 불필요한 API 호출을 방지하기 위해 500ms 디바운싱 로직을 적용, 서버 부하를 최소화했습니다.

### 3. Supabase RLS (Row Level Security)

`expert_requests` 테이블에 대해 익명 사용자의 `INSERT` 권한만 허용하고, 외부에서의 `SELECT`를 원천 차단하여 사용자 이메일 등 리드 데이터를 안전하게 보호합니다.

---

## ⚙️ 실행 방법 (Local Development)

1. 저장소 클론

   ```bash
   git clone [https://github.com/mdeeno/mdeeno-platform.git](https://github.com/mdeeno/mdeeno-platform.git)
   ```

2. **패키지 설치**

   ```bash
   pnpm install
   ```

3. **환경 변수 세팅 (.env.local)**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **로컬 서버 실행**

   ```bash
   pnpm dev
   ```

---

## 👤 Author

- **M-DEENO Official** ([mdeeno.com](https://mdeeno.com))
- 정비사업 및 부동산 의사결정 구조 연구소

---

© 2026 M-DEENO. All rights reserved.

```

```

```

```
