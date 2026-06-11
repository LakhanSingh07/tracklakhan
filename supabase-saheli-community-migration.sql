-- Migration: Recreate community tables for Saheli Community
-- Run this script in your Supabase SQL Editor

DROP TABLE IF EXISTS public.community_saved_posts CASCADE;
DROP TABLE IF EXISTS public.community_reactions CASCADE;
DROP TABLE IF EXISTS public.community_comments CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.community_page_followers CASCADE;
DROP TABLE IF EXISTS public.community_pages CASCADE;
DROP TABLE IF EXISTS public.community_group_members CASCADE;
DROP TABLE IF EXISTS public.community_groups CASCADE;
DROP TABLE IF EXISTS public.community_users CASCADE;
DROP TABLE IF EXISTS public.community_blocks CASCADE;
DROP TABLE IF EXISTS public.community_reports CASCADE;

-- ============================================================
-- Saheli Community — Supabase Seed Script
-- Run this in the Supabase SQL Editor to populate realistic data
-- ============================================================

-- ─── Create Tables ───────────────────────────────────────────
-- (skip if tables already exist — safe to re-run seed only)

CREATE TABLE IF NOT EXISTS community_users (
  id          TEXT PRIMARY KEY,
  nickname    TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#C2185B',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_groups (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#C2185B',
  type         TEXT NOT NULL DEFAULT 'public',
  created_by   TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_group_members (
  id        SERIAL PRIMARY KEY,
  group_id  INTEGER NOT NULL,
  user_id   TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_pages (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  bio            TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT 'Health',
  avatar_color   TEXT NOT NULL DEFAULT '#9C27B0',
  created_by     TEXT NOT NULL,
  follower_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_page_followers (
  id          SERIAL PRIMARY KEY,
  page_id     INTEGER NOT NULL,
  user_id     TEXT NOT NULL,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
  id             SERIAL PRIMARY KEY,
  user_id        TEXT,
  content        TEXT NOT NULL,
  image_url      TEXT,
  type           TEXT NOT NULL DEFAULT 'text',
  topic          TEXT,
  group_id       INTEGER,
  page_id        INTEGER,
  is_anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
  reaction_count INTEGER NOT NULL DEFAULT 0,
  comment_count  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id                SERIAL PRIMARY KEY,
  post_id           INTEGER NOT NULL,
  user_id           TEXT,
  body              TEXT NOT NULL,
  parent_comment_id INTEGER,
  is_anonymous      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_reactions (
  id            SERIAL PRIMARY KEY,
  post_id       INTEGER NOT NULL,
  user_id       TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_saved_posts (
  id       SERIAL PRIMARY KEY,
  user_id  TEXT NOT NULL,
  post_id  INTEGER NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Seed Users ──────────────────────────────────────────────
INSERT INTO community_users (id, nickname, avatar_color, created_at) VALUES
  ('user_priya_001',    'PriyaRose',      '#C2185B', NOW() - INTERVAL '120 days'),
  ('user_ananya_002',   'AnanyaBloom',    '#9C27B0', NOW() - INTERVAL '100 days'),
  ('user_meera_003',    'MeeraHeal',      '#E91E63', NOW() - INTERVAL '90 days'),
  ('user_sonal_004',    'SonalStrong',    '#AD1457', NOW() - INTERVAL '80 days'),
  ('user_kavitha_005',  'KavithaGlow',    '#F06292', NOW() - INTERVAL '70 days'),
  ('user_divya_006',    'DivyaCycler',    '#7B1FA2', NOW() - INTERVAL '65 days'),
  ('user_rashmi_007',   'RashmiWellness', '#D81B60', NOW() - INTERVAL '60 days'),
  ('user_nisha_008',    'NishaMoon',      '#880E4F', NOW() - INTERVAL '55 days'),
  ('user_pooja_009',    'PoojaPower',     '#C2185B', NOW() - INTERVAL '50 days'),
  ('user_lakshmi_010',  'LakshmiLight',   '#9C27B0', NOW() - INTERVAL '45 days'),
  ('user_shruti_011',   'ShrutiBalance',  '#E91E63', NOW() - INTERVAL '40 days'),
  ('user_tanvi_012',    'TanviHope',      '#AD1457', NOW() - INTERVAL '35 days'),
  ('user_riya_013',     'RiyaResilient',  '#F06292', NOW() - INTERVAL '30 days'),
  ('user_sneha_014',    'SnehaCare',      '#7B1FA2', NOW() - INTERVAL '25 days'),
  ('user_aisha_015',    'AishaRising',    '#D81B60', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Seed Groups ─────────────────────────────────────────────
INSERT INTO community_groups (name, description, avatar_color, type, created_by, member_count, created_at) VALUES
  ('PCOS Warriors',          'A supportive space for women managing PCOS — share symptoms, treatments, and daily wins together.',                             '#C2185B', 'public',  'user_priya_001',   1240, NOW() - INTERVAL '115 days'),
  ('Endometriosis Support',  'For those living with endo. No judgment, only understanding. Share your journey and find your tribe.',                          '#AD1457', 'public',  'user_ananya_002',   875, NOW() - INTERVAL '105 days'),
  ('Fertility & Hope',       'A warm, safe space for women on their fertility journey — whether TTC, IVF, or exploring options.',                             '#E91E63', 'public',  'user_meera_003',   2103, NOW() - INTERVAL '95 days'),
  ('Mental Wellness Circle', 'Talking about anxiety, depression, and emotional health without stigma. You are not alone.',                                    '#9C27B0', 'public',  'user_sonal_004',    983, NOW() - INTERVAL '85 days'),
  ('Thyroid & Hormones',     'Managing hypothyroidism, hyperthyroidism, and hormonal imbalances? Connect with women who get it.',                             '#7B1FA2', 'public',  'user_kavitha_005',  651, NOW() - INTERVAL '78 days'),
  ('Pregnancy & Postpartum', 'For expecting moms and new mothers navigating the beautiful, chaotic journey of motherhood.',                                   '#D81B60', 'public',  'user_divya_006',   1876, NOW() - INTERVAL '70 days'),
  ('Cycle Trackers',         'Understanding your menstrual cycle deeply — phases, symptoms, patterns. Knowledge is power.',                                   '#F06292', 'public',  'user_rashmi_007',   562, NOW() - INTERVAL '60 days'),
  ('Nutrition & Hormones',   'Food choices that support hormonal balance. Recipes, meal plans, anti-inflammatory eating and more.',                           '#C2185B', 'public',  'user_nisha_008',    789, NOW() - INTERVAL '55 days'),
  ('Body Image & Self-Love', 'Celebrate your body at every stage. No diet culture, no unrealistic standards — just real women lifting each other up.',       '#880E4F', 'public',  'user_pooja_009',   1134, NOW() - INTERVAL '48 days'),
  ('Perimenopausal Women',   'Private group for women navigating perimenopause. Hot flashes, mood changes, sleep — let''s talk about it all.',               '#9C27B0', 'private', 'user_lakshmi_010',  318, NOW() - INTERVAL '40 days')
ON CONFLICT DO NOTHING;

-- ─── Seed Group Members ──────────────────────────────────────
INSERT INTO community_group_members (group_id, user_id, role, joined_at)
SELECT g.id, u.id, 'member', NOW() - (RANDOM() * INTERVAL '90 days')
FROM community_groups g
CROSS JOIN community_users u
WHERE RANDOM() > 0.5
ON CONFLICT DO NOTHING;

-- Make creators admins
INSERT INTO community_group_members (group_id, user_id, role, joined_at)
SELECT g.id, g.created_by, 'admin', g.created_at
FROM community_groups g
ON CONFLICT DO NOTHING;

-- ─── Seed Professional Pages ─────────────────────────────────
INSERT INTO community_pages (name, bio, category, avatar_color, created_by, follower_count, created_at) VALUES
  ('Dr. Preethi Nair — OB-GYN',         'Senior Gynaecologist at Apollo Hospitals with 18 years of experience. Specialises in PCOS, endometriosis, and minimally invasive surgery. Sharing evidence-based women''s health insights.',                '#C2185B', 'Gynecologist',   'user_priya_001',   4820, NOW() - INTERVAL '110 days'),
  ('Dr. Sunita Sharma — Reproductive',   'Reproductive Endocrinologist & IVF specialist. Helping couples navigate infertility with compassion and cutting-edge medicine. Author of "The Fertility Code".',                                             '#E91E63', 'Gynecologist',   'user_meera_003',   3215, NOW() - INTERVAL '95 days'),
  ('Ananya Krishnan — Nutritionist',     'Certified Clinical Nutritionist focused on hormonal health and gut wellness. Helping women eat their way to balanced hormones naturally.',                                                                    '#AD1457', 'Nutritionist',   'user_ananya_002',  2890, NOW() - INTERVAL '88 days'),
  ('Priya Mehta — PCOS Nutritionist',    'PCOS specialist nutritionist with a focus on insulin resistance and anti-inflammatory eating. Meal plans, recipes, and real talk about food and hormones.',                                                  '#9C27B0', 'Nutritionist',   'user_sonal_004',   1940, NOW() - INTERVAL '80 days'),
  ('Mind & Cycle — Mental Wellness',     'Licensed psychotherapist specialising in women''s mental health across the menstrual cycle. CBT, mindfulness, and cycle-aware therapy.',                                                                   '#7B1FA2', 'Mental Health',  'user_kavitha_005', 2340, NOW() - INTERVAL '72 days'),
  ('Dr. Rekha Iyer — Endocrinologist',   'Endocrinologist at AIIMS, New Delhi. Thyroid disorders, PCOS, diabetes in women. Cutting through misinformation with real science.',                                                                        '#D81B60', 'Health',         'user_divya_006',   5600, NOW() - INTERVAL '65 days'),
  ('Saheli Health Official',             'The official Saheli health education channel. Curated information on women''s reproductive health, menstrual wellness, and preventive care.',                                                              '#880E4F', 'Official',       'user_rashmi_007',  8920, NOW() - INTERVAL '118 days'),
  ('FitHer — Women''s Fitness',          'Fitness for women, by women. Cycle-synced workouts, strength training, yoga, and everything in between. Move in ways that honour your body.',                                                              '#F06292', 'Fitness',        'user_nisha_008',   3180, NOW() - INTERVAL '58 days')
ON CONFLICT DO NOTHING;

-- ─── Seed Posts ──────────────────────────────────────────────
INSERT INTO community_posts (user_id, content, type, topic, group_id, is_anonymous, reaction_count, comment_count, created_at) VALUES

  -- PCOS posts
  ('user_priya_001',
   'Finally got my PCOS diagnosis after 3 years of being told "your periods are just irregular, it''s normal." Getting the diagnosis actually felt like relief — at least I know what I''m dealing with now. Starting Metformin next week, has anyone else had a positive experience with it for insulin resistance?',
   'text', 'PCOS', 1, FALSE, 87, 24, NOW() - INTERVAL '14 days'),

  ('user_ananya_002',
   'Day 60 of inositol supplementation for PCOS update 🌸 My cycle has come down from 65 days to 42 days. Not perfect yet but the best it''s been in 2 years. My dermatologist also noticed improvement in my acne. Small wins count! What supplements have worked for you ladies?',
   'text', 'PCOS', 1, FALSE, 134, 41, NOW() - INTERVAL '11 days'),

  (NULL,
   'I''ve been struggling with PCOS-related hair loss for 6 months and honestly it''s affecting my mental health more than the physical symptoms. Every shower I cry a little. I know I should see a doctor but wanted to hear if anyone else has been through this and what helped?',
   'text', 'PCOS', 1, TRUE, 203, 67, NOW() - INTERVAL '8 days'),

  -- Endometriosis posts
  ('user_meera_003',
   'Endo excision surgery was the best decision I ever made for my health. I spent 4 years on hormonal suppression that masked the pain but never treated the disease. If you''re considering surgery, please find a specialist — not just any gynaecologist. The difference is life-changing.',
   'text', 'PCOS', 2, FALSE, 156, 38, NOW() - INTERVAL '18 days'),

  ('user_sonal_004',
   'Heating pad, magnesium glycinate, and a hot cup of turmeric milk — my holy trinity for endo flare-ups. What are your non-medication pain management techniques? I''m trying to avoid NSAIDs as much as possible because they upset my stomach.',
   'text', 'Cramps', 2, FALSE, 92, 29, NOW() - INTERVAL '6 days'),

  -- Fertility posts
  ('user_kavitha_005',
   'IVF round 2 starting next month 💙 Round 1 ended in a chemical pregnancy and I took 4 months off to grieve and heal. I feel ready again. Nervous but hopeful. Sending love to everyone on this hard, hard road.',
   'text', 'Fertility', 3, FALSE, 321, 89, NOW() - INTERVAL '3 days'),

  (NULL,
   'Does anyone else feel like they can''t talk about fertility struggles without people saying "just relax" or "adopt then it will happen naturally"? The unsolicited advice is exhausting. I just want to be heard sometimes, not fixed.',
   'text', 'Fertility', 3, TRUE, 445, 112, NOW() - INTERVAL '5 days'),

  -- Mental health posts
  ('user_divya_006',
   'Started cycle-aware therapy 3 months ago and it has completely changed how I relate to my emotions. Tracking which phase I''m in and working with my therapist to understand my patterns has been more helpful than anything else I''ve tried. Highly recommend looking into luteal-phase anxiety specifically.',
   'text', 'Mood', 4, FALSE, 178, 44, NOW() - INTERVAL '10 days'),

  -- Thyroid posts
  ('user_rashmi_007',
   'Newly diagnosed Hashimoto''s here. My TSH was 8.2 and T4 was low. Starting levothyroxine tomorrow. The fatigue and brain fog have been so bad I''ve been missing work. For those of you who''ve been on thyroid medication — how long before you started feeling human again?',
   'text', NULL, 5, FALSE, 67, 31, NOW() - INTERVAL '2 days'),

  -- Pregnancy posts
  ('user_nisha_008',
   'Week 32 update! Baby girl is measuring perfectly. Had my glucose tolerance test and I''m clear of gestational diabetes 🙌 The third trimester fatigue is REAL though. How did you second and third-time mamas manage the exhaustion while still functioning?',
   'text', 'Pregnancy', 6, FALSE, 89, 27, NOW() - INTERVAL '4 days'),

  ('user_pooja_009',
   'Postpartum anxiety is real and I wish someone had warned me. I had no history of anxiety before my daughter was born and now 4 months in I''m struggling badly. Just started therapy. For anyone else going through this — you are not a bad mother for struggling. Please ask for help.',
   'text', 'Pregnancy', 6, FALSE, 389, 93, NOW() - INTERVAL '9 days'),

  -- Cycle tracking posts
  ('user_lakshmi_010',
   'Learning the difference between my four cycle phases literally changed my life. Follicular phase me is a CEO. Ovulation week I could run a marathon and host a dinner party. Luteal phase I just want to hibernate and eat soup. Menstrual phase is sacred rest time. Working WITH your cycle instead of against it is everything.',
   'text', 'Cycles', 7, FALSE, 267, 58, NOW() - INTERVAL '12 days'),

  -- Nutrition posts
  ('user_shruti_011',
   'Anti-inflammatory eating has genuinely helped my period pain. I cut out seed oils, reduced sugar, added omega-3s and turmeric, and my period went from a 7/10 pain to a 3/10 in about 3 months. I know it''s not a cure for everyone but sharing in case it helps someone.',
   'text', 'Nutrition', 8, FALSE, 198, 52, NOW() - INTERVAL '7 days'),

  -- Body image posts
  ('user_tanvi_012',
   'I finally unfollowed every account that made me feel bad about my body and filled my feed with women of all shapes, sizes, ages, and abilities doing amazing things. My mental health has improved so much. Curate your feed like your life depends on it — because your mental health does.',
   'text', 'Mood', 9, FALSE, 312, 74, NOW() - INTERVAL '15 days'),

  -- Anonymous general posts
  (NULL,
   'I''ve been on the pill for 7 years and just stopped taking it. I genuinely don''t know who I am hormonally anymore. My emotions feel more intense, my skin is breaking out, but also I feel more myself? Going through the post-pill adjustment is wild. Anyone else been through this?',
   'text', 'Cycles', NULL, TRUE, 534, 143, NOW() - INTERVAL '6 days'),

  ('user_riya_013',
   'My period came back after 18 months of amenorrhea due to overexercising and under-eating. I never thought I''d be HAPPY to see it but I actually cried with joy. Your period is not an inconvenience — it''s a vital sign. Take care of yourselves.',
   'text', 'Cycles', NULL, FALSE, 621, 167, NOW() - INTERVAL '20 days'),

  ('user_sneha_014',
   'Hot take: we need better menstrual health education in schools. I was 25 years old before I found out ovulation happens in the MIDDLE of your cycle, not at the end. The lack of education is a public health problem. Sharing with every young woman I know now.',
   'text', 'Cycles', NULL, FALSE, 445, 98, NOW() - INTERVAL '16 days'),

  ('user_aisha_015',
   'Gentle reminder that fibroids are extremely common and you are not alone. 1 in 3 women will develop them by age 50. I had a myomectomy last year for a 9cm fibroid and I''m doing beautifully. If you''re newly diagnosed, please ask questions, get second opinions, and know surgery is not always the first step.',
   'text', NULL, NULL, FALSE, 287, 61, NOW() - INTERVAL '22 days')

ON CONFLICT DO NOTHING;

-- ─── Seed Comments ───────────────────────────────────────────
-- Comments on "PCOS diagnosis" post
INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, 'user_ananya_002',
  'Getting diagnosed late is SO common and so frustrating. I waited 4 years too. Metformin helped me a lot — give it at least 3 months. The initial nausea passes after the first few weeks. Starting with the lowest dose and going up slowly made a huge difference.',
  FALSE, NOW() - INTERVAL '13 days'
FROM community_posts p WHERE p.content LIKE '%Finally got my PCOS%' LIMIT 1;

INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, 'user_meera_003',
  'Same journey here! I was told "just lose weight" for years. The diagnosis felt validating even though it was scary. You''re not alone in this.',
  FALSE, NOW() - INTERVAL '13 days'
FROM community_posts p WHERE p.content LIKE '%Finally got my PCOS%' LIMIT 1;

INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, 'user_kavitha_005',
  'Metformin + lifestyle changes was my combination. I also found berberine helpful. Please check your Vitamin D levels if you haven''t — PCOS and low Vit D are very linked.',
  FALSE, NOW() - INTERVAL '12 days'
FROM community_posts p WHERE p.content LIKE '%Finally got my PCOS%' LIMIT 1;

-- Comments on IVF post
INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, 'user_pooja_009',
  'Sending you so much strength 💙 I went through 3 rounds before my daughter arrived. Round 2 was emotionally the hardest but it taught me so much. You are SO brave for getting back up.',
  FALSE, NOW() - INTERVAL '2 days'
FROM community_posts p WHERE p.content LIKE '%IVF round 2%' LIMIT 1;

INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, NULL,
  'I had a chemical pregnancy in my first cycle too. It took me 6 months to feel ready again and that is completely okay. Rooting for you with everything I have.',
  TRUE, NOW() - INTERVAL '2 days'
FROM community_posts p WHERE p.content LIKE '%IVF round 2%' LIMIT 1;

INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, 'user_lakshmi_010',
  'Chemical pregnancies are real losses and it''s okay to grieve them fully. Wishing you all the best for round 2 — your courage is inspiring 🌸',
  FALSE, NOW() - INTERVAL '1 day'
FROM community_posts p WHERE p.content LIKE '%IVF round 2%' LIMIT 1;

-- Comments on cycle phase post
INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, 'user_shruti_011',
  'This absolutely! I''ve started scheduling important meetings and hard conversations for my follicular phase and I save creative work for ovulation. Luteal phase is for admin tasks only lol.',
  FALSE, NOW() - INTERVAL '11 days'
FROM community_posts p WHERE p.content LIKE '%four cycle phases%' LIMIT 1;

INSERT INTO community_comments (post_id, user_id, body, is_anonymous, created_at)
SELECT p.id, 'user_tanvi_012',
  'I wish I had learned this at 18. I spent years thinking something was wrong with me for having such different energy levels throughout the month. Your cycle is your superpower!',
  FALSE, NOW() - INTERVAL '10 days'
FROM community_posts p WHERE p.content LIKE '%four cycle phases%' LIMIT 1;

-- ─── Seed Reactions ──────────────────────────────────────────
INSERT INTO community_reactions (post_id, user_id, reaction_type, created_at)
SELECT p.id, u.id, 
  CASE (FLOOR(RANDOM() * 4)::INT)
    WHEN 0 THEN 'support'
    WHEN 1 THEN 'same_here'
    WHEN 2 THEN 'helpful'
    ELSE 'thank_you'
  END,
  NOW() - (RANDOM() * INTERVAL '30 days')
FROM community_posts p
CROSS JOIN community_users u
WHERE RANDOM() > 0.7
ON CONFLICT DO NOTHING;

-- ─── Seed Page Followers ─────────────────────────────────────
INSERT INTO community_page_followers (page_id, user_id, followed_at)
SELECT pg.id, u.id, NOW() - (RANDOM() * INTERVAL '100 days')
FROM community_pages pg
CROSS JOIN community_users u
WHERE RANDOM() > 0.6
ON CONFLICT DO NOTHING;

-- ─── Update Counts (keep denormalised columns in sync) ────────
UPDATE community_groups g
SET member_count = (
  SELECT COUNT(*) FROM community_group_members gm WHERE gm.group_id = g.id
);

UPDATE community_pages pg
SET follower_count = (
  SELECT COUNT(*) FROM community_page_followers pf WHERE pf.page_id = pg.id
);

UPDATE community_posts p
SET reaction_count = (
  SELECT COUNT(*) FROM community_reactions r WHERE r.post_id = p.id
),
comment_count = (
  SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id
);

-- Done! Your Saheli community is populated with realistic data.
-- Connect Supabase using the DATABASE_URL environment variable in your .env file.
