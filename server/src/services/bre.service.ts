const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export type EmploymentMode = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";

export type BreInput = {
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
};

export function calculateAge(dateOfBirth: Date, asOf = new Date()) {
  let age = asOf.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = asOf.getMonth() - dateOfBirth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && asOf.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function runBre(input: BreInput) {
  const reasons: string[] = [];
  const age = calculateAge(input.dateOfBirth);

  if (age < 23 || age > 50) {
    reasons.push("Age must be between 23 and 50 years.");
  }

  if (input.monthlySalary < 25000) {
    reasons.push("Monthly salary must be at least Rs. 25,000.");
  }

  if (!PAN_REGEX.test(input.pan.toUpperCase())) {
    reasons.push("PAN must be in a valid format, for example ABCDE1234F.");
  }

  if (input.employmentMode === "UNEMPLOYED") {
    reasons.push("Unemployed applicants are not eligible.");
  }

  return {
    passed: reasons.length === 0,
    reasons,
    age
  };
}
