/**
 * Clinical Dietetics & Nutrition Management System
 * Offline-First Local Data Architecture & Automated Clinical Engine
 */

// ==========================================
// 1. DATA STORAGE & SEED DATABASE
// ==========================================

const STORAGE_KEYS = {
    DB: 'ClinicalDiet_Database_v1',
    AUTH: 'ClinicalDiet_AuthSession_v1'
};

const DEFAULT_AUTH = {
    username: 'Ashish',
    password: 'Ashish@2026',
    displayName: 'Ashish (Admin / Registered Dietitian)',
    isAuthenticated: true
};

const SEED_DISEASES = [
    {
        id: 'd-1',
        name: 'Diabetes / Sugar',
        category: 'Metabolic',
        description: 'Impaired insulin secretion and resistance leading to chronic hyperglycemia.',
        dietaryGuidelines: 'Low glycemic index carbohydrates, high soluble fiber, strict restriction of simple sugars, sweets, cakes, cold drinks, and sugary juices.',
        restrictedNutrients: ['High-Glycemic Foods', 'Refined Sugars', 'White Flour / Maida', 'Sweetened Juices'],
        restrictedFoodIds: ['f-sugar', 'f-sweets', 'f-cake', 'f-cold-drink', 'f-sugary-juice', 'f-23'],
        restrictedFoodNames: ['Sugar', 'Sweets', 'Cake', 'Cold Drink', 'Sugary Juice']
    },
    {
        id: 'd-2',
        name: 'Hypertension',
        category: 'Cardiovascular',
        description: 'Elevated arterial blood pressure requiring sodium limitation (DASH protocol).',
        dietaryGuidelines: 'Sodium restriction (<2000mg/day), rich in potassium, calcium, magnesium, avoidance of processed and salted snacks.',
        restrictedNutrients: ['High Sodium / Added Salt', 'Processed Meats', 'Pickles & Papad', 'Fried Snacks']
    },
    {
        id: 'd-3',
        name: 'Chronic Kidney Disease (CKD)',
        category: 'Renal',
        description: 'Gradual loss of renal function requiring monitoring of protein, potassium, sodium, and phosphorus.',
        dietaryGuidelines: 'Low to moderate protein (0.6 - 0.8g/kg), low potassium (limit high potassium fruits like bananas, oranges), low phosphorus.',
        restrictedNutrients: ['Excess Dietary Protein', 'High Potassium Foods', 'High Phosphorus', 'Excess Sodium']
    },
    {
        id: 'd-4',
        name: 'Hyperlipidemia / Dyslipidemia',
        category: 'Cardiovascular',
        description: 'Elevated total cholesterol, triglycerides, or LDL particles.',
        dietaryGuidelines: 'Limit saturated and trans fatty acids, avoid deep-fried foods, butter, full-cream dairy. Increase omega-3 and soluble oat fiber.',
        restrictedNutrients: ['Saturated Fats', 'Trans Fats', 'Deep Fried Foods', 'Full Cream Dairy', 'Egg Yolks']
    },
    {
        id: 'd-5',
        name: 'Non-Alcoholic Fatty Liver (NAFLD)',
        category: 'Hepatic',
        description: 'Hepatic steatosis in the absence of significant alcohol consumption.',
        dietaryGuidelines: 'Mediterranean pattern, caloric reduction, strict avoidance of high-fructose corn syrup, refined sugar, and alcohol.',
        restrictedNutrients: ['Fructose / Table Sugar', 'Alcohol', 'Refined Carbohydrates', 'Trans Fats']
    },
    {
        id: 'd-6',
        name: 'Gout / Hyperuricemia',
        category: 'Metabolic',
        description: 'Uric acid crystal deposition in joints triggered by high-purine foods.',
        dietaryGuidelines: 'Strict low-purine diet. Avoid organ meats, red meats, sardines, beer, yeast extracts, and high-purine legumes/spinach.',
        restrictedNutrients: ['High Purine Foods', 'Red Meat', 'Seafood / Sardines', 'Excess Spinach', 'Beer']
    },
    {
        id: 'd-7',
        name: 'Polycystic Ovary Syndrome (PCOS)',
        category: 'Endocrine',
        description: 'Hormonal disorder with hyperandrogenism, irregular menses, and insulin resistance.',
        dietaryGuidelines: 'Low glycemic anti-inflammatory nutrition, balanced macronutrients with adequate protein and healthy fats.',
        restrictedNutrients: ['High-GI Sweets', 'Ultra-Processed Foods', 'Excess Refined Dairy']
    },
    {
        id: 'd-8',
        name: 'Hypothyroidism',
        category: 'Endocrine',
        description: 'Underactive thyroid gland with reduced metabolic rate.',
        dietaryGuidelines: 'Adequate iodine and selenium, avoid excessive raw goitrogens (raw cabbage, cauliflower, soy) around medication timing.',
        restrictedNutrients: ['Raw Goitrogens', 'Excess Soy Uncooked', 'High Calorie Sugars']
    },
    {
        id: 'd-9',
        name: 'GERD / Acid Reflux',
        category: 'Gastrointestinal',
        description: 'Acid reflux and irritation of the esophageal lining.',
        dietaryGuidelines: 'Small frequent meals, avoid spicy foods, citrus, tomatoes, coffee, mint, chocolate, and eating within 3 hours of sleep.',
        restrictedNutrients: ['Spicy Foods', 'Citrus & Tomatoes', 'Caffeine / Coffee', 'Deep Fried Meals']
    },
    {
        id: 'd-10',
        name: 'Celiac Disease / Gluten Sensitivity',
        category: 'Autoimmune',
        description: 'Immune reaction to eating gluten, damaging the small intestine.',
        dietaryGuidelines: 'Strict lifelong 100% gluten-free diet. Avoid wheat, rye, barley, standard oats contaminated with wheat.',
        restrictedNutrients: ['Wheat / Atta / Maida', 'Barley', 'Rye', 'Gluten Contaminants']
    }
];

