export const ACCOUNT_TYPES = ["spot", "profit", "initial_deposit", "mining", "bonus"] as const;
export const LABELS: Record<(typeof ACCOUNT_TYPES)[number], string> = {
  spot: "Spot Account",
  profit: "Profit Account",
  initial_deposit: "Initial Deposit",
  mining: "Mining Account",
  bonus: "Bonus",
};
