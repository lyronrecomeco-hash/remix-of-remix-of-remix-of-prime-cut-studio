import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Utensils,
  Edit2,
  Droplets,
  Flame,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FoodItem {
  name: string;
  quantity_grams: number;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  fiber_grams: number;
  sodium_mg: number;
  confidence: number;
}

interface ParsedMeal {
  foods: FoodItem[];
  water_ml: number;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sodium: number;
  original_text: string;
}

interface MealConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: ParsedMeal | null;
  onConfirm: (meal: ParsedMeal) => void;
  isLoading?: boolean;
}

const mealTypeLabels: Record<string, { label: string; icon: string }> = {
  breakfast: { label: 'Café da Manhã', icon: '🌅' },
  lunch: { label: 'Almoço', icon: '☀️' },
  snack: { label: 'Lanche', icon: '🍎' },
  dinner: { label: 'Jantar', icon: '🌙' },
};

export function MealConfirmationModal({
  isOpen,
  onClose,
  meal,
  onConfirm,
  isLoading
}: MealConfirmationModalProps) {
  const [editedMeal, setEditedMeal] = useState<ParsedMeal | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const currentMeal = editedMeal || meal;

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (!currentMeal) return;
    
    const food = currentMeal.foods[index];
    const ratio = newQuantity / food.quantity_grams;
    
    const updatedFoods = [...currentMeal.foods];
    updatedFoods[index] = {
      ...food,
      quantity_grams: newQuantity,
      calories: Math.round(food.calories * ratio),
      protein_grams: Math.round(food.protein_grams * ratio * 10) / 10,
      carbs_grams: Math.round(food.carbs_grams * ratio * 10) / 10,
      fat_grams: Math.round(food.fat_grams * ratio * 10) / 10,
      fiber_grams: Math.round(food.fiber_grams * ratio * 10) / 10,
      sodium_mg: Math.round(food.sodium_mg * ratio),
    };
    
    // Recalculate totals
    const totals = updatedFoods.reduce(
      (acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein_grams,
        carbs: acc.carbs + f.carbs_grams,
        fat: acc.fat + f.fat_grams,
        fiber: acc.fiber + f.fiber_grams,
        sodium: acc.sodium + f.sodium_mg,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
    );
    
    setEditedMeal({
      ...currentMeal,
      foods: updatedFoods,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein * 10) / 10,
      total_carbs: Math.round(totals.carbs * 10) / 10,
      total_fat: Math.round(totals.fat * 10) / 10,
      total_fiber: Math.round(totals.fiber * 10) / 10,
      total_sodium: Math.round(totals.sodium),
    });
    
    setEditingIndex(null);
  };

  const removeFood = (index: number) => {
    if (!currentMeal) return;
    
    const updatedFoods = currentMeal.foods.filter((_, i) => i !== index);
    
    const totals = updatedFoods.reduce(
      (acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein_grams,
        carbs: acc.carbs + f.carbs_grams,
        fat: acc.fat + f.fat_grams,
        fiber: acc.fiber + f.fiber_grams,
        sodium: acc.sodium + f.sodium_mg,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
    );
    
    setEditedMeal({
      ...currentMeal,
      foods: updatedFoods,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein * 10) / 10,
      total_carbs: Math.round(totals.carbs * 10) / 10,
      total_fat: Math.round(totals.fat * 10) / 10,
      total_fiber: Math.round(totals.fiber * 10) / 10,
      total_sodium: Math.round(totals.sodium),
    });
  };

  const handleConfirm = () => {
    if (currentMeal) {
      onConfirm(currentMeal);
    }
  };

  const handleClose = () => {
    setEditedMeal(null);
    setEditingIndex(null);
    onClose();
  };

  if (!currentMeal) return null;

  const mealInfo = mealTypeLabels[currentMeal.meal_type] || mealTypeLabels.lunch;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            Confirmar Refeição
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original transcription */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Você disse:</p>
            <p className="text-sm italic">"{currentMeal.original_text}"</p>
          </div>

          {/* Meal type */}
          <div className="flex items-center gap-2 text-sm">
            <span>{mealInfo.icon}</span>
            <span className="font-medium">{mealInfo.label}</span>
          </div>

          {/* Foods list */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Alimentos identificados:</p>
            <AnimatePresence>
              {currentMeal.foods.map((food, index) => (
                <motion.div
                  key={`${food.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card border border-border rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{food.name}</p>
                      {editingIndex === index ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            defaultValue={food.quantity_grams}
                            className="w-20 h-7 text-xs"
                            onBlur={(e) => handleQuantityChange(index, parseInt(e.target.value) || food.quantity_grams)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleQuantityChange(index, parseInt((e.target as HTMLInputElement).value) || food.quantity_grams);
                              }
                            }}
                            autoFocus
                          />
                          <span className="text-xs text-muted-foreground">gramas</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{food.quantity_grams}g</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {food.confidence < 0.7 && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:bg-destructive/10"
                        onClick={() => removeFood(index)}
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                    <div className="bg-muted/50 rounded px-2 py-1 text-center">
                      <span className="block font-medium text-foreground">{food.calories}</span>
                      kcal
                    </div>
                    <div className="bg-blue-500/10 rounded px-2 py-1 text-center">
                      <span className="block font-medium text-blue-500">{food.protein_grams}g</span>
                      prot
                    </div>
                    <div className="bg-yellow-500/10 rounded px-2 py-1 text-center">
                      <span className="block font-medium text-yellow-500">{food.carbs_grams}g</span>
                      carb
                    </div>
                    <div className="bg-red-500/10 rounded px-2 py-1 text-center">
                      <span className="block font-medium text-red-500">{food.fat_grams}g</span>
                      gord
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Water */}
          {currentMeal.water_ml > 0 && (
            <div className="flex items-center gap-2 bg-blue-500/10 rounded-lg p-3">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="text-sm">
                <span className="font-medium">{currentMeal.water_ml}ml</span> de água
              </span>
            </div>
          )}

          {/* Totals */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Total da refeição</span>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-primary" />
                <span className="font-bold text-lg">{currentMeal.total_calories} kcal</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <span className="block font-semibold text-blue-500">{currentMeal.total_protein}g</span>
                <span className="text-muted-foreground">Proteína</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-yellow-500">{currentMeal.total_carbs}g</span>
                <span className="text-muted-foreground">Carbos</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-red-500">{currentMeal.total_fat}g</span>
                <span className="text-muted-foreground">Gordura</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-green-500">{currentMeal.total_fiber}g</span>
                <span className="text-muted-foreground">Fibra</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleConfirm}
              disabled={isLoading || currentMeal.foods.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
