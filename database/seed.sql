-- Seeding Script: 100 Sample Zimbabwean SMEs + 50 Tenders
-- Run: psql -d radbit -f seed.sql

-- ============================================
-- EXTENSION REQUIREMENTS
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- ============================================
-- SEED USERS AND BUSINESSES
-- ============================================

WITH inserted_users AS (
    INSERT INTO users (id, phone, email, display_name, language, country_code, is_verified)
    VALUES
        (gen_random_uuid(), '+263771000001', 'tafadzwa.moyo@gmail.com', 'Tafadzwa Moyo', 'en', 'ZW', true),
        (gen_random_uuid(), '+263771000002', 'chipo.dube@yahoo.com', 'Chipo Dube', 'sn', 'ZW', true),
        (gen_random_uuid(), '+263771000003', 'tendai.sithole@gmail.com', 'Tendai Sithole', 'sn', 'ZW', true),
        (gen_random_uuid(), '+263771000004', 'ruvashe.chikwanha@outlook.com', 'Ruvashe Chikwanha', 'en', 'ZW', true),
        (gen_random_uuid(), '+263771000005', 'nyasha.makoni@gmail.com', 'Nyasha Makoni', 'en', 'ZW', true),
        (gen_random_uuid(), '+263771000006', 'faith.moyo@gmail.com', 'Faith Moyo', 'sn', 'ZW', true),
        (gen_random_uuid(), '+263771000007', 'blessing.tlou@yahoo.com', 'Blessing Tlou', 'nd', 'ZW', true),
        (gen_random_uuid(), '+263771000008', 'tatenda.chikwanha@gmail.com', 'Tatenda Chikwanha', 'sn', 'ZW', true),
        (gen_random_uuid(), '+263771000009', 'kudzai.mutasa@outlook.com', 'Kudzai Mutasa', 'en', 'ZW', true),
        (gen_random_uuid(), '+263771000010', 'simba.nyoni@gmail.com', 'Simba Nyoni', 'en', 'ZW', true)
    RETURNING id, display_name
)
-- Generate 90 more users using a loop
DO $$
DECLARE
    i INTEGER;
    phone_base VARCHAR(20);
    names TEXT[] := ARRAY['Tanaka', 'Rumbi', 'Takudzwa', 'Vimbai', 'Kudakwashe', 'Munyaradzi', 'Tsitsi', 'Farai', 'Nokutenda', 'Panashe',
                         'Anesu', 'Rutendo', 'Tadiwanashe', 'Makanaka', 'Nyasha', 'Tariro', 'Kundai', 'Ruvimbo', 'Tawananyasha', 'Munashe',
                         'Tatenda', 'Shamiso', 'Chengetai', 'Precious', 'Memory', 'Luckmore', 'Innocent', 'Silence', 'Prosper', 'Blessing',
                         'Tanatswa', 'Mufaro', 'Neville', 'Tafara', 'Kumbirai', 'Itai', 'Takunda', 'Ropafadzo', 'Masimba', 'Chiedza',
                         'Tanyaradzwa', 'Tanaka', 'Mutsa', 'Paidamoyo', 'Kudzanai', 'Takudzwa', 'Ranganai', 'Nyasha', 'Kuziva', 'Tadiwa',
                         'Tawanda', 'Charmaine', 'Patricia', 'Angeline', 'Josephine', 'Nomsa', 'Thelma', 'Loveness', 'Eunice', 'Sharon',
                         'Tafadzwa', 'Chipo', 'Tendai', 'Ruvashe', 'Nyasha', 'Faith', 'Blessing', 'Tatenda', 'Kudzai', 'Simba',
                         'Tanaka', 'Rumbi', 'Takudzwa', 'Vimbai', 'Kudakwashe', 'Munyaradzi', 'Tsitsi', 'Farai', 'Nokutenda', 'Panashe'];
    surnames TEXT[] := ARRAY['Moyo', 'Dube', 'Sithole', 'Ndlovu', 'Sibanda', 'Ngwenya', 'Mpofu', 'Tshuma', 'Ncube', 'Zulu',
                             'Chikwanha', 'Makoni', 'Mutasa', 'Nyoni', 'Gumbo', 'Chirwa', 'Banda', 'Phiri', 'Mwale', 'Kamoto',
                             'Mudimu', 'Mashava', 'Chikomo', 'Garasu', 'Simango', 'Madondo', 'Hove', 'Mazvita', 'Tagwirei', 'Chikono',
                             'Mangena', 'Sigauke', 'Marufu', 'Mundawarara', 'Mushonga', 'Mhetu', 'Muzondo', 'Kanengoni', 'Mawere', 'Makore',
                             'Chikore', 'Mukwena', 'Dzumbira', 'Gwenzi', 'Chidavaenzi', 'Munyuki', 'Makuwe', 'Machiri', 'Mada', 'Dzapata'];
    industries TEXT[] := ARRAY['Agribusiness', 'Retail', 'Technology', 'Manufacturing', 'Healthcare', 'Education', 'Construction',
                               'Hospitality', 'Transport', 'Financial Services', 'Renewable Energy', 'Textiles', 'Mining',
                               'Real Estate', 'Consulting'];
    business_types TEXT[] := ARRAY['Tuck Shop', 'Farm', 'Agency', 'Workshop', 'Clinic', 'School', 'Store', 'Studio', 'Service', 'Cooperative'];
    user_id UUID;
    surname VARCHAR(50);
    firstname VARCHAR(50);
    industry VARCHAR(50);
    biz_type VARCHAR(50);
