import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Droplets, 
  Plus,
  Flame,
  Search,
  TrendingUp,
  AlertCircle,
  Trash2,
  ChevronRight,
  Target,
  Dumbbell,
  Camera
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { PhotoMealScanner } from '@/components/academiapro/nutrition/PhotoMealScanner';
import { MealConfirmationModal } from '@/components/academiapro/nutrition/MealConfirmationModal';
import { NutritionAIChat } from '@/components/academiapro/nutrition/NutritionAIChat';
import { NutritionProgressCharts } from '@/components/academiapro/nutrition/NutritionProgressCharts';
import { useWorkoutCalorieAdjustment } from '@/hooks/useWorkoutCalorieAdjustment';

interface NutritionGoals {
  id: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  water_ml: number;
}

interface MealLog {
  id: string;
  food_name: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  quantity_grams: number;
  meal_type: string;
  logged_at: string;
}

interface HydrationLog {
  id: string;
  amount_ml: number;
  logged_at: string;
}

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
}

interface ParsedMeal {
  foods: Array<{
    name: string;
    quantity_grams: number;
    calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
    fiber_grams: number;
    sodium_mg: number;
    confidence: number;
  }>;
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

const mealTypes = [
  { value: 'breakfast', label: 'Café da Manhã', icon: '🌅' },
  { value: 'lunch', label: 'Almoço', icon: '☀️' },
  { value: 'snack', label: 'Lanche', icon: '🍎' },
  { value: 'dinner', label: 'Jantar', icon: '🌙' },
];

export default function GymNutritionPage() {
  const { user } = useGymAuth();
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [isLoading, setIsLoading] = useState(true);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showProgressCharts, setShowProgressCharts] = useState(false);
  const [showPhotoScanner, setShowPhotoScanner] = useState(false);

  // Photo scanning states
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [parsedMeal, setParsedMeal] = useState<ParsedMeal | null>(null);
  const [showMealConfirmation, setShowMealConfirmation] = useState(false);
  const [isSavingMeal, setIsSavingMeal] = useState(false);

