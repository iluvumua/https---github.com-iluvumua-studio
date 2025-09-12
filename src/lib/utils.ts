import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'decimal',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).format(value);
}
