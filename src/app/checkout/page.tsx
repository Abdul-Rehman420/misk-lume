import { createClient } from "@/lib/supabase/server";
import CheckoutForm, { type BankDetails } from "./CheckoutForm";

const FALLBACK_BANK: BankDetails = {
  bank_name: "Meezan Bank",
  account_title: "Misk Lume (Pvt) Ltd",
  account_number: "0123-0101-2345678-01",
  iban: "PK90MEZN0001230101234567801",
};

const BANK_KEYS = ["bank_name", "account_title", "account_number", "iban"] as const;

export default async function CheckoutPage() {
  const bank: BankDetails = { ...FALLBACK_BANK };

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("key, value")
      .in("key", [...BANK_KEYS]);

    data?.forEach((row) => {
      if (BANK_KEYS.includes(row.key as (typeof BANK_KEYS)[number]) && row.value) {
        bank[row.key as keyof BankDetails] = row.value;
      }
    });
  } catch {
    // Fall back to defaults if settings are unavailable
  }

  return <CheckoutForm bankDetails={bank} />;
}
