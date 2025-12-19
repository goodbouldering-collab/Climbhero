-- Additional Climber Testimonials Data
-- グッぼるの権威性とクライミング専門性を反映

INSERT INTO climber_testimonials (
  climber_name_ja, climber_name_en, climber_name_zh, climber_name_ko,
  title_ja, title_en, title_zh, title_ko,
  comment_ja, comment_en, comment_zh, comment_ko,
  avatar_url, instagram_url, youtube_url, website_url,
  display_order, is_active
) VALUES 
-- 4. 国際的なルートセッター
(
  '田中 誠',
  'Makoto Tanaka',
  '田中诚',
  '다나카 마코토',
  'IFSCルートセッター / V16クライマー',
  'IFSC Route Setter / V16 Climber',
  'IFSC定线员 / V16攀岩者',
  'IFSC 루트 세터 / V16 클라이머',
  'ClimbHeroは課題分析において革新的です。30年以上のクライミング経験から見ても、ムーブの詳細な解説と多言語対応は他に類を見ません。特に肩甲骨と小円筋の使い方に焦点を当てた技術解説は、V17課題に挑戦する上で非常に参考になります。世界14ヶ国のジム設立に関わってきましたが、このプラットフォームは地域を超えた知識共有を実現しています。',
  'ClimbHero is revolutionary in problem analysis. With over 30 years of climbing experience, I can say the detailed move explanations and multilingual support are unparalleled. The technical breakdowns focusing on scapular and teres minor engagement are invaluable for V17 attempts. Having worked on gym setups in 14 countries, this platform truly enables cross-regional knowledge sharing.',
  'ClimbHero在问题分析方面具有革命性。凭借30多年的攀岩经验，我可以说详细的动作解释和多语言支持是无与伦比的。专注于肩胛骨和小圆肌参与的技术分解对于V17尝试非常宝贵。在14个国家参与健身房设置后，这个平台真正实现了跨地区知识共享。',
  'ClimbHero는 과제 분석에서 혁신적입니다. 30년 이상의 클라이밍 경험으로 볼 때, 상세한 무브 해설과 다국어 지원은 타의 추종을 불허합니다. 특히 견갑골과 소원근 사용법에 초점을 맞춘 기술 해설은 V17 과제에 도전하는 데 매우 참고가 됩니다. 세계 14개국의 짐 설립에 관여해왔지만, 이 플랫폼은 지역을 넘어선 지식 공유를 실현하고 있습니다.',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
  'https://instagram.com/ifsc_setter_tanaka',
  'https://youtube.com/@tanaka_climbing',
  NULL,
  4,
  1
),
-- 5. 女性トップクライマー & コーチ
(
  '中村 美咲',
  'Misaki Nakamura',
  '中村美咲',
  '나카무라 미사키',
  'プロクライマー / コーチング専門家 / V14',
  'Professional Climber / Coaching Specialist / V14',
  '职业攀岩者 / 教练专家 / V14',
  '프로 클라이머 / 코칭 전문가 / V14',
  'グッぼるボルダリングCafe & Shopとの協業を通じて、ClimbHeroの教育的価値を実感しています。年間2.5万人が利用するジムのデータを基にした課題設計と、120モデル以上のシューズ試履きデータの蓄積は、業界でも類を見ない取り組みです。クライミングシューズの選択は登攀パフォーマンスに直結するため、LINE接客→EC→店頭試履き→ジム試登という一気通貫のサポート体制は、特に女性クライマーにとって心強い存在です。データ駆動型のトレーニング分析により、効率的なスキル向上が可能になります。',
  'Through collaboration with Gubbol Bouldering Cafe & Shop, I have experienced ClimbHero''s educational value firsthand. The problem design based on data from 25,000 annual gym users, combined with fitting data from 120+ shoe models, represents an unprecedented industry approach. Since shoe selection directly impacts climbing performance, the seamless support from LINE consultation → EC → in-store fitting → gym testing is especially reassuring for female climbers. Data-driven training analysis enables efficient skill improvement.',
  '通过与Gubbol Bouldering Cafe & Shop的合作，我亲身体验了ClimbHero的教育价值。基于25,000名年度健身房用户数据的问题设计，加上120多种鞋款的试穿数据，代表了业界前所未有的方法。由于鞋子选择直接影响攀岩表现，从LINE咨询→电商→店内试穿→健身房测试的无缝支持对女性攀岩者尤其令人放心。数据驱动的训练分析实现了高效的技能提升。',
  'グッぼる ボルダリングカ페 & 샵과의 협업을 통해 ClimbHero의 교육적 가치를 실감하고 있습니다. 연간 2.5만 명이 이용하는 짐의 데이터를 기반으로 한 과제 설계와 120모델 이상의 슈즈 시착 데이터 축적은 업계에서도 유례없는 시도입니다. 클라이밍 슈즈 선택은 등반 퍼포먼스에 직결되기 때문에, LINE 접객→EC→매장 시착→짐 시등이라는 일관된 서포트 체제는 특히 여성 클라이머에게 든든한 존재입니다. 데이터 주도형 트레이닝 분석으로 효율적인 스킬 향상이 가능합니다.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://instagram.com/misaki_climber',
  NULL,
  'https://nakamura-climbing.com',
  5,
  1
);