  // Workout integration
  const { workoutData } = useWorkoutCalorieAdjustment(
    user?.id,
    goals?.daily_calories || 2000
  );

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadGoals(),
      loadMealLogs(),
      loadHydrationLogs(),
      loadFoodItems()
    ]);
    setIsLoading(false);
  };

  const loadGoals = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('gym_nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading goals:', error);
        return;
      }
      
      if (data) {
        setGoals(data as unknown as NutritionGoals);
      } else {
        // Create default goals
        const defaultGoals = {
          user_id: user.id,
          daily_calories: 2000,
          protein_grams: 150,
          carbs_grams: 200,
          fat_grams: 70,
          water_ml: 2500
        };
        const { data: newGoals, error: insertError } = await supabase
          .from('gym_nutrition_goals')
          .insert(defaultGoals)
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating goals:', insertError);
        } else if (newGoals) {
          setGoals(newGoals as unknown as NutritionGoals);
        }
      }
    } catch (err) {
      console.error('Error in loadGoals:', err);
    }
  };

  const loadMealLogs = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('gym_meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: true });
      
      if (error) {
        console.error('Error loading meals:', error);
        return;
      }
      
      if (data) setMealLogs(data as unknown as MealLog[]);
    } catch (err) {
      console.error('Error in loadMealLogs:', err);
    }
  };

  const loadHydrationLogs = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('gym_hydration_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: true });
      
      if (error) {
        console.error('Error loading hydration:', error);
        return;
      }
      
      if (data) setHydrationLogs(data as unknown as HydrationLog[]);
    } catch (err) {
      console.error('Error in loadHydrationLogs:', err);
    }
  };

  const loadFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gym_food_items')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error loading food items:', error);
        return;
      }
      
      if (data) setFoodItems(data as unknown as FoodItem[]);
    } catch (err) {
      console.error('Error in loadFoodItems:', err);
    }
  };

  const filteredFoods = foodItems.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMeal = async () => {
    if (!selectedFood || !quantity || !user?.id) {
      toast.error('Selecione um alimento e quantidade');
      return;
    }

    const multiplier = parseFloat(quantity) / 100;
    const mealData = {
      user_id: user.id,
      food_item_id: selectedFood.id,
      food_name: selectedFood.name,
      calories: Math.round(selectedFood.calories_per_100g * multiplier),
      protein_grams: Math.round(selectedFood.protein_per_100g * multiplier * 10) / 10,
      carbs_grams: Math.round(selectedFood.carbs_per_100g * multiplier * 10) / 10,
      fat_grams: Math.round(selectedFood.fat_per_100g * multiplier * 10) / 10,
      quantity_grams: parseFloat(quantity),
      meal_type: selectedMealType
    };

    try {
      const { error } = await supabase
        .from('gym_meal_logs')
        .insert(mealData);

      if (error) {
        console.error('Error adding meal:', error);
        toast.error('Erro ao registrar refeição');
      } else {
        toast.success('Refeição registrada!');
        loadMealLogs();
        setSelectedFood(null);
        setQuantity('100');
        setShowFoodSearch(false);
      }
    } catch (err) {
      console.error('Error in addMeal:', err);
      toast.error('Erro ao registrar refeição');
    }
  };

  const addWater = async (amount?: number) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    const waterMl = amount || 250;
    
    try {
      const { error } = await supabase
        .from('gym_hydration_logs')
        .insert({
          user_id: user.id,
          amount_ml: waterMl
        });

      if (error) {
        console.error('Error adding water:', error);
        toast.error('Erro ao registrar água');
      } else {
        toast.success(`+${waterMl}ml registrado!`);
        loadHydrationLogs();
      }
    } catch (err) {
      console.error('Error in addWater:', err);
      toast.error('Erro ao registrar água');
    }
  };

  const deleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('gym_meal_logs')
        .delete()
        .eq('id', mealId);

      if (error) {
        console.error('Error deleting meal:', error);
        toast.error('Erro ao excluir refeição');
      } else {
        toast.success('Refeição excluída');
        loadMealLogs();
      }
    } catch (err) {
      console.error('Error in deleteMeal:', err);
      toast.error('Erro ao excluir refeição');
    }
  };

  // Photo processing
  const handlePhotoAnalysis = useCallback(async (imageBase64: string) => {
    setIsProcessingPhoto(true);
    
    try {
      toast.info('Analisando foto...');
      const { data, error } = await supabase.functions.invoke('nutrition-voice-processor', {
        body: {
          action: 'analyze-photo',
          image: imageBase64
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Erro ao analisar foto');
      }

      console.log('Photo analysis result:', data.meal);
      setParsedMeal(data.meal);
      setShowMealConfirmation(true);
      setShowPhotoScanner(false);

    } catch (error: any) {
      console.error('Photo analysis error:', error);
      toast.error(error.message || 'Erro ao analisar foto');
    } finally {
      setIsProcessingPhoto(false);
    }
  }, []);

  const handleConfirmMeal = useCallback(async (meal: ParsedMeal) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    setIsSavingMeal(true);

    try {
      // Insert all foods
      const mealInserts = meal.foods.map(food => ({
        user_id: user.id,
        food_name: food.name,
        calories: Math.round(food.calories),
        protein_grams: Math.round(food.protein_grams * 10) / 10,
        carbs_grams: Math.round(food.carbs_grams * 10) / 10,
        fat_grams: Math.round(food.fat_grams * 10) / 10,
        quantity_grams: Math.round(food.quantity_grams),
        meal_type: meal.meal_type || 'lunch'
      }));
      
      const { error } = await supabase
        .from('gym_meal_logs')
        .insert(mealInserts);
        
      if (error) {
        console.error('Error inserting meals:', error);
        throw error;
      }

      // Add water if detected
      if (meal.water_ml > 0) {
        await supabase
          .from('gym_hydration_logs')
          .insert({
            user_id: user.id,
            amount_ml: Math.round(meal.water_ml)
          });
      }

      toast.success('Refeição registrada com sucesso!');
      setShowMealConfirmation(false);
      setParsedMeal(null);
      loadMealLogs();
      loadHydrationLogs();

    } catch (error: any) {
      console.error('Save meal error:', error);
      toast.error('Erro ao salvar refeição');
    } finally {
      setIsSavingMeal(false);
    }
  }, [user?.id]);

  const totalCalories = mealLogs.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = mealLogs.reduce((sum, m) => sum + m.protein_grams, 0);
  const totalCarbs = mealLogs.reduce((sum, m) => sum + m.carbs_grams, 0);
  const totalFat = mealLogs.reduce((sum, m) => sum + m.fat_grams, 0);
  const totalWater = hydrationLogs.reduce((sum, h) => sum + h.amount_ml, 0);

  // Use adjusted goal from workout integration
  const effectiveCalorieGoal = workoutData.adjustedCalorieGoal;

  const calorieProgress = effectiveCalorieGoal ? (totalCalories / effectiveCalorieGoal) * 100 : 0;
  const proteinProgress = goals ? (totalProtein / goals.protein_grams) * 100 : 0;
  const carbsProgress = goals ? (totalCarbs / goals.carbs_grams) * 100 : 0;
  const fatProgress = goals ? (totalFat / goals.fat_grams) * 100 : 0;
  const waterProgress = goals ? (totalWater / goals.water_ml) * 100 : 0;

  const remainingCalories = Math.max(0, effectiveCalorieGoal - totalCalories);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">Nutrição</h1>
            <p className="text-muted-foreground text-sm">
              {format(new Date(), "EEEE, d MMM", { locale: ptBR })}
            </p>
          </div>
        </motion.div>

        {/* Main Calorie Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Calorias</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalCalories} / {effectiveCalorieGoal} kcal
            </span>
          </div>
          
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(calorieProgress, 100)}%` }}
              transition={{ duration: 0.8 }}
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
            />
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            <span className="text-primary font-medium">{remainingCalories}</span> kcal restantes
          </p>

          {/* Workout Adjustment Indicator */}
          {workoutData.totalWorkouts > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-3 p-2 bg-primary/5 border border-primary/20 rounded-lg"
            >
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                +{workoutData.estimatedCaloriesBurned} kcal queimadas hoje
                <span className="text-primary ml-1">
                  (+{Math.round(workoutData.estimatedCaloriesBurned * 0.7)} ajustado)
                </span>
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card 
            className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setShowFoodSearch(true)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Manual</p>
                <p className="text-xs text-muted-foreground">Buscar alimento</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setShowPhotoScanner(true)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Scanner</p>
                <p className="text-xs text-muted-foreground">Foto do prato</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Macros Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              Macros
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MacroCard
              label="Proteína"
              value={totalProtein}
              goal={goals?.protein_grams || 150}
              progress={proteinProgress}
              unit="g"
            />
            <MacroCard
              label="Carbos"
              value={totalCarbs}
              goal={goals?.carbs_grams || 200}
              progress={carbsProgress}
              unit="g"
            />
            <MacroCard
              label="Gordura"
              value={totalFat}
              goal={goals?.fat_grams || 70}
              progress={fatProgress}
              unit="g"
            />
          </div>
        </motion.div>

        {/* Hydration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Hidratação</p>
                    <p className="text-xs text-muted-foreground">
                      {totalWater}ml de {goals?.water_ml}ml
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{Math.round(waterProgress)}%</span>
              </div>
              
              <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(waterProgress, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-primary rounded-full"
                />
              </div>

              <div className="flex gap-2">
                {[200, 300, 500].map((ml) => (
                  <Button
                    key={ml}
                    variant="outline"
                    size="sm"
                    onClick={() => addWater(ml)}
                    className="flex-1 text-xs"
                  >
                    +{ml}ml
                  </Button>
                ))}
              </div>

              {waterProgress < 50 && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-muted rounded-lg">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Beba mais água!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setShowProgressCharts(!showProgressCharts)}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span>Progresso Semanal</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${showProgressCharts ? 'rotate-90' : ''}`} />
          </Button>
          
          <AnimatePresence>
            {showProgressCharts && user && goals && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <NutritionProgressCharts 
                  userId={user.id} 
                  dailyCalorieGoal={goals.daily_calories} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Today's Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Utensils className="w-4 h-4 text-muted-foreground" />
              Refeições de Hoje
            </h3>
            <span className="text-xs text-muted-foreground">{mealLogs.length} itens</span>
          </div>

          {mealLogs.length === 0 ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-6 text-center">
                <Utensils className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Nenhuma refeição registrada</p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  Tire uma foto ou adicione manualmente
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {mealLogs.map((meal, index) => (
                <MealCard 
                  key={meal.id} 
                  meal={meal} 
                  onDelete={deleteMeal} 
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Food Search Modal */}
      <AnimatePresence>
        {showFoodSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowFoodSearch(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-card rounded-t-2xl max-h-[85dvh] overflow-hidden border-t border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
                <h3 className="font-medium text-center text-foreground">Adicionar Alimento</h3>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85dvh-5rem)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>

                {searchQuery && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredFoods.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        Nenhum alimento encontrado
                      </p>
                    ) : (
                      filteredFoods.slice(0, 10).map((food) => (
                        <button
                          key={food.id}
                          onClick={() => setSelectedFood(food)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedFood?.id === food.id
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-muted hover:bg-muted/80 border border-transparent'
                          }`}
                        >
                          <p className="font-medium text-foreground text-sm">{food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {food.calories_per_100g} kcal • P:{food.protein_per_100g}g • C:{food.carbs_per_100g}g • G:{food.fat_per_100g}g
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {selectedFood && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="font-medium text-foreground text-sm">{selectedFood.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Quantidade (g)</label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Refeição</label>
                        <select
                          value={selectedMealType}
                          onChange={(e) => setSelectedMealType(e.target.value)}
                          className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm text-foreground"
                        >
                          {mealTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFood(null);
                          setShowFoodSearch(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={addMeal}>
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Scanner Modal */}
      <AnimatePresence>
        {showPhotoScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPhotoScanner(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-card rounded-2xl overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-center text-foreground">Scanner de Refeição</h3>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Tire uma foto ou selecione da galeria
                </p>
              </div>

              <div className="p-6">
                <PhotoMealScanner
                  onPhotoAnalyzed={handlePhotoAnalysis}
                  isProcessing={isProcessingPhoto}
                />
              </div>

              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowPhotoScanner(false)}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal Confirmation Modal */}
      <MealConfirmationModal
        isOpen={showMealConfirmation}
        onClose={() => {
          setShowMealConfirmation(false);
          setParsedMeal(null);
        }}
        meal={parsedMeal}
        onConfirm={handleConfirmMeal}
        isLoading={isSavingMeal}
      />

      {/* AI Chat Assistant */}
      <NutritionAIChat
        currentMacros={{
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          water: totalWater
        }}
        nutritionGoals={goals}
      />
    </div>
  );
}

function MacroCard({ 
  label, 
  value, 
  goal, 
  progress, 
  unit 
}: { 
  label: string; 
  value: number; 
  goal: number; 
  progress: number; 
  unit: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-lg font-semibold text-foreground mt-1">
          {value.toFixed(0)}
          <span className="text-xs text-muted-foreground font-normal ml-0.5">{unit}</span>
        </p>
        <div className="relative h-1 bg-muted rounded-full overflow-hidden mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8 }}
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Meta: {goal}{unit}</p>
      </CardContent>
    </Card>
  );
}

function MealCard({ 
  meal, 
  onDelete, 
  index 
}: { 
  meal: MealLog; 
  onDelete: (id: string) => void;
  index: number;
}) {
  const mealType = mealTypes.find(t => t.value === meal.meal_type);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{mealType?.icon || '🍽️'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{meal.food_name}</p>
              <p className="text-xs text-muted-foreground">
                {meal.quantity_grams}g • {format(new Date(meal.logged_at), 'HH:mm')}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-foreground">{meal.calories}</p>
              <p className="text-[10px] text-muted-foreground">kcal</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 hover:bg-destructive/10 flex-shrink-0"
              onClick={() => onDelete(meal.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
