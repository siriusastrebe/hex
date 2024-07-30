import { hoursAndMinutes } from "./datetime";

export function validateEmail(email: string): boolean {
  let valid = true;
  if (!email.includes('@') || !email.includes('.')) valid = false;
  if (email.split('@').length !== 2) valid = false;
  if (email.split('.').length !== 2) valid = false;
  if (email.length > 127) valid = false;
  return valid;
}

export function validatePhone(phone: string): false | number {
  // Returns false or a valid 11 digit phone number
  let stripped = '';
  let valid = true;
  for (let i=0; i<phone.length; i++) {
    const char = phone[i];
    if (char !== ' ' && char.match(/[0-9]/)) {
      stripped = stripped + char;
    }
    if (!char.match(/[0-9]/) && char !== ' ' && char !== '(' && char !== ')' && char !== '-' && char !== '+') {
      valid = false;
    }
  }

  if (stripped.length < 10) {
    return false;
  }

  if (stripped.length === 11) {
    // US phone numbers only
    if (stripped[0] !== '1') {
      return false;
    }
  }

  if (stripped.length === 10 && (stripped[0] === '1' || stripped[0] === '0')) {
    // Area codes in the North American Numbering Plan area may not contain 0 or 1 as the first digit. 
    // https://en.wikipedia.org/wiki/Category:Area_codes_in_the_United_States
    return false;
  }

  if (stripped.length === 10 && stripped[0] !== '1') {
    // Add in the US country code
    stripped = '1' + stripped;
  }

  if (stripped.length > 11) {
    return false;
  }

  if (!valid) {
    return false;
  }

  return Number(stripped);
}

export function validZip(zip: string): boolean {
 zip = zip.trim();
 if (zip.match(/^[0-9]*$/) && zip.length === 5) {
   return true;
 }
 return false;
}

export function validateDigitalTimeRange(start: string, end: string, allowZeroDuration?: boolean): boolean {
  if ((start.length !== 8 && start.length !== 5) || (end.length !== 8 && end.length !== 5)) {
    return false;
  }
  if (!start.slice(0, 2).match(/^[0-9]*$/)) {
    return false;
  }
  if (!start.slice(3, 5).match(/^[0-9]*$/)) {
    return false;
  }
  if (!end.slice(0, 2).match(/^[0-9]*$/)) {
    return false;
  }
  if (!end.slice(3, 5).match(/^[0-9]*$/)) {
    return false;
  }

  const [startHours, startMinutes] = hoursAndMinutes(start);
  const [endHours, endMinutes] = hoursAndMinutes(end);

  if (startHours > endHours) {
    return false;
  }
  if (startHours === endHours && startMinutes >= endMinutes) {
    return false;
  }
  if (startHours < 0 || startHours > 23) {
    return false;
  }
  if (endHours < 0 || endHours > 23) {
    return false;
  }
  if (startMinutes < 0 || endMinutes > 59) {
    return false;
  }
  if (endMinutes < 0 || endMinutes > 59) {
    return false;
  }
  if (startHours === endHours && startMinutes === endMinutes && !allowZeroDuration) {
    return false;
  }

  return true;
}

export function validateyyyyMMdd(date: string): boolean {
  if (date.length !== 10) {
    return false;
  }
  if (date[4] !== '-' || date[7] !== '-') {
    return false;
  }
  if (!date.slice(0, 4).match(/^[0-9]*$/)) {
    return false;
  }
  if (!date.slice(5, 7).match(/^[0-9]*$/)) {
    return false;
  }
  if (!date.slice(8, 10).match(/^[0-9]*$/)) {
    return false;
  }
  return true;
}