const SEED_FOODS = [
    {
        id: 'f-1',
        name: 'Rolled Oats (Cooked/Raw)',
        category: 'Cereals',
        standardUnit: 'g',
        servingQuantity: 40,
        carbsPerGram: 0.60,
        proteinPerGram: 0.13,
        fatPerGram: 0.065,
        fiberPerGram: 0.10,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.007,
        calcium_mgPerGram: 0.54,
        iron_mgPerGram: 0.047,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Rich in beta-glucan soluble fiber, excellent for diabetes and cholesterol control.'
    },
    {
        id: 'f-2',
        name: 'Whole Wheat Roti / Chapati',
        category: 'Cereals',
        standardUnit: 'g',
        servingQuantity: 35,
        carbsPerGram: 0.46,
        proteinPerGram: 0.09,
        fatPerGram: 0.035,
        fiberPerGram: 0.08,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.004,
        calcium_mgPerGram: 0.35,
        iron_mgPerGram: 0.038,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Celiac Disease / Gluten Sensitivity'],
        notes: 'Standard home-style medium roti (~35g). High dietary fiber.'
    },
    {
        id: 'f-3',
        name: 'Brown Rice (Cooked)',
        category: 'Cereals',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0.23,
        proteinPerGram: 0.026,
        fatPerGram: 0.009,
        fiberPerGram: 0.018,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.002,
        calcium_mgPerGram: 0.10,
        iron_mgPerGram: 0.004,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Complex carbohydrate, gluten-free, slow release glucose.'
    },
    {
        id: 'f-4',
        name: 'White Basmati Rice (Cooked)',
        category: 'Cereals',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0.28,
        proteinPerGram: 0.027,
        fatPerGram: 0.003,
        fiberPerGram: 0.004,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0,
        calcium_mgPerGram: 0.10,
        iron_mgPerGram: 0.002,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Diabetes Mellitus Type 2'],
        notes: 'High glycemic index. Readily spikes blood sugar in diabetics.'
    },
    {
        id: 'f-5',
        name: 'Yellow Moong Dal (Cooked)',
        category: 'Proteins',
        standardUnit: 'g',
        servingQuantity: 150,
        carbsPerGram: 0.16,
        proteinPerGram: 0.07,
        fatPerGram: 0.015,
        fiberPerGram: 0.045,
        vitaminA_mcgPerGram: 0.02,
        vitaminC_mgPerGram: 0.01,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.002,
        calcium_mgPerGram: 0.27,
        iron_mgPerGram: 0.014,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Light, easily digestible lentil with complete amino acid balance.'
    },
    {
        id: 'f-6',
        name: 'Paneer Low Fat / Fresh Cottage Cheese',
        category: 'Dairy',
        standardUnit: 'g',
        servingQuantity: 80,
        carbsPerGram: 0.03,
        proteinPerGram: 0.18,
        fatPerGram: 0.08,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0.65,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0.005,
        vitaminB12_mcgPerGram: 0.008,
        vitaminE_mgPerGram: 0.003,
        calcium_mgPerGram: 4.80,
        iron_mgPerGram: 0.002,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Chronic Kidney Disease (CKD)'],
        notes: 'Rich source of bioavailable dairy casein protein and calcium.'
    },
    {
        id: 'f-7',
        name: 'Boiled Egg White (Large)',
        category: 'Proteins',
        standardUnit: 'g',
        servingQuantity: 33,
        carbsPerGram: 0.007,
        proteinPerGram: 0.11,
        fatPerGram: 0.002,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0.003,
        vitaminE_mgPerGram: 0,
        calcium_mgPerGram: 0.06,
        iron_mgPerGram: 0.001,
        dietCategory: 'Eggitarian',
        contraindicatedDiseases: [],
        notes: '1 large egg white (~33g). Pure albumin protein, virtually fat-free and zero cholesterol.'
    },
    {
        id: 'f-8',
        name: 'Whole Boiled Egg (Large)',
        category: 'Proteins',
        standardUnit: 'g',
        servingQuantity: 50,
        carbsPerGram: 0.012,
        proteinPerGram: 0.126,
        fatPerGram: 0.100,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 1.60,      // 80 mcg in 50g egg (10% DV)
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0.022,     // 1.1 mcg (44 IU) in 50g egg (22% DV)
        vitaminB12_mcgPerGram: 0.012,   // 0.6 mcg in 50g egg (25% DV)
        vitaminE_mgPerGram: 0.010,      // 0.5 mg in 50g egg
        calcium_mgPerGram: 0.50,        // 25 mg in 50g egg
        iron_mgPerGram: 0.018,          // 0.9 mg in 50g egg
        dietCategory: 'Eggitarian',
        contraindicatedDiseases: ['Hyperlipidemia / Dyslipidemia'],
        notes: '1 large whole boiled egg (50g). Golden standard reference protein with Vitamin D, B12, and brain-essential choline (147mg).'
    },
    {
        id: 'f-8b',
        name: 'Egg Bhurji / Scrambled (2 Eggs)',
        category: 'Proteins',
        standardUnit: 'g',
        servingQuantity: 110,
        carbsPerGram: 0.02,
        proteinPerGram: 0.12,
        fatPerGram: 0.11,
        fiberPerGram: 0.005,
        vitaminA_mcgPerGram: 1.50,
        vitaminC_mgPerGram: 0.04,
        vitaminD_mcgPerGram: 0.020,
        vitaminB12_mcgPerGram: 0.011,
        vitaminE_mgPerGram: 0.012,
        calcium_mgPerGram: 0.55,
        iron_mgPerGram: 0.019,
        dietCategory: 'Eggitarian',
        contraindicatedDiseases: ['Hyperlipidemia / Dyslipidemia'],
        notes: 'Home-style 2-egg bhurji with chopped onions, tomatoes, and green chillies.'
    },
    {
        id: 'f-9',
        name: 'Grilled Skinless Chicken Breast',
        category: 'Proteins',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0,
        proteinPerGram: 0.31,
        fatPerGram: 0.036,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0.10,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0.001,
        vitaminB12_mcgPerGram: 0.003,
        vitaminE_mgPerGram: 0.003,
        calcium_mgPerGram: 0.15,
        iron_mgPerGram: 0.010,
        dietCategory: 'Non-Veg',
        contraindicatedDiseases: ['Gout / Hyperuricemia', 'Chronic Kidney Disease (CKD)'],
        notes: 'Ultra lean high protein poultry with complete amino acid spectrum.'
    },
    {
        id: 'f-10',
        name: 'Firm Tofu (Soy Paneer)',
        category: 'Proteins',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0.02,
        proteinPerGram: 0.14,
        fatPerGram: 0.08,
        fiberPerGram: 0.02,
        vitaminA_mcgPerGram: 0.08,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.005,
        calcium_mgPerGram: 3.50,
        iron_mgPerGram: 0.054,
        dietCategory: 'Vegan',
        contraindicatedDiseases: [],
        notes: '100% plant-based soy protein with isoflavones, calcium, and iron.'
    },
    {
        id: 'f-11',
        name: 'Sprouted Green Moong (Raw/Steamed)',
        category: 'Proteins',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0.19,
        proteinPerGram: 0.085,
        fatPerGram: 0.012,
        fiberPerGram: 0.065,
        vitaminA_mcgPerGram: 0.12,
        vitaminC_mgPerGram: 0.13,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.005,
        calcium_mgPerGram: 0.48,
        iron_mgPerGram: 0.020,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Live enzymatic sprouted legumes, high bioavailable iron and vitamin C.'
    },
    {
        id: 'f-12',
        name: 'Roasted Bengal Gram (Chana / Bhuna Chana)',
        category: 'Snacks',
        standardUnit: 'g',
        servingQuantity: 40,
        carbsPerGram: 0.58,
        proteinPerGram: 0.18,
        fatPerGram: 0.05,
        fiberPerGram: 0.15,
        vitaminA_mcgPerGram: 0.05,
        vitaminC_mgPerGram: 0.01,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.008,
        calcium_mgPerGram: 0.58,
        iron_mgPerGram: 0.045,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Traditional crunchy high-fiber pulse snack with low GI.'
    },
    {
        id: 'f-13',
        name: 'Low-Fat Probiotic Curd / Dahi',
        category: 'Dairy',
        standardUnit: 'g',
        servingQuantity: 150,
        carbsPerGram: 0.045,
        proteinPerGram: 0.038,
        fatPerGram: 0.015,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0.25,
        vitaminC_mgPerGram: 0.01,
        vitaminD_mcgPerGram: 0.001,
        vitaminB12_mcgPerGram: 0.004,
        vitaminE_mgPerGram: 0.001,
        calcium_mgPerGram: 1.20,
        iron_mgPerGram: 0.001,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Cultured gut-friendly fermented dairy, high bioavailable calcium and Vitamin B12.'
    },
    {
        id: 'f-14',
        name: 'Toned Cow Milk (3% Fat)',
        category: 'Dairy',
        standardUnit: 'g',
        servingQuantity: 200,
        carbsPerGram: 0.048,
        proteinPerGram: 0.032,
        fatPerGram: 0.030,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0.32,
        vitaminC_mgPerGram: 0.01,
        vitaminD_mcgPerGram: 0.005,
        vitaminB12_mcgPerGram: 0.004,
        vitaminE_mgPerGram: 0.001,
        calcium_mgPerGram: 1.25,
        iron_mgPerGram: 0.001,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: '1 glass (200ml) of toned milk with bone-building calcium and Vitamin D.'
    },
    {
        id: 'f-15',
        name: 'Raw California Almonds',
        category: 'Nuts & Seeds',
        standardUnit: 'g',
        servingQuantity: 15,
        carbsPerGram: 0.21,
        proteinPerGram: 0.21,
        fatPerGram: 0.49,
        fiberPerGram: 0.12,
        vitaminA_mcgPerGram: 0.01,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.26,       // Very rich in Vitamin E!
        calcium_mgPerGram: 2.64,
        iron_mgPerGram: 0.037,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Superfood rich in Vitamin E (3.9mg in 15g), monounsaturated fats, and magnesium.'
    },
    {
        id: 'f-16',
        name: 'Raw Walnut Kernels',
        category: 'Nuts & Seeds',
        standardUnit: 'g',
        servingQuantity: 15,
        carbsPerGram: 0.14,
        proteinPerGram: 0.15,
        fatPerGram: 0.65,
        fiberPerGram: 0.07,
        vitaminA_mcgPerGram: 0.02,
        vitaminC_mgPerGram: 0.01,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.007,
        calcium_mgPerGram: 0.98,
        iron_mgPerGram: 0.029,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'High plant-based Omega-3 ALA for brain and cardiovascular health.'
    },
    {
        id: 'f-17',
        name: 'Chia Seeds (Raw)',
        category: 'Nuts & Seeds',
        standardUnit: 'g',
        servingQuantity: 15,
        carbsPerGram: 0.42,
        proteinPerGram: 0.17,
        fatPerGram: 0.31,
        fiberPerGram: 0.34,
        vitaminA_mcgPerGram: 0.05,
        vitaminC_mgPerGram: 0.01,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.005,
        calcium_mgPerGram: 6.31,
        iron_mgPerGram: 0.077,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Rich soluble mucilage fiber, calcium, and plant omega-3s.'
    },
    {
        id: 'f-18',
        name: 'Fresh Red Apple (With Peel)',
        category: 'Fruits',
        standardUnit: 'g',
        servingQuantity: 120,
        carbsPerGram: 0.14,
        proteinPerGram: 0.003,
        fatPerGram: 0.002,
        fiberPerGram: 0.024,
        vitaminA_mcgPerGram: 0.03,
        vitaminC_mgPerGram: 0.046,      // 5.5mg in 120g
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.002,
        calcium_mgPerGram: 0.06,
        iron_mgPerGram: 0.001,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: '1 medium apple (120g). Pectin prebiotic fiber, low GI, antioxidant quercetin.'
    },
    {
        id: 'f-19',
        name: 'Ripe Banana',
        category: 'Fruits',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0.23,
        proteinPerGram: 0.011,
        fatPerGram: 0.003,
        fiberPerGram: 0.026,
        vitaminA_mcgPerGram: 0.03,
        vitaminC_mgPerGram: 0.087,      // 8.7mg in 100g
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.001,
        calcium_mgPerGram: 0.05,
        iron_mgPerGram: 0.003,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Chronic Kidney Disease (CKD)', 'Diabetes Mellitus Type 2'],
        notes: 'High potassium energy fruit. Strictly contraindicated in advanced CKD / renal failure.'
    },
    {
        id: 'f-20',
        name: 'Fresh Spinach / Palak (Cooked)',
        category: 'Vegetables',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0.036,
        proteinPerGram: 0.029,
        fatPerGram: 0.004,
        fiberPerGram: 0.022,
        vitaminA_mcgPerGram: 4.69,      // 469 mcg Vitamin A beta-carotene!
        vitaminC_mgPerGram: 0.28,       // 28mg Vitamin C!
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.02,
        calcium_mgPerGram: 0.99,
        iron_mgPerGram: 0.027,          // 2.7mg iron
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Gout / Hyperuricemia', 'Chronic Kidney Disease (CKD)'],
        notes: 'High in carotenoids, Vitamin C, iron, oxalates, and moderate purines.'
    },
    {
        id: 'f-21',
        name: 'Cucumber & Tomato Green Salad',
        category: 'Vegetables',
        standardUnit: 'g',
        servingQuantity: 150,
        carbsPerGram: 0.036,
        proteinPerGram: 0.009,
        fatPerGram: 0.002,
        fiberPerGram: 0.018,
        vitaminA_mcgPerGram: 0.42,
        vitaminC_mgPerGram: 0.14,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.005,
        calcium_mgPerGram: 0.16,
        iron_mgPerGram: 0.004,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'Hydrating roughage with lycopene and vitamin C.'
    },
    {
        id: 'f-22',
        name: 'Green Tea (Fresh Infusion)',
        category: 'Beverages',
        standardUnit: 'g',
        servingQuantity: 200,
        carbsPerGram: 0.002,
        proteinPerGram: 0,
        fatPerGram: 0,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0.005,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0,
        calcium_mgPerGram: 0.02,
        iron_mgPerGram: 0.001,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: 'EGCG antioxidant beverage. Calorie-free.'
    },
    {
        id: 'f-23',
        name: 'Refined White Sugar / Sweets',
        category: 'Snacks',
        standardUnit: 'g',
        servingQuantity: 20,
        carbsPerGram: 1.0,
        proteinPerGram: 0,
        fatPerGram: 0,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0,
        calcium_mgPerGram: 0,
        iron_mgPerGram: 0,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Diabetes Mellitus Type 2', 'Non-Alcoholic Fatty Liver (NAFLD)', 'Polycystic Ovary Syndrome (PCOS)'],
        notes: 'Pure sucrose, causes severe glycemic spikes.'
    },
    {
        id: 'f-24',
        name: 'Deep Fried Samosa / Kachori',
        category: 'Snacks',
        standardUnit: 'g',
        servingQuantity: 80,
        carbsPerGram: 0.32,
        proteinPerGram: 0.04,
        fatPerGram: 0.22,
        fiberPerGram: 0.015,
        vitaminA_mcgPerGram: 0.05,
        vitaminC_mgPerGram: 0.01,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.008,
        calcium_mgPerGram: 0.20,
        iron_mgPerGram: 0.008,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Hypertension', 'Hyperlipidemia / Dyslipidemia', 'Non-Alcoholic Fatty Liver (NAFLD)', 'GERD / Acid Reflux'],
        notes: 'Commercial deep-fried trans-fats and excessive sodium.'
    },
    {
        id: 'f-sugar',
        name: 'Sugar',
        category: 'Snacks',
        standardUnit: 'g',
        servingQuantity: 20,
        carbsPerGram: 1.0,
        proteinPerGram: 0,
        fatPerGram: 0,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0,
        calcium_mgPerGram: 0,
        iron_mgPerGram: 0,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Diabetes / Sugar', 'Diabetes Mellitus Type 2'],
        notes: 'Refined sucrose table sugar, causes rapid glycemic surge.'
    },
    {
        id: 'f-sweets',
        name: 'Sweets',
        category: 'Snacks',
        standardUnit: 'g',
        servingQuantity: 50,
        carbsPerGram: 0.65,
        proteinPerGram: 0.05,
        fatPerGram: 0.20,
        fiberPerGram: 0.01,
        vitaminA_mcgPerGram: 0.1,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0.001,
        vitaminE_mgPerGram: 0.005,
        calcium_mgPerGram: 0.40,
        iron_mgPerGram: 0.005,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Diabetes / Sugar', 'Diabetes Mellitus Type 2'],
        notes: 'Traditional Indian sweets (Gulab Jamun, Laddu, Barfi) high in sugar and ghee.'
    },
    {
        id: 'f-cake',
        name: 'Cake',
        category: 'Snacks',
        standardUnit: 'g',
        servingQuantity: 60,
        carbsPerGram: 0.55,
        proteinPerGram: 0.05,
        fatPerGram: 0.18,
        fiberPerGram: 0.01,
        vitaminA_mcgPerGram: 0.08,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0.001,
        vitaminB12_mcgPerGram: 0.001,
        vitaminE_mgPerGram: 0.004,
        calcium_mgPerGram: 0.35,
        iron_mgPerGram: 0.008,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Diabetes / Sugar', 'Diabetes Mellitus Type 2'],
        notes: 'Bakery pastry with high refined carbs, table sugar, and saturated fats.'
    },
    {
        id: 'f-cold-drink',
        name: 'Cold Drink',
        category: 'Beverages',
        standardUnit: 'g',
        servingQuantity: 250,
        carbsPerGram: 0.11,
        proteinPerGram: 0,
        fatPerGram: 0,
        fiberPerGram: 0,
        vitaminA_mcgPerGram: 0,
        vitaminC_mgPerGram: 0,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0,
        calcium_mgPerGram: 0.01,
        iron_mgPerGram: 0,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Diabetes / Sugar', 'Diabetes Mellitus Type 2'],
        notes: 'Carbonated sweetened soft drink / cola with high sugar content.'
    },
    {
        id: 'f-sugary-juice',
        name: 'Sugary Juice',
        category: 'Beverages',
        standardUnit: 'g',
        servingQuantity: 200,
        carbsPerGram: 0.14,
        proteinPerGram: 0.005,
        fatPerGram: 0.002,
        fiberPerGram: 0.002,
        vitaminA_mcgPerGram: 0.12,
        vitaminC_mgPerGram: 0.15,
        vitaminD_mcgPerGram: 0,
        vitaminB12_mcgPerGram: 0,
        vitaminE_mgPerGram: 0.002,
        calcium_mgPerGram: 0.08,
        iron_mgPerGram: 0.002,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: ['Diabetes / Sugar', 'Diabetes Mellitus Type 2'],
        notes: 'Commercial packaged juice beverage with added sucrose.'
    }
];

