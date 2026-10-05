using System;
using System.Collections.Generic;

namespace Diet.Models
{
    public class Patient
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        // Demographics
        public string Name { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty; // WhatsApp phone e.g. +91 9876543210
        public DateTime? DateOfBirth { get; set; } = DateTime.Today.AddYears(-30);
        public int YearOfBirth { get; set; } = 2000;
        public int Age => DateOfBirth.HasValue ? Math.Max(0, (DateTime.Today - DateOfBirth.Value).Days / 365) : (DateTime.Today.Year - YearOfBirth);
        public int CustomAge { get; set; } = 30;
        public string Gender { get; set; } = "Male"; // Male, Female, Others
        public string EatingFrequency { get; set; } = "Three meals a day"; // One meal a day, Two meals a day, Three meals a day, More than three meals a day
        public string PrimaryDietType { get; set; } = "Vegetarian"; // Vegetarian, Vegan, Non-Veg, Ovo-Vegetarian, Jain
        public string PrimaryComplaint { get; set; } = string.Empty;

        // Clinical Diagnosis & Medical Details (Links to Disease Master)
        public List<string> ClinicalDiagnoses { get; set; } = new(); // Multi-select from Disease Master
        public string DescribeMedicalConditions { get; set; } = string.Empty;
        public string PrescribedMedications { get; set; } = string.Empty;
        public string OtcSupplements { get; set; } = string.Empty;

        // Lifestyle & Environmental Parameters
        public string Occupation { get; set; } = string.Empty;
        public string WorkingHours { get; set; } = "Day"; // Day, Night, Rotating
        public double DailySleepDurationHours { get; set; } = 7.0;
        public string SleepQuality { get; set; } = "Restful"; // Restful, Broken, Insomnia
        public int StressLevel { get; set; } = 5; // 1-10
        public string PrimaryStressFactor { get; set; } = string.Empty;
        public int DailyStepCount { get; set; } = 5000;
        public string ExerciseRoutine { get; set; } = string.Empty;
        public string ActivityLevel { get; set; } = "Lightly Active"; // Sedentary (1.2), Lightly Active (1.375), Moderately Active (1.55), Very Active (1.725)

        // Dietary Recall & Lifestyle
        public double WaterConsumptionLiters { get; set; } = 2.5;
        public string AlcoholSmokingFrequency { get; set; } = string.Empty;
        public List<string> EmotionalEatingTriggers { get; set; } = new(); // Stress, Boredom, Anxiety, Sadness, Late Night Craving, None
        public string MealFrequency { get; set; } = "3 Meals"; // 2 Meals, 3 Meals, Small Frequent Meals
        
        // 24-Hour Dietary Recall Slots
        public string RecallBreakfast { get; set; } = string.Empty;
        public string RecallBreakfastTime { get; set; } = "08:30 AM";
        public string RecallMidMorning { get; set; } = string.Empty;
        public string RecallMidMorningTime { get; set; } = "11:00 AM";
        public string RecallLunch { get; set; } = string.Empty;
        public string RecallLunchTime { get; set; } = "01:30 PM";
        public string RecallEvening { get; set; } = string.Empty;
        public string RecallEveningTime { get; set; } = "05:30 PM";
        public string RecallDinner { get; set; } = string.Empty;
        public string RecallDinnerTime { get; set; } = "08:30 PM";
        public string RecallBedtime { get; set; } = string.Empty;
        public string RecallBedtimeTime { get; set; } = "10:00 PM";

        // Core Anthropometric Measurements
        public double HeightCm { get; set; } = 170.0;
        public double WeightKg { get; set; } = 70.0;
        public double WaistCm { get; set; } = 80.0;
        public double HipsCm { get; set; } = 95.0;

        // Goal & Clinical Macro Presets
        public string CalorieGoalType { get; set; } = "Maintenance"; // Weight Loss, Maintenance, Weight Gain, Custom
        public double TargetCaloriesOverride { get; set; } = 0;
        public string MacroDistributionPreset { get; set; } = "Standard Balanced"; // Standard Balanced, Diabetic, High Protein, Renal Protective, Cardiac Low-Fat
        public double CustomCarbPercent { get; set; } = 55;
        public double CustomProteinPercent { get; set; } = 20;
        public double CustomFatPercent { get; set; } = 25;

        // ==========================================
        // AUTOMATED CLINICAL CALCULATION ENGINE
        // ==========================================

        public double HeightMeters => HeightCm > 0 ? HeightCm / 100.0 : 1.7;

        // 1. BMI (kg/m^2)
        public double BMI => HeightMeters > 0 ? Math.Round(WeightKg / (HeightMeters * HeightMeters), 2) : 0;

        // Asian-Indian BMI Classification (WHO Guidelines for Asians)
        public string BMICategory
        {
            get
            {
                var bmi = BMI;
                if (bmi <= 0) return "Unknown";
                if (bmi < 18.5) return "Underweight";
                if (bmi < 23.0) return "Normal (Asian-Indian Standard)";
                if (bmi < 25.0) return "Overweight (At Risk)";
                if (bmi < 30.0) return "Obese Class I";
                return "Obese Class II";
            }
        }

        // 2. Ideal Body Weight (IBW) via Broca's Index
        // Men: Height (cm) - 100
        // Women: Height (cm) - 105
        public double IdealBodyWeightBroca => Gender.Equals("Female", StringComparison.OrdinalIgnoreCase)
            ? Math.Max(30, HeightCm - 105)
            : Math.Max(35, HeightCm - 100);

        // 3. Waist-to-Hip Ratio (WHR) = Waist / Hip
        public double WaistToHipRatio => HipsCm > 0 ? Math.Round(WaistCm / HipsCm, 2) : 0;

        // 4. Waist Circumference High-Risk Check (Asian-Indian Guidelines: Men > 90cm, Women > 80cm)
        public bool IsAbdominalObesityHighRisk
        {
            get
            {
                var whr = WaistToHipRatio;
                if (Gender.Equals("Female", StringComparison.OrdinalIgnoreCase))
                    return WaistCm > 80 || whr > 0.85;
                else
                    return WaistCm > 90 || whr > 0.90;
            }
        }

        public string AbdominalRiskDescription
        {
            get
            {
                bool isFemale = Gender.Equals("Female", StringComparison.OrdinalIgnoreCase);
                double waistLimit = isFemale ? 80.0 : 90.0;
                double whrLimit = isFemale ? 0.85 : 0.90;

                if (IsAbdominalObesityHighRisk)
                {
                    return $"High Risk (Waist > {waistLimit}cm or WHR > {whrLimit}) - Elevated Cardiovascular & Metabolic Risk";
                }
                return $"Normal Risk (Waist ≤ {waistLimit}cm, WHR ≤ {whrLimit})";
            }
        }

        // PAL Activity Factor
        public double ActivityFactor => ActivityLevel switch
        {
            "Sedentary" => 1.2,
            "Lightly Active" => 1.375,
            "Moderately Active" => 1.55,
            "Very Active" => 1.725,
            _ => 1.375
        };

        // 5. Basal Metabolic Rate (BMR) - Harris-Benedict Formula
        // Men: BMR = 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age)
        // Women: BMR = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age)
        public double BMR
        {
            get
            {
                int age = Age > 0 ? Age : 30;
                if (Gender.Equals("Female", StringComparison.OrdinalIgnoreCase))
                {
                    return Math.Round(655.1 + (9.563 * WeightKg) + (1.850 * HeightCm) - (4.676 * age), 1);
                }
                else
                {
                    return Math.Round(66.5 + (13.75 * WeightKg) + (5.003 * HeightCm) - (6.755 * age), 1);
                }
            }
        }

        // 6. Total Daily Energy Expenditure (TDEE) = BMR * Activity Factor (PAL)
        public double TDEE => Math.Round(BMR * ActivityFactor, 1);

        // 7. Rapid Rule of Thumb Caloric Estimations
        // Deficit / Weight Loss: 20-22 kcal/kg
        public double WeightLossCalorieTargetMin => Math.Round(20 * WeightKg, 0);
        public double WeightLossCalorieTargetMax => Math.Round(22 * WeightKg, 0);
        
        // Maintenance: 25-30 kcal/kg
        public double MaintenanceCalorieTargetMin => Math.Round(25 * WeightKg, 0);
        public double MaintenanceCalorieTargetMax => Math.Round(30 * WeightKg, 0);
        
        // Surplus: 30-35 kcal/kg
        public double WeightGainCalorieTargetMin => Math.Round(30 * WeightKg, 0);
        public double WeightGainCalorieTargetMax => Math.Round(35 * WeightKg, 0);

        // Target Calories based on selected goal
        public double RecommendedTargetCalories => CalorieGoalType switch
        {
            "Weight Loss" => Math.Round((WeightLossCalorieTargetMin + WeightLossCalorieTargetMax) / 2, 0),
            "Weight Gain" => Math.Round((WeightGainCalorieTargetMin + WeightGainCalorieTargetMax) / 2, 0),
            "Custom" => TargetCaloriesOverride > 0 ? TargetCaloriesOverride : TDEE,
            _ => Math.Round((MaintenanceCalorieTargetMin + MaintenanceCalorieTargetMax) / 2, 0)
        };

        // 8. Macronutrient Distribution & Conversion
        // Standard energy conversion factors: 1g Carb = 4 kcal, 1g Protein = 4 kcal, 1g Fat = 9 kcal
        public (double CarbPct, double ProtPct, double FatPct) ActiveMacroPercentages => MacroDistributionPreset switch
        {
            "Diabetic" => (45.0, 25.0, 30.0),
            "High Protein" => (40.0, 30.0, 30.0),
            "Renal Protective" => (60.0, 15.0, 25.0),
            "Cardiac Low-Fat" => (60.0, 20.0, 20.0),
            "Custom" => (CustomCarbPercent, CustomProteinPercent, CustomFatPercent),
            _ => (55.0, 20.0, 25.0) // Standard Indian Balanced
        };

        public double TargetCarbsGrams => Math.Round((RecommendedTargetCalories * (ActiveMacroPercentages.CarbPct / 100.0)) / 4.0, 1);
        public double TargetProteinGrams => Math.Round((RecommendedTargetCalories * (ActiveMacroPercentages.ProtPct / 100.0)) / 4.0, 1);
        public double TargetFatGrams => Math.Round((RecommendedTargetCalories * (ActiveMacroPercentages.FatPct / 100.0)) / 9.0, 1);

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
