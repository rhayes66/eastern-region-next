/**
 * Statuses that mean the member has been granted the money. An admin-recorded
 * grant is created as "Approved"; "Disbursed" marks it as paid out.
 */
export const RECEIVED_BENEFIT_STATUSES = ["Approved", "Disbursed"] as const;

export function totalBenefitsReceived(
  benefits: { amount: number; status: string }[]
): number {
  return benefits
    .filter((b) =>
      (RECEIVED_BENEFIT_STATUSES as readonly string[]).includes(b.status)
    )
    .reduce((s, b) => s + b.amount, 0);
}
