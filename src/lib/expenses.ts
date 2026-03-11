import { Expense, ExpenseSettlement, MemberBalance, SimplifiedDebt, User } from "../types";

/**
 * Compute net balances for each group member.
 * Positive = others owe you. Negative = you owe others.
 */
export function computeBalances(
  expenses: Expense[],
  settlements: ExpenseSettlement[],
  members: { user_id: string; user?: User }[],
): MemberBalance[] {
  const balanceMap = new Map<string, number>();
  const userMap = new Map<string, User>();

  // Initialize all members
  for (const m of members) {
    balanceMap.set(m.user_id, 0);
    if (m.user) userMap.set(m.user_id, m.user);
  }

  // Process expenses
  for (const expense of expenses) {
    if (!expense.splits) continue;

    // The payer gets credit for the total they paid
    balanceMap.set(
      expense.paid_by,
      (balanceMap.get(expense.paid_by) ?? 0) + Number(expense.amount),
    );

    // Each person in the split owes their share
    for (const split of expense.splits) {
      balanceMap.set(
        split.user_id,
        (balanceMap.get(split.user_id) ?? 0) - Number(split.amount),
      );
    }

    if (expense.user) userMap.set(expense.paid_by, expense.user);
    for (const split of expense.splits) {
      if (split.user) userMap.set(split.user_id, split.user);
    }
  }

  // Process settlements
  for (const s of settlements) {
    const amount = Number(s.amount);
    balanceMap.set(s.paid_by, (balanceMap.get(s.paid_by) ?? 0) + amount);
    balanceMap.set(s.paid_to, (balanceMap.get(s.paid_to) ?? 0) - amount);
    if (s.payer) userMap.set(s.paid_by, s.payer);
    if (s.payee) userMap.set(s.paid_to, s.payee);
  }

  const result: MemberBalance[] = [];
  for (const [userId, balance] of balanceMap) {
    const user = userMap.get(userId);
    if (!user) continue;
    result.push({
      user_id: userId,
      user,
      net_balance: Math.round(balance * 100) / 100,
    });
  }
  return result;
}

/**
 * Simplify debts using a greedy algorithm.
 * Minimizes the number of transactions needed.
 */
export function simplifyDebts(balances: MemberBalance[]): SimplifiedDebt[] {
  // Filter out zero balances
  const creditors: { user: User; amount: number }[] = [];
  const debtors: { user: User; amount: number }[] = [];

  for (const b of balances) {
    if (b.net_balance > 0.01) {
      creditors.push({ user: b.user, amount: b.net_balance });
    } else if (b.net_balance < -0.01) {
      debtors.push({ user: b.user, amount: Math.abs(b.net_balance) });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const debts: SimplifiedDebt[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
    if (transfer > 0.01) {
      debts.push({
        from_user: debtors[di].user,
        to_user: creditors[ci].user,
        amount: Math.round(transfer * 100) / 100,
      });
    }
    creditors[ci].amount -= transfer;
    debtors[di].amount -= transfer;

    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }

  return debts;
}

/**
 * Compute split amounts for an expense.
 * Handles rounding: remainder cents go to the first member.
 */
export function computeSplitAmounts(
  totalAmount: number,
  memberIds: string[],
  customAmounts?: Record<string, number>,
): { user_id: string; amount: number }[] {
  if (customAmounts) {
    return memberIds.map((uid) => ({
      user_id: uid,
      amount: customAmounts[uid] ?? 0,
    }));
  }

  // Equal split
  const count = memberIds.length;
  if (count === 0) return [];

  const perPerson = Math.floor((totalAmount * 100) / count) / 100;
  const remainder = Math.round((totalAmount - perPerson * count) * 100) / 100;

  return memberIds.map((uid, i) => ({
    user_id: uid,
    amount: i === 0 ? perPerson + remainder : perPerson,
  }));
}
