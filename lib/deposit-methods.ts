/** Single source of truth for deposit method ids and labels (admin + user dashboard). Admin enables which methods show on user Deposit page. */
export const DEPOSIT_METHOD_IDS = ["crypto"] as const;
export type DepositMethodId = (typeof DEPOSIT_METHOD_IDS)[number];

export const DEPOSIT_METHODS: { id: DepositMethodId; title: string; subtitle: string }[] = [
  { id: "crypto", title: "Deposit", subtitle: "Upload proof after payment. Admin will confirm." },
];
