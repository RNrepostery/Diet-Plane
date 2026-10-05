using System;
using System.Collections.Generic;

namespace Diet.Models
{
    public class FoodItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = "Cereals"; // Cereals, Proteins, Fats, Fruits, Vegetables, Dairy, Nuts & Seeds, Beverages, Supplements
        public string StandardUnit { get; set; } = "g"; // g, ml, piece, cup, bowl, roti, scoop
        public double ServingQuantity { get; set; } = 100; // default serving in standard unit

        // Macronutrients per 1 Gram (Standard clinical reference: 1g Carb = 4kcal, 1g Protein = 4kcal, 1g Fat = 9kcal)
        public double CarbsPerGram { get; set; } = 0; // g/g
        public double ProteinPerGram { get; set; } = 0; // g/g
        public double FatPerGram { get; set; } = 0; // g/g
        public double FiberPerGram { get; set; } = 0; // g/g

        // Micronutrients per 1 Gram (or standard unit)
        public double VitaminA_mcgPerGram { get; set; } = 0; // mcg/g (Retinol / Carotene)
        public double VitaminC_mgPerGram { get; set; } = 0;  // mg/g (Ascorbic acid)
        public double VitaminD_mcgPerGram { get; set; } = 0; // mcg/g (Cholecalciferol)
        public double VitaminB12_mcgPerGram { get; set; } = 0; // mcg/g (Cobalamin)
        public double VitaminE_mgPerGram { get; set; } = 0;  // mg/g
        public double Calcium_mgPerGram { get; set; } = 0;   // mg/g
        public double Iron_mgPerGram { get; set; } = 0;      // mg/g

        // Automated energy calculation per 1 Gram
        public double CaloriesPerGram => Math.Round((CarbsPerGram * 4.0) + (ProteinPerGram * 4.0) + (FatPerGram * 9.0), 3);

        // Serving Totals
        public double Calories => Math.Round(CaloriesPerGram * ServingQuantity, 1);
        public double Protein => Math.Round(ProteinPerGram * ServingQuantity, 1);
        public double Carbs => Math.Round(CarbsPerGram * ServingQuantity, 1);
        public double Fat => Math.Round(FatPerGram * ServingQuantity, 1);
        public double Fiber => Math.Round(FiberPerGram * ServingQuantity, 1);

        // Serving Micronutrient Totals
        public double VitaminA => Math.Round(VitaminA_mcgPerGram * ServingQuantity, 1); // mcg
        public double VitaminC => Math.Round(VitaminC_mgPerGram * ServingQuantity, 1); // mg
        public double VitaminD => Math.Round(VitaminD_mcgPerGram * ServingQuantity, 2); // mcg
        public double VitaminB12 => Math.Round(VitaminB12_mcgPerGram * ServingQuantity, 2); // mcg
        public double VitaminE => Math.Round(VitaminE_mgPerGram * ServingQuantity, 2); // mg
        public double Calcium => Math.Round(Calcium_mgPerGram * ServingQuantity, 1); // mg
        public double Iron => Math.Round(Iron_mgPerGram * ServingQuantity, 2); // mg

        public string DietCategory { get; set; } = "Vegetarian"; // Vegetarian, Non-Veg, Vegan, Eggitarian, Jain
        
        // Disease Restrictions Mapping: Multi-select contraindicated diseases from Disease Master
        public List<string> ContraindicatedDiseases { get; set; } = new();

        public string Notes { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