const SEED_PATIENTS = [
    {
        id: 'p-1',
        name: 'Rajesh Sharma',
        contactNumber: '+919876543210',
        dateOfBirth: '1989-05-15',
        yearOfBirth: 1989,
        age: 37,
        gender: 'Male',
        eatingFrequency: '3 meals a day',
        primaryComplaint: 'Weight loss and management of Grade 1 Fatty Liver & Borderline Hypertension.',
        clinicalDiagnoses: ['Hypertension', 'Non-Alcoholic Fatty Liver (NAFLD)'],
        describeMedicalConditions: 'Grade 1 Hepatic Steatosis reported on abdominal ultrasound; BP 138/88 mmHg.',
        prescribedMedications: 'Telmisartan 20mg (once daily morning post breakfast)',
        otcSupplements: 'Omega-3 Fish Oil (1000mg), CoQ10',
        occupation: 'Senior Software Engineer (Desk Job)',
        workingHours: 'Day',
        dailySleepDurationHours: 6.5,
        sleepQuality: 'Broken',
        stressLevel: 7,
        primaryStressFactor: 'Work deadlines and sedentary lifestyle',
        dailyStepCount: 4500,
        exerciseRoutine: 'Brisk walking 25 mins (3 days/week)',
        activityLevel: 'Lightly Active',
        primaryDietType: 'Vegetarian',
        waterConsumptionLiters: 2.0,
        alcoholSmokingFrequency: 'Non-smoker, occasional social wine',
        emotionalEatingTriggers: ['Stress', 'Boredom', 'Late Night Craving'],
        mealFrequency: '3 Meals',
        heightCm: 175.0,
        weightKg: 84.5,
        waistCm: 96.0,
        hipsCm: 102.0,
        calorieGoalType: 'Weight Loss',
        macroDistributionPreset: 'Standard Balanced',
        createdAt: new Date().toISOString()
    },
    {
        id: 'p-2',
        name: 'Pooja Varma',
        contactNumber: '+919812345678',
        dateOfBirth: '1996-09-22',
        yearOfBirth: 1996,
        age: 30,
        gender: 'Female',
        eatingFrequency: '5 meals a day',
        primaryComplaint: 'PCOS management, weight stagnation, and insulin resistance.',
        clinicalDiagnoses: ['Polycystic Ovary Syndrome (PCOS)', 'Diabetes Mellitus Type 2'],
        describeMedicalConditions: 'Insulin resistance (HOMA-IR 3.8), irregular menstrual cycles (45-50 days).',
        prescribedMedications: 'Metformin 500mg SR (post dinner), Inositol',
        otcSupplements: 'Vitamin D3 60k IU, Zinc + Magnesium',
        occupation: 'Financial Analyst',
        workingHours: 'Day',
        dailySleepDurationHours: 7.0,
        sleepQuality: 'Restful',
        stressLevel: 6,
        primaryStressFactor: 'Long sitting hours',
        dailyStepCount: 6000,
        exerciseRoutine: 'Pilates & Strength Training 3x weekly',
        activityLevel: 'Moderately Active',
        primaryDietType: 'Vegetarian',
        waterConsumptionLiters: 2.8,
        alcoholSmokingFrequency: 'Non-smoker',
        emotionalEatingTriggers: ['Anxiety', 'Sadness'],
        mealFrequency: '5 Meals',
        heightCm: 162.0,
        weightKg: 68.0,
        waistCm: 84.0,
        hipsCm: 98.0,
        calorieGoalType: 'Weight Loss',
        macroDistributionPreset: 'Diabetic',
        createdAt: new Date().toISOString()
    },
    {
        id: 'p-3',
        name: 'Ananya Sen',
        contactNumber: '+919934567890',
        dateOfBirth: '2000-03-12',
        yearOfBirth: 2000,
        age: 26,
        gender: 'Female',
        eatingFrequency: '2 meals a day',
        primaryComplaint: 'Lean muscle definition, high energy nutrition, and micronutrient balancing.',
        clinicalDiagnoses: [],
        describeMedicalConditions: 'Healthy vitals, periodic low iron fatigue.',
        prescribedMedications: 'None',
        otcSupplements: 'Iron + Vitamin C chewable',
        occupation: 'Product Designer',
        workingHours: 'Day',
        dailySleepDurationHours: 7.5,
        sleepQuality: 'Restful',
        stressLevel: 4,
        primaryStressFactor: 'Creative deadlines',
        dailyStepCount: 8500,
        exerciseRoutine: 'Yoga & Strength Training 4x weekly',
        activityLevel: 'Moderately Active',
        primaryDietType: 'Eggitarian',
        waterConsumptionLiters: 3.0,
        alcoholSmokingFrequency: 'Non-smoker',
        emotionalEatingTriggers: [],
        mealFrequency: '2 Meals',
        heightCm: 165.0,
        weightKg: 58.0,
        waistCm: 70.0,
        hipsCm: 92.0,
        calorieGoalType: 'Maintenance',
        macroDistributionPreset: 'High Protein',
        createdAt: new Date().toISOString()
    },
    {
        id: 'p-4',
        name: 'Vikram Patel',
        contactNumber: '+919871122334',
        dateOfBirth: '1994-11-05',
        yearOfBirth: 1994,
        age: 32,
        gender: 'Male',
        eatingFrequency: '4 meals a day',
        primaryComplaint: 'Athletic conditioning & clean caloric nutrition.',
        clinicalDiagnoses: [],
        describeMedicalConditions: 'Active runner, normal lipid and glucose profile.',
        prescribedMedications: 'None',
        otcSupplements: 'Whey Protein, Multivitamins',
        occupation: 'Architect',
        workingHours: 'Day',
        dailySleepDurationHours: 7.0,
        sleepQuality: 'Restful',
        stressLevel: 5,
        primaryStressFactor: 'Site visits',
        dailyStepCount: 11000,
        exerciseRoutine: 'Running 5km + Calisthenics',
        activityLevel: 'Very Active',
        primaryDietType: 'Non-Veg',
        waterConsumptionLiters: 3.5,
        alcoholSmokingFrequency: 'Occasional beer',
        emotionalEatingTriggers: [],
        mealFrequency: '4 Meals',
        heightCm: 180.0,
        weightKg: 76.0,
        waistCm: 82.0,
        hipsCm: 96.0,
        calorieGoalType: 'Maintenance',
        macroDistributionPreset: 'High Protein',
        createdAt: new Date().toISOString()
    }
];

