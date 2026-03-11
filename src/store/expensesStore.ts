import { create } from "zustand";
import { computeBalances, simplifyDebts } from "../lib/expenses";
import { getGroupInfo, notifyGroup } from "../lib/pushNotify";
import {
  addExpenseApi,
  addSettlementApi,
  deleteExpenseApi,
  fetchGroupExpenses,
  fetchGroupSettlements,
  supabase,
} from "../lib/supabase";
import { Expense, ExpenseSettlement, MemberBalance, SimplifiedDebt } from "../types";

interface ExpensesStoreState {
  expenses: Expense[];
  settlements: ExpenseSettlement[];
  balances: MemberBalance[];
  simplifiedDebts: SimplifiedDebt[];
  isLoading: boolean;

  fetchExpenses: (groupId: string) => Promise<void>;
  fetchSettlements: (groupId: string) => Promise<void>;
  recalculateBalances: (groupId: string) => Promise<void>;

  addExpense: (
    groupId: string,
    paidBy: string,
    amount: number,
    description: string,
    splitType: string,
    splits: { user_id: string; amount: number }[],
    receiptUrl?: string,
  ) => Promise<void>;

  deleteExpense: (expenseId: string, groupId: string) => Promise<void>;

  settleDebt: (
    groupId: string,
    paidBy: string,
    paidTo: string,
    amount: number,
  ) => Promise<void>;
}

export const useExpensesStore = create<ExpensesStoreState>((set, get) => ({
  expenses: [],
  settlements: [],
  balances: [],
  simplifiedDebts: [],
  isLoading: false,

  fetchExpenses: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const data = await fetchGroupExpenses(groupId);
      set({ expenses: data as Expense[] });
      await get().recalculateBalances(groupId);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSettlements: async (groupId: string) => {
    try {
      const data = await fetchGroupSettlements(groupId);
      set({ settlements: data as ExpenseSettlement[] });
      await get().recalculateBalances(groupId);
    } catch (err) {
      console.warn("Failed to fetch settlements:", err);
    }
  },

  recalculateBalances: async (groupId: string) => {
    const { expenses, settlements } = get();

    // Get group members
    const { data: members, error } = await supabase
      .from("group_members")
      .select("user_id, user:users(*)")
      .eq("group_id", groupId);

    if (error || !members) return;

    const balances = computeBalances(
      expenses,
      settlements,
      members as { user_id: string; user?: any }[],
    );
    const debts = simplifyDebts(balances);
    set({ balances, simplifiedDebts: debts });
  },

  addExpense: async (groupId, paidBy, amount, description, splitType, splits, receiptUrl) => {
    set({ isLoading: true });
    try {
      await addExpenseApi(groupId, paidBy, amount, description, splitType, splits, receiptUrl);
      await get().fetchExpenses(groupId);
      await get().fetchSettlements(groupId);

      const info = await getGroupInfo(groupId);
      if (info) {
        notifyGroup({
          type: "expense_added",
          groupId,
          groupName: info.name,
          groupEmoji: info.emoji,
          data: { amount, description },
        }).catch(() => {});
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExpense: async (expenseId, groupId) => {
    set({ isLoading: true });
    try {
      await deleteExpenseApi(expenseId);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expenseId),
      }));
      await get().recalculateBalances(groupId);

      const info = await getGroupInfo(groupId);
      if (info) {
        notifyGroup({
          type: "expense_deleted",
          groupId,
          groupName: info.name,
          groupEmoji: info.emoji,
        }).catch(() => {});
      }
    } finally {
      set({ isLoading: false });
    }
  },

  settleDebt: async (groupId, paidBy, paidTo, amount) => {
    set({ isLoading: true });
    try {
      await addSettlementApi(groupId, paidBy, paidTo, amount);
      await get().fetchExpenses(groupId);
      await get().fetchSettlements(groupId);

      const info = await getGroupInfo(groupId);
      if (info) {
        notifyGroup({
          type: "settlement_created",
          groupId,
          groupName: info.name,
          groupEmoji: info.emoji,
          data: { amount },
        }).catch(() => {});
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
