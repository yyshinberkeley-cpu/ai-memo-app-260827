insert into public.memos (id, title, content, category, tags, created_at, updated_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '프로젝트 회의 준비',
    '다음 주 월요일 오전 10시 프로젝트 킥오프 미팅을 위한 준비사항:

- 프로젝트 범위 정의서 작성
- 팀원별 역할 분담
- 일정 계획 수립
- 필요한 리소스 정리',
    'work',
    array['회의', '프로젝트', '준비'],
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'React 18 새로운 기능 학습',
    'React 18에서 새로 추가된 기능들을 학습해야 함:

1. Concurrent Features
2. Automatic Batching
3. Suspense 개선사항
4. useId Hook
5. useDeferredValue Hook

이번 주말에 공식 문서를 읽고 간단한 예제를 만들어보자.',
    'study',
    array['React', '학습', '개발'],
    now() - interval '5 days',
    now() - interval '1 day'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '새로운 앱 아이디어: 습관 트래커',
    '매일 실천하고 싶은 습관들을 관리할 수 있는 앱:

핵심 기능:
- 습관 등록 및 관리
- 일일 체크인
- 진행 상황 시각화
- 목표 달성 알림
- 통계 분석

기술 스택: React Native + Supabase
출시 목표: 3개월 후',
    'idea',
    array['앱개발', '습관', 'React Native'],
    now() - interval '7 days',
    now() - interval '3 days'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '주말 여행 계획',
    '이번 주말 제주도 여행 계획:

토요일:
- 오전: 한라산 등반
- 오후: 성산일출봉 관광
- 저녁: 흑돼지 맛집 방문

일요일:
- 오전: 우도 관광
- 오후: 쇼핑 및 기념품 구매
- 저녁: 공항 이동

준비물: 등산화, 카메라, 선크림',
    'personal',
    array['여행', '제주도', '주말'],
    now() - interval '10 days',
    now() - interval '8 days'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    '독서 목록',
    '올해 읽고 싶은 책들:

개발 관련:
- 클린 코드 (로버트 C. 마틴)
- 리팩토링 2판 (마틴 파울러)
- 시스템 디자인 인터뷰 (알렉스 쉬)

자기계발:
- 아토믹 해빗 (제임스 클리어)
- 데일 카네기 인간관계론

소설:
- 82년생 김지영 (조남주)
- 미드나잇 라이브러리 (매트 헤이그)',
    'personal',
    array['독서', '책', '자기계발'],
    now() - interval '15 days',
    now() - interval '15 days'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    '성능 최적화 아이디어',
    '웹 애플리케이션 성능 최적화 방법들:

프론트엔드:
- 이미지 최적화 (WebP, lazy loading)
- 코드 스플리팅
- 번들 크기 최적화
- 캐싱 전략

백엔드:
- 데이터베이스 쿼리 최적화
- CDN 활용
- 서버 사이드 렌더링
- API 응답 캐싱

모니터링:
- Core Web Vitals 측정
- 성능 예산 설정',
    'idea',
    array['성능', '최적화', '웹개발'],
    now() - interval '20 days',
    now() - interval '12 days'
  )
on conflict (id) do nothing;