class ClinicalDatabase {
    constructor() {
        this.activeRole = localStorage.getItem('diet_active_role') || 'admin'; // 'admin' or 'user'
        this.activeUserId = localStorage.getItem('diet_active_user_id') || 'p-1';
        this.load();
    }

    load() {
        const stored = localStorage.getItem(STORAGE_KEYS.DB);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                
                // Merge diseases to ensure restrictedFoodIds are present
                if (parsed.diseases && parsed.diseases.length > 0) {
                    this.diseases = parsed.diseases.map(d => {
                        const seed = SEED_DISEASES.find(sd => sd.id === d.id || sd.name.toLowerCase() === d.name.toLowerCase());
                        return {
                            restrictedNutrients: d.restrictedNutrients || (seed ? seed.restrictedNutrients : []),
                            restrictedFoodIds: d.restrictedFoodIds || (seed ? seed.restrictedFoodIds : []),
                            restrictedFoodNames: d.restrictedFoodNames || (seed ? seed.restrictedFoodNames : []),
                            ...d
                        };
                    });
                    for (const sd of SEED_DISEASES) {
                        if (!this.diseases.some(d => d.id === sd.id || d.name.toLowerCase() === sd.name.toLowerCase())) {
                            this.diseases.push(sd);
                        }
                    }
                } else {
                    this.diseases = [...SEED_DISEASES];
                }
                
                // Merge foods to ensure vitamin fields and new restricted food seeds are present
                if (parsed.foods && parsed.foods.length > 0) {
                    this.foods = parsed.foods.map(f => {
                        const seed = SEED_FOODS.find(sf => sf.id === f.id || sf.name.toLowerCase() === f.name.toLowerCase());
                        return {
                            vitaminA_mcgPerGram: seed ? seed.vitaminA_mcgPerGram : 0,
                            vitaminC_mgPerGram: seed ? seed.vitaminC_mgPerGram : 0,
                            vitaminD_mcgPerGram: seed ? seed.vitaminD_mcgPerGram : 0,
                            vitaminB12_mcgPerGram: seed ? seed.vitaminB12_mcgPerGram : 0,
                            vitaminE_mgPerGram: seed ? seed.vitaminE_mgPerGram : 0,
                            calcium_mgPerGram: seed ? seed.calcium_mgPerGram : 0,
                            iron_mgPerGram: seed ? seed.iron_mgPerGram : 0,
                            ...f
                        };
                    });
                    for (const sf of SEED_FOODS) {
                        if (!this.foods.some(f => f.id === sf.id || f.name.toLowerCase() === sf.name.toLowerCase())) {
                            this.foods.push(sf);
                        }
                    }
                } else {
                    this.foods = [...SEED_FOODS];
                }

                // Merge patients to ensure multiple users & demographic fields
                if (parsed.patients && parsed.patients.length > 0) {
                    this.patients = parsed.patients;
                    // Add any missing seeds
                    for (const sp of SEED_PATIENTS) {
                        if (!this.patients.some(p => p.id === sp.id)) {
                            this.patients.push(sp);
                        }
                    }
                } else {
                    this.patients = [...SEED_PATIENTS];
                }

                this.plans = parsed.plans || [];
                return;
            } catch (e) {
                console.error('Failed to parse database, resetting to seeds', e);
            }
        }
        this.diseases = [...SEED_DISEASES];
        this.foods = [...SEED_FOODS];
        this.patients = [...SEED_PATIENTS];
        this.plans = [];
        this.save();
    }

    save() {
        const payload = {
            diseases: this.diseases,
            foods: this.foods,
            patients: this.patients,
            plans: this.plans
        };
        localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(payload));
    }

    // ==========================================
    // DISEASE MASTER CRUD & RESTRICTION VALIDATION
    // (Disease -> Multiple Restricted Foods)
    // ==========================================
    getDiseases() {
        return this.diseases || [];
    }

    getDisease(id) {
        if (!id) return null;
        return (this.diseases || []).find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase()) || null;
    }

    saveDisease(diseaseData) {
        if (!diseaseData) return null;
        if (!diseaseData.restrictedFoodIds) diseaseData.restrictedFoodIds = [];

        // Synchronize restrictedFoodNames for convenience
        diseaseData.restrictedFoodNames = this.getFoods()
            .filter(f => diseaseData.restrictedFoodIds.includes(f.id))
            .map(f => f.name);

        if (!diseaseData.id) {
            diseaseData.id = 'd-' + Date.now();
            diseaseData.createdAt = new Date().toISOString();
            this.diseases.push(diseaseData);
        } else {
            const idx = this.diseases.findIndex(d => d.id === diseaseData.id);
            if (idx >= 0) {
                this.diseases[idx] = { ...this.diseases[idx], ...diseaseData, updatedAt: new Date().toISOString() };
            } else {
                this.diseases.push(diseaseData);
            }
        }
        this.save();
        return this.getDisease(diseaseData.id);
    }

    deleteDisease(id) {
        const disease = this.getDisease(id);
        const name = disease?.name;
        const idx = this.diseases.findIndex(d => d.id === id);
        if (idx >= 0) {
            this.diseases.splice(idx, 1);
            if (name) {
                this.patients.forEach(p => {
                    p.clinicalDiagnoses = (p.clinicalDiagnoses || []).filter(cd => cd !== name && cd !== id);
                });
            }
            this.save();
            return true;
        }
        return false;
    }

    getRestrictedFoodsForDisease(diseaseId) {
        const disease = this.getDisease(diseaseId);
        if (!disease) return [];
        const ids = disease.restrictedFoodIds || [];
        const names = disease.restrictedFoodNames || [];
        return this.foods.filter(f => 
            ids.includes(f.id) || 
            names.some(n => n.toLowerCase() === f.name.toLowerCase()) ||
            (f.contraindicatedDiseases && f.contraindicatedDiseases.some(cd => cd.toLowerCase() === disease.name.toLowerCase()))
        );
    }

    isFoodRestrictedForUser(userId, foodId) {
        const user = this.getUser(userId);
        const food = this.getFood(foodId);
        if (!user || !food) return { isRestricted: false };

        const diagnoses = user.clinicalDiagnoses || [];
        if (!diagnoses.length) return { isRestricted: false };

        for (const diagName of diagnoses) {
            // Find disease by name, id, or partial match
            const disease = (this.diseases || []).find(d => 
                d.name.toLowerCase() === diagName.toLowerCase() || 
                d.id === diagName ||
                (diagName.toLowerCase().includes('diabetes') && d.name.toLowerCase().includes('diabetes')) ||
                (diagName.toLowerCase().includes('hypertension') && d.name.toLowerCase().includes('hypertension')) ||
                (diagName.toLowerCase().includes('kidney') && d.name.toLowerCase().includes('kidney'))
            );

            if (disease) {
                const restrictedIds = disease.restrictedFoodIds || [];
                const restrictedNames = disease.restrictedFoodNames || [];

                // 1. Direct ID check
                if (restrictedIds.includes(food.id)) {
                    return {
                        isRestricted: true,
                        foodName: food.name,
                        diseaseName: disease.name,
                        message: `${food.name} is restricted for ${disease.name}.`
                    };
                }

                // 2. Direct Name check
                if (restrictedNames.some(rn => rn.toLowerCase() === food.name.toLowerCase())) {
                    return {
                        isRestricted: true,
                        foodName: food.name,
                        diseaseName: disease.name,
                        message: `${food.name} is restricted for ${disease.name}.`
                    };
                }

                // 3. Keyword matching for Diabetes (Sugar, Sweets, Cake, Cold Drink, Sugary Juice)
                if (disease.name.toLowerCase().includes('diabetes')) {
                    const fn = food.name.toLowerCase();
                    if (fn.includes('sugar') || fn.includes('sweet') || fn.includes('cake') || fn.includes('cold drink') || fn.includes('sugary juice')) {
                        return {
                            isRestricted: true,
                            foodName: food.name,
                            diseaseName: disease.name,
                            message: `${food.name} is restricted for ${disease.name}.`
                        };
                    }
                }
            }

            // Also check food's contraindicatedDiseases list
            if (food.contraindicatedDiseases && food.contraindicatedDiseases.some(cd => 
                cd.toLowerCase().includes(diagName.toLowerCase()) || 
                diagName.toLowerCase().includes(cd.toLowerCase())
            )) {
                return {
                    isRestricted: true,
                    foodName: food.name,
                    diseaseName: diagName,
                    message: `${food.name} is restricted for ${diagName}.`
                };
            }
        }

        return { isRestricted: false };
    }

    // ==========================================
    // ROLE & MULTI-USER STATE MANAGEMENT
    // ==========================================
    setRole(role) {
        this.activeRole = role === 'user' ? 'user' : 'admin';
        localStorage.setItem('diet_active_role', this.activeRole);
    }

    setActiveUser(userId) {
        this.activeUserId = userId;
        localStorage.setItem('diet_active_user_id', userId);
    }

    getActiveUser() {
        return this.getPatient(this.activeUserId) || this.patients[0] || null;
    }

    // ==========================================
    // USER / PATIENT CRUD
    // ==========================================
    getPatients() {
        return this.patients || [];
    }

    getUsers() {
        return this.getPatients();
    }

    getPatient(id) {
        return this.patients.find(p => p.id === id) || null;
    }

    getUser(id) {
        return this.getPatient(id);
    }

    savePatient(patientData) {
        if (!patientData.id) {
            patientData.id = 'p-' + Date.now();
            patientData.createdAt = new Date().toISOString();
            this.patients.push(patientData);
        } else {
            const idx = this.patients.findIndex(p => p.id === patientData.id);
            if (idx >= 0) {
                this.patients[idx] = { ...this.patients[idx], ...patientData, updatedAt: new Date().toISOString() };
            } else {
                this.patients.push(patientData);
            }
        }
        this.save();
        return this.getPatient(patientData.id);
    }

    saveUser(userData) {
        return this.savePatient(userData);
    }

    deletePatient(id) {
        const idx = this.patients.findIndex(p => p.id === id);
        if (idx >= 0) {
            this.patients.splice(idx, 1);
            // Also delete plans for this patient
            this.plans = this.plans.filter(p => p.patientId !== id);
            if (this.activeUserId === id && this.patients.length > 0) {
                this.setActiveUser(this.patients[0].id);
            }
            this.save();
            return true;
        }
        return false;
    }

    deleteUser(id) {
        return this.deletePatient(id);
    }

    // ==========================================
    // FOOD & MEAL LIBRARY CRUD (ADMIN UPLOADER)
    // ==========================================
    getFoods() {
        return this.foods || [];
    }

    getFood(id) {
        return this.foods.find(f => f.id === id) || null;
    }

    saveFood(foodData) {
        const carbs = parseFloat(foodData.carbsPerGram) || 0;
        const prot = parseFloat(foodData.proteinPerGram) || 0;
        const fat = parseFloat(foodData.fatPerGram) || 0;
        const cals = (carbs * 4) + (prot * 4) + (fat * 9);

        const cleanFood = {
            id: foodData.id || ('f-' + Date.now()),
            name: foodData.name || 'Unnamed Meal',
            category: foodData.category || 'Proteins',
            standardUnit: foodData.standardUnit || 'g',
            servingQuantity: parseFloat(foodData.servingQuantity) || 100,
            carbsPerGram: Number(carbs.toFixed(3)),
            proteinPerGram: Number(prot.toFixed(3)),
            fatPerGram: Number(fat.toFixed(3)),
            fiberPerGram: Number((parseFloat(foodData.fiberPerGram) || 0).toFixed(3)),
            caloriesPerGram: Number(cals.toFixed(3)),
            // Vitamins & Micronutrients
            vitaminA_mcgPerGram: Number((parseFloat(foodData.vitaminA_mcgPerGram) || 0).toFixed(3)),
            vitaminC_mgPerGram: Number((parseFloat(foodData.vitaminC_mgPerGram) || 0).toFixed(3)),
            vitaminD_mcgPerGram: Number((parseFloat(foodData.vitaminD_mcgPerGram) || 0).toFixed(3)),
            vitaminB12_mcgPerGram: Number((parseFloat(foodData.vitaminB12_mcgPerGram) || 0).toFixed(3)),
            vitaminE_mgPerGram: Number((parseFloat(foodData.vitaminE_mgPerGram) || 0).toFixed(3)),
            calcium_mgPerGram: Number((parseFloat(foodData.calcium_mgPerGram) || 0).toFixed(3)),
            iron_mgPerGram: Number((parseFloat(foodData.iron_mgPerGram) || 0).toFixed(3)),
            dietCategory: foodData.dietCategory || 'Vegetarian',
            contraindicatedDiseases: Array.isArray(foodData.contraindicatedDiseases) ? foodData.contraindicatedDiseases : [],
            notes: foodData.notes || '',
            imageUrl: foodData.imageUrl || '',
            updatedAt: new Date().toISOString()
        };

        const existingIdx = this.foods.findIndex(f => f.id === cleanFood.id);
        if (existingIdx >= 0) {
            this.foods[existingIdx] = cleanFood;
        } else {
            this.foods.unshift(cleanFood);
        }

        this.save();
        return cleanFood;
    }

    uploadMeal(mealData) {
        return this.saveFood(mealData);
    }

    deleteFood(id) {
        const idx = this.foods.findIndex(f => f.id === id);
        if (idx >= 0) {
            this.foods.splice(idx, 1);
            this.save();
            return true;
        }
        return false;
    }

    // Calculates all macro and micronutrient amounts for any portion of food
    calculateMealNutrients(food, quantity) {
        if (!food) return null;
        const qty = parseFloat(quantity) > 0 ? parseFloat(quantity) : (parseFloat(food.servingQuantity) || 100);
        const calsPerG = food.caloriesPerGram || ((food.carbsPerGram * 4) + (food.proteinPerGram * 4) + (food.fatPerGram * 9));

        return {
            quantity: qty,
            unit: food.standardUnit || 'g',
            calories: Math.round(calsPerG * qty * 10) / 10,
            protein: Math.round((food.proteinPerGram || 0) * qty * 10) / 10,
            fat: Math.round((food.fatPerGram || 0) * qty * 10) / 10,
            carbs: Math.round((food.carbsPerGram || 0) * qty * 10) / 10,
            fiber: Math.round((food.fiberPerGram || 0) * qty * 10) / 10,
            vitaminA: Math.round((food.vitaminA_mcgPerGram || 0) * qty * 10) / 10,
            vitaminC: Math.round((food.vitaminC_mgPerGram || 0) * qty * 10) / 10,
            vitaminD: Math.round((food.vitaminD_mcgPerGram || 0) * qty * 100) / 100,
            vitaminB12: Math.round((food.vitaminB12_mcgPerGram || 0) * qty * 100) / 100,
            vitaminE: Math.round((food.vitaminE_mgPerGram || 0) * qty * 100) / 100,
            calcium: Math.round((food.calcium_mgPerGram || 0) * qty * 10) / 10,
            iron: Math.round((food.iron_mgPerGram || 0) * qty * 100) / 100
        };
    }

    // ==========================================
    // USER DIET PLAN CRUD & RECALCULATIONS
    // ==========================================
    getPlans() {
        return this.plans || [];
    }

    getPlan(id) {
        return this.plans.find(p => p.id === id) || null;
    }

    getPlanByPatient(patientId) {
        const found = this.plans.find(p => p.patientId === patientId);
        if (found) return found;

        // Auto-create plan if none exists
        const patient = this.getPatient(patientId);
        if (patient) {
            const newPlan = DietGenerator.generatePlan(patient);
            this.plans.push(newPlan);
            this.save();
            return newPlan;
        }
        return null;
    }

    getUserDiet(userId) {
        return this.getPlanByPatient(userId);
    }

    savePlan(plan) {
        this.recalculatePlanTotals(plan);
        const idx = this.plans.findIndex(p => p.id === plan.id);
        if (idx >= 0) {
            this.plans[idx] = plan;
        } else {
            this.plans.unshift(plan);
        }
        this.save();
        return plan;
    }

    saveUserDiet(plan) {
        return this.savePlan(plan);
    }

    deletePlan(id) {
        const idx = this.plans.findIndex(p => p.id === id);
        if (idx >= 0) {
            this.plans.splice(idx, 1);
            this.save();
            return true;
        }
        return false;
    }

    recalculatePlanTotals(plan) {
        if (!plan || !plan.mealItems) return;
        plan.totalAllocatedCalories = Math.round(plan.mealItems.reduce((s, i) => s + (i.calories || 0), 0));
        plan.allocatedCarbsGrams = Math.round(plan.mealItems.reduce((s, i) => s + (i.carbs || i.carbsGrams || 0), 0) * 10) / 10;
        plan.allocatedProteinGrams = Math.round(plan.mealItems.reduce((s, i) => s + (i.protein || i.proteinGrams || 0), 0) * 10) / 10;
        plan.allocatedFatGrams = Math.round(plan.mealItems.reduce((s, i) => s + (i.fat || i.fatGrams || 0), 0) * 10) / 10;
        plan.allocatedFiberGrams = Math.round(plan.mealItems.reduce((s, i) => s + (i.fiber || 0), 0) * 10) / 10;
        plan.totalVitaminA = Math.round(plan.mealItems.reduce((s, i) => s + (i.vitaminA || 0), 0) * 10) / 10;
        plan.totalVitaminC = Math.round(plan.mealItems.reduce((s, i) => s + (i.vitaminC || 0), 0) * 10) / 10;
        plan.totalVitaminD = Math.round(plan.mealItems.reduce((s, i) => s + (i.vitaminD || 0), 0) * 100) / 100;
        plan.totalVitaminB12 = Math.round(plan.mealItems.reduce((s, i) => s + (i.vitaminB12 || 0), 0) * 100) / 100;
        plan.totalCalcium = Math.round(plan.mealItems.reduce((s, i) => s + (i.calcium || 0), 0) * 10) / 10;
        plan.totalIron = Math.round(plan.mealItems.reduce((s, i) => s + (i.iron || 0), 0) * 100) / 100;
    }

    addMealToUserDiet(userId, slot, foodId, quantity, instructions = '') {
        const plan = this.getUserDiet(userId);
        const food = this.getFood(foodId);
        if (!plan || !food) return null;

        // Backend Validation: check if food is restricted for user's diseases
        const restriction = this.isFoodRestrictedForUser(userId, foodId);
        if (restriction.isRestricted) {
            return {
                success: false,
                isRestricted: true,
                foodName: restriction.foodName,
                diseaseName: restriction.diseaseName,
                error: `${restriction.foodName} is restricted for ${restriction.diseaseName}.`
            };
        }

        const qty = parseFloat(quantity) > 0 ? parseFloat(quantity) : food.servingQuantity;
        const nut = this.calculateMealNutrients(food, qty);

        const newItem = {
            id: 'mi-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            mealSlot: slot || 'Breakfast',
            timeSlot: this.getDefaultTimeForSlot(slot),
            foodItemId: food.id,
            foodItemName: food.name,
            quantity: qty,
            unit: food.standardUnit || 'g',
            calories: nut.calories,
            protein: nut.protein,
            carbs: nut.carbs,
            fat: nut.fat,
            fiber: nut.fiber,
            vitaminA: nut.vitaminA,
            vitaminC: nut.vitaminC,
            vitaminD: nut.vitaminD,
            vitaminB12: nut.vitaminB12,
            calcium: nut.calcium,
            iron: nut.iron,
            specialInstructions: instructions || food.notes || ''
        };

        plan.mealItems.push(newItem);
        this.savePlan(plan);
        return newItem;
    }

    removeMealFromUserDiet(userId, itemId) {
        const plan = this.getUserDiet(userId);
        if (!plan) return false;
        const idx = plan.mealItems.findIndex(i => i.id === itemId);
        if (idx >= 0) {
            plan.mealItems.splice(idx, 1);
            this.savePlan(plan);
            return true;
        }
        return false;
    }

    updateMealInUserDiet(userId, itemId, updates) {
        const plan = this.getUserDiet(userId);
        if (!plan) return false;
        const item = plan.mealItems.find(i => i.id === itemId);
        if (!item) return false;

        const food = this.getFood(item.foodItemId);
        if (updates.quantity && food) {
            const qty = parseFloat(updates.quantity) || item.quantity;
            const nut = this.calculateMealNutrients(food, qty);
            item.quantity = qty;
            item.calories = nut.calories;
            item.protein = nut.protein;
            item.carbs = nut.carbs;
            item.fat = nut.fat;
            item.fiber = nut.fiber;
            item.vitaminA = nut.vitaminA;
            item.vitaminC = nut.vitaminC;
            item.vitaminD = nut.vitaminD;
            item.vitaminB12 = nut.vitaminB12;
            item.calcium = nut.calcium;
            item.iron = nut.iron;
        }

        if (updates.specialInstructions !== undefined) item.specialInstructions = updates.specialInstructions;
        if (updates.mealSlot) item.mealSlot = updates.mealSlot;

        this.savePlan(plan);
        return true;
    }

    getDefaultTimeForSlot(slot) {
        switch ((slot || '').toLowerCase()) {
            case 'breakfast': return '08:30 AM';
            case 'mid-morning': return '11:00 AM';
            case 'lunch': return '01:30 PM';
            case 'evening': return '05:30 PM';
            case 'dinner': return '08:30 PM';
            case 'bedtime': return '10:00 PM';
            default: return '08:00 AM';
        }
    }
}

