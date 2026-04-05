-- ============================================================
-- SPARK LMS – Course Seed Data
-- ============================================================
-- Run this in the Supabase SQL Editor.
-- Prerequisites: users 1 (Danilo) and 2 (Zoup Admin) must exist
--                company 1 (ZOUP) must exist
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────
-- 1. COURSES  (company_id=1, created_by=2)
-- ──────────────────────────────────────────────────────────────
INSERT INTO courses (id, company_id, title, description, icon_emoji, status, created_by) VALUES
  (1, 1, 'Sales Fundamentals',   'Master the art of modern selling — from buyer psychology to closing deals.', '💼', 'published', 2),
  (2, 1, 'Customer Service Pro',  'Learn how to deliver exceptional customer experiences.', '👤', 'published', 2),
  (3, 1, 'Digital Marketing',     'From SEO to social media — become a full-stack digital marketer.', '📢', 'published', 2),
  (4, 1, 'Technical Onboarding',  'Get up to speed with the tools, systems, and workflows used across the organization.', '⚙️', 'published', 2);

SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));

-- ──────────────────────────────────────────────────────────────
-- 2. COURSE MODULES
-- ──────────────────────────────────────────────────────────────

-- Sales Fundamentals (5 modules)
INSERT INTO course_modules (id, course_id, title, "order", description) VALUES
  (1,  1, 'Understanding the Modern Buyer', 1, 'Learn the psychology behind purchasing decisions.'),
  (2,  1, 'Building Your Sales Pitch',       2, 'Craft compelling pitches using proven frameworks.'),
  (3,  1, 'Handling Objections',              3, 'Turn objections into opportunities.'),
  (4,  1, 'Closing Techniques',               4, 'Master different closing strategies.'),
  (5,  1, 'Post-Sale & Client Retention',    5, 'Build long-term client relationships.');

-- Customer Service Pro (4 modules)
INSERT INTO course_modules (id, course_id, title, "order", description) VALUES
  (6,  2, 'Customer Communication Basics',   1, 'Effective communication skills for support.'),
  (7,  2, 'Handling Complaints',              2, 'De-escalation and resolution techniques.'),
  (8,  2, 'Building Customer Loyalty',        3, 'Strategies for customer retention.'),
  (9,  2, 'Support Tools & Metrics',          4, 'Using CRM tools and measuring satisfaction.');

-- Digital Marketing (4 modules)
INSERT INTO course_modules (id, course_id, title, "order", description) VALUES
  (10, 3, 'SEO Fundamentals',       1, 'How search engines work and keyword research.'),
  (11, 3, 'Content Marketing',      2, 'Crafting content that converts.'),
  (12, 3, 'Social Media Strategy',  3, 'Choosing platforms and building communities.'),
  (13, 3, 'Campaign Analytics',     4, 'Measuring and optimizing campaigns.');

-- Technical Onboarding (6 modules)
INSERT INTO course_modules (id, course_id, title, "order", description) VALUES
  (14, 4, 'Company Systems Overview',     1, 'Introduction to internal tools and platforms.'),
  (15, 4, 'Development Environment',       2, 'Setting up your local dev environment.'),
  (16, 4, 'Version Control & Git',         3, 'Git workflows and branching strategies.'),
  (17, 4, 'CI/CD Pipelines',               4, 'Continuous integration and deployment.'),
  (18, 4, 'Security Best Practices',       5, 'Security policies and vulnerability awareness.'),
  (19, 4, 'Documentation Standards',       6, 'Writing and maintaining technical docs.');

SELECT setval('course_modules_id_seq', (SELECT MAX(id) FROM course_modules));

-- ──────────────────────────────────────────────────────────────
-- 3. COURSE LESSONS
-- ──────────────────────────────────────────────────────────────

