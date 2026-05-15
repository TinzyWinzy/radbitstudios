
"use client";

import { useState, useEffect, useContext, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, Save, Loader2, Share2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/contexts/auth-context";
import { db } from "@/lib/firebase/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';

const budgetItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  amount: z.number().positive('Amount must be positive').max(999999999, 'Amount is too large'),
});
type BudgetItem = {
  id: number;
  name: string;
  amount: number;
};

export default function BudgetCalculatorPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [income, setIncome] = useState<BudgetItem[]>([]);
  const [expenses, setExpenses] = useState<BudgetItem[]>([]);

  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    };

    const fetchBudget = async () => {
        setIsLoading(true);
        const budgetDocRef = doc(db, 'budgets', user.uid);
        try {
            const docSnap = await getDoc(budgetDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setIncome(data.income || []);
                setExpenses(data.expenses || []);
            } else {
                console.log("No budget document found for user, starting fresh.");
                setIncome([]);
                setExpenses([]);
            }
        } catch (error) {
             console.error("Error fetching budget data:", error);
             toast({
                title: "Error Loading Budget",
                description: "Could not fetch your saved budget data. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    fetchBudget();
  }, [user, toast]);


  const addItem = (
    type: "income" | "expense"
  ) => {
    const name = type === 'income' ? incomeName : expenseName;
    const amount = type === 'income' ? parseFloat(incomeAmount) : parseFloat(expenseAmount);

    const validation = budgetItemSchema.safeParse({ name: name.trim(), amount });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ title: "Invalid Input", description: firstError.message, variant: "destructive" });
      return;
    }

    const newItem: BudgetItem = {
      id: Date.now(),
      name,
      amount,
    };

    if (type === "income") {
      setIncome([...income, newItem]);
      setIncomeName("");
      setIncomeAmount("");
    } else {
      setExpenses([...expenses, newItem]);
      setExpenseName("");
      setExpenseAmount("");
    }
  };

  const removeItem = (type: "income" | "expense", id: number) => {
    if (type === "income") {
      setIncome(income.filter((item) => item.id !== id));
    } else {
      setExpenses(expenses.filter((item) => item.id !== id));
    }
  };
  
  const handleSaveBudget = async () => {
    if (!user) {
        toast({
            title: "Not Authenticated",
            description: "You must be logged in to save your budget.",
            variant: "destructive"
        });
        return;
    }
    
    setIsSaving(true);
    try {
        const budgetDocRef = doc(db, 'budgets', user.uid);
        await setDoc(budgetDocRef, {
            income,
            expenses,
            updatedAt: serverTimestamp(),
            userId: user.uid
        }, { merge: true });
        
        toast({
            title: "Budget Saved!",
            description: "Your financial data has been successfully saved."
        });

    } catch (error) {
        console.error("Error saving budget: ", error);
        toast({
            title: "Save Failed",
            description: "Could not save your budget. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  };

  const totalIncome = income.reduce((acc, item) => acc + item.amount, 0);
  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const handleDownload = async () => {
    if (!summaryRef.current) return;
    setIsDownloading(true);

    try {
        const html2canvas = (await import('html2canvas')).default;
        const { default: jsPDF } = await import('jspdf');
        const canvas = await html2canvas(summaryRef.current, {
            useCORS: true,
            scale: 2, 
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('Radbit_Budget_Summary.pdf');

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const shareText = `*My Budget Summary from Radbit SME Hub:*\n\n- Total Income: $${totalIncome.toFixed(2)}\n- Total Expenses: $${totalExpenses.toFixed(2)}\n- *Net Balance: $${netBalance.toFixed(2)}*`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Calculator</h1>
            <p className="text-muted-foreground mt-2">
            Plan your finances by tracking your income and expenses.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleSaveBudget} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save Budget'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download
            </Button>
        </div>
      </div>

      <div ref={summaryRef} className="grid gap-8 md:grid-cols-3">
        {/* Summary Card */}
        <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Your real-time financial balance.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                </div>
                 <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                </div>
                 <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                    <p className={cn("text-2xl font-bold", netBalance >= 0 ? "text-primary" : "text-destructive")}>${netBalance.toFixed(2)}</p>
                </div>
            </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="md:col-span-3 lg:col-span-1">
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => {e.preventDefault(); addItem("income")}} className="space-y-2">
              <Label htmlFor="income-name">Source Name</Label>
              <Input id="income-name" placeholder="e.g., Sales" value={incomeName} onChange={(e) => setIncomeName(e.target.value)} />
              <Label htmlFor="income-amount">Amount</Label>
              <Input id="income-amount" type="number" placeholder="1000" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Income
              </Button>
            </form>
            <Separator />
            <div className="space-y-2">
                {income.length > 0 ? income.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">${item.amount.toFixed(2)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem("income", item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                )) : <p className="text-xs text-muted-foreground text-center">No income sources added yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <form onSubmit={(e) => {e.preventDefault(); addItem("expense")}} className="space-y-2">
              <Label htmlFor="expense-name">Expense Name</Label>
              <Input id="expense-name" placeholder="e.g., Rent" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} />
              <Label htmlFor="expense-amount">Amount</Label>
              <Input id="expense-amount" type="number" placeholder="500" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </form>
            <Separator />
             <div className="space-y-2">
                {expenses.length > 0 ? expenses.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">${item.amount.toFixed(2)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem("expense", item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                )) : <p className="text-xs text-muted-foreground text-center">No expenses added yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
