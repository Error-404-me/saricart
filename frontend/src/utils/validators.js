export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidUsername(value) {
  return /^[a-zA-Z0-9_]{3,50}$/.test(value.trim());
}

export function passwordIssues(value) {
  const issues = [];
  if (value.length < 8) issues.push("at least 8 characters");
  if (!/[A-Za-z]/.test(value)) issues.push("at least one letter");
  if (!/[0-9]/.test(value)) issues.push("at least one number");
  return issues;
}
