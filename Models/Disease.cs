using System;
using System.Collections.Generic;

namespace Diet.Models
{
    public class Disease
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = "Metabolic"; // Metabolic, Cardiovascular, Renal, Hepatic, Endocrine, Gastrointestinal, Autoimmune
        public string Description { get; set; } = string.Empty;
        public string DietaryGuidelines { get; set; } = string.Empty;
        public List<string> RestrictedNutrients { get; set; } = new(); // e.g. "High Glycemic Carbs", "Sodium > 2000mg", "Potassium", "Phosphorus", "Purines", "Saturated Fats"
        public List<string> RestrictedFoodIds { get; set; } = new(); // Food Item IDs from Food/Item Master (Disease -> Multiple Restricted Foods)
        public List<string> RestrictedFoodNames { get; set; } = new(); // Names for convenient display (e.g. Sugar, Sweets, Cake, Cold Drink, Sugary Juice)
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}


