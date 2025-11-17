-- Add Chinese and Korean translations for blog posts

-- Blog Post 1
UPDATE blog_posts SET 
  title_zh = '突破抱石 V5-V7 的5个技巧',
  title_ko = '볼더링 V5-V7 돌파를 위한 5가지 기술',
  content_zh = '从 V5 进步到 V7 需要不仅仅是力量的提升。本文介绍了基于30年攀岩经验的5个关键技巧，包括身体定位、重心控制和高效动作。',
  content_ko = 'V5에서 V7로 진보하려면 단순한 힘 이상이 필요합니다. 이 글에서는 30년의 클라이밍 경험을 바탕으로 한 5가지 핵심 기술을 소개합니다. 신체 위치, 중심 제어 및 효율적인 움직임을 포함합니다.'
WHERE id = 1;

-- Blog Post 2
UPDATE blog_posts SET 
  title_zh = '攀岩鞋选择完全指南 2025年版',
  title_ko = '클라이밍 신발 선택 완벽 가이드 2025년 버전',
  content_zh = '选择合适的攀岩鞋对您的表现至关重要。本综合指南涵盖了120多款鞋子，并详细说明了适合不同攀岩风格的鞋型、尺寸选择和橡胶类型。',
  content_ko = '적합한 클라이밍 신발 선택은 성능에 매우 중요합니다. 이 종합 가이드는 120개 이상의 신발을 다루며, 다양한 클라이밍 스타일에 맞는 신발 유형, 사이즈 선택 및 고무 종류를 자세히 설명합니다.'
WHERE id = 2;

-- Blog Post 3
UPDATE blog_posts SET 
  title_zh = '基于科学证据的指力板训练：30年经验总结',
  title_ko = '과학적 근거 기반 핑거보드 트레이닝: 30년 경험에서',
  content_zh = '指力板训练是提高攀岩能力的最有效方法之一。本文基于最新运动科学研究和30年的实践经验，介绍了如何安全有效地使用指力板，避免常见的伤害。',
  content_ko = '핑거보드 트레이닝은 클라이밍 능력 향상을 위한 가장 효과적인 방법 중 하나입니다. 이 글은 최신 운동 과학 연구와 30년의 실전 경험을 바탕으로 핑거보드를 안전하고 효과적으로 사용하는 방법과 일반적인 부상을 피하는 방법을 소개합니다.'
WHERE id = 3;

-- Add Chinese and Korean translations for announcements

-- Announcement 1
UPDATE announcements SET 
  title_zh = '新功能发布',
  title_ko = '새로운 기능 출시',
  content_zh = '添加了按平台筛选功能！您可以从YouTube、Instagram、TikTok、Vimeo中选择来查找视频。',
  content_ko = '플랫폼별 필터 기능 추가! YouTube, Instagram, TikTok, Vimeo에서 선택하여 동영상을 찾을 수 있습니다.'
WHERE id = 1;

-- Announcement 2
UPDATE announcements SET 
  title_zh = '维护通知',
  title_ko = '유지보수 안내',
  content_zh = '将于2025年11月20日（周三）凌晨2:00-4:00进行服务器维护。',
  content_ko = '2025년 11월 20일(수) 오전 2:00-4:00에 서버 유지보수를 실시합니다.'
WHERE id = 2;

-- Announcement 3
UPDATE announcements SET 
  title_zh = '冬季促销活动开始',
  title_ko = '겨울 캠페인 시작',
  content_zh = '注册高级会员首月可享50%折扣！限时活动至2025年12月31日。',
  content_ko = '프리미엄 회원 가입 시 첫 달 50% 할인! 2025년 12월 31일까지 한정 캠페인 진행 중입니다.'
WHERE id = 3;

-- Announcement 4
UPDATE announcements SET 
  title_zh = '社区活动举办',
  title_ko = '커뮤니티 이벤트 개최',
  content_zh = '12月15日（周日）将举办在线攀岩交流会。与全世界的攀岩者联系！',
  content_ko = '12월 15일(일)에 온라인 클라이밍 교류회를 개최합니다. 전 세계 클라이머들과 연결하세요!'
WHERE id = 4;

-- Announcement 5
UPDATE announcements SET 
  title_zh = '新教程添加',
  title_ko = '새로운 튜토리얼 추가',
  content_zh = '添加了突破V5-V7的详细技巧解说视频。从初学者到中级者必看！',
  content_ko = 'V5-V7 돌파를 위한 상세한 기술 해설 동영상을 추가했습니다. 초보자부터 중급자까지 필독!'
WHERE id = 5;

-- Announcement 6
UPDATE announcements SET 
  title_zh = '系统更新完成',
  title_ko = '시스템 업데이트 완료',
  content_zh = '性能提升系统更新已完成。视频加载速度提高了30%！',
  content_ko = '성능 향상을 위한 시스템 업데이트가 완료되었습니다. 동영상 로딩 속도가 30% 향상!'
WHERE id = 6;

-- Announcement 7
UPDATE announcements SET 
  title_zh = '春季大感谢祭',
  title_ko = '봄 대감사제',
  content_zh = '会员专享！春季大感谢祭正在举办。准备了众多特别内容。',
  content_ko = '회원 한정! 봄 대감사제 개최 중. 특별 콘텐츠를 다수 준비했습니다.'
WHERE id = 7;

-- Announcement 8
UPDATE announcements SET 
  title_zh = '攀岩者交流会报告',
  title_ko = '클라이머 교류회 리포트',
  content_zh = '上个月举办的攀岩者交流会报告！有100多人参加了。',
  content_ko = '지난달 개최된 클라이머 교류회 리포트! 100명 이상이 참가했습니다.'
WHERE id = 8;
