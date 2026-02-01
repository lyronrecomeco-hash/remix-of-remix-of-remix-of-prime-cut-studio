import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Droplets, 
  Plus,
  Flame,
  Apple,
  Search
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [waterAmount, setWaterAmount] = useState('250');
  const [isLoading, setIsLoading] = useState(true);
  const [showFoodSearch, setShowFoodSearch] = useState(false);

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

  const addWater = async () => {
    const amount = parseInt(waterAmount);
    if (!amount) return;

    const { error } = await supabase
      .from('gym_hydration_logs' as any)
      .insert({
        user_id: user?.id,
        amount_ml: amount
      });

    if (error) {
      toast.error('Erro ao registrar água');
    } else {
      toast.success(`+${amount}ml registrado!`);
      loadHydrationLogs();
    }
  };

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

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-0 space-y-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Apple className="w-7 h-7 text-primary" />
          NutriTrack
        </h1>
        <p className="text-muted-foreground text-sm">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary/20 to-destructive/10 border border-primary/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm">Calorias consumidas</p>
            <p className="text-3xl font-bold">
              {totalCalories}
              <span className="text-lg text-muted-foreground font-normal">
                /{goals?.daily_calories || 2000}
              </span>
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary" />
          </div>
        </div>
        <Progress value={Math.min(calorieProgress, 100)} className="h-3 bg-muted" />
        <p className="text-xs text-muted-foreground mt-2">
          {goals ? goals.daily_calories - totalCalories : 0} kcal restantes
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Proteína</span>
          </div>
          <p className="text-lg font-bold">{totalProtein.toFixed(0)}g</p>
          <Progress value={Math.min(proteinProgress, 100)} className="h-1.5 mt-2 bg-muted" />
          <p className="text-[10px] text-muted-foreground mt-1">Meta: {goals?.protein_grams}g</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Carbos</span>
          </div>
          <p className="text-lg font-bold">{totalCarbs.toFixed(0)}g</p>
          <Progress value={Math.min(carbsProgress, 100)} className="h-1.5 mt-2 bg-muted" />
          <p className="text-[10px] text-muted-foreground mt-1">Meta: {goals?.carbs_grams}g</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Gordura</span>
          </div>
          <p className="text-lg font-bold">{totalFat.toFixed(0)}g</p>
          <Progress value={Math.min(fatProgress, 100)} className="h-1.5 mt-2 bg-muted" />
          <p className="text-[10px] text-muted-foreground mt-1">Meta: {goals?.fat_grams}g</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold">Hidratação</p>
              <p className="text-sm text-muted-foreground">
                {totalWater}ml / {goals?.water_ml}ml
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              className="w-20 h-9 bg-muted border-border text-center"
            />
            <Button
              size="sm"
              onClick={addWater}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Progress value={Math.min(waterProgress, 100)} className="h-2 bg-muted" />
        <div className="flex justify-between mt-3">
          {[250, 350, 500].map((ml) => (
            <Button
              key={ml}
              variant="outline"
              size="sm"
              onClick={() => setWaterAmount(ml.toString())}
              className="border-border hover:bg-muted text-xs"
            >
              {ml}ml
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            Refeições de Hoje
          </h2>
          <Button
            size="sm"
            onClick={() => setShowFoodSearch(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {showFoodSearch && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>

            {searchQuery && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      selectedFood?.id === food.id
                        ? 'bg-primary/20 border border-primary/50'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <p className="font-medium">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.calories_per_100g} kcal | P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fat_per_100g}g (100g)
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedFood && (
              <div className="space-y-3 pt-3 border-t border-border">
                <p className="font-medium">{selectedFood.name}</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Quantidade (g)</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Refeição</label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="w-full h-10 px-3 bg-muted border border-border rounded-md text-sm"
                    >
                      {mealTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-border"
                    onClick={() => {
                      setSelectedFood(null);
                      setShowFoodSearch(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={addMeal}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full bg-card border border-border">
            <TabsTrigger value="all" className="flex-1">Todas</TabsTrigger>
            {mealTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value} className="flex-1">
                {type.icon}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-2 mt-3">
            {mealLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma refeição registrada hoje
              </p>
            ) : (
              mealLogs.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))
            )}
          </TabsContent>

          {mealTypes.map((type) => (
            <TabsContent key={type.value} value={type.value} className="space-y-2 mt-3">
              {mealLogs.filter(m => m.meal_type === type.value).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma refeição nesta categoria
                </p>
              ) : (
                mealLogs
                  .filter(m => m.meal_type === type.value)
                  .map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}

function MealCard({ meal }: { meal: MealLog }) {
  const mealType = mealTypes.find(t => t.value === meal.meal_type);
  
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mealType?.icon || '🍽️'}</span>
          <div>
            <p className="font-medium">{meal.food_name}</p>
            <p className="text-xs text-muted-foreground">
              {meal.quantity_grams}g • {format(new Date(meal.logged_at), 'HH:mm')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary">{meal.calories} kcal</p>
          <p className="text-xs text-muted-foreground">
            P: {meal.protein_grams}g | C: {meal.carbs_grams}g | G: {meal.fat_grams}g
          </p>
        </div>
      </div>
    </div>
  );
}
