export function ordinal(number: number): string {
  if (number < 0) return String(number);
  if (number === 0) return "0th";
  if (number === 11) return "11th";
  if (number === 12) return "12th";
  if (number === 13) return "13th";

  const str = String(number);

  if (str[str.length - 1] === "1") return str + "st";
  if (str[str.length - 1] === "2") return str + "nd";
  if (str[str.length - 1] === "3") return str + "rd";

  return str + "th";
}

export const leadingZeroes = (value: number | string): string => {
  // Adds a 0 before any single digit
  if (typeof value === 'number') {
    value = value.toString();
  }
  return value.length === 1 ? '0' + value : value;
}

export function currency(amount: number) {
  if (amount > 99) {
    return '$' + (amount / 100).toFixed(2);
  } else {
    return amount + '¢';
  }
}

export function plural(word: string, count: number, singular?: string, plural?: string) {
  if (singular && plural) {
    return count === 1 ? singular : plural;
  } else {
    return count === 1 ? word : word + 's';
  }
}

export function fullAddress(address: string, city: string, state: string, zip: string) {
  return `${address}, ${city}, ${state} ${zip}`;
}