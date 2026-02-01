import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Droplets, 
  Plus,
  Flame,
  Apple,
  Search,
  Mic,
  TrendingUp,
  AlertCircle,
  Trash2,
  ChevronRight,
  Target,
  Zap
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { VoiceMealRecorder } from '@/components/academiapro/nutrition/VoiceMealRecorder';
import { MealConfirmationModal } from '@/components/academiapro/nutrition/MealConfirmationModal';
import { NutritionAIChat } from '@/components/academiapro/nutrition/NutritionAIChat';
import { NutritionProgressCharts } from '@/components/academiapro/nutrition/NutritionProgressCharts';

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

  // Voice recording states
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [parsedMeal, setParsedMeal] = useState<ParsedMeal | null>(null);
  const [showMealConfirmation, setShowMealConfirmation] = useState(false);
  const [isSavingMeal, setIsSavingMeal] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const friendlyFunctionErrorMessage = (err: any, data: any, fallback: string) => {
    const raw = (data?.error as string | undefined) || (err?.message as string | undefined) || fallback;
    const status = err?.context?.status || err?.status || data?.status;

    if (status === 429 || /insufficient_quota|quota|429/i.test(raw)) {
      return 'Limite de uso do serviço de transcrição atingido. Tente novamente em alguns minutos ou ajuste o plano/créditos do provedor.';
    }

    if (status === 401 || /401|unauthorized/i.test(raw)) {
      return 'Serviço de transcrição não autorizado. Verifique a configuração do provedor.';
    }

    return raw;
  };

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
    const { data } = await supabase
      .from('gym_nutrition_goals' as any)
      .select('*')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setGoals(data as unknown as NutritionGoals);
    } else {
      const defaultGoals = {
        user_id: user?.id,
        daily_calories: 2000,
        protein_grams: 150,
        carbs_grams: 200,
        fat_grams: 70,
        water_ml: 2500
      };
      const { data: newGoals } = await supabase
        .from('gym_nutrition_goals' as any)
        .insert(defaultGoals)
        .select()
        .single();
      if (newGoals) setGoals(newGoals as unknown as NutritionGoals);
    }
  };

  const loadMealLogs = async () => {
    const { data } = await supabase
      .from('gym_meal_logs' as any)
      .select('*')
      .eq('user_id', user?.id)
      .gte('logged_at', `${today}T00:00:00`)
      .lte('logged_at', `${today}T23:59:59`)
      .order('logged_at', { ascending: true });
    
    if (data) setMealLogs(data as unknown as MealLog[]);
  };

  const loadHydrationLogs = async () => {
    const { data } = await supabase
      .from('gym_hydration_logs' as any)
      .select('*')
      .eq('user_id', user?.id)
      .gte('logged_at', `${today}T00:00:00`)
      .lte('logged_at', `${today}T23:59:59`)
      .order('logged_at', { ascending: true });
    
    if (data) setHydrationLogs(data as unknown as HydrationLog[]);
  };

  const loadFoodItems = async () => {
    const { data } = await supabase
      .from('gym_food_items' as any)
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (data) setFoodItems(data as unknown as FoodItem[]);
  };

  const filteredFoods = foodItems.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMeal = async () => {
    if (!selectedFood || !quantity) return;

    const multiplier = parseFloat(quantity) / 100;
    const mealData = {
      user_id: user?.id,
      food_item_id: selectedFood.id,
      food_name: selectedFood.name,
      calories: Math.round(selectedFood.calories_per_100g * multiplier),
      protein_grams: Math.round(selectedFood.protein_per_100g * multiplier * 10) / 10,
      carbs_grams: Math.round(selectedFood.carbs_per_100g * multiplier * 10) / 10,
      fat_grams: Math.round(selectedFood.fat_per_100g * multiplier * 10) / 10,
      quantity_grams: parseFloat(quantity),
      meal_type: selectedMealType
    };

    const { error } = await supabase
      .from('gym_meal_logs' as any)
      .insert(mealData);

    if (error) {
      toast.error('Erro ao registrar refeição');
    } else {
      toast.success('Refeição registrada!');
      loadMealLogs();
      setSelectedFood(null);
      setQuantity('100');
      setShowFoodSearch(false);
    }
  };

  const addWater = async (amount?: number) => {
    const waterMl = amount || 250;
    const { error } = await supabase
      .from('gym_hydration_logs' as any)
      .insert({
        user_id: user?.id,
        amount_ml: waterMl
      });

    if (error) {
      toast.error('Erro ao registrar água');
    } else {
      toast.success(`+${waterMl}ml registrado!`);
      loadHydrationLogs();
    }
  };

  const deleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from('gym_meal_logs' as any)
      .delete()
      .eq('id', mealId);

    if (error) {
      toast.error('Erro ao excluir refeição');
    } else {
      toast.success('Refeição excluída');
      loadMealLogs();
    }
  };

  // Voice processing
  const handleVoiceTranscription = useCallback(async (audioBase64: string) => {
    setIsProcessingVoice(true);
    
    try {
      toast.info('Transcrevendo áudio...');
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('nutrition-voice-processor', {
        body: {
          action: 'transcribe',
          audio: audioBase64
        }
      });

      if (transcriptionError || !transcriptionData?.success) {
        throw new Error(
          friendlyFunctionErrorMessage(transcriptionError, transcriptionData, 'Erro na transcrição')
        );
      }

      const transcribedText = transcriptionData.text;
      console.log('Transcribed:', transcribedText);

      toast.info('Analisando refeição com IA...');
      const { data: parseData, error: parseError } = await supabase.functions.invoke('nutrition-voice-processor', {
        body: {
          action: 'parse-meal',
          text: transcribedText
        }
      });

      if (parseError || !parseData?.success) {
        throw new Error(
          (parseData?.error as string | undefined) || (parseError?.message as string | undefined) || 'Erro ao analisar refeição'
        );
      }

      console.log('Parsed meal:', parseData.meal);
      setParsedMeal(parseData.meal);
      setShowMealConfirmation(true);

    } catch (error: any) {
      console.error('Voice processing error:', error);
      toast.error(error.message || 'Erro ao processar áudio');
    } finally {
      setIsProcessingVoice(false);
    }
  }, []);

  const handleConfirmMeal = useCallback(async (meal: ParsedMeal) => {
    setIsSavingMeal(true);

    try {
      for (const food of meal.foods) {
        await supabase
          .from('gym_meal_logs' as any)
          .insert({
            user_id: user?.id,
            food_name: food.name,
            calories: food.calories,
            protein_grams: food.protein_grams,
            carbs_grams: food.carbs_grams,
            fat_grams: food.fat_grams,
            quantity_grams: food.quantity_grams,
            meal_type: meal.meal_type
          });
      }

      if (meal.water_ml > 0) {
        await addWater(meal.water_ml);
      }

      toast.success('Refeição registrada com sucesso!');
      setShowMealConfirmation(false);
      setParsedMeal(null);
      loadMealLogs();

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

  const calorieProgress = goals ? (totalCalories / goals.daily_calories) * 100 : 0;
  const proteinProgress = goals ? (totalProtein / goals.protein_grams) * 100 : 0;
  const carbsProgress = goals ? (totalCarbs / goals.carbs_grams) * 100 : 0;
  const fatProgress = goals ? (totalFat / goals.fat_grams) * 100 : 0;
  const waterProgress = goals ? (totalWater / goals.water_ml) * 100 : 0;

  const remainingCalories = Math.max(0, (goals?.daily_calories || 2000) - totalCalories);

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
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background px-4 pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">NutriTrack</h1>
            <p className="text-muted-foreground text-sm">
              {format(new Date(), "EEEE, d MMM", { locale: ptBR })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Apple className="w-6 h-6 text-primary" />
          </div>
        </motion.div>

        {/* Main Calorie Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 flex items-center justify-center"
        >
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted/30"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 * (1 - Math.min(calorieProgress, 100) / 100)}
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="w-5 h-5 text-primary mb-1" />
              <span className="text-3xl font-bold text-foreground">{totalCalories}</span>
              <span className="text-xs text-muted-foreground">/ {goals?.daily_calories} kcal</span>
            </div>
          </div>
        </motion.div>

        {/* Remaining calories */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground mt-2"
        >
          <span className="text-primary font-semibold">{remainingCalories}</span> kcal restantes
        </motion.p>
      </div>

      {/* Content */}
      <div className="px-4 -mt-2 space-y-4">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <Card 
            className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setShowFoodSearch(true)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Adicionar</p>
                <p className="text-xs text-muted-foreground">Registro manual</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">Por Voz</p>
                  <p className="text-xs text-muted-foreground">Fale sua refeição</p>
                </div>
              </div>
              <div className="mt-3">
                <VoiceMealRecorder
                  onTranscription={handleVoiceTranscription}
                  isProcessing={isProcessingVoice}
                />
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
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Macros
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MacroCard
              label="Proteína"
              value={totalProtein}
              goal={goals?.protein_grams || 150}
              progress={proteinProgress}
              variant="strong"
              unit="g"
            />
            <MacroCard
              label="Carbos"
              value={totalCarbs}
              goal={goals?.carbs_grams || 200}
              progress={carbsProgress}
              variant="medium"
              unit="g"
            />
            <MacroCard
              label="Gordura"
              value={totalFat}
              goal={goals?.fat_grams || 70}
              progress={fatProgress}
              variant="soft"
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
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Hidratação</p>
                    <p className="text-xs text-muted-foreground">
                      {totalWater}ml de {goals?.water_ml}ml
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">{Math.round(waterProgress)}%</span>
              </div>
              
              <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(waterProgress, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full"
                />
              </div>

              <div className="flex gap-2">
                {[200, 300, 500].map((ml) => (
                  <Button
                    key={ml}
                    variant="outline"
                    size="sm"
                    onClick={() => addWater(ml)}
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-xs"
                  >
                    +{ml}ml
                  </Button>
                ))}
              </div>

              {waterProgress < 50 && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span className="text-xs text-primary">Beba mais água!</span>
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
            className="w-full justify-between border-border hover:bg-muted"
            onClick={() => setShowProgressCharts(!showProgressCharts)}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
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
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" />
              Refeições de Hoje
            </h3>
            <span className="text-xs text-muted-foreground">{mealLogs.length} itens</span>
          </div>

          {mealLogs.length === 0 ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-8 text-center">
                <Utensils className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhuma refeição registrada</p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  Use a voz ou adicione manualmente
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
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowFoodSearch(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-card rounded-t-3xl max-h-[90dvh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-center text-foreground">Adicionar Alimento</h3>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90dvh-6.5rem)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted border-border"
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
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedFood?.id === food.id
                              ? 'bg-primary/20 border-2 border-primary'
                              : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                          }`}
                        >
                          <p className="font-medium text-foreground">{food.name}</p>
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
                    <div className="bg-primary/10 rounded-xl p-3">
                      <p className="font-medium text-primary">{selectedFood.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Quantidade (g)</label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="bg-muted border-border"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Refeição</label>
                        <select
                          value={selectedMealType}
                          onChange={(e) => setSelectedMealType(e.target.value)}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground"
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
                        className="border-border"
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
  variant,
  unit 
}: { 
  label: string; 
  value: number; 
  goal: number; 
  progress: number; 
  variant: 'strong' | 'medium' | 'soft';
  unit: string;
}) {
  const indicatorClass =
    variant === 'strong'
      ? 'bg-primary'
      : variant === 'medium'
        ? 'bg-primary/70'
        : 'bg-primary/40';

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <div className={`w-2 h-2 rounded-full ${indicatorClass}`} />
        </div>
        <p className="text-lg font-bold text-foreground">
          {value.toFixed(0)}
          <span className="text-xs text-muted-foreground font-normal">{unit}</span>
        </p>
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-y-0 left-0 rounded-full ${indicatorClass}`}
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
      <Card className="bg-card border-border hover:border-primary/30 transition-colors">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mealType?.icon || '🍽️'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{meal.food_name}</p>
              <p className="text-xs text-muted-foreground">
                {meal.quantity_grams}g • {format(new Date(meal.logged_at), 'HH:mm')}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-primary">{meal.calories}</p>
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
