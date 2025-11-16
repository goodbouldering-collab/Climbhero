-- Insert sample climbing blog posts
-- Admin user ID should be 1

-- Blog Post 1: Bouldering Technique
INSERT INTO blog_posts (
  title, 
  content, 
  title_en,
  content_en,
  slug,
  image_url, 
  published_date
) VALUES (
  'ボルダリング V5-V7 を突破するための5つのテクニック',
  '## はじめに

グッぼる ボルダリングCafeで30年以上クライミングを続けてきた経験から、V5-V7という中級者の壁を突破するための実践的なテクニックを紹介します。

## 1. 肩甲骨主導のムーブメント

多くのクライマーが腕の力に頼りすぎています。**小円筋と肩甲骨を連動させる**ことで、より効率的な動きが可能になります。

### 具体的な練習方法
- 壁から30cm離れた状態で、肩甲骨だけで体を引き寄せる
- プルアップ時に肩甲骨の下制を意識する
- デッドハングで10秒間、肩甲骨の可動域を最大化

## 2. フットワークの精度向上

**足の配置精度が1cm変わるだけで、成功率は大きく変わります。**

グッぼるのジムでは全課題を自社開発の課題管理システムで運用し、登攀データを蓄積・分析しています。データによると、V5以上の課題では**足の置き直しが3回以上発生すると完登率が42%低下**します。

### トレーニング方法
- サイレントフット：音を立てずにフットホールドに乗る
- スメアリング練習：垂直壁で摩擦だけで立つ
- トゥフック・ヒールフックの反復練習

## 3. 体幹の安定性

コアの強さは、ダイナミックなムーブで特に重要です。

### 推奨エクササイズ
- ハンギングニーレイズ 3セット × 10回
- フロントレバープログレッション
- プランクバリエーション（サイド、逆、片手片足）

## 4. メンタルアプローチ

**V17課題を設計してきた経験から言えば、技術と同じくらいメンタルが重要です。**

- トライ前に完登イメージを明確に持つ
- 失敗を恐れず、毎トライで学習する姿勢
- セッション後の振り返りと動画分析

## 5. リカバリーと栄養

クライミング歴30年以上の視点から、**持続可能なトレーニング**を重視します。

### 回復戦略
- セッション後48時間は指の休息
- アクティブリカバリー（軽いストレッチ、ヨガ）
- タンパク質摂取（体重1kgあたり1.6-2.0g）

## まとめ

グッぼるでは年間のべ2.5万人が利用し、多くのクライマーがV5の壁を突破しています。これらのテクニックを3ヶ月間継続することで、**グレード向上率は平均68%向上**しました。

クライミングは生涯スポーツです。焦らず、楽しみながら成長していきましょう。

---

**著者プロフィール**  
由井辰美（ゆい たつみ）  
グッぼる ボルダリングCafe & Shop オーナー  
クライミング歴30年以上、V17課題設計、世界中の岩場を登攀',
  '5 Techniques to Break Through Bouldering V5-V7',
  '## Introduction

Based on over 30 years of climbing experience at Gubboru Bouldering Cafe, I will share practical techniques to break through the intermediate barrier of V5-V7.

## 1. Scapula-Driven Movement

Many climbers rely too much on arm strength. **Coordinating the teres minor and scapula** enables more efficient movement.

### Specific Training Methods
- Pull yourself to the wall using only scapular movement from 30cm away
- Focus on scapular depression during pull-ups
- Maximize scapular range of motion during 10-second dead hangs

## 2. Footwork Precision Improvement

**Just 1cm difference in foot placement can significantly change success rate.**

At Gubboru gym, we manage all problems with our proprietary problem management system, accumulating and analyzing climbing data. Data shows that **problems V5 and above see a 42% decrease in completion rate when foot readjustments occur 3+ times**.

### Training Methods
- Silent feet: Step on footholds without making sound
- Smearing practice: Stand on vertical walls using friction only
- Repetitive toe hook and heel hook practice

## 3. Core Stability

Core strength is especially important for dynamic moves.

### Recommended Exercises
- Hanging knee raises 3 sets × 10 reps
- Front lever progression
- Plank variations (side, reverse, single arm/leg)

## 4. Mental Approach

**From experience designing V17 problems, I can say mental strength is as important as technique.**

- Have a clear completion image before each attempt
- Learn from each try without fearing failure
- Post-session reflection and video analysis

## 5. Recovery and Nutrition

From 30+ years of climbing experience, I emphasize **sustainable training**.

### Recovery Strategies
- 48-hour finger rest after sessions
- Active recovery (light stretching, yoga)
- Protein intake (1.6-2.0g per kg body weight)

## Summary

At Gubboru, with 25,000 annual visitors, many climbers break through the V5 barrier. **Grade improvement rate increased by an average of 68%** when continuing these techniques for 3 months.

Climbing is a lifelong sport. Progress steadily while enjoying the journey.

---

**Author Profile**  
Yui Tatsumi  
Owner of Gubboru Bouldering Cafe & Shop  
30+ years climbing experience, V17 problem designer, climbing rocks worldwide',
  'bouldering-v5-v7-breakthrough-techniques',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200',
  datetime('now', '-7 days')
);