const db = new ClinicalDatabase();

// ==========================================
// 2. AUTOMATED CLINICAL CALCULATION ENGINE
// ==========================================

const ClinicalCalculator = {
    calculateBMI(weightKg, heightCm) {
        if (!weightKg || !heightCm) return 0;
        const heightMeters = heightCm / 100.0;
        return Number((weightKg / (heightMeters * heightMeters)).toFixed(2));
    },

    getBMICategory(bmi) {
        if (bmi <= 0) return 'Unknown';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 23.0) return 'Normal (Asian-Indian Standard)';
        if (bmi < 25.0) return 'Overweight (At Risk)';
        if (bmi < 30.0) return 'Obese Class I';
        return 'Obese Class II';
    },

    getBMIBadgeClass(category) {
        if (category.includes('Underweight')) return 'badge-bmi-underweight';
        if (category.includes('Normal')) return 'badge-bmi-normal';
        if (category.includes('Overweight')) return 'badge-bmi-overweight';
        return 'badge-bmi-obese';
    },

    calculateBrocaIBW(heightCm, gender = 'Male') {
        if (!heightCm) return 0;
        const isFemale = String(gender).toLowerCase() === 'female';
        const ibw = isFemale ? heightCm - 105 : heightCm - 100;
        return Math.max(isFemale ? 30 : 35, Number(ibw.toFixed(1)));
    },

    calculateWHR(waistCm, hipCm) {
        if (!waistCm || !hipCm || hipCm <= 0) return 0;
        return Number((waistCm / hipCm).toFixed(2));
    },

    isAbdominalObesityHighRisk(waistCm, hipCm, gender = 'Male') {
        const isFemale = String(gender).toLowerCase() === 'female';
        const whr = this.calculateWHR(waistCm, hipCm);
        if (isFemale) {
            return waistCm > 80 || whr > 0.85;
        } else {
            return waistCm > 90 || whr > 0.90;
        }
    },

    getActivityFactor(activityLevel) {
        switch (activityLevel) {
            case 'Sedentary': return 1.2;
            case 'Lightly Active': return 1.375;
            case 'Moderately Active': return 1.55;
            case 'Very Active': return 1.725;
            default: return 1.375;
        }
    },

    calculateBMR(weightKg, heightCm, age = 30, gender = 'Male') {
        if (!weightKg || !heightCm) return 0;
        const isFemale = String(gender).toLowerCase() === 'female';
        if (isFemale) {
            return Number((655.1 + (9.563 * weightKg) + (1.850 * heightCm) - (4.676 * age)).toFixed(1));
        } else {
            return Number((66.5 + (13.75 * weightKg) + (5.003 * heightCm) - (6.755 * age)).toFixed(1));
        }
    },

    calculateTDEE(bmr, activityLevel) {
        const factor = this.getActivityFactor(activityLevel);
        return Number((bmr * factor).toFixed(1));
    },

    calculateRuleOfThumb(weightKg) {
        if (!weightKg) return { deficitMin: 0, deficitMax: 0, maintMin: 0, maintMax: 0, surplusMin: 0, surplusMax: 0 };
        return {
            deficitMin: Math.round(20 * weightKg),
            deficitMax: Math.round(22 * weightKg),
            maintMin: Math.round(25 * weightKg),
            maintMax: Math.round(30 * weightKg),
            surplusMin: Math.round(30 * weightKg),
            surplusMax: Math.round(35 * weightKg)
        };
    },

    getRecommendedTargetCalories(patient) {
        const thumb = this.calculateRuleOfThumb(patient.weightKg);
        switch (patient.calorieGoalType) {
            case 'Weight Loss':
                return Math.round((thumb.deficitMin + thumb.deficitMax) / 2);
            case 'Weight Gain':
                return Math.round((thumb.surplusMin + thumb.surplusMax) / 2);
            case 'Custom':
                return patient.targetCaloriesOverride > 0 ? patient.targetCaloriesOverride : patient.tdee;
            default:
                return Math.round((thumb.maintMin + thumb.maintMax) / 2);
        }
    },

    getMacroPercentages(preset = 'Standard Balanced') {
        switch (preset) {
            case 'Diabetic': return { carbPct: 45, protPct: 25, fatPct: 30 };
            case 'High Protein': return { carbPct: 40, protPct: 30, fatPct: 30 };
            case 'Renal Protective': return { carbPct: 60, protPct: 15, fatPct: 25 };
            case 'Cardiac Low-Fat': return { carbPct: 60, protPct: 20, fatPct: 20 };
            default: return { carbPct: 55, protPct: 20, fatPct: 25 };
        }
    },

    calculateTargetMacros(targetCalories, preset) {
        const { carbPct, protPct, fatPct } = this.getMacroPercentages(preset);
        return {
            carbPct,
            protPct,
            fatPct,
            targetCarbsGrams: Number(((targetCalories * (carbPct / 100.0)) / 4.0).toFixed(1)),
            targetProteinGrams: Number(((targetCalories * (protPct / 100.0)) / 4.0).toFixed(1)),
            targetFatGrams: Number(((targetCalories * (fatPct / 100.0)) / 9.0).toFixed(1))
        };
    }
};

