using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Diet.Models
{
    public class DietPlanItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string MealSlot { get; set; } = "Breakfast"; // Breakfast, Mid-Morning, Lunch, Evening, Dinner, Bedtime
        public string TimeSlot { get; set; } = "08:30 AM";
        public string FoodItemId { get; set; } = string.Empty;
        public string FoodItemName { get; set; } = string.Empty;
        public double Quantity { get; set; } = 1;
        public string Unit { get; set; } = "g";
        
        // Calculated per portion
        public double Calories { get; set; }
        public double Protein { get; set; }
        public double Carbs { get; set; }
        public double Fat { get; set; }
        public double Fiber { get; set; }
        public double VitaminA { get; set; } // mcg
        public double VitaminC { get; set; } // mg
        public double VitaminD { get; set; } // mcg
        public double VitaminB12 { get; set; } // mcg
        public double Calcium { get; set; } // mg
        public double Iron { get; set; } // mg
        public string SpecialInstructions { get; set; } = string.Empty;
    }

    public class DietPlan
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string PatientContact { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string PlanTitle { get; set; } = "Custom Clinical Diet Plan";
        
        // Patient Snapshot at plan creation
        public double PatientWeightKg { get; set; }
        public double PatientHeightCm { get; set; }
        public double PatientBMI { get; set; }
        public string PatientBMICategory { get; set; } = string.Empty;
        public double PatientBrocaIBW { get; set; }
        public double PatientBMR { get; set; }
        public double PatientTDEE { get; set; }
        public double TargetCalories { get; set; }
        public double TargetCarbsGrams { get; set; }
        public double TargetProteinGrams { get; set; }
        public double TargetFatGrams { get; set; }
        public string CalorieGoalType { get; set; } = "Maintenance";
        public List<string> PatientDiagnoses { get; set; } = new();
        public List<string> ExcludedRestrictedFoods { get; set; } = new();

        public List<DietPlanItem> MealItems { get; set; } = new();
        public string GeneralNotes { get; set; } = string.Empty;
        public string FluidIntakeInstructions { get; set; } = "3 Liters of filtered water daily";
        public string AvoidFoodInstructions { get; set; } = string.Empty;
        public string DietitianName { get; set; } = "Ashish (Clinical Nutritionist / Admin)";

        // Totals
        public double TotalCalories => Math.Round(GetSum(i => i.Calories), 1);
        public double TotalProtein => Math.Round(GetSum(i => i.Protein), 1);
        public double TotalCarbs => Math.Round(GetSum(i => i.Carbs), 1);
        public double TotalFat => Math.Round(GetSum(i => i.Fat), 1);
        public double TotalFiber => Math.Round(GetSum(i => i.Fiber), 1);
        public double TotalVitaminA => Math.Round(GetSum(i => i.VitaminA), 1);
        public double TotalVitaminC => Math.Round(GetSum(i => i.VitaminC), 1);
        public double TotalVitaminD => Math.Round(GetSum(i => i.VitaminD), 2);
        public double TotalVitaminB12 => Math.Round(GetSum(i => i.VitaminB12), 2);
        public double TotalCalcium => Math.Round(GetSum(i => i.Calcium), 1);
        public double TotalIron => Math.Round(GetSum(i => i.Iron), 2);

        private double GetSum(Func<DietPlanItem, double> selector)
        {
            double sum = 0;
            if (MealItems != null)
            {
                foreach (var item in MealItems)
                {
                    sum += selector(item);
                }
            }
            return sum;
        }

        // Clean clinical WhatsApp text formatter
        public string GenerateWhatsAppMessage()
        {
            var sb = new StringBuilder();
            sb.AppendLine($"🏥 *CLINICAL MEDICAL NUTRITION CHART*");
            sb.AppendLine($"━━━━━━━━━━━━━━━━━━━━━━━━━");
            sb.AppendLine($"👤 *Patient:* {PatientName}");
            sb.AppendLine($"📅 *Date:* {CreatedDate:dd MMM yyyy}");
            sb.AppendLine($"🎯 *Goal Strategy:* {CalorieGoalType} ({TargetCalories} kcal/day)");
            sb.AppendLine($"⚖️ *Vitals:* Wt: {PatientWeightKg}kg | BMI: {PatientBMI} kg/m² | IBW: {PatientBrocaIBW}kg");
            if (PatientDiagnoses.Any())
            {
                sb.AppendLine($"🩺 *Clinical Diagnoses:* {string.Join(", ", PatientDiagnoses)}");
            }
            sb.AppendLine($"📊 *Macro Target:* Carbs: {TargetCarbsGrams}g | Protein: {TargetProteinGrams}g | Fats: {TargetFatGrams}g");
            sb.AppendLine($"━━━━━━━━━━━━━━━━━━━━━━━━━");
            sb.AppendLine($"📋 *DAILY MEAL SCHEDULE:*");

            var slots = new[] { "Breakfast", "Mid-Morning", "Lunch", "Evening", "Dinner", "Bedtime" };
            foreach (var slot in slots)
            {
                var items = MealItems.Where(m => m.MealSlot.Equals(slot, StringComparison.OrdinalIgnoreCase)).ToList();
                if (items.Any())
                {
                    sb.AppendLine($"\n⏰ *{slot.ToUpper()}* ({items.First().TimeSlot})");
                    foreach (var item in items)
                    {
                        sb.AppendLine($"  • {item.FoodItemName} — *{item.Quantity} {item.Unit}* ({item.Calories} kcal)");
                        if (!string.IsNullOrEmpty(item.SpecialInstructions))
                        {
                            sb.AppendLine($"    ↳ _{item.SpecialInstructions}_");
                        }
                    }
                }
            }

            sb.AppendLine($"\n━━━━━━━━━━━━━━━━━━━━━━━━━");
            sb.AppendLine($"💧 *Hydration:* {FluidIntakeInstructions}");
            if (!string.IsNullOrEmpty(AvoidFoodInstructions))
            {
                sb.AppendLine($"🚫 *Strictly Avoid:* {AvoidFoodInstructions}");
            }
            if (!string.IsNullOrEmpty(GeneralNotes))
            {
                sb.AppendLine($"📝 *Special Advice:* {GeneralNotes}");
            }
            sb.AppendLine($"\n✨ *Prescribed by:* {DietitianName}");
            sb.AppendLine($"_Strictly follow prescribed portions for optimal clinical outcome._");

            return sb.ToString();
        }
    }
}
