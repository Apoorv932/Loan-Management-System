const INTEREST_RATE = 12;

export function calculateLoan(principalAmount: number, tenureDays: number) {
  const interestAmount = Number(
    ((principalAmount * INTEREST_RATE * tenureDays) / (365 * 100)).toFixed(2)
  );
  const totalRepayment = Number((principalAmount + interestAmount).toFixed(2));

  return {
    principalAmount,
    tenureDays,
    interestRate: INTEREST_RATE,
    interestAmount,
    totalRepayment,
    outstandingAmount: totalRepayment
  };
}
