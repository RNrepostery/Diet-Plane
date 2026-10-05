using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Diet.Models;
using Microsoft.Maui.Storage;

namespace Diet.Services
{
    public class DataContainer
    {
        public List<Disease> Diseases { get; set; } = new();
        public List<FoodItem> MasterFoodItems { get; set; } = new();
        public List<Patient> Patients { get; set; } = new();
        public List<DietPlan> DietPlans { get; set; } = new();
    }

    public class DataService
    {
        private List<Disease> _diseases = new();
        private List<FoodItem> _masterFoodItems = new();
        private List<Patient> _patients = new();
        private List<DietPlan> _dietPlans = new();
        private readonly string _filePath;

        public event Action? OnDataChanged;

        public DataService()
        {
            _filePath = Path.Combine(FileSystem.AppDataDirectory, "diet_clinical_database.json");
            LoadData();
        }

        private void LoadData()
        {
            try
            {
                if (File.Exists(_filePath))
                {
                    string json = File.ReadAllText(_filePath);
                    var container = JsonSerializer.Deserialize<DataContainer>(json);
                    if (container != null)
                    {
                        _diseases = container.Diseases ?? new();
                        _masterFoodItems = container.MasterFoodItems ?? new();
                        _patients = container.Patients ?? new();
                        _dietPlans = container.DietPlans ?? new();
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading clinical database: {ex.Message}");
            }

            // Seed defaults if empty
            if (!_diseases.Any())
            {
                SeedDiseases();
            }

            if (!_masterFoodItems.Any())
            {
                SeedMasterFoodItems();
            }

            if (!_patients.Any())
            {
                SeedSamplePatients();
            }

            SaveData();
        }

        public void SaveData()
        {
            try
            {
                var container = new DataContainer
                {
                    Diseases = _diseases,
                    MasterFoodItems = _masterFoodItems,
                    Patients = _patients,
                    DietPlans = _dietPlans
                };
                string json = JsonSerializer.Serialize(container, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_filePath, json);
                OnDataChanged?.Invoke();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving clinical database: {ex.Message}");
            }
        }

        #region Disease Master API
        public List<Disease> GetDiseases() => _diseases.OrderBy(d => d.Category).ThenBy(d => d.Name).ToList();

        public Disease? GetDiseaseById(string id) => _diseases.FirstOrDefault(d => d.Id == id);

        public void SaveDisease(Disease disease)
        {
            var existing = _diseases.FirstOrDefault(d => d.Id == disease.Id);
            if (existing != null)
            {
                int index = _diseases.IndexOf(existing);
                _diseases[index] = disease;
            }
            else
            {
                _diseases.Add(disease);
            }
            SaveData();
        }

        public void DeleteDisease(string id)
        {
            var disease = _diseases.FirstOrDefault(d => d.Id == id);
            if (disease != null)
            {
                string diseaseName = disease.Name;
                _diseases.Remove(disease);

                // Clean up references in FoodItems and Patients
                foreach (var item in _masterFoodItems)
                {
                    item.ContraindicatedDiseases.Remove(diseaseName);
                    item.ContraindicatedDiseases.Remove(id);
                }
                foreach (var p in _patients)
                {
                    p.ClinicalDiagnoses.Remove(diseaseName);
                    p.ClinicalDiagnoses.Remove(id);
                }
                SaveData();
            }
        }
        #endregion

        #region Item Master API (Food Database)
        public List<FoodItem> GetMasterFoodItems() => _masterFoodItems.OrderBy(f => f.Category).ThenBy(f => f.Name).ToList();

        public FoodItem? GetFoodItemById(string id) => _masterFoodItems.FirstOrDefault(f => f.Id == id);

        public void SaveFoodItem(FoodItem item)
        {
            var existing = _masterFoodItems.FirstOrDefault(f => f.Id == item.Id);
            if (existing != null)
            {
                int index = _masterFoodItems.IndexOf(existing);
                _masterFoodItems[index] = item;
            }
            else
            {
                _masterFoodItems.Add(item);
            }
            SaveData();
        }

        public void DeleteFoodItem(string id)
        {
            _masterFoodItems.RemoveAll(f => f.Id == id);
            SaveData();
        }

        public List<FoodItem> GetRestrictedFoodsForDisease(string diseaseId)
        {
            var disease = GetDiseaseById(diseaseId);
            if (disease == null) return new List<FoodItem>();
            return _masterFoodItems.Where(f => disease.RestrictedFoodIds.Contains(f.Id) || 
                                               disease.RestrictedFoodNames.Contains(f.Name, StringComparer.OrdinalIgnoreCase) ||
                                               f.ContraindicatedDiseases.Contains(disease.Name, StringComparer.OrdinalIgnoreCase)).ToList();
        }

        public bool IsFoodRestrictedForPatient(Patient patient, string foodId, out string restrictedDiseaseName)
        {
            restrictedDiseaseName = string.Empty;
            if (patient == null || string.IsNullOrEmpty(foodId)) return false;

            var food = GetFoodItemById(foodId);
            if (food == null) return false;

            return IsFoodRestrictedForPatient(patient, food, out restrictedDiseaseName);
        }

        public bool IsFoodRestrictedForPatient(Patient patient, FoodItem food, out string restrictedDiseaseName)
        {
            restrictedDiseaseName = string.Empty;
            if (patient == null || food == null) return false;

            var patientDiagnoses = new HashSet<string>(patient.ClinicalDiagnoses, StringComparer.OrdinalIgnoreCase);

            foreach (var diagName in patientDiagnoses)
            {
                var disease = _diseases.FirstOrDefault(d => d.Name.Equals(diagName, StringComparison.OrdinalIgnoreCase) || 
                                                            d.Id.Equals(diagName, StringComparison.OrdinalIgnoreCase) ||
                                                            (diagName.Contains("Diabetes", StringComparison.OrdinalIgnoreCase) && d.Name.Contains("Diabetes", StringComparison.OrdinalIgnoreCase)));
                if (disease != null)
                {
                    if (disease.RestrictedFoodIds.Contains(food.Id) || 
                        disease.RestrictedFoodNames.Contains(food.Name, StringComparer.OrdinalIgnoreCase))
                    {
                        restrictedDiseaseName = disease.Name;
                        return true;
                    }

                    if (disease.Name.Contains("Diabetes", StringComparison.OrdinalIgnoreCase))
                    {
                        string fn = food.Name.ToLowerInvariant();
                        if (fn.Contains("sugar") || fn.Contains("sweet") || fn.Contains("cake") || fn.Contains("cold drink") || fn.Contains("sugary juice"))
                        {
                            restrictedDiseaseName = disease.Name;
                            return true;
                        }
                    }
                }

                if (food.ContraindicatedDiseases.Any(cd => cd.Equals(diagName, StringComparison.OrdinalIgnoreCase)))
                {
                    restrictedDiseaseName = diagName;
                    return true;
                }
            }

            return false;
        }

        // Smart Filter: Filter out food items contraindicated for a given patient's clinical diagnoses
        public List<FoodItem> GetSafeFoodItemsForPatient(Patient patient, out List<FoodItem> excludedRestrictedFoods)
        {
            var safeItems = new List<FoodItem>();
            excludedRestrictedFoods = new List<FoodItem>();

            foreach (var food in _masterFoodItems)
            {
                // Check diet compatibility
                bool isDietMatch = IsFoodCompatibleWithDiet(food.DietCategory, patient.PrimaryDietType);
                if (!isDietMatch)
                {
                    continue;
                }

                // Check disease contraindications & restricted foods
                if (IsFoodRestrictedForPatient(patient, food, out _))
                {
                    excludedRestrictedFoods.Add(food);
                }
                else
                {
                    safeItems.Add(food);
                }
            }

            return safeItems;
        }

        private bool IsFoodCompatibleWithDiet(string foodDiet, string patientDiet)
        {
            if (patientDiet.Equals("Non-Veg", StringComparison.OrdinalIgnoreCase)) return true;
            if (patientDiet.Equals("Eggitarian", StringComparison.OrdinalIgnoreCase))
            {
                return !foodDiet.Equals("Non-Veg", StringComparison.OrdinalIgnoreCase);
            }
            if (patientDiet.Equals("Vegetarian", StringComparison.OrdinalIgnoreCase))
            {
                return foodDiet.Equals("Vegetarian", StringComparison.OrdinalIgnoreCase) || foodDiet.Equals("Vegan", StringComparison.OrdinalIgnoreCase);
            }
            if (patientDiet.Equals("Vegan", StringComparison.OrdinalIgnoreCase))
            {
                return foodDiet.Equals("Vegan", StringComparison.OrdinalIgnoreCase);
            }
            if (patientDiet.Equals("Jain", StringComparison.OrdinalIgnoreCase))
            {
                return foodDiet.Equals("Vegetarian", StringComparison.OrdinalIgnoreCase) || foodDiet.Equals("Vegan", StringComparison.OrdinalIgnoreCase);
            }
            return true;
        }
        #endregion

        #region Patient Management API
        public List<Patient> GetPatients() => _patients.OrderByDescending(p => p.CreatedAt).ToList();

        public Patient? GetPatientById(string id) => _patients.FirstOrDefault(p => p.Id == id);

        public void SavePatient(Patient patient)
        {
            var existing = _patients.FirstOrDefault(p => p.Id == patient.Id);
            if (existing != null)
            {
                int index = _patients.IndexOf(existing);
                _patients[index] = patient;
            }
            else
            {
                _patients.Add(patient);
            }
            SaveData();
        }

        public void DeletePatient(string id)
        {
            _patients.RemoveAll(p => p.Id == id);
            _dietPlans.RemoveAll(dp => dp.PatientId == id);
            SaveData();
        }
        #endregion

        #region Diet Plans API
        public List<DietPlan> GetDietPlans() => _dietPlans.OrderByDescending(dp => dp.CreatedDate).ToList();

        public List<DietPlan> GetDietPlansByPatient(string patientId) =>
            _dietPlans.Where(dp => dp.PatientId == patientId).OrderByDescending(dp => dp.CreatedDate).ToList();

        public DietPlan? GetDietPlanById(string id) => _dietPlans.FirstOrDefault(dp => dp.Id == id);

        public void SaveDietPlan(DietPlan plan)
        {
            var existing = _dietPlans.FirstOrDefault(dp => dp.Id == plan.Id);
            if (existing != null)
            {
                int index = _dietPlans.IndexOf(existing);
                _dietPlans[index] = plan;
            }
            else
            {
                _dietPlans.Add(plan);
            }
            SaveData();
        }

        public void DeleteDietPlan(string id)
        {
            _dietPlans.RemoveAll(dp => dp.Id == id);
            SaveData();
        }

        // Automated Diet Plan Generator
        public DietPlan GenerateAutomatedPlan(Patient patient)
        {
            var safeItems = GetSafeFoodItemsForPatient(patient, out var excludedFoods);

            var plan = new DietPlan
            {
                PatientId = patient.Id,
                PatientName = patient.Name,
                PatientContact = patient.ContactNumber,
                PlanTitle = $"{patient.Name} - Clinical {patient.CalorieGoalType} Diet Chart",
                PatientWeightKg = patient.WeightKg,
                PatientHeightCm = patient.HeightCm,
                PatientBMI = patient.BMI,
                PatientBMICategory = patient.BMICategory,
                PatientBrocaIBW = patient.IdealBodyWeightBroca,
                PatientBMR = patient.BMR,
                PatientTDEE = patient.TDEE,
                TargetCalories = patient.RecommendedTargetCalories,
                TargetCarbsGrams = patient.TargetCarbsGrams,
                TargetProteinGrams = patient.TargetProteinGrams,
                TargetFatGrams = patient.TargetFatGrams,
                CalorieGoalType = patient.CalorieGoalType,
                PatientDiagnoses = new List<string>(patient.ClinicalDiagnoses),
                ExcludedRestrictedFoods = excludedFoods.Select(f => f.Name).ToList()
            };

            // Clinical meal slots
            // Breakfast (~25% cals)
            var oats = safeItems.FirstOrDefault(f => f.Name.Contains("Oats", StringComparison.OrdinalIgnoreCase))
                       ?? safeItems.FirstOrDefault(f => f.Category == "Breakfast" || f.Category == "Cereals");
            var eggOrTofu = safeItems.FirstOrDefault(f => f.Name.Contains("Egg White", StringComparison.OrdinalIgnoreCase))
                            ?? safeItems.FirstOrDefault(f => f.Category == "Proteins");
            
            if (oats != null)
            {
                plan.MealItems.Add(CreateItem("Breakfast", "08:30 AM", oats, 40, "Cooked with warm water or skim milk"));
            }
            if (eggOrTofu != null)
            {
                plan.MealItems.Add(CreateItem("Breakfast", "08:30 AM", eggOrTofu, eggOrTofu.ServingQuantity, "Boiled / Steamed"));
            }

            // Mid-Morning (~10% cals)
            var nuts = safeItems.FirstOrDefault(f => f.Name.Contains("Almond", StringComparison.OrdinalIgnoreCase))
                       ?? safeItems.FirstOrDefault(f => f.Category == "Nuts & Seeds");
            var fruit = safeItems.FirstOrDefault(f => f.Name.Contains("Apple", StringComparison.OrdinalIgnoreCase))
                        ?? safeItems.FirstOrDefault(f => f.Category == "Fruits");

            if (nuts != null)
            {
                plan.MealItems.Add(CreateItem("Mid-Morning", "11:00 AM", nuts, nuts.ServingQuantity, "Soaked overnight and peeled"));
            }
            if (fruit != null)
            {
                plan.MealItems.Add(CreateItem("Mid-Morning", "11:00 AM", fruit, fruit.ServingQuantity, "Wash thoroughly, eat with skin"));
            }

            // Lunch (~30% cals)
            var staple = safeItems.FirstOrDefault(f => f.Name.Contains("Roti", StringComparison.OrdinalIgnoreCase))
                         ?? safeItems.FirstOrDefault(f => f.Name.Contains("Brown Rice", StringComparison.OrdinalIgnoreCase))
                         ?? safeItems.FirstOrDefault(f => f.Category == "Cereals");
            var pulse = safeItems.FirstOrDefault(f => f.Name.Contains("Moong Dal", StringComparison.OrdinalIgnoreCase))
                        ?? safeItems.FirstOrDefault(f => f.Category == "Proteins");
            var salad = safeItems.FirstOrDefault(f => f.Name.Contains("Salad", StringComparison.OrdinalIgnoreCase) || f.Name.Contains("Cucumber", StringComparison.OrdinalIgnoreCase))
                        ?? safeItems.FirstOrDefault(f => f.Category == "Vegetables");
            var curd = safeItems.FirstOrDefault(f => f.Name.Contains("Curd", StringComparison.OrdinalIgnoreCase) || f.Name.Contains("Yogurt", StringComparison.OrdinalIgnoreCase));

            if (staple != null)
            {
                plan.MealItems.Add(CreateItem("Lunch", "01:30 PM", staple, staple.ServingQuantity, "Whole grain, without extra ghee"));
            }
            if (pulse != null)
            {
                plan.MealItems.Add(CreateItem("Lunch", "01:30 PM", pulse, pulse.ServingQuantity, "Cooked with light cumin & turmeric"));
            }
            if (salad != null)
            {
                plan.MealItems.Add(CreateItem("Lunch", "01:30 PM", salad, salad.ServingQuantity, "Add lemon juice and pink salt"));
            }
            if (curd != null)
            {
                plan.MealItems.Add(CreateItem("Lunch", "01:30 PM", curd, curd.ServingQuantity, "Probiotic plain curd"));
            }

            // Evening Snack (~10% cals)
            var tea = safeItems.FirstOrDefault(f => f.Name.Contains("Green Tea", StringComparison.OrdinalIgnoreCase));
            var chana = safeItems.FirstOrDefault(f => f.Name.Contains("Roasted Chana", StringComparison.OrdinalIgnoreCase))
                        ?? safeItems.FirstOrDefault(f => f.Name.Contains("Sprouted", StringComparison.OrdinalIgnoreCase));

            if (tea != null)
            {
                plan.MealItems.Add(CreateItem("Evening", "05:30 PM", tea, tea.ServingQuantity, "Antioxidant brew, no sugar"));
            }
            if (chana != null)
            {
                plan.MealItems.Add(CreateItem("Evening", "05:30 PM", chana, chana.ServingQuantity, "High fiber roasted legume snack"));
            }

            // Dinner (~20% cals)
            var dinnerStaple = safeItems.FirstOrDefault(f => f.Name.Contains("Roti", StringComparison.OrdinalIgnoreCase)) ?? staple;
            var dinnerProtein = safeItems.FirstOrDefault(f => f.Name.Contains("Paneer", StringComparison.OrdinalIgnoreCase) || f.Name.Contains("Chicken", StringComparison.OrdinalIgnoreCase) || f.Name.Contains("Tofu", StringComparison.OrdinalIgnoreCase))
                                ?? pulse;
            var dinnerVeg = safeItems.FirstOrDefault(f => f.Name.Contains("Vegetables", StringComparison.OrdinalIgnoreCase) || f.Name.Contains("Spinach", StringComparison.OrdinalIgnoreCase)) ?? salad;

            if (dinnerStaple != null)
            {
                plan.MealItems.Add(CreateItem("Dinner", "08:30 PM", dinnerStaple, dinnerStaple.ServingQuantity, "Light dinner portion"));
            }
            if (dinnerProtein != null)
            {
                plan.MealItems.Add(CreateItem("Dinner", "08:30 PM", dinnerProtein, dinnerProtein.ServingQuantity, "Non-oily preparation"));
            }
            if (dinnerVeg != null)
            {
                plan.MealItems.Add(CreateItem("Dinner", "08:30 PM", dinnerVeg, dinnerVeg.ServingQuantity, "Steamed or sautéed vegetables"));
            }

            // Bedtime (~5% cals)
            var milk = safeItems.FirstOrDefault(f => f.Name.Contains("Milk", StringComparison.OrdinalIgnoreCase));
            if (milk != null)
            {
                plan.MealItems.Add(CreateItem("Bedtime", "10:00 PM", milk, milk.ServingQuantity, "Warm with pinch of pure organic turmeric"));
            }

            // Clinical Instructions
            plan.FluidIntakeInstructions = $"{patient.WaterConsumptionLiters:0.0} - 3.5 Liters of filtered water throughout the day. Restrict fluids 1 hour before sleep.";
            
            var avoidList = new List<string> { "Refined sugar & bakery sweets", "Deep fried snacks & trans-fats", "Ultra-processed packaged foods", "Excess salt & sodium sauces" };
            if (excludedFoods.Any())
            {
                avoidList.AddRange(excludedFoods.Take(5).Select(f => $"{f.Name} (Contraindicated for {string.Join('/', f.ContraindicatedDiseases)})"));
            }
            plan.AvoidFoodInstructions = string.Join("; ", avoidList);

            plan.GeneralNotes = $"Walk briskly for 20-30 minutes post meals. Do not skip breakfast. Chew food thoroughly (20-30 chews per bite). Aim for 7-8 hours of uninterrupted sleep.";

            return plan;
        }

        private DietPlanItem CreateItem(string slot, string time, FoodItem food, double qty, string notes)
        {
            double factor = qty / (food.ServingQuantity > 0 ? food.ServingQuantity : 100);
            return new DietPlanItem
            {
                MealSlot = slot,
                TimeSlot = time,
                FoodItemId = food.Id,
                FoodItemName = food.Name,
                Quantity = qty,
                Unit = food.StandardUnit,
                Calories = Math.Round(food.CaloriesPerGram * qty, 1),
                Protein = Math.Round(food.ProteinPerGram * qty, 1),
                Carbs = Math.Round(food.CarbsPerGram * qty, 1),
                Fat = Math.Round(food.FatPerGram * qty, 1),
                Fiber = Math.Round(food.FiberPerGram * qty, 1),
                SpecialInstructions = notes
            };
        }
        #endregion

        #region Seed Data Initialization
        private void SeedDiseases()
        {
            _diseases = new List<Disease>
            {
                new Disease
                {
                    Id = "d-1",
                    Name = "Diabetes / Sugar",
                    Category = "Metabolic",
                    Description = "Impaired insulin secretion and resistance leading to chronic hyperglycemia.",
                    DietaryGuidelines = "Low glycemic index carbohydrates, high soluble fiber, strict restriction of simple sugars, sweets, cakes, cold drinks, and sugary juices.",
                    RestrictedNutrients = new List<string> { "High-Glycemic Foods", "Refined Sugars", "White Flour / Maida", "Sweetened Juices" },
                    RestrictedFoodIds = new List<string> { "f-sugar", "f-sweets", "f-cake", "f-cold-drink", "f-sugary-juice" },
                    RestrictedFoodNames = new List<string> { "Sugar", "Sweets", "Cake", "Cold Drink", "Sugary Juice" }
                },
                new Disease
                {
                    Name = "Hypertension",
                    Category = "Cardiovascular",
                    Description = "Chronic elevated arterial blood pressure requiring sodium limitation (DASH diet protocol).",
                    DietaryGuidelines = "Sodium restriction (<2000mg/day), rich in potassium, calcium, magnesium, avoidance of processed and salted snacks.",
                    RestrictedNutrients = new List<string> { "High Sodium / Added Salt", "Processed Meats", "Pickles & Papad", "Fried Snacks" }
                },
                new Disease
                {
                    Name = "Chronic Kidney Disease (CKD)",
                    Category = "Renal",
                    Description = "Gradual loss of renal function requiring careful monitoring of protein, potassium, sodium, and phosphorus.",
                    DietaryGuidelines = "Low to moderate protein (0.6 - 0.8g/kg), low potassium (limit high potassium fruits like bananas, oranges), low phosphorus.",
                    RestrictedNutrients = new List<string> { "Excess Dietary Protein", "High Potassium Foods", "High Phosphorus", "Excess Sodium" }
                },
                new Disease
                {
                    Name = "Hyperlipidemia / Dyslipidemia",
                    Category = "Cardiovascular",
                    Description = "Elevated total cholesterol, triglycerides, or LDL particles.",
                    DietaryGuidelines = "Limit saturated and trans fatty acids, avoid deep-fried foods, butter, full-cream dairy. Increase omega-3 and soluble oat fiber.",
                    RestrictedNutrients = new List<string> { "Saturated Fats", "Trans Fats", "Deep Fried Foods", "Full Cream Dairy", "Egg Yolks" }
                },
                new Disease
                {
                    Name = "Non-Alcoholic Fatty Liver (NAFLD)",
                    Category = "Hepatic",
                    Description = "Hepatic steatosis in the absence of significant alcohol consumption.",
                    DietaryGuidelines = "Mediterranean diet pattern, caloric reduction, strict avoidance of high-fructose corn syrup, refined sugar, and alcohol.",
                    RestrictedNutrients = new List<string> { "Fructose / Table Sugar", "Alcohol", "Refined Carbohydrates", "Trans Fats" }
                },
                new Disease
                {
                    Name = "Gout / Hyperuricemia",
                    Category = "Metabolic",
                    Description = "Uric acid crystal deposition in joints triggered by high-purine foods.",
                    DietaryGuidelines = "Strict low-purine diet. Avoid organ meats, red meats, sardines, beer, yeast extracts, and high-purine legumes/spinach in flare-ups.",
                    RestrictedNutrients = new List<string> { "High Purine Foods", "Red Meat", "Seafood / Sardines", "Spinach / Cauliflower in excess", "Beer" }
                },
                new Disease
                {
                    Name = "Polycystic Ovary Syndrome (PCOS)",
                    Category = "Endocrine",
                    Description = "Hormonal disorder with hyperandrogenism, irregular menses, and insulin resistance.",
                    DietaryGuidelines = "Low glycemic anti-inflammatory nutrition, balanced macronutrients with adequate protein and healthy fats, avoidance of dairy or sugar spikes.",
                    RestrictedNutrients = new List<string> { "High-GI Sweets", "Ultra-Processed Foods", "Excess Refined Dairy" }
                },
                new Disease
                {
                    Name = "Hypothyroidism",
                    Category = "Endocrine",
                    Description = "Underactive thyroid gland with reduced metabolic rate.",
                    DietaryGuidelines = "Adequate iodine and selenium, avoid excessive raw goitrogens (raw cabbage, cauliflower, soy) around medication timing.",
                    RestrictedNutrients = new List<string> { "Raw Goitrogens", "Excess Soy Uncooked", "High Calorie Sugars" }
                },
                new Disease
                {
                    Name = "GERD / Acid Reflux",
                    Category = "Gastrointestinal",
                    Description = "Acid reflux and irritation of the esophageal lining.",
                    DietaryGuidelines = "Small frequent meals, avoid spicy foods, citrus, tomatoes, coffee, mint, chocolate, and eating within 3 hours of sleeping.",
                    RestrictedNutrients = new List<string> { "Spicy Foods", "Citrus & Tomatoes", "Caffeine / Coffee", "Deep Fried Meals" }
                },
                new Disease
                {
                    Name = "Celiac Disease / Gluten Sensitivity",
                    Category = "Autoimmune",
                    Description = "Immune reaction to eating gluten, damaging the small intestine.",
                    DietaryGuidelines = "Strict lifelong 100% gluten-free diet. Avoid wheat, rye, barley, standard oats contaminated with wheat.",
                    RestrictedNutrients = new List<string> { "Wheat / Atta / Maida", "Barley", "Rye", "Gluten Contaminants" }
                }
            };
        }

        private void SeedMasterFoodItems()
        {
            _masterFoodItems = new List<FoodItem>
            {
                // Cereals / Grains
                new FoodItem
                {
                    Name = "Rolled Oats (Raw/Cooked)",
                    Category = "Cereals",
                    StandardUnit = "g",
                    ServingQuantity = 40,
                    CarbsPerGram = 0.60,
                    ProteinPerGram = 0.13,
                    FatPerGram = 0.065,
                    FiberPerGram = 0.10,
                    DietCategory = "Vegetarian",
                    Notes = "Rich in beta-glucan soluble fiber, excellent for diabetes and cholesterol management."
                },
                new FoodItem
                {
                    Name = "Whole Wheat Roti / Chapati",
                    Category = "Cereals",
                    StandardUnit = "g",
                    ServingQuantity = 35,
                    CarbsPerGram = 0.46,
                    ProteinPerGram = 0.09,
                    FatPerGram = 0.035,
                    FiberPerGram = 0.08,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Celiac Disease / Gluten Sensitivity" },
                    Notes = "Standard Indian home-style medium chapati. High fiber."
                },
                new FoodItem
                {
                    Name = "Brown Rice (Cooked)",
                    Category = "Cereals",
                    StandardUnit = "g",
                    ServingQuantity = 100,
                    CarbsPerGram = 0.23,
                    ProteinPerGram = 0.026,
                    FatPerGram = 0.009,
                    FiberPerGram = 0.018,
                    DietCategory = "Vegetarian",
                    Notes = "Complex carbohydrate, gluten-free, slow release glucose."
                },
                new FoodItem
                {
                    Name = "White Basmati Rice (Cooked)",
                    Category = "Cereals",
                    StandardUnit = "g",
                    ServingQuantity = 100,
                    CarbsPerGram = 0.28,
                    ProteinPerGram = 0.027,
                    FatPerGram = 0.003,
                    FiberPerGram = 0.004,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Diabetes Mellitus Type 2" },
                    Notes = "High glycemic index, rapidly digested. Caution in diabetes."
                },

                // Proteins / Pulses
                new FoodItem
                {
                    Name = "Yellow Moong Dal (Cooked)",
                    Category = "Proteins",
                    StandardUnit = "g",
                    ServingQuantity = 150,
                    CarbsPerGram = 0.16,
                    ProteinPerGram = 0.07,
                    FatPerGram = 0.015,
                    FiberPerGram = 0.045,
                    DietCategory = "Vegetarian",
                    Notes = "Light, easily digestible lentil with complete amino acid profile when paired with grains."
                },
                new FoodItem
                {
                    Name = "Paneer Low Fat / Fresh Cottage Cheese",
                    Category = "Dairy",
                    StandardUnit = "g",
                    ServingQuantity = 80,
                    CarbsPerGram = 0.03,
                    ProteinPerGram = 0.18,
                    FatPerGram = 0.08,
                    FiberPerGram = 0,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Chronic Kidney Disease (CKD)" },
                    Notes = "Concentrated dairy protein with calcium."
                },
                new FoodItem
                {
                    Name = "Boiled Egg White (Large)",
                    Category = "Proteins",
                    StandardUnit = "g",
                    ServingQuantity = 33,
                    CarbsPerGram = 0.007,
                    ProteinPerGram = 0.11,
                    FatPerGram = 0.002,
                    FiberPerGram = 0,
                    DietCategory = "Eggitarian",
                    Notes = "1 large egg white (~33g). Pure albumin protein, zero cholesterol."
                },
                new FoodItem
                {
                    Name = "Whole Boiled Egg (Large)",
                    Category = "Proteins",
                    StandardUnit = "g",
                    ServingQuantity = 50,
                    CarbsPerGram = 0.012,
                    ProteinPerGram = 0.126,
                    FatPerGram = 0.100,
                    FiberPerGram = 0,
                    VitaminA_mcgPerGram = 1.60,      // 80 mcg in 50g egg
                    VitaminD_mcgPerGram = 0.022,     // 1.1 mcg (44 IU) in 50g egg
                    VitaminB12_mcgPerGram = 0.012,   // 0.6 mcg in 50g egg
                    VitaminE_mgPerGram = 0.010,      // 0.5 mg in 50g egg
                    Calcium_mgPerGram = 0.50,        // 25 mg in 50g egg
                    Iron_mgPerGram = 0.018,          // 0.9 mg in 50g egg
                    DietCategory = "Eggitarian",
                    ContraindicatedDiseases = new List<string> { "Hyperlipidemia / Dyslipidemia" },
                    Notes = "1 large whole egg (~50g). Golden reference protein, Vitamin D, Vitamin B12, and brain-essential choline."
                },
                new FoodItem
                {
                    Name = "Grilled Skinless Chicken Breast",
                    Category = "Proteins",
                    StandardUnit = "g",
                    ServingQuantity = 100,
                    CarbsPerGram = 0,
                    ProteinPerGram = 0.31,
                    FatPerGram = 0.036,
                    FiberPerGram = 0,
                    DietCategory = "Non-Veg",
                    ContraindicatedDiseases = new List<string> { "Gout / Hyperuricemia", "Chronic Kidney Disease (CKD)" },
                    Notes = "Ultra lean high protein poultry."
                },
                new FoodItem
                {
                    Name = "Firm Tofu (Soy Paneer)",
                    Category = "Proteins",
                    StandardUnit = "g",
                    ServingQuantity = 100,
                    CarbsPerGram = 0.02,
                    ProteinPerGram = 0.14,
                    FatPerGram = 0.08,
                    FiberPerGram = 0.02,
                    DietCategory = "Vegan",
                    Notes = "100% plant-based soy protein with isoflavones and calcium."
                },
                new FoodItem
                {
                    Name = "Sprouted Green Moong (Raw/Steamed)",
                    Category = "Proteins",
                    StandardUnit = "g",
                    ServingQuantity = 100,
                    CarbsPerGram = 0.19,
                    ProteinPerGram = 0.085,
                    FatPerGram = 0.012,
                    FiberPerGram = 0.065,
                    DietCategory = "Vegetarian",
                    Notes = "Live enzymatic sprouted legumes, high in bioavailable iron and vitamin C."
                },
                new FoodItem
                {
                    Name = "Roasted Bengal Gram (Chana / Bhuna Chana)",
                    Category = "Snacks",
                    StandardUnit = "g",
                    ServingQuantity = 40,
                    CarbsPerGram = 0.58,
                    ProteinPerGram = 0.18,
                    FatPerGram = 0.05,
                    FiberPerGram = 0.15,
                    DietCategory = "Vegetarian",
                    Notes = "Traditional crunchy high-fiber roasted pulse snack with low GI."
                },

                // Dairy
                new FoodItem
                {
                    Name = "Low-Fat Probiotic Curd / Dahi",
                    Category = "Dairy",
                    StandardUnit = "g",
                    ServingQuantity = 150,
                    CarbsPerGram = 0.045,
                    ProteinPerGram = 0.038,
                    FatPerGram = 0.015,
                    FiberPerGram = 0,
                    DietCategory = "Vegetarian",
                    Notes = "Cultured gut-friendly fermented dairy, high bioavailable calcium."
                },
                new FoodItem
                {
                    Name = "Toned Cow Milk (3% Fat)",
                    Category = "Dairy",
                    StandardUnit = "g",
                    ServingQuantity = 200,
                    CarbsPerGram = 0.048,
                    ProteinPerGram = 0.032,
                    FatPerGram = 0.030,
                    FiberPerGram = 0,
                    DietCategory = "Vegetarian",
                    Notes = "1 glass (200ml) of toned milk."
                },

                // Nuts & Healthy Fats
                new FoodItem
                {
                    Name = "Raw California Almonds",
                    Category = "Nuts & Seeds",
                    StandardUnit = "g",
                    ServingQuantity = 15,
                    CarbsPerGram = 0.21,
                    ProteinPerGram = 0.21,
                    FatPerGram = 0.49,
                    FiberPerGram = 0.12,
                    DietCategory = "Vegetarian",
                    Notes = "Rich in Vitamin E, monounsaturated fats, and magnesium."
                },
                new FoodItem
                {
                    Name = "Raw Walnut Kernels",
                    Category = "Nuts & Seeds",
                    StandardUnit = "g",
                    ServingQuantity = 15,
                    CarbsPerGram = 0.14,
                    ProteinPerGram = 0.15,
                    FatPerGram = 0.65,
                    FiberPerGram = 0.07,
                    DietCategory = "Vegetarian",
                    Notes = "High plant-based Omega-3 ALA (Alpha-Linolenic Acid) for brain and heart."
                },
                new FoodItem
                {
                    Name = "Chia Seeds (Raw)",
                    Category = "Nuts & Seeds",
                    StandardUnit = "g",
                    ServingQuantity = 15,
                    CarbsPerGram = 0.42,
                    ProteinPerGram = 0.17,
                    FatPerGram = 0.31,
                    FiberPerGram = 0.34,
                    DietCategory = "Vegetarian",
                    Notes = "Hydrating soluble mucilage fiber and omega-3."
                },

                // Fruits & Vegetables
                new FoodItem
                {
                    Name = "Fresh Red Apple (With Peel)",
                    Category = "Fruits",
                    StandardUnit = "g",
                    ServingQuantity = 120,
                    CarbsPerGram = 0.14,
                    ProteinPerGram = 0.003,
                    FatPerGram = 0.002,
                    FiberPerGram = 0.024,
                    DietCategory = "Vegetarian",
                    Notes = "1 medium apple (120g). Pectin prebiotic fiber, low glycemic index."
                },
                new FoodItem
                {
                    Name = "Ripe Banana",
                    Category = "Fruits",
                    StandardUnit = "g",
                    ServingQuantity = 100,
                    CarbsPerGram = 0.23,
                    ProteinPerGram = 0.011,
                    FatPerGram = 0.003,
                    FiberPerGram = 0.026,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Chronic Kidney Disease (CKD)", "Diabetes Mellitus Type 2" },
                    Notes = "High potassium fruit. Strictly contraindicated in CKD / renal failure."
                },
                new FoodItem
                {
                    Name = "Fresh Spinach / Palak (Cooked)",
                    Category = "Vegetables",
                    StandardUnit = "g",
                    ServingQuantity = 100,
                    CarbsPerGram = 0.036,
                    ProteinPerGram = 0.029,
                    FatPerGram = 0.004,
                    FiberPerGram = 0.022,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Gout / Hyperuricemia", "Chronic Kidney Disease (CKD)" },
                    Notes = "Rich in iron and folates. High in oxalates and moderate purines."
                },
                new FoodItem
                {
                    Name = "Cucumber & Tomato Green Salad",
                    Category = "Vegetables",
                    StandardUnit = "g",
                    ServingQuantity = 150,
                    CarbsPerGram = 0.036,
                    ProteinPerGram = 0.009,
                    FatPerGram = 0.002,
                    FiberPerGram = 0.018,
                    DietCategory = "Vegetarian",
                    Notes = "Hydrating crunchy roughage with lycopene and vitamin C."
                },
                new FoodItem
                {
                    Name = "Green Tea (Fresh Infusion)",
                    Category = "Beverages",
                    StandardUnit = "g",
                    ServingQuantity = 200,
                    CarbsPerGram = 0.002,
                    ProteinPerGram = 0,
                    FatPerGram = 0,
                    FiberPerGram = 0,
                    DietCategory = "Vegetarian",
                    Notes = "EGCG epigallocatechin gallate antioxidant beverage. Zero calories."
                },

                // High Risk / Restricted Foods for Demonstration
                new FoodItem
                {
                    Name = "Refined White Sugar / Sweets",
                    Category = "Snacks",
                    StandardUnit = "g",
                    ServingQuantity = 20,
                    CarbsPerGram = 1.0,
                    ProteinPerGram = 0,
                    FatPerGram = 0,
                    FiberPerGram = 0,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Diabetes Mellitus Type 2", "Non-Alcoholic Fatty Liver (NAFLD)", "Polycystic Ovary Syndrome (PCOS)" },
                    Notes = "Pure sucrose, 100% simple carbs. Causes massive insulin spikes."
                },
                new FoodItem
                {
                    Name = "Deep Fried Samosa / Kachori",
                    Category = "Snacks",
                    StandardUnit = "g",
                    ServingQuantity = 80,
                    CarbsPerGram = 0.32,
                    ProteinPerGram = 0.04,
                    FatPerGram = 0.22,
                    FiberPerGram = 0.015,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Hypertension", "Hyperlipidemia / Dyslipidemia", "Non-Alcoholic Fatty Liver (NAFLD)", "GERD / Acid Reflux" },
                    Notes = "Commercial deep-fried trans-fats and high sodium."
                },
                new FoodItem
                {
                    Name = "Spicy Pickles / Achaar in Mustard Oil",
                    Category = "Snacks",
                    StandardUnit = "g",
                    ServingQuantity = 20,
                    CarbsPerGram = 0.08,
                    ProteinPerGram = 0.01,
                    FatPerGram = 0.15,
                    FiberPerGram = 0.02,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Hypertension", "GERD / Acid Reflux", "Chronic Kidney Disease (CKD)" },
                    Notes = "Extremely high sodium (>3000mg/100g) and irritant spices."
                },
                new FoodItem
                {
                    Id = "f-sugar",
                    Name = "Sugar",
                    Category = "Snacks",
                    StandardUnit = "g",
                    ServingQuantity = 15,
                    CarbsPerGram = 1.0,
                    ProteinPerGram = 0,
                    FatPerGram = 0,
                    FiberPerGram = 0,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Diabetes / Sugar", "Diabetes Mellitus Type 2" },
                    Notes = "Refined white sugar. Simple sucrose causing rapid blood glucose spike."
                },
                new FoodItem
                {
                    Id = "f-sweets",
                    Name = "Sweets",
                    Category = "Snacks",
                    StandardUnit = "g",
                    ServingQuantity = 50,
                    CarbsPerGram = 0.65,
                    ProteinPerGram = 0.04,
                    FatPerGram = 0.18,
                    FiberPerGram = 0.01,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Diabetes / Sugar", "Diabetes Mellitus Type 2" },
                    Notes = "Mithai sweets made with condensed milk and heavy sugar syrup."
                },
                new FoodItem
                {
                    Id = "f-cake",
                    Name = "Cake",
                    Category = "Snacks",
                    StandardUnit = "g",
                    ServingQuantity = 60,
                    CarbsPerGram = 0.58,
                    ProteinPerGram = 0.05,
                    FatPerGram = 0.16,
                    FiberPerGram = 0.01,
                    DietCategory = "Vegetarian",
                    ContraindicatedDiseases = new List<string> { "Diabetes / Sugar", "Diabetes Mellitus Type 2" },
                    Notes = "Bakery dessert cake with refined flour (maida) and sweet icing."
                },
                new FoodItem
                {
                    Id = "f-cold-drink",
                    Name = "Cold Drink",
                    Category = "Beverages",
                    StandardUnit = "ml",
                    ServingQuantity = 250,
                    CarbsPerGram = 0.11,
                    ProteinPerGram = 0,
                    FatPerGram = 0,
                    FiberPerGram = 0,
                    DietCategory = "Vegan",
                    ContraindicatedDiseases = new List<string> { "Diabetes / Sugar", "Diabetes Mellitus Type 2" },
                    Notes = "Carbonated sweet beverage containing liquid corn syrup and high glycemic index."
                },
                new FoodItem
                {
                    Id = "f-sugary-juice",
                    Name = "Sugary Juice",
                    Category = "Beverages",
                    StandardUnit = "ml",
                    ServingQuantity = 200,
                    CarbsPerGram = 0.13,
                    ProteinPerGram = 0.005,
                    FatPerGram = 0,
                    FiberPerGram = 0.002,
                    DietCategory = "Vegan",
                    ContraindicatedDiseases = new List<string> { "Diabetes / Sugar", "Diabetes Mellitus Type 2" },
                    Notes = "Sweetened fruit beverage with zero roughage fiber and added cane sugar."
                }
            };
        }

        private void SeedSamplePatients()
        {
            _patients = new List<Patient>
            {
                new Patient
                {
                    Name = "Rajesh Sharma",
                    ContactNumber = "+919876543210",
                    DateOfBirth = new DateTime(1989, 5, 15),
                    Gender = "Male",
                    PrimaryComplaint = "Weight loss and management of Grade 1 Fatty Liver & Borderline Hypertension.",
                    ClinicalDiagnoses = new List<string> { "Hypertension", "Non-Alcoholic Fatty Liver (NAFLD)" },
                    DescribeMedicalConditions = "Grade 1 Hepatic Steatosis reported on abdominal sonography; BP 138/88 mmHg.",
                    PrescribedMedications = "Telmisartan 20mg (once daily morning post breakfast)",
                    OtcSupplements = "Omega-3 Fish Oil (1000mg), CoQ10",
                    Occupation = "Senior Software Engineer (Desk Job)",
                    WorkingHours = "Day",
                    DailySleepDurationHours = 6.5,
                    SleepQuality = "Broken",
                    StressLevel = 7,
                    PrimaryStressFactor = "Deadlines and sedentary lifestyle",
                    DailyStepCount = 4500,
                    ExerciseRoutine = "Brisk walking 25 mins (3 days/week)",
                    ActivityLevel = "Lightly Active",
                    PrimaryDietType = "Vegetarian",
                    WaterConsumptionLiters = 2.0,
                    AlcoholSmokingFrequency = "Non-smoker, occasional social wine",
                    EmotionalEatingTriggers = new List<string> { "Stress", "Boredom", "Late Night Craving" },
                    MealFrequency = "3 Meals",
                    RecallBreakfast = "2 Stuffed Aloo Parathas with 1 cup sweet milk tea",
                    RecallMidMorning = "2 Cream Biscuits with office coffee",
                    RecallLunch = "2 Rotis, White Rice, Paneer Butter Masala, Curd",
                    RecallEvening = "Samosa or fried namkeen with cutting chai",
                    RecallDinner = "3 Rotis, Yellow Dal, Mixed Sabzi late at 10:15 PM",
                    RecallBedtime = "1 Glass warm buffalo milk with sugar",
                    HeightCm = 175.0,
                    WeightKg = 84.5,
                    WaistCm = 96.0,
                    HipsCm = 102.0,
                    CalorieGoalType = "Weight Loss",
                    MacroDistributionPreset = "Standard Balanced"
                },
                new Patient
                {
                    Name = "Pooja Varma",
                    ContactNumber = "+919812345678",
                    DateOfBirth = new DateTime(1996, 9, 22),
                    Gender = "Female",
                    PrimaryComplaint = "PCOS management, weight stagnation, and fatigue.",
                    ClinicalDiagnoses = new List<string> { "Polycystic Ovary Syndrome (PCOS)", "Diabetes Mellitus Type 2" },
                    DescribeMedicalConditions = "Insulin resistance (HOMA-IR 3.8), irregular menstrual cycles (45-50 days).",
                    PrescribedMedications = "Metformin 500mg SR (post dinner), Inositol supplement",
                    OtcSupplements = "Vitamin D3 60k IU, Zinc + Magnesium",
                    Occupation = "Financial Analyst",
                    WorkingHours = "Day",
                    DailySleepDurationHours = 7.0,
                    SleepQuality = "Restful",
                    StressLevel = 6,
                    PrimaryStressFactor = "Long sitting hours",
                    DailyStepCount = 6000,
                    ExerciseRoutine = "Pilates & Strength Training 3x weekly",
                    ActivityLevel = "Moderately Active",
                    PrimaryDietType = "Vegetarian",
                    WaterConsumptionLiters = 2.8,
                    EmotionalEatingTriggers = new List<string> { "Anxiety", "Sadness" },
                    MealFrequency = "Small Frequent Meals",
                    RecallBreakfast = "Poha with tea",
                    RecallMidMorning = "Handful roasted nuts",
                    RecallLunch = "2 Rotis, dal, sabzi, buttermilk",
                    RecallEvening = "Roasted makhana",
                    RecallDinner = "Khichdi or 2 Rotis with sabzi",
                    RecallBedtime = "Chamomile tea",
                    HeightCm = 162.0,
                    WeightKg = 68.0,
                    WaistCm = 84.0,
                    HipsCm = 98.0,
                    CalorieGoalType = "Weight Loss",
                    MacroDistributionPreset = "Diabetic"
                }
            };
        }
        #endregion
    }
}