-- === Sales Fundamentals ===
-- Module 1: Understanding the Modern Buyer (4 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (1,  1, 'Buyer Psychology',         'video',   'Understanding how buyers make decisions and what influences their choices.', 1),
  (2,  1, 'Market Analysis',          'reading', 'Learn how to analyze your target market and identify key demographics.', 2),
  (3,  1, 'Identifying Pain Points',  'reading', 'Techniques for uncovering customer pain points during discovery calls.', 3),
  (4,  1, 'Module 1 Quiz',            'assessment', NULL, 4);

-- Module 2: Building Your Sales Pitch (4 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (5,  2, 'The Perfect Pitch',         'video',   'How to structure a compelling sales pitch that resonates with your audience.', 1),
  (6,  2, 'SPIN Selling Framework',    'reading', 'Situation, Problem, Implication, Need-Payoff — a proven questioning technique.', 2),
  (7,  2, 'The AIDA Framework',        'video',   'Attention, Interest, Desire, Action — applying AIDA to your sales process.', 3),
  (8,  2, 'Module 2 Quiz',             'assessment', NULL, 4);

-- Module 3: Handling Objections (4 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (9,  3, 'Common Sales Objections',    'video',   'The most common objections and why prospects raise them.', 1),
  (10, 3, 'Reframing Techniques',       'reading', 'How to reframe objections into selling opportunities.', 2),
  (11, 3, 'Role-Play Scenarios',        'video',   'Practice handling objections in simulated sales calls.', 3),
  (12, 3, 'Module 3 Quiz',              'assessment', NULL, 4);

-- Module 4: Closing Techniques (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (13, 4, 'Types of Closes',            'video',   'Alternative close, assumptive close, urgency close, and more.', 1),
  (14, 4, 'Reading Buying Signals',     'reading', 'Recognizing when a prospect is ready to buy.', 2),
  (15, 4, 'Module 4 Quiz',              'assessment', NULL, 3);

-- Module 5: Post-Sale & Client Retention (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (16, 5, 'Follow-Up Best Practices',   'video',   'How and when to follow up after closing a deal.', 1),
  (17, 5, 'Client Retention Strategies', 'reading', 'Building loyalty through consistent value delivery.', 2),
  (18, 5, 'Module 5 Quiz',              'assessment', NULL, 3);

-- === Customer Service Pro ===
-- Module 1: Customer Communication Basics (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (19, 6, 'Active Listening',            'video',   'The art of truly hearing your customer.', 1),
  (20, 6, 'Written Communication',       'reading', 'Email and chat etiquette for support teams.', 2),
  (21, 6, 'Module 1 Quiz',              'assessment', NULL, 3);

-- Module 2: Handling Complaints (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (22, 7, 'De-escalation Techniques',   'video',   'Calm down upset customers with proven methods.', 1),
  (23, 7, 'Complaint Resolution Flow',  'reading', 'Step-by-step process for resolving complaints.', 2),
  (24, 7, 'Module 2 Quiz',              'assessment', NULL, 3);

-- Module 3: Building Customer Loyalty (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (25, 8, 'Customer Loyalty Programs',   'video',   'Designing programs that keep customers coming back.', 1),
  (26, 8, 'Personalization Strategies',  'reading', 'Using data to personalize the customer experience.', 2),
  (27, 8, 'Module 3 Quiz',              'assessment', NULL, 3);

-- Module 4: Support Tools & Metrics (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (28, 9, 'CRM Tools Overview',         'video',   'Introduction to popular CRM platforms.', 1),
  (29, 9, 'Measuring Customer Satisfaction', 'reading', 'CSAT, NPS, and other key metrics.', 2),
  (30, 9, 'Module 4 Quiz',              'assessment', NULL, 3);

-- === Digital Marketing ===
-- Module 1: SEO Fundamentals (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (31, 10, 'How Search Engines Work',    'video',   'Understanding crawling, indexing, and ranking.', 1),
  (32, 10, 'Keyword Research Basics',    'reading', 'Finding the right keywords for your content.', 2),
  (33, 10, 'SEO Quiz',                   'assessment', NULL, 3);

-- Module 2: Content Marketing (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (34, 11, 'The Content Funnel',         'video',   'Mapping content to the buyer journey.', 1),
  (35, 11, 'Crafting Engaging Copy',     'reading', 'Writing copy that drives engagement and conversions.', 2),
  (36, 11, 'Content Quiz',              'assessment', NULL, 3);

-- Module 3: Social Media Strategy (2 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (37, 12, 'Choosing the Right Platforms', 'video',   'Which social media platforms suit your business?', 1),
  (38, 12, 'Community Management',         'reading', 'Building and nurturing an online community.', 2);

-- Module 4: Campaign Analytics (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (39, 13, 'Understanding Key Metrics',    'video',   'CTR, CPC, ROAS, and other vital metrics.', 1),
  (40, 13, 'Google Analytics Basics',      'reading', 'Setting up and interpreting Google Analytics.', 2),
  (41, 13, 'Final Exam',                   'assessment', NULL, 3);

-- === Technical Onboarding ===
-- Module 1: Company Systems Overview (4 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (42, 14, 'Internal Tools Introduction',   'video',   'Overview of Slack, Jira, Confluence, and internal portals.', 1),
  (43, 14, 'Access & Permissions',           'reading', 'How to request access and manage permissions.', 2),
  (44, 14, 'VPN & Network Setup',            'reading', 'Setting up VPN and connecting to the corporate network.', 3),
  (45, 14, 'Module 1 Quiz',                  'assessment', NULL, 4);

-- Module 2: Development Environment (4 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (46, 15, 'IDE Setup',                     'video',   'Installing and configuring your development environment.', 1),
  (47, 15, 'Package Managers',               'reading', 'npm, yarn, and managing dependencies.', 2),
  (48, 15, 'Local Database Setup',           'reading', 'Setting up PostgreSQL and running migrations locally.', 3),
  (49, 15, 'Module 2 Quiz',                  'assessment', NULL, 4);

-- Module 3: Version Control & Git (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (50, 16, 'Git Fundamentals',              'video',   'Commits, branches, merges, and rebases.', 1),
  (51, 16, 'Branching Strategies',           'reading', 'Gitflow, trunk-based development, and best practices.', 2),
  (52, 16, 'Module 3 Quiz',                  'assessment', NULL, 3);

-- Module 4: CI/CD Pipelines (4 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (53, 17, 'CI/CD Concepts',                'video',   'What is continuous integration and continuous deployment?', 1),
  (54, 17, 'GitHub Actions',                 'reading', 'Setting up automated workflows with GitHub Actions.', 2),
  (55, 17, 'Deployment Strategies',          'video',   'Blue-green, canary, and rolling deployments.', 3),
  (56, 17, 'Module 4 Quiz',                  'assessment', NULL, 4);

-- Module 5: Security Best Practices (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (57, 18, 'OWASP Top 10',                  'video',   'Understanding the most common web security vulnerabilities.', 1),
  (58, 18, 'Secure Coding Practices',       'reading', 'Writing code that resists common attacks.', 2),
  (59, 18, 'Module 5 Quiz',                  'assessment', NULL, 3);

-- Module 6: Documentation Standards (3 lessons)
INSERT INTO course_lessons (id, module_id, title, type, content, position) VALUES
  (60, 19, 'Writing Technical Docs',        'video',   'Structure, clarity, and audience awareness in documentation.', 1),
  (61, 19, 'API Documentation',              'reading', 'Documenting REST APIs with OpenAPI/Swagger.', 2),
  (62, 19, 'Module 6 Quiz',                  'assessment', NULL, 3);

SELECT setval('course_lessons_id_seq', (SELECT MAX(id) FROM course_lessons));

-- ──────────────────────────────────────────────────────────────
-- 4. ASSESSMENTS  (linked to assessment-type lessons)
-- ──────────────────────────────────────────────────────────────
INSERT INTO assessments (id, lesson_id, title, passing_score, time_limit) VALUES
  -- Sales Fundamentals
  (1,  4,  'Module 1 Assessment – Understanding the Modern Buyer', 70, 15),
  (2,  8,  'Module 2 Assessment – Building Your Sales Pitch',       70, 15),
  (3,  12, 'Module 3 Assessment – Handling Objections',              70, 15),
  (4,  15, 'Module 4 Assessment – Closing Techniques',               70, 15),
  (5,  18, 'Module 5 Assessment – Post-Sale & Client Retention',    70, 15),
  -- Customer Service Pro
  (6,  21, 'Module 1 Assessment – Customer Communication',           70, 15),
  (7,  24, 'Module 2 Assessment – Handling Complaints',              70, 15),
  (8,  27, 'Module 3 Assessment – Building Customer Loyalty',        70, 15),
  (9,  30, 'Module 4 Assessment – Support Tools & Metrics',          70, 15),
  -- Digital Marketing
  (10, 33, 'SEO Fundamentals Quiz',     70, 15),
  (11, 36, 'Content Marketing Quiz',    70, 15),
  (12, 41, 'Digital Marketing Final Exam', 70, 20),
  -- Technical Onboarding
  (13, 45, 'Company Systems Quiz',       70, 10),
  (14, 49, 'Dev Environment Quiz',       70, 10),
  (15, 52, 'Version Control Quiz',       70, 10),
  (16, 56, 'CI/CD Quiz',                 70, 10),
  (17, 59, 'Security Quiz',              70, 10),
  (18, 62, 'Documentation Quiz',         70, 10);

SELECT setval('assessments_id_seq', (SELECT MAX(id) FROM assessments));

-- ──────────────────────────────────────────────────────────────
-- 5. ASSESSMENT QUESTIONS & CHOICES  (Sales Module 2 – 10 questions)
--    These match the existing MOCK_QUESTIONS in ModuleAssessment.tsx
-- ──────────────────────────────────────────────────────────────
INSERT INTO assessment_questions (id, assessment_id, question_text, position) VALUES
  (1,  2, 'Which component of the AIDA framework is primarily responsible for creating emotional desire for product or service in the prospect''s mind?', 1),
  (2,  2, 'What is the first step in the consultative selling process?', 2),
  (3,  2, 'Which technique is most effective for handling price objections?', 3),
  (4,  2, 'In the SPIN selling methodology, what does the ''S'' stand for?', 4),
  (5,  2, 'What is the primary benefit of active listening in sales conversations?', 5),
  (6,  2, 'Which closing technique involves offering two positive choices?', 6),
  (7,  2, 'What is the purpose of a follow-up email after a sales meeting?', 7),
  (8,  2, 'Which metric best measures the effectiveness of a sales pipeline?', 8),
  (9,  2, 'What does a value proposition primarily communicate?', 9),
  (10, 2, 'Which approach helps build long-term client relationships?', 10);

SELECT setval('assessment_questions_id_seq', (SELECT MAX(id) FROM assessment_questions));

INSERT INTO assessment_choices (id, question_id, choice_text, is_correct) VALUES
  -- Q1: Desire
  (1,  1, 'Attention — grabbing initial awareness',              false),
  (2,  1, 'Interest — explaining product relevance',             false),
  (3,  1, 'Desire — creating emotional pull toward the offer',   true),
  (4,  1, 'Action — motivating the purchase decision',           false),
  -- Q2: Build rapport
  (5,  2, 'Present the solution immediately',                     false),
  (6,  2, 'Build rapport and trust with the client',              true),
  (7,  2, 'Close the deal as quickly as possible',                false),
  (8,  2, 'Offer discounts to incentivize purchase',              false),
  -- Q3: Reframe value
  (9,  3, 'Lower the price immediately',                          false),
  (10, 3, 'Ignore the objection and move on',                     false),
  (11, 3, 'Reframe the value proposition',                        true),
  (12, 3, 'Add more products to justify cost',                    false),
  -- Q4: Situation
  (13, 4, 'Solution',   false),
  (14, 4, 'Situation',  true),
  (15, 4, 'Strategy',   false),
  (16, 4, 'Selling',    false),
  -- Q5: Identify pain points
  (17, 5, 'It makes the sales call longer',                       false),
  (18, 5, 'It helps identify customer pain points',               true),
  (19, 5, 'It shows the salesperson is smart',                    false),
  (20, 5, 'It allows time to prepare rebuttals',                  false),
  -- Q6: Alternative close
  (21, 6, 'Hard close',        false),
  (22, 6, 'Alternative close', true),
  (23, 6, 'Assumptive close',  false),
  (24, 6, 'Urgency close',     false),
  -- Q7: Reinforce key points
  (25, 7, 'To send the invoice',                                  false),
  (26, 7, 'To reinforce key discussion points',                   true),
  (27, 7, 'To apologize for any mistakes',                        false),
  (28, 7, 'To share competitor information',                      false),
  -- Q8: Conversion rate
  (29, 8, 'Number of contacts',         false),
  (30, 8, 'Conversion rate by stage',    true),
  (31, 8, 'Total emails sent',           false),
  (32, 8, 'Social media followers',      false),
  -- Q9: Why choose this solution
  (33, 9, 'Company history and background',                       false),
  (34, 9, 'Product technical specifications',                     false),
  (35, 9, 'Why a customer should choose this solution',           true),
  (36, 9, 'Price comparisons with competitors',                   false),
  -- Q10: Consistent value delivery
  (37, 10, 'Aggressive upselling on every call',                  false),
  (38, 10, 'Consistent value delivery and check-ins',             true),
  (39, 10, 'Avoiding all post-sale contact',                      false),
  (40, 10, 'Sending automated bulk messages',                     false);

SELECT setval('assessment_choices_id_seq', (SELECT MAX(id) FROM assessment_choices));

-- ──────────────────────────────────────────────────────────────
-- 6. COURSE ASSIGNMENTS  (user=1 Danilo, assigned_by=2 Zoup Admin)
-- ──────────────────────────────────────────────────────────────
INSERT INTO course_assignments (id, user_id, course_id, assigned_by, status) VALUES
  (1, 1, 1, 2, 'not_started'),  -- Sales Fundamentals
  (2, 1, 2, 2, 'not_started'),  -- Customer Service Pro
  (3, 1, 3, 2, 'not_started'),  -- Digital Marketing
  (4, 1, 4, 2, 'not_started');  -- Technical Onboarding

SELECT setval('course_assignments_id_seq', (SELECT MAX(id) FROM course_assignments));

-- ──────────────────────────────────────────────────────────────
-- 7. LESSONS PROGRESS  (seed some completed lessons for demo)
--    Progress is computed dynamically at runtime.
--
--    Sales Fundamentals: Module 1 fully done (4/4), Module 2 partially (2/4)
--                        = 6 out of 18 total lessons completed
--    Customer Service Pro: Module 1 fully done (3/3), Module 2 partially (1/3)
--                          = 4 out of 12 total lessons completed
--    Digital Marketing: All lessons completed (11/11)
--    Technical Onboarding: No lessons completed (0/21)
-- ──────────────────────────────────────────────────────────────

-- Sales Fundamentals – Module 1 (all 4 lessons completed)
INSERT INTO lessons_progress (assignment_id, lesson_id, is_completed, completed_at) VALUES
  (1, 1, true, NOW() - INTERVAL '10 days'),
  (1, 2, true, NOW() - INTERVAL '9 days'),
  (1, 3, true, NOW() - INTERVAL '8 days'),
  (1, 4, true, NOW() - INTERVAL '7 days');

-- Sales Fundamentals – Module 2 (2 of 4 completed)
INSERT INTO lessons_progress (assignment_id, lesson_id, is_completed, completed_at) VALUES
  (1, 5, true, NOW() - INTERVAL '5 days'),
  (1, 6, true, NOW() - INTERVAL '4 days');

-- Customer Service Pro – Module 1 (all 3 completed)
INSERT INTO lessons_progress (assignment_id, lesson_id, is_completed, completed_at) VALUES
  (2, 19, true, NOW() - INTERVAL '14 days'),
  (2, 20, true, NOW() - INTERVAL '13 days'),
  (2, 21, true, NOW() - INTERVAL '12 days');

-- Customer Service Pro – Module 2 (1 of 3 completed)
INSERT INTO lessons_progress (assignment_id, lesson_id, is_completed, completed_at) VALUES
  (2, 22, true, NOW() - INTERVAL '11 days');

-- Digital Marketing – ALL lessons completed
INSERT INTO lessons_progress (assignment_id, lesson_id, is_completed, completed_at) VALUES
  (3, 31, true, NOW() - INTERVAL '30 days'),
  (3, 32, true, NOW() - INTERVAL '29 days'),
  (3, 33, true, NOW() - INTERVAL '28 days'),
  (3, 34, true, NOW() - INTERVAL '27 days'),
  (3, 35, true, NOW() - INTERVAL '26 days'),
  (3, 36, true, NOW() - INTERVAL '25 days'),
  (3, 37, true, NOW() - INTERVAL '24 days'),
  (3, 38, true, NOW() - INTERVAL '23 days'),
  (3, 39, true, NOW() - INTERVAL '22 days'),
  (3, 40, true, NOW() - INTERVAL '21 days'),
  (3, 41, true, NOW() - INTERVAL '20 days');

-- Technical Onboarding – no progress at all (Not Started)

COMMIT;
