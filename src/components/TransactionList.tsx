import { Trash2, Utensils, Car, Home, Gamepad2, HeartPulse, ShoppingBag, Wallet, MoreHorizontal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Transaction, Category } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Utensils, Car, Home, Gamepad2, HeartPulse, ShoppingBag, Wallet, MoreHorizontal
};

export function TransactionList({ transactions, categories, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-200">
        <p className="text-zinc-500">Транзакцій поки немає. Додайте першу!</p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="w-[100px]">Дата</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead className="hidden md:table-cell">Опис</TableHead>
              <TableHead className="text-right">Сума</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => {
              const category = categories.find(c => c.id === t.categoryId);
              const Icon = ICON_MAP[category?.icon || 'MoreHorizontal'];
              
              return (
                <TableRow key={t.id} className="group">
                  <TableCell className="text-xs text-zinc-500">
                    {format(parseISO(t.date), 'dd MMM', { locale: uk })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${category?.color}20`, color: category?.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{category?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-zinc-600">
                    {t.description || '-'}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ₴
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