BEGIN
    FOR i IN 11..100 LOOP
        user_id := gen_random_uuid();
        firstname := names[1 + (i % 100)];
        surname := surnames[1 + (i % 50)];
        industry := industries[1 + (i % 15)];
        biz_type := business_types[1 + (i % 10)];

        INSERT INTO users (id, phone, email, display_name, language, country_code, is_verified)
        VALUES (user_id,
                '+26377' || LPAD(i::text, 6, '0'),
                LOWER(firstname || '.' || surname || '@example.com'),
                firstname || ' ' || surname,
                CASE WHEN i % 10 < 6 THEN 'en' WHEN i % 10 < 8 THEN 'sn' ELSE 'nd' END,
                'ZW',
                i % 3 != 0);  -- ~67% verified

        INSERT INTO business_profiles (user_id, company_name, industry_code, employee_count_band,
                                        annual_revenue_band, currency_preference, verified_status,
                                        business_description, max_assessment_score)
        VALUES (user_id,
                firstname || '''s ' || biz_type,
                industry,
                (ARRAY['1-5', '6-20', '21-50'])[1 + (i % 3)],
                (ARRAY['$0-5k', '$5k-20k', '$20k-100k'])[1 + (i % 3)],
                (ARRAY['USD', 'ZIG', 'ZAR'])[1 + (i % 3)],
                (ARRAY['unverified', 'pending', 'verified', 'verified'])[1 + (i % 4)]::verified_status,
                'A ' || industry || ' ' || LOWER(biz_type) || ' based in ' ||
                (ARRAY['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo', 'Kwekwe', 'Chitungwiza', 'Kadoma'])[1 + (i % 8)] || '.',
                (20 + (i % 80))::SMALLINT);  -- Scores 20-99
    END LOOP;
END $$;

-- ============================================
-- SEED ASSESSMENTS (for first 30 users)
-- ============================================
DO $$
DECLARE
    framework_id UUID;
    user_rec RECORD;
    dimension_keys TEXT[] := ARRAY['finance', 'marketing', 'operations', 'technology', 'legal'];
    dimension_weights NUMERIC[] := ARRAY[0.2, 0.2, 0.2, 0.25, 0.15];
    dim_count INTEGER;
    dim_score NUMERIC;
    total_weighted NUMERIC;
    response_id UUID;
    i INTEGER;
BEGIN
    -- Create Zim framework
    INSERT INTO assessment_frameworks (id, version, country_code, is_active, dimensions)
    VALUES (gen_random_uuid(), '1.2', 'ZW', true,
            '[{"key":"finance","weight":0.2,"label":"Financial Management"},{"key":"marketing","weight":0.2,"label":"Marketing & Sales"},{"key":"operations","weight":0.2,"label":"Operations & Logistics"},{"key":"technology","weight":0.25,"label":"Technology Adoption"},{"key":"legal","weight":0.15,"label":"Legal & Compliance"}]')
    RETURNING id INTO framework_id;

    FOR user_rec IN SELECT id FROM users LIMIT 30 LOOP
        -- Generate random dimension scores
        dim_count := 5;
        total_weighted := 0;
        response_id := gen_random_uuid();

        INSERT INTO assessment_responses (id, user_id, framework_id, answers, maturity_score, dimension_scores, completed_at)
        VALUES (response_id, user_rec.id, framework_id,
                '[]'::JSONB,
                0,
                '{}'::JSONB,
                NOW() - (random() * INTERVAL '90 days'));

        -- Recalculate with actual loop
        FOR i IN 1..5 LOOP
            dim_score := 20 + (random() * 60);  -- 20-80
            UPDATE assessment_responses
            SET dimension_scores = JSONB_SET(
                COALESCE(dimension_scores, '{}'::JSONB),
                ARRAY[dimension_keys[i]],
                to_jsonb(dim_score::NUMERIC(5,2))
            )
            WHERE id = response_id;
            total_weighted := total_weighted + (dim_score * dimension_weights[i]);
        END LOOP;

        UPDATE assessment_responses
        SET maturity_score = ROUND(total_weighted::NUMERIC, 2)
        WHERE id = response_id;
    END LOOP;
END $$;

-- ============================================
-- SEED TENDERS (50 open tenders)
-- ============================================
INSERT INTO tenders (title, description, issuing_authority, country_code, industry_tags,
                     deadline, budget_range_min, budget_range_max, currency, status, scraped_at)
VALUES
    ('Supply of Solar Irrigation Systems – Masvingo Province',
     'The Government of Zimbabwe invites tenders for the supply and installation of 500 solar-powered irrigation systems for smallholder farmers in Masvingo Province.',
     'Ministry of Lands, Agriculture, Fisheries, Water and Rural Development', 'ZW',
     ARRAY['agribusiness', 'renewable_energy', 'irrigation'],
     '2026-07-15 10:00:00+02', 50000, 200000, 'USD', 'open', NOW()),

    ('Provision of ICT Equipment for Rural Schools',
     'Supply and delivery of desktop computers, tablets, and networking equipment for 50 rural secondary schools across Zimbabwe.',
     'Ministry of Primary and Secondary Education', 'ZW',
     ARRAY['technology', 'education', 'ict'],
     '2026-06-30 10:00:00+02', 100000, 350000, 'USD', 'open', NOW()),

    ('Road Rehabilitation – Harare-Chitungwiza Highway',
     'Tender for the rehabilitation of 15km of the Harare-Chitungwiza highway including drainage works, resurfacing, and signage.',
     'City of Harare', 'ZW',
     ARRAY['construction', 'infrastructure', 'road'],
     '2026-08-01 10:00:00+02', 2000000, 5000000, 'USD', 'open', NOW()),

    ('Supply of Essential Medicines – 2026 Q3',
     'Framework contract for the supply of essential medicines and medical consumables to 10 provincial hospitals.',
     'Ministry of Health and Child Care', 'ZW',
     ARRAY['healthcare', 'pharmaceutical', 'supply_chain'],
     '2026-06-15 10:00:00+02', 500000, 1500000, 'USD', 'open', NOW()),

    ('Rebranding and Digital Marketing Services for ZTA',
     'The Zimbabwe Tourism Authority seeks a creative agency to develop and execute a 12-month digital marketing campaign targeting regional tourists.',
     'Zimbabwe Tourism Authority', 'ZW',
     ARRAY['marketing', 'digital', 'creative'],
     '2026-07-01 10:00:00+02', 30000, 80000, 'USD', 'open', NOW()),

    ('Clean Energy Solutions Provider – SADC Tender',
     'Request for proposals for the deployment of mini-grid solar solutions in 20 off-grid communities across SADC region.',
     'SADC Development Finance Resource Centre', 'ZA',
     ARRAY['renewable_energy', 'infrastructure', 'energy'],
     '2026-08-15 14:00:00+02', 1000000, 3000000, 'USD', 'open', NOW()),

    ('Supply of Maize Seed and Fertilizers – 2026/27 Season',
     'Tender for the supply of certified maize seed and blended fertilizers under the Presidential Input Scheme.',
     'Grain Marketing Board', 'ZW',
     ARRAY['agribusiness', 'agriculture', 'inputs'],
     '2026-06-20 10:00:00+02', 200000, 500000, 'USD', 'open', NOW()),

    ('Mobile Clinic Vehicle Conversions',
     'Conversion of 15 Toyota Land Cruisers into fully equipped mobile clinics, including medical equipment fitting and branding.',
     'Ministry of Health and Child Care', 'ZW',
     ARRAY['manufacturing', 'automotive', 'healthcare'],
     '2026-07-30 10:00:00+02', 450000, 750000, 'USD', 'open', NOW()),

    ('Software Development – E-Government Portal',
     'Development and maintenance of an integrated e-government services portal for citizen-facing services.',
     'Office of the President and Cabinet', 'ZW',
     ARRAY['technology', 'software', 'government'],
     '2026-09-01 10:00:00+02', 150000, 400000, 'USD', 'open', NOW()),

    ('Supply of Office Furniture – Parliament Building',
     'Tender for the design, manufacture, and installation of office furniture for the new Parliament building in Mt Hampden.',
     'Parliament of Zimbabwe', 'ZW',
     ARRAY['manufacturing', 'furniture', 'construction'],
     '2026-07-10 10:00:00+02', 200000, 500000, 'USD', 'open', NOW()),

    ('School Feeding Programme – Food Supply',
     'Supply of maize meal, cooking oil, beans, and sugar for the school feeding programme covering 500 primary schools.',
     'Ministry of Public Service, Labour and Social Welfare', 'ZW',
     ARRAY['agribusiness', 'food', 'logistics'],
     '2026-05-30 10:00:00+02', 800000, 2000000, 'USD', 'closing_soon', NOW()),

    ('Call Centre Services for ZESA Customer Care',
     'Outsourcing of call centre operations for ZESA customer care, including toll-free line management and CRM integration.',
     'ZESA Holdings', 'ZW',
     ARRAY['technology', 'services', 'customer_care'],
     '2026-07-20 10:00:00+02', 120000, 240000, 'USD', 'open', NOW()),

    ('Precision Agriculture Drone Services',
     'Request for proposals for drone-based crop monitoring, spraying, and mapping services covering 10,000 hectares.',
     'Agricultural Marketing Authority', 'ZW',
     ARRAY['agribusiness', 'technology', 'drones'],
     '2026-08-10 10:00:00+02', 80000, 180000, 'USD', 'open', NOW()),

    ('Textile Supply – School Uniforms for 2027',
     'Tender for the production and supply of school uniforms for 200,000 primary school children.',
     'Ministry of Primary and Secondary Education', 'ZW',
     ARRAY['textiles', 'manufacturing', 'education'],
     '2026-10-01 10:00:00+02', 600000, 1200000, 'USD', 'open', NOW()),

    ('Water Treatment Chemicals Supply',
     'Framework agreement for the supply of water treatment chemicals (chlorine, alum, lime) for 12 months.',
     'Zimbabwe National Water Authority', 'ZW',
     ARRAY['chemicals', 'water', 'infrastructure'],
     '2026-06-25 10:00:00+02', 300000, 600000, 'USD', 'closing_soon', NOW()),

    -- 35 more tenders...
    ('Security Services – Government Buildings', 'Provision of security services for 25 government buildings across Harare.', 'Ministry of Home Affairs', 'ZW', ARRAY['services', 'security'], '2026-07-05 10:00:00+02', 50000, 150000, 'USD', 'open', NOW()),
    ('Cleaning Services – Parliament Building', 'Tender for cleaning and janitorial services at the new Parliament Building.', 'Parliament of Zimbabwe', 'ZW', ARRAY['services', 'cleaning'], '2026-07-15 10:00:00+02', 30000, 80000, 'USD', 'open', NOW()),
    ('Supply of Laboratory Equipment', 'Supply of laboratory equipment for 5 new district hospitals.', 'Ministry of Health', 'ZW', ARRAY['healthcare', 'equipment', 'laboratory'], '2026-08-20 10:00:00+02', 200000, 500000, 'USD', 'open', NOW()),
    ('Fleet Management Services', 'Vehicle tracking, maintenance, and fuel management for a fleet of 200 government vehicles.', 'Government Fleet Management', 'ZW', ARRAY['transport', 'services', 'technology'], '2026-07-25 10:00:00+02', 80000, 200000, 'USD', 'open', NOW()),
    ('Training – Digital Skills for SMEs', 'Development and delivery of a digital skills training programme for 5,000 SMEs.', 'Ministry of SMEs', 'ZW', ARRAY['education', 'training', 'technology'], '2026-09-10 10:00:00+02', 100000, 250000, 'USD', 'open', NOW()),
    ('Supply of Building Materials – Low-Cost Housing', 'Supply of cement, bricks, roofing sheets, and windows for 200 low-cost housing units.', 'Ministry of Local Government', 'ZW', ARRAY['construction', 'materials', 'housing'], '2026-08-01 10:00:00+02', 400000, 800000, 'USD', 'open', NOW()),
    ('Food Processing Equipment Supply', 'Supply and installation of food processing equipment for 10 SME agri-processing hubs.', 'Ministry of Lands and Agriculture', 'ZW', ARRAY['manufacturing', 'agribusiness', 'food'], '2026-09-15 10:00:00+02', 300000, 700000, 'USD', 'open', NOW()),
    ('Auditing Services – Parastatals Audit 2026', 'External auditing services for 15 state-owned enterprises for FY2026.', 'Auditor General', 'ZW', ARRAY['financial_services', 'audit', 'consulting'], '2026-11-01 10:00:00+02', 150000, 350000, 'USD', 'open', NOW()),
    ('Waste Management Services – Harare CBD', 'Solid waste collection and management services for Harare Central Business District.', 'City of Harare', 'ZW', ARRAY['services', 'environment', 'cleaning'], '2026-07-01 10:00:00+02', 100000, 250000, 'USD', 'closing_soon', NOW()),
    ('ICT Network Upgrade – Government Data Center', 'Upgrade of network infrastructure, firewalls, and servers at the Government Data Center.', 'Ministry of ICT', 'ZW', ARRAY['technology', 'ict', 'infrastructure'], '2026-08-30 10:00:00+02', 500000, 1200000, 'USD', 'open', NOW()),
    ('Supply of Veterinary Medicines', 'Supply of veterinary medicines and vaccines for the national livestock programme.', 'Ministry of Lands and Agriculture', 'ZW', ARRAY['agribusiness', 'healthcare', 'veterinary'], '2026-06-20 10:00:00+02', 150000, 350000, 'USD', 'closing_soon', NOW()),
    ('Event Management – Zimbabwe Trade Fair 2027', 'Event management services for the Zimbabwe International Trade Fair 2027.', 'ZITF Company', 'ZW', ARRAY['services', 'events', 'marketing'], '2026-12-01 10:00:00+02', 80000, 200000, 'USD', 'open', NOW()),
    ('Supply of Sports Equipment', 'Supply of sports equipment for the National Sports Stadium refurbishment.', 'Sports and Recreation Commission', 'ZW', ARRAY['manufacturing', 'sports', 'equipment'], '2026-08-15 10:00:00+02', 50000, 120000, 'USD', 'open', NOW()),
    ('Consultancy – Tourism Strategy Development', 'Development of a 5-year tourism growth strategy for Zimbabwe.', 'Zimbabwe Tourism Authority', 'ZW', ARRAY['consulting', 'tourism', 'strategy'], '2026-07-30 10:00:00+02', 40000, 100000, 'USD', 'open', NOW()),
    ('Supply of Firefighting Equipment', 'Supply and maintenance of firefighting equipment for 8 municipal fire stations.', 'Civil Protection Department', 'ZW', ARRAY['manufacturing', 'safety', 'equipment'], '2026-09-01 10:00:00+02', 200000, 400000, 'USD', 'open', NOW()),
    ('School Bus Supply – Rural Transport', 'Supply of 50 school buses for rural secondary school transport schemes.', 'Ministry of Primary and Secondary Education', 'ZW', ARRAY['transport', 'manufacturing', 'education'], '2026-10-15 10:00:00+02', 2500000, 4000000, 'USD', 'open', NOW()),
    ('Solar Water Heating Installation', 'Installation of solar water heating systems at 30 government buildings.', 'Ministry of Energy', 'ZW', ARRAY['renewable_energy', 'construction', 'solar'], '2026-08-05 10:00:00+02', 150000, 300000, 'USD', 'open', NOW()),
    ('Printing Services – Examination Papers', 'Secure printing of Grade 7, O-Level, and A-Level examination papers for 2027.', 'Zimbabwe School Examinations Council', 'ZW', ARRAY['manufacturing', 'printing', 'education'], '2026-12-15 10:00:00+02', 400000, 800000, 'USD', 'open', NOW()),
    ('Irrigation Infrastructure Maintenance', 'Rehabilitation and maintenance of 50 existing irrigation schemes countrywide.', 'Ministry of Lands and Agriculture', 'ZW', ARRAY['construction', 'agribusiness', 'irrigation'], '2026-09-20 10:00:00+02', 800000, 2000000, 'USD', 'open', NOW()),
    ('Broadband Connectivity – Rural Schools', 'Provision of broadband internet connectivity to 500 rural schools.', 'Ministry of ICT', 'ZW', ARRAY['technology', 'telecommunications', 'education'], '2026-10-01 10:00:00+02', 1200000, 3000000, 'USD', 'open', NOW()),
    ('CCTV Installation – Border Posts', 'Supply and installation of CCTV surveillance systems at 10 border posts.', 'Border Control Authority', 'ZW', ARRAY['technology', 'security', 'infrastructure'], '2026-08-20 10:00:00+02', 300000, 600000, 'USD', 'open', NOW()),
    ('Supply of Personal Protective Equipment', 'Framework contract for PPE supply to all government hospitals.', 'Ministry of Health', 'ZW', ARRAY['manufacturing', 'healthcare', 'safety'], '2026-07-10 10:00:00+02', 100000, 250000, 'USD', 'closing_soon', NOW()),
    ('Green Building Consultancy', 'Environmental impact assessment and green building certification consultancy for 10 new government buildings.', 'Ministry of Environment', 'ZW', ARRAY['consulting', 'environment', 'construction'], '2026-09-05 10:00:00+02', 40000, 100000, 'USD', 'open', NOW()),
    ('Supply of Water Bowsers', 'Supply of 50 water bowsers for emergency water delivery in drought-prone areas.', 'Civil Protection Department', 'ZW', ARRAY['manufacturing', 'water', 'emergency'], '2026-08-01 10:00:00+02', 500000, 1000000, 'USD', 'open', NOW()),
    ('Market Research – Mobile Money Usage', 'Market research study on mobile money usage patterns among Zimbabwean SMEs.', 'Reserve Bank of Zimbabwe', 'ZW', ARRAY['consulting', 'research', 'financial_services'], '2026-06-15 10:00:00+02', 20000, 50000, 'USD', 'closing_soon', NOW()),
    ('Waste-to-Energy Plant Feasibility Study', 'Feasibility study for a waste-to-energy plant in Harare.', 'Environmental Management Agency', 'ZW', ARRAY['consulting', 'renewable_energy', 'environment'], '2026-09-10 10:00:00+02', 25000, 60000, 'USD', 'open', NOW()),
    ('Supply of Ambulances', 'Supply of 20 fully equipped ambulances for the national health service.', 'Ministry of Health', 'ZW', ARRAY['manufacturing', 'automotive', 'healthcare'], '2026-10-30 10:00:00+02', 800000, 1600000, 'USD', 'open', NOW()),
    ('Cloud Migration Services', 'Migration of 5 government departments to cloud infrastructure.', 'Ministry of ICT', 'ZW', ARRAY['technology', 'cloud', 'services'], '2026-11-15 10:00:00+02', 200000, 500000, 'USD', 'open', NOW()),
    ('Supply of Library Books', 'Supply of textbooks and reference materials for 100 community libraries.', 'Ministry of Education', 'ZW', ARRAY['education', 'publishing', 'logistics'], '2026-09-20 10:00:00+02', 100000, 250000, 'USD', 'open', NOW());
