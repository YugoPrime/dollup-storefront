import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

// Currencies that are zero-decimal (amounts stored as whole units, not cents)
const ZERO_DECIMAL_CURRENCIES = ["mur", "jpy", "krw", "vnd", "idr", "clp", "gnf", "mga", "pyg", "rwf", "ugx", "xaf", "xof", "bif", "djf", "kmf"]

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  // Zero-decimal currencies: amount is already in whole units (e.g. 800 MUR = Rs.800)
  // Standard currencies: amount is in cents (e.g. 800 USD = $8.00), divide by 100
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(currency_code.toLowerCase())
  const displayAmount = isZeroDecimal ? amount : amount / 100

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minimumFractionDigits ?? (isZeroDecimal ? 0 : 2),
    maximumFractionDigits: maximumFractionDigits ?? (isZeroDecimal ? 0 : 2),
  }).format(displayAmount)
}
