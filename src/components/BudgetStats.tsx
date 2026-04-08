import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction, Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BudgetStatsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function BudgetStats({ transactions, categories }: BudgetStatsProps) {
  const expensesByCategory = useMemo(() => {
    const data = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(data).map(([id, value]) => ({
      name: categories.find(c => c.id === id)?.name || 'Інше',
      value,
      color: categories.find(c => c.id === id)?.color || '#94a3b8'
    })).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const dailyData = useMemo(() => {
    const data = transactions.reduce((acc, t) => {
      const date = t.date;
      if (!acc[date]) acc[date] = { date, income: 0, expenses: 0 };
      if (t.type === 'income') acc[date].income += t.amount;
      else acc[date].expenses += t.amount;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Розподіл витрат</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ₴`, 'Сума']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 text-sm italic">
              Немає даних для відображення
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Топ категорій</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {expensesByCategory.slice(0, 5).map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-zinc-500">{item.value.toLocaleString()} ₴ ({Math.round((item.value / totalExpenses) * 100)}%)</span>
              </div>
              <Progress value={(item.value / totalExpenses) * 100} className="h-2" style={{ '--progress-foreground': item.color } as any} />
            </div>
          ))}
          {expensesByCategory.length === 0 && (
            <div className="text-center py-12 text-zinc-400 text-sm italic">
              Додайте витрати, щоб побачити аналітику
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Динаміка (Доходи vs Витрати)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(str) => str.split('-').slice(2).join('.')} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ₴`, '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="income" name="Дохід" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Витрати" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 text-sm italic">
              Немає даних для відображення
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
