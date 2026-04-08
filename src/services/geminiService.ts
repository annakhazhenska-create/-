import { GoogleGenAI } from "@google/genai";
import { Transaction, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getBudgetAdvice(transactions: Transaction[], categories: Category[]) {
  try {
    const summary = transactions.reduce((acc, t) => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Інше';
      if (t.type === 'expense') {
        acc.expenses[cat] = (acc.expenses[cat] || 0) + t.amount;
        acc.totalExpenses += t.amount;
      } else {
        acc.totalIncome += t.amount;
      }
      return acc;
    }, { expenses: {} as Record<string, number>, totalExpenses: 0, totalIncome: 0 });

    const prompt = `
      Ти - фінансовий експерт. Проаналізуй наступні дані про бюджет користувача та дай 3 короткі, практичні поради українською мовою.
      
      Загальний дохід: ${summary.totalIncome} грн
      Загальні витрати: ${summary.totalExpenses} грн
      Витрати по категоріях: ${JSON.stringify(summary.expenses)}
      
      Поради мають бути конкретними та допомагати заощаджувати або краще планувати.
      Поверни відповідь у форматі JSON: { "advice": ["порада 1", "порада 2", "порада 3"] }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const text = response.text || "";
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).advice as string[];
    }
    
    return [
      "Спробуйте відкладати 10% доходу щомісяця.",
      "Перегляньте витрати на необов'язкові категорії.",
      "Створіть резервний фонд для непередбачуваних витрат."
    ];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["Не вдалося отримати поради від AI. Спробуйте пізніше."];
  }
}
