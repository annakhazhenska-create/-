/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, BrainCircuit, PieChart as PieChartIcon, List, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Transaction, Category, CATEGORIES } from './types';
import { getBudgetAdvice } from './services/geminiService';

// Components (will be created or inline)
import { AddTransactionDialog } from './components/AddTransactionDialog';
import { TransactionList } from './components/TransactionList';
import { BudgetStats } from './components/BudgetStats';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('budget_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [advice, setAdvice] = useState<string[]>([]);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const currentMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
  }, [transactions]);

  const totals = useMemo(() => {
    return currentMonth.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expenses += t.amount;
      return acc;
    }, { income: 0, expenses: 0 });
  }, [currentMonth]);

  const balance = totals.income - totals.expenses;

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Math.random().toString(36).substring(2, 9),
    };
    setTransactions([transaction, ...transactions]);
    setIsAddDialogOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const fetchAdvice = async () => {
    setIsAdviceLoading(true);
    const newAdvice = await getBudgetAdvice(currentMonth, CATEGORIES);
    setAdvice(newAdvice);
    setIsAdviceLoading(false);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-zinc-200 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Бюджетний Помічник</h1>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-full gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Додати витрату</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Wallet className="w-32 h-32" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-indigo-100">Поточний баланс</CardDescription>
              <CardTitle className="text-3xl font-bold">{balance.toLocaleString()} ₴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-indigo-200">За цей місяць</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardDescription>Доходи</CardDescription>
                <CardTitle className="text-2xl font-bold text-emerald-600">+{totals.income.toLocaleString()} ₴</CardTitle>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <TrendingUp className="text-emerald-600 w-5 h-5" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardDescription>Витрати</CardDescription>
                <CardTitle className="text-2xl font-bold text-rose-600">-{totals.expenses.toLocaleString()} ₴</CardTitle>
              </div>
              <div className="bg-rose-50 p-2 rounded-lg">
                <TrendingDown className="text-rose-600 w-5 h-5" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* AI Advice Section */}
        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-indigo-600 w-5 h-5" />
              <CardTitle className="text-lg">AI Поради</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchAdvice} disabled={isAdviceLoading} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100">
              {isAdviceLoading ? 'Аналізую...' : 'Оновити поради'}
            </Button>
          </CardHeader>
          <CardContent>
            {advice.length > 0 ? (
              <ul className="space-y-3">
                {advice.map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 text-sm text-zinc-600 bg-white p-3 rounded-lg border border-zinc-100 shadow-sm"
                  >
                    <span className="text-indigo-500 font-bold">•</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-zinc-500 text-sm italic">
                Натисніть "Оновити поради", щоб AI проаналізував ваші витрати.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-zinc-100 p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="rounded-lg gap-2">
              <PieChartIcon className="w-4 h-4" />
              Аналітика
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg gap-2">
              <List className="w-4 h-4" />
              Транзакції
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <BudgetStats transactions={currentMonth} categories={CATEGORIES} />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionList 
              transactions={transactions} 
              categories={CATEGORIES} 
              onDelete={handleDeleteTransaction} 
            />
          </TabsContent>
        </Tabs>
      </main>

      <AddTransactionDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onAdd={handleAddTransaction}
        categories={CATEGORIES}
      />
    </div>
  );
}