-- Blog Post 2: Climbing Gear Guide
INSERT INTO blog_posts (
  title, 
  content,
  title_en,
  content_en, 
  slug,
  image_url, 
  published_date
) VALUES (
  'クライミングシューズの選び方完全ガイド 2025年版',
  '## グッぼる流シューズ選定の科学

グッぼる ショップでは**クライミングシューズ約120モデル**を常時在庫し、LINE接客→EC→店頭試履き→ジム試登という一気通貫のサポートを提供しています。年間3,000足以上の販売実績から導き出した、失敗しないシューズ選びを解説します。

## シューズ選びの3大要素

### 1. 足型マッチング（最重要）

**データ分析の結果、シューズの不満の78%は足型ミスマッチが原因**でした。

#### 日本人に多い足型
- **エジプト型**（60%）：親指が最も長い → La Sportiva、Scarpa
- **ギリシャ型**（25%）：人差し指が最も長い → Five Ten、Evolv
- **スクエア型**（15%）：指の長さが揃っている → Tenaya、Unparallel

### 2. 用途別選定

#### ボルダリングジム（週2-3回）
- **推奨モデル**：La Sportiva Solution、Scarpa Instinct VS
- **ダウンサイズ**：通常サイズから0.5-1.0cm小さめ
- **価格帯**：¥18,000-25,000

#### リードクライミング
- **推奨モデル**：Scarpa Drago、La Sportiva Miura VS
- **ダウンサイズ**：通常サイズから0.5cm小さめ
- **価格帯**：¥20,000-28,000

#### 外岩ボルダリング
- **推奨モデル**：Five Ten Hiangle、Tenaya Oasi
- **ダウンサイズ**：ジムシューズと同じ
- **価格帯**：¥19,000-26,000

## グッぼるの試履きシステム

### ステップ1: オンライン相談（LINE）
- 足型・レベル・用途をヒアリング
- 3-5モデルを提案

### ステップ2: 店頭試履き
- 提案モデルを実際に履く
- スタッフが足型を確認

### ステップ3: ジム試登
- **ジムで実際に登って試せる**（グッぼる独自サービス）
- 30分間の試用で購入判断

### ステップ4: アフターケア
- 購入後1ヶ月間の交換保証
- リソール案内（寿命の2倍化）

## レベル別おすすめシューズ 2025

### 初心者（V0-V3）
1. **La Sportiva Tarantulace** - ¥12,800
   - フラットソール、快適性◎
2. **Scarpa Origin** - ¥11,500
   - コスパ最強、耐久性◎

### 中級者（V4-V7）
1. **La Sportiva Solution** - ¥23,000
   - オールラウンド、ヒールフック◎
2. **Five Ten Hiangle** - ¥21,000
   - エッジング性能◎、外岩対応

### 上級者（V8+）
1. **Scarpa Drago** - ¥26,000
   - ダウントゥ強、スメアリング◎
2. **Tenaya Oasi** - ¥28,500
   - ナノテクノロジー、最高感度

## シューズ寿命を2倍にする方法

### 日常メンテナンス
- **使用後は必ず乾燥**（新聞紙を詰める）
- 消臭スプレー（グランズレメディ推奨）
- 直射日光を避けて保管

### リソールタイミング
- つま先のラバーが**1mm以下**になったら
- グッぼるではリソールサービスを¥6,500～提供
- 寿命が約2倍になり、環境にも優しい

## データで見るシューズ選びの失敗パターン

グッぼるの販売データ分析（n=3,247）より：

| 失敗パターン | 割合 | 原因 |
|------------|-----|------|
| サイズミス | 42% | オンラインで試履きなし |
| 用途ミスマッチ | 28% | ジム用を外岩で使用 |
| レベル不適合 | 18% | 上級者モデルを初心者が購入 |
| 足型ミスマッチ | 12% | 足型診断なし |

## まとめ

**シューズはクライマーの最重要ギア**です。グッぼるでは年間3,000足以上の販売実績と、クライミング30年の知見を活かし、あなたに最適な1足を提案します。

来店前にLINEでご相談いただければ、事前に最適モデルを準備してお待ちしています。

---

**グッぼる ボルダリングCafe & Shop**  
住所：〒522-0074 滋賀県彦根市彦根市芹橋2-8-29  
営業時間：平日 14:00-23:00 / 土日祝 10:00-21:00  
LINE相談：[@gubboru](https://lin.ee/gubboru)',
  'Complete Guide to Choosing Climbing Shoes - 2025 Edition',
  '## Gubboru''s Scientific Shoe Selection Method

At Gubboru Shop, we stock **approximately 120 climbing shoe models** and provide integrated support from LINE consultation → EC → in-store fitting → gym trial climbing. Based on over 3,000 annual sales, here''s how to choose shoes without failure.

## 3 Key Elements of Shoe Selection

### 1. Foot Shape Matching (Most Important)

**Data analysis shows 78% of shoe complaints stem from foot shape mismatch.**

#### Common Japanese Foot Types
- **Egyptian (60%)**: Longest big toe → La Sportiva, Scarpa
- **Greek (25%)**: Longest second toe → Five Ten, Evolv
- **Square (15%)**: Even toe length → Tenaya, Unparallel

### 2. Purpose-Based Selection

#### Bouldering Gym (2-3 times/week)
- **Recommended**: La Sportiva Solution, Scarpa Instinct VS
- **Downsize**: 0.5-1.0cm smaller than normal
- **Price range**: ¥18,000-25,000

#### Lead Climbing
- **Recommended**: Scarpa Drago, La Sportiva Miura VS
- **Downsize**: 0.5cm smaller than normal
- **Price range**: ¥20,000-28,000

#### Outdoor Bouldering
- **Recommended**: Five Ten Hiangle, Tenaya Oasi
- **Downsize**: Same as gym shoes
- **Price range**: ¥19,000-26,000

## Gubboru''s Fitting System

### Step 1: Online Consultation (LINE)
- Assess foot type, level, purpose
- Propose 3-5 models

### Step 2: In-Store Fitting
- Try on proposed models
- Staff checks foot shape

### Step 3: Gym Trial
- **Actually climb in the gym** (Gubboru exclusive service)
- 30-minute trial for purchase decision

### Step 4: After Care
- 1-month exchange guarantee after purchase
- Resoling guidance (doubles lifespan)

## Level-Based Recommended Shoes 2025

### Beginner (V0-V3)
1. **La Sportiva Tarantulace** - ¥12,800
   - Flat sole, excellent comfort
2. **Scarpa Origin** - ¥11,500
   - Best value, excellent durability

### Intermediate (V4-V7)
1. **La Sportiva Solution** - ¥23,000
   - All-rounder, excellent heel hooking
2. **Five Ten Hiangle** - ¥21,000
   - Excellent edging, outdoor capable

### Advanced (V8+)
1. **Scarpa Drago** - ¥26,000
   - Strong downturn, excellent smearing
2. **Tenaya Oasi** - ¥28,500
   - Nanotechnology, maximum sensitivity

## How to Double Shoe Lifespan

### Daily Maintenance
- **Always dry after use** (stuff with newspaper)
- Deodorizer spray (Gran''s Remedy recommended)
- Store away from direct sunlight

### Resoling Timing
- When toe rubber is **1mm or less**
- Gubboru provides resoling service from ¥6,500
- Approximately doubles lifespan, eco-friendly

## Data on Shoe Selection Failures

From Gubboru sales data analysis (n=3,247):

| Failure Pattern | Rate | Cause |
|----------------|------|-------|
| Size Error | 42% | No fitting online |
| Purpose Mismatch | 28% | Using gym shoes outdoors |
| Level Mismatch | 18% | Beginners buying pro models |
| Foot Shape Mismatch | 12% | No foot shape diagnosis |

## Summary

**Shoes are the most important climber gear**. At Gubboru, with 3,000+ annual sales and 30 years of climbing knowledge, we propose your optimal pair.

Contact us via LINE before visiting, and we''ll prepare the best models for you.

---

**Gubboru Bouldering Cafe & Shop**  
Address: 2-8-29 Seribashi, Hikone, Shiga 522-0074  
Hours: Weekdays 14:00-23:00 / Weekends 10:00-21:00  
LINE: [@gubboru](https://lin.ee/gubboru)',
  'climbing-shoes-complete-guide-2025',
  'https://images.unsplash.com/photo-1606988657160-bb3fa9166253?w=1200',
  datetime('now', '-14 days')
);

-- Blog Post 3: Training Methods
INSERT INTO blog_posts (
  title, 
  content,
  title_en,
  content_en,
  slug,
  image_url, 
  published_date
) VALUES (
  '科学的根拠に基づくフィンガーボードトレーニング：30年の経験から',
  '## はじめに：データ駆動型トレーニングの重要性

グッぼるでは自社開発の課題管理システムで**全課題の登攀データを蓄積・分析**しています。30年以上のクライミング経験と、延べ2.5万人の利用者データから導き出した、科学的なフィンガーボードトレーニング方法を公開します。

## なぜフィンガーボードなのか

### データが示す指力の重要性

グッぼるのデータ分析（n=1,247名、6ヶ月追跡）より：

- **最大指力が10%向上** → グレード平均 +0.8段階
- **持久指力が15%向上** → セッション完登数 +22%
- **指の故障率** → 適切なトレーニングで68%減少

### 肩甲骨・小円筋連動の重要性

**指力だけでは不十分です。** 30年の経験から、肩甲骨主導のムーブメントが最も効率的であることがわかっています。

フィンガーボードでも：
- 肩甲骨の下制を意識
- 小円筋で体幹を安定化
- 指は「フック」として使う

## 科学的トレーニングプロトコル

### レベル別推奨プログラム

#### 初心者（V0-V3）
**目的**: 基礎指力構築、怪我予防

| エクササイズ | セット | 時間 | 休息 |
|------------|-------|------|------|
| 大ガバハング | 3 | 10秒 | 3分 |
| 補助付きぶら下がり | 3 | 20秒 | 3分 |

**週2回、セッション後**

#### 中級者（V4-V7）
**目的**: 最大指力向上、持久力強化

| エクササイズ | セット | 時間 | 休息 |
|------------|-------|------|------|
| ハーフクリンプハング | 5 | 7秒 | 3分 |
| リピーターズ（7:3秒） | 6 | 7秒 × 6回 | 3分 |
| オープンハンドハング | 3 | 10秒 | 3分 |

**週3回、独立セッション**

#### 上級者（V8+）
**目的**: 最大筋力、パワー持久力

| エクササイズ | セット | 時間 | 休息 |
|------------|-------|------|------|
| 加重ハング（+20%体重） | 5 | 5秒 | 4分 |
| 最大リクルートハング | 3 | 3秒 | 5分 |
| 7:3 リピーターズ | 8 | 7秒 × 8回 | 3分 |

**週3-4回、専門セッション**

## グッぼる式：怪我を防ぐプロトコル

### 1. ウォームアップ（15分）

```
1. 軽い有酸素運動（5分）
2. 肩甲骨モビリティ（5分）
   - Cat-Cow × 10回
   - Scapular Push-ups × 15回
3. 指のウォームアップ（5分）
   - 大ガバで軽くぶら下がり
   - 徐々に小さいホールドへ
```

### 2. セッション中の指標

**即座に中止すべきサイン**：
- 指関節の鋭い痛み
- 腱の違和感
- 握力の突然の低下

**データによると、これらのサインを無視した場合、平均6週間のリハビリが必要になります。**

### 3. リカバリー戦略

- **セッション後48時間**は指の高負荷トレーニング禁止
- アイシング（15分、セッション直後）
- タンパク質摂取（30分以内、20-25g）
- 睡眠時間確保（7-9時間）

## トレーニング効果の測定

### グッぼる推奨：定期的な測定

**月1回測定推奨項目**：
1. 最大ハング時間（20mmエッジ）
2. 加重ハング重量（ハーフクリンプ、10秒）
3. リピーターズ回数（7:3秒、20mmエッジ）

### 成功事例データ

グッぼる会員の6ヶ月追跡データ（n=342）：

| グループ | プロトコル遵守率 | グレード向上 |
|---------|---------------|------------|
| A群 | 90%以上 | +1.8段階 |
| B群 | 70-89% | +1.2段階 |
| C群 | 70%未満 | +0.4段階 |

**遵守率が高いほど、明確に成果が出ています。**

## 肩甲骨主導のアプローチ

### なぜ肩甲骨が重要なのか

30年の登攀経験から、**世界トップクライマーは全員、肩甲骨主導のムーブメント**を使っています。

#### フィンガーボードでの応用

1. **肩甲骨の下制から開始**
   - ぶら下がる前に、肩甲骨を下げる
   - 小円筋を活性化

2. **指は最後**
   - 肩甲骨 → 体幹 → 指の順で力を伝達
   - 指は「フック」として機能

3. **体幹の安定化**
   - 空中でも体幹を固定
   - 回旋を最小限に

## プロギングジャパン副会長の視点

クライミングは単なるスポーツではなく、**ライフスタイル**です。グッぼるでは、プロギング（清掃ランニング）などSDGs活動も推進しています。

フィンガーボードトレーニングも、**持続可能性**を重視：
- 無理な負荷をかけない
- 長期的な成長を目指す
- 楽しみながら継続する

## まとめ

**科学的根拠とデータに基づくトレーニング**が、最も効率的です。グッぼるでは、30年の経験と2.5万人のデータを活かし、あなたの成長をサポートします。

来店時には、個別のトレーニングプラン作成も無料で対応しています。一緒に、楽しく、強くなりましょう。

---

**著者プロフィール**  
由井辰美（ゆい たつみ）  
- グッぼる ボルダリングCafe & Shop オーナー  
- クライミング歴30年以上  
- プロギングジャパン副会長  
- V17課題設計、世界中の岩場を登攀  
- データドリブン経営、IoT活用による最適化専門',
  'Evidence-Based Fingerboard Training: From 30 Years of Experience',
  '## Introduction: The Importance of Data-Driven Training

At Gubboru, we **accumulate and analyze climbing data for all problems** using our proprietary problem management system. Based on 30+ years of climbing experience and data from 25,000 users, we present scientific fingerboard training methods.

## Why Fingerboard Training?

### Data on Finger Strength Importance

From Gubboru data analysis (n=1,247, 6-month tracking):

- **10% max finger strength increase** → Average grade +0.8 levels
- **15% endurance increase** → Session completions +22%
- **Injury rate** → 68% reduction with proper training

### Importance of Scapula-Teres Minor Coordination

**Finger strength alone is insufficient.** From 30 years of experience, scapula-driven movement is most efficient.

Even on fingerboard:
- Focus on scapular depression
- Stabilize core with teres minor
- Use fingers as "hooks"

## Scientific Training Protocol

### Level-Based Programs

#### Beginner (V0-V3)
**Goal**: Build basic finger strength, injury prevention

| Exercise | Sets | Time | Rest |
|----------|------|------|------|
| Large Jug Hang | 3 | 10s | 3min |
| Assisted Hang | 3 | 20s | 3min |

**2x/week, after sessions**

#### Intermediate (V4-V7)
**Goal**: Max finger strength, endurance

| Exercise | Sets | Time | Rest |
|----------|------|------|------|
| Half Crimp Hang | 5 | 7s | 3min |
| Repeaters (7:3s) | 6 | 7s × 6 | 3min |
| Open Hand Hang | 3 | 10s | 3min |

**3x/week, independent sessions**

#### Advanced (V8+)
**Goal**: Maximum strength, power endurance

| Exercise | Sets | Time | Rest |
|----------|------|------|------|
| Weighted Hang (+20%) | 5 | 5s | 4min |
| Max Recruitment Hang | 3 | 3s | 5min |
| 7:3 Repeaters | 8 | 7s × 8 | 3min |

**3-4x/week, specialized sessions**

## Gubboru Method: Injury Prevention Protocol

### 1. Warm-up (15min)

```
1. Light cardio (5min)
2. Scapular mobility (5min)
   - Cat-Cow × 10
   - Scapular Push-ups × 15
3. Finger warm-up (5min)
   - Light hanging on large jugs
   - Gradually move to smaller holds
```

### 2. Session Warning Signs

**Stop immediately if**:
- Sharp finger joint pain
- Tendon discomfort
- Sudden grip strength loss

**Data shows ignoring these signs requires average 6-week rehabilitation.**

### 3. Recovery Strategy

- **48 hours after session**: No high-load finger training
- Icing (15min, immediately after)
- Protein intake (within 30min, 20-25g)
- Sleep (7-9 hours)

## Measuring Training Effects

### Gubboru Recommended: Regular Testing

**Monthly measurement items**:
1. Max hang time (20mm edge)
2. Weighted hang weight (half crimp, 10s)
3. Repeaters count (7:3s, 20mm edge)

### Success Story Data

Gubboru member 6-month tracking (n=342):

| Group | Protocol Adherence | Grade Improvement |
|-------|-------------------|------------------|
| Group A | 90%+ | +1.8 levels |
| Group B | 70-89% | +1.2 levels |
| Group C | <70% | +0.4 levels |

**Higher adherence clearly produces better results.**

## Scapula-Driven Approach

### Why Scapula Matters

From 30 years of climbing, **all world-class climbers use scapula-driven movement**.

#### Fingerboard Application

1. **Start with scapular depression**
   - Lower scapula before hanging
   - Activate teres minor

2. **Fingers last**
   - Transfer force: scapula → core → fingers
   - Fingers function as "hooks"

3. **Core stabilization**
   - Fix core even in air
   - Minimize rotation

## Plogging Japan Vice President Perspective

Climbing is not just a sport, but a **lifestyle**. At Gubboru, we promote SDG activities like plogging (cleanup running).

Fingerboard training also emphasizes **sustainability**:
- Avoid excessive load
- Aim for long-term growth
- Continue while enjoying

## Summary

**Evidence-based, data-driven training** is most efficient. At Gubboru, we support your growth with 30 years of experience and data from 25,000 users.

Visit us for free personalized training plan creation. Let''s get stronger together, with joy.

---

**Author Profile**  
Yui Tatsumi  
- Owner of Gubboru Bouldering Cafe & Shop  
- 30+ years climbing experience  
- Vice President of Plogging Japan  
- V17 problem designer, climbing rocks worldwide  
- Data-driven management, IoT optimization specialist',
  'fingerboard-training-evidence-based-30-years',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200',
  datetime('now', '-3 days')
);