// ==========================================
// 3. SMART FILTERING & DIET GENERATOR
// ==========================================

const DietGenerator = {
    filterFoodsForPatient(patient, allFoods) {
        const safe = [];
        const excluded = [];

        for (const food of allFoods) {
            const isDietMatch = this.isDietCompatible(food.dietCategory, patient.primaryDietType);
            if (!isDietMatch) continue;

            const restriction = db.isFoodRestrictedForUser(patient.id, food.id);
            if (restriction.isRestricted) {
                excluded.push(food);
            } else {
                safe.push(food);
            }
        }

        return { safe, excluded };
    },

    isDietCompatible(foodDiet, patientDiet) {
        if (!patientDiet || patientDiet === 'Non-Veg') return true;
        if (patientDiet === 'Eggitarian') return foodDiet !== 'Non-Veg';
        if (patientDiet === 'Vegetarian') return foodDiet === 'Vegetarian' || foodDiet === 'Vegan';
        if (patientDiet === 'Vegan') return foodDiet === 'Vegan';
        if (patientDiet === 'Jain') return foodDiet === 'Vegetarian' || foodDiet === 'Vegan';
        return true;
    },

    generatePlan(patient) {
        const { safe, excluded } = this.filterFoodsForPatient(patient, db.foods);
        const age = patient.age || (patient.dateOfBirth ? Math.max(0, Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 3600 * 1000))) : 30);
        const bmr = ClinicalCalculator.calculateBMR(patient.weightKg, patient.heightCm, age, patient.gender);
        const tdee = ClinicalCalculator.calculateTDEE(bmr, patient.activityLevel);
        const targetCalories = ClinicalCalculator.getRecommendedTargetCalories(patient);
        const macros = ClinicalCalculator.calculateTargetMacros(targetCalories, patient.macroDistributionPreset);
        const ibw = ClinicalCalculator.calculateBrocaIBW(patient.heightCm, patient.gender);
        const bmi = ClinicalCalculator.calculateBMI(patient.weightKg, patient.heightCm);

        const plan = {
            id: 'plan-' + Date.now(),
            patientId: patient.id,
            patientName: patient.name,
            patientContact: patient.contactNumber,
            createdDate: new Date().toISOString(),
            planTitle: `${patient.name} - Clinical ${patient.calorieGoalType} Diet Chart`,
            patientWeightKg: patient.weightKg,
            patientHeightCm: patient.heightCm,
            patientBMI: bmi,
            patientBMICategory: ClinicalCalculator.getBMICategory(bmi),
            patientBrocaIBW: ibw,
            patientBMR: bmr,
            patientTDEE: tdee,
            targetCalories: targetCalories,
            targetCarbsGrams: macros.targetCarbsGrams,
            targetProteinGrams: macros.targetProteinGrams,
            targetFatGrams: macros.targetFatGrams,
            calorieGoalType: patient.calorieGoalType,
            patientDiagnoses: [...(patient.clinicalDiagnoses || [])],
            excludedRestrictedFoods: excluded.map(f => f.name),
            mealItems: [],
            fluidIntakeInstructions: `${patient.waterConsumptionLiters || 2.5} - 3.5 Liters of filtered water throughout the day. Restrict fluids 1 hour before sleep.`,
            avoidFoodInstructions: 'Refined sugar & bakery sweets; deep-fried snacks & trans-fats; ultra-processed foods; excess sodium sauces.',
            generalNotes: 'Walk briskly for 20-30 minutes post dinner. Do not skip breakfast. Chew food thoroughly (25-30 times per bite). Maintain 7-8 hours of sound sleep.',
            dietitianName: 'Ashish (Admin / Registered Dietitian)'
        };

        const findItem = (term, cat) => safe.find(f => f.name.toLowerCase().includes(term.toLowerCase())) || (cat ? safe.find(f => f.category === cat) : null);

        // Detect meal count: 2, 3, 4, 5, or 6 meals per day
        const freqStr = (patient.mealFrequency || patient.eatingFrequency || '3 meals a day').toLowerCase();
        let mealCount = 3;
        if (freqStr.includes('2') || freqStr.includes('two')) mealCount = 2;
        else if (freqStr.includes('4') || freqStr.includes('four')) mealCount = 4;
        else if (freqStr.includes('5') || freqStr.includes('five')) mealCount = 5;
        else if (freqStr.includes('6') || freqStr.includes('six')) mealCount = 6;
        else if (freqStr.includes('3') || freqStr.includes('three')) mealCount = 3;

        // Food helpers
        const oats = findItem('Oats', 'Cereals');
        const eggWhite = findItem('Egg White', 'Proteins');
        const almonds = findItem('Almonds', 'Nuts & Seeds');
        const apple = findItem('Apple', 'Fruits');
        const roti = findItem('Roti', 'Cereals') || findItem('Brown Rice', 'Cereals');
        const dal = findItem('Moong Dal', 'Proteins');
        const salad = findItem('Salad', 'Vegetables');
        const curd = findItem('Curd', 'Dairy');
        const greenTea = findItem('Green Tea', 'Beverages');
        const chana = findItem('Chana', 'Snacks');
        const dinnerRoti = findItem('Roti', 'Cereals');
        const dinnerProtein = findItem('Paneer', 'Dairy') || findItem('Tofu', 'Proteins') || findItem('Chicken', 'Proteins') || dal;
        const milk = findItem('Milk', 'Dairy');

        if (mealCount === 2) {
            // 2 Meals Per Day: Lunch & Dinner
            if (roti) plan.mealItems.push(this.createMealItem('Lunch', '12:30 PM', roti, 100, 'Main Meal 1 (Whole Grain)'));
            if (dal) plan.mealItems.push(this.createMealItem('Lunch', '12:30 PM', dal, 200, 'Cooked with light cumin & turmeric'));
            if (salad) plan.mealItems.push(this.createMealItem('Lunch', '12:30 PM', salad, 180, 'Fresh raw fiber bowl with lemon'));
            if (curd) plan.mealItems.push(this.createMealItem('Lunch', '12:30 PM', curd, 150, 'Plain probiotic curd'));

            if (dinnerRoti) plan.mealItems.push(this.createMealItem('Dinner', '08:00 PM', dinnerRoti, 70, 'Main Meal 2 (Light Whole Wheat)'));
            if (dinnerProtein) plan.mealItems.push(this.createMealItem('Dinner', '08:00 PM', dinnerProtein, dinnerProtein.servingQuantity, 'Non-oily preparation'));
            if (almonds) plan.mealItems.push(this.createMealItem('Dinner', '08:00 PM', almonds, 15, 'Soaked nuts'));
        } else if (mealCount === 3) {
            // 3 Meals Per Day: Breakfast, Lunch & Dinner
            if (oats) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', oats, 50, 'Cooked with warm water or skim milk'));
            if (eggWhite) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', eggWhite, 33, 'Boiled'));
            if (apple) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', apple, 100, 'Fresh sliced apple'));

            if (roti) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', roti, 70, '2 medium rotis without extra ghee'));
            if (dal) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', dal, 150, '1 medium bowl with light cumin & turmeric'));
            if (salad) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', salad, 150, 'Add lemon juice and pink salt'));
            if (curd) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', curd, 150, 'Plain probiotic curd'));

            if (dinnerRoti) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerRoti, 50, 'Light dinner portion'));
            if (dinnerProtein) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerProtein, dinnerProtein.servingQuantity, 'Non-oily preparation'));
        } else if (mealCount === 4) {
            // 4 Meals Per Day: Breakfast, Lunch, Evening Snack & Dinner
            if (oats) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', oats, 45, 'Cooked with warm water'));
            if (eggWhite) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', eggWhite, 33, 'Boiled'));

            if (roti) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', roti, 70, 'Whole wheat rotis'));
            if (dal) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', dal, 150, 'Moong dal bowl'));
            if (salad) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', salad, 150, 'Fresh cucumber & tomato'));
            if (curd) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', curd, 100, 'Probiotic curd'));

            if (greenTea) plan.mealItems.push(this.createMealItem('Evening', '05:30 PM', greenTea, 200, 'Fresh brew without sugar'));
            if (chana) plan.mealItems.push(this.createMealItem('Evening', '05:30 PM', chana, 40, 'Roasted snack'));

            if (dinnerRoti) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerRoti, 45, 'Light roti portion'));
            if (dinnerProtein) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerProtein, dinnerProtein.servingQuantity, 'Therapeutic preparation'));
        } else if (mealCount === 5) {
            // 5 Meals Per Day: Breakfast, Mid-Morning, Lunch, Evening & Dinner
            if (oats) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', oats, 40, 'Warm preparation'));
            if (eggWhite) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', eggWhite, 33, 'Boiled'));

            if (almonds) plan.mealItems.push(this.createMealItem('Mid-Morning', '11:00 AM', almonds, 15, 'Soaked & peeled'));
            if (apple) plan.mealItems.push(this.createMealItem('Mid-Morning', '11:00 AM', apple, 120, 'Eat fresh with peel'));

            if (roti) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', roti, 70, '2 medium rotis'));
            if (dal) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', dal, 150, 'Lentil bowl'));
            if (salad) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', salad, 150, 'Raw veggies'));
            if (curd) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', curd, 100, 'Plain curd'));

            if (greenTea) plan.mealItems.push(this.createMealItem('Evening', '05:30 PM', greenTea, 200, 'Green tea'));
            if (chana) plan.mealItems.push(this.createMealItem('Evening', '05:30 PM', chana, 40, 'Roasted chana'));

            if (dinnerRoti) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerRoti, 35, '1 medium roti'));
            if (dinnerProtein) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerProtein, dinnerProtein.servingQuantity, 'Healthy protein'));
        } else {
            // 6 Meals Per Day: Breakfast, Mid-Morning, Lunch, Evening, Dinner & Bedtime
            if (oats) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', oats, 40, 'Warm oats'));
            if (eggWhite) plan.mealItems.push(this.createMealItem('Breakfast', '08:30 AM', eggWhite, 33, 'Boiled'));

            if (almonds) plan.mealItems.push(this.createMealItem('Mid-Morning', '11:00 AM', almonds, 15, 'Soaked almonds'));
            if (apple) plan.mealItems.push(this.createMealItem('Mid-Morning', '11:00 AM', apple, 100, 'Fresh apple'));

            if (roti) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', roti, 70, 'Whole grain rotis'));
            if (dal) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', dal, 150, 'Protein dal'));
            if (salad) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', salad, 150, 'Salad'));
            if (curd) plan.mealItems.push(this.createMealItem('Lunch', '01:30 PM', curd, 100, 'Curd'));

            if (greenTea) plan.mealItems.push(this.createMealItem('Evening', '05:30 PM', greenTea, 200, 'Green tea'));
            if (chana) plan.mealItems.push(this.createMealItem('Evening', '05:30 PM', chana, 35, 'Roasted snack'));

            if (dinnerRoti) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerRoti, 35, 'Light roti'));
            if (dinnerProtein) plan.mealItems.push(this.createMealItem('Dinner', '08:30 PM', dinnerProtein, dinnerProtein.servingQuantity, 'Dinner protein'));

            if (milk) plan.mealItems.push(this.createMealItem('Bedtime', '10:00 PM', milk, 180, 'Warm turmeric milk'));
        }

        db.recalculatePlanTotals(plan);
        return plan;
    },

    createMealItem(slot, time, food, quantity, notes) {
        const calPerG = (food.carbsPerGram * 4) + (food.proteinPerGram * 4) + (food.fatPerGram * 9);
        const qty = parseFloat(quantity) > 0 ? parseFloat(quantity) : (parseFloat(food.servingQuantity) || 100);
        return {
            id: 'mi-' + Math.random().toString(36).substr(2, 9),
            mealSlot: slot,
            timeSlot: time,
            foodItemId: food.id,
            foodItemName: food.name,
            quantity: qty,
            unit: food.standardUnit || 'g',
            calories: Number((calPerG * qty).toFixed(1)),
            protein: Number(((food.proteinPerGram || 0) * qty).toFixed(1)),
            carbs: Number(((food.carbsPerGram || 0) * qty).toFixed(1)),
            fat: Number(((food.fatPerGram || 0) * qty).toFixed(1)),
            fiber: Number(((food.fiberPerGram || 0) * qty).toFixed(1)),
            vitaminA: Number(((food.vitaminA_mcgPerGram || 0) * qty).toFixed(1)),
            vitaminC: Number(((food.vitaminC_mgPerGram || 0) * qty).toFixed(1)),
            vitaminD: Number(((food.vitaminD_mcgPerGram || 0) * qty).toFixed(2)),
            vitaminB12: Number(((food.vitaminB12_mcgPerGram || 0) * qty).toFixed(2)),
            calcium: Number(((food.calcium_mgPerGram || 0) * qty).toFixed(1)),
            iron: Number(((food.iron_mgPerGram || 0) * qty).toFixed(2)),
            specialInstructions: notes || food.notes || ''
        };
    },

    formatWhatsApp(plan) {
        let msg = `🏥 *CLINICAL MEDICAL NUTRITION CHART*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `👤 *Patient:* ${plan.patientName}\n`;
        msg += `📅 *Prescription Date:* ${new Date(plan.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}\n`;
        msg += `🎯 *Goal Strategy:* ${plan.calorieGoalType} (${plan.targetCalories} kcal/day)\n`;
        msg += `⚖️ *Vitals:* Wt: ${plan.patientWeightKg}kg | BMI: ${plan.patientBMI} kg/m² | Broca IBW: ${plan.patientBrocaIBW}kg\n`;
        if (plan.patientDiagnoses && plan.patientDiagnoses.length > 0) {
            msg += `🩺 *Diagnoses:* ${plan.patientDiagnoses.join(', ')}\n`;
        }
        msg += `📊 *Macro Target:* C: ${plan.targetCarbsGrams}g | P: ${plan.targetProteinGrams}g | F: ${plan.targetFatGrams}g\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📋 *DAILY MEAL SCHEDULE:*\n`;

        const slots = ['Breakfast', 'Mid-Morning', 'Lunch', 'Evening', 'Dinner', 'Bedtime'];
        for (const slot of slots) {
            const items = (plan.mealItems || []).filter(i => i.mealSlot.toLowerCase() === slot.toLowerCase());
            if (items.length > 0) {
                msg += `\n⏰ *${slot.toUpperCase()}* (${items[0].timeSlot})\n`;
                for (const item of items) {
                    msg += `  • ${item.foodItemName} — *${item.quantity} ${item.unit}* (${item.calories} kcal)\n`;
                    if (item.specialInstructions) {
                        msg += `    ↳ _${item.specialInstructions}_\n`;
                    }
                }
            }
        }

        msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `💧 *Hydration:* ${plan.fluidIntakeInstructions}\n`;
        if (plan.avoidFoodInstructions) {
            msg += `🚫 *Strictly Avoid:* ${plan.avoidFoodInstructions}\n`;
        }
        if (plan.generalNotes) {
            msg += `📝 *Advice:* ${plan.generalNotes}\n`;
        }
        msg += `\n✨ *Prescribed by:* ${plan.dietitianName}\n`;
        msg += `_Follow strictly for therapeutic clinical recovery._`;

        return msg;
    }
};

/**
 * Admin Authentication Service
 * Controls access to Clinical Admin Portal & Patient Management
 */
const AdminAuth = {
    SESSION_KEY: 'diet_admin_auth_session',

    isAuthenticated() {
        try {
            const raw = localStorage.getItem(this.SESSION_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            return Boolean(data && data.isLoggedIn);
        } catch (e) {
            return false;
        }
    },

    getCurrentAdmin() {
        try {
            const raw = localStorage.getItem(this.SESSION_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    },

    login(username, password) {
        const u = (username || '').trim().toLowerCase();
        const p = (password || '').trim();

        // Support official credentials 'Ashish' / 'Ashish@2026' or 'admin' / 'admin123'
        const isAshish = (u === 'ashish' && (p === 'Ashish@2026' || p === 'ashish@2026' || p === 'Ashish' || p === 'ashish'));
        const isAdmin = (u === 'admin' && (p === 'admin123' || p === 'admin' || p === 'admin@123'));

        if (isAshish || isAdmin) {
            const session = {
                isLoggedIn: true,
                username: isAshish ? 'Ashish' : 'Admin',
                displayName: isAshish ? 'Dt. Ashish (Registered Dietitian)' : 'Clinical Administrator',
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, user: session };
        }

        return { 
            success: false, 
            message: 'Invalid credentials. Enter Username: Ashish | Password: Ashish@2026 (or admin / admin123)' 
        };
    },

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }
};

window.AdminAuth = AdminAuth;
window.db = db;
window.ClinicalCalculator = ClinicalCalculator;
window.DietGenerator = DietGenerator;
