import { donationCatalogueById } from "./donation-catalogue.js";

export const TI_PAYMENT_DETAILS = {
  tillNumber: "9911113",
  accountName: "TUOKOLEANE INITIATIVE CBO",
  confirmationPhoneDisplay: "0740 603 626",
  confirmationPhoneLink: "+254740603626",
  notificationEmail: "tuokoleaneinitiative@gmail.com",
} as const;

export interface DonationItem {
  packageId: string;
  title: string;
  kind: "fixed" | "custom" | "time";
  quantity: number;
  unitAmount: number;
}

export interface DonationSubmission {
  reference: string;
  donor: {
    name: string;
    email: string;
    phone: string;
    anonymous: boolean;
  };
  note: string;
  mpesaReference: string;
  items: DonationItem[];
  website: string;
}

export interface DonationNotificationResponse {
  reference: string;
}

export type DonationValidationResult =
  | { ok: true; submission: DonationSubmission; total: number }
  | { ok: false; error: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?\d{9,15}$/;
const mpesaReferencePattern = /^[A-Z0-9]{8,20}$/;

export function isValidEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value.trim());
}

export function isValidPhone(value: string) {
  return phonePattern.test(value.replace(/[\s()-]/g, ""));
}

export function isValidMpesaReference(value: string) {
  return mpesaReferencePattern.test(value.trim().toUpperCase());
}

export function donationTotal(items: DonationItem[]) {
  return items.reduce((total, item) => total + item.unitAmount * item.quantity, 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isShortString(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.length <= maximumLength;
}

export function validateDonationSubmission(value: unknown): DonationValidationResult {
  if (!isRecord(value) || !isRecord(value.donor) || !Array.isArray(value.items)) {
    return { ok: false, error: "Some donation details are missing. Please check the form and try again." };
  }

  const { donor } = value;
  if (
    !isShortString(value.reference, 64)
    || !/^TI-[A-Z0-9-]{6,60}$/.test(value.reference)
    || !isShortString(donor.name, 120)
    || !isShortString(donor.email, 254)
    || !isShortString(donor.phone, 30)
    || typeof donor.anonymous !== "boolean"
    || !isShortString(value.note, 2000)
    || !isShortString(value.mpesaReference, 40)
    || !isShortString(value.website, 200)
  ) {
    return { ok: false, error: "One of the donation details does not look right. Please check the form and try again." };
  }

  if (!isValidEmail(donor.email) || (!donor.anonymous && !donor.name.trim())) {
    return { ok: false, error: "Add a valid email. Then add your name or choose to give anonymously." };
  }

  if (value.items.length === 0 || value.items.length > 20) {
    return { ok: false, error: "Your basket does not contain a valid item." };
  }

  const items: DonationItem[] = [];
  for (const item of value.items) {
    if (
      !isRecord(item)
      || !isShortString(item.packageId, 80)
      || !/^[a-z0-9-]+$/.test(item.packageId)
      || !Number.isInteger(item.quantity)
      || Number(item.quantity) < 1
      || Number(item.quantity) > 99
      || !Number.isInteger(item.unitAmount)
      || Number(item.unitAmount) < 0
      || Number(item.unitAmount) > 1_000_000
    ) {
      return { ok: false, error: "One item in your basket could not be sent. Please remove it and try again." };
    }

    const catalogueItem = donationCatalogueById.get(item.packageId);
    if (!catalogueItem) {
      return { ok: false, error: "One item is no longer available. Please remove it and try again." };
    }

    const submittedAmount = Number(item.unitAmount);
    const unitAmount = catalogueItem.kind === "fixed"
      ? catalogueItem.price ?? 0
      : catalogueItem.kind === "custom"
        ? submittedAmount
        : 0;

    if (
      (catalogueItem.kind === "fixed" && submittedAmount !== unitAmount)
      || (catalogueItem.kind === "custom" && submittedAmount < (catalogueItem.minimumAmount ?? 500))
      || (catalogueItem.kind === "time" && submittedAmount !== 0)
    ) {
      return { ok: false, error: "One item has changed since it was added. Please refresh the page and try again." };
    }

    items.push({
      packageId: catalogueItem.id,
      title: catalogueItem.title,
      kind: catalogueItem.kind,
      quantity: Number(item.quantity),
      unitAmount,
    });
  }

  const total = donationTotal(items);
  if (total > 5_000_000) {
    return { ok: false, error: "This donation is above the online limit. Please contact TI before paying." };
  }

  if (total > 0 && (!isValidPhone(donor.phone) || !isValidMpesaReference(value.mpesaReference))) {
    return { ok: false, error: "Add the phone number used for M-PESA and the confirmation code." };
  }

  return {
    ok: true,
    total,
    submission: {
      reference: value.reference,
      donor: {
        name: donor.name.trim(),
        email: donor.email.trim(),
        phone: donor.phone.trim(),
        anonymous: donor.anonymous,
      },
      note: value.note.trim(),
      mpesaReference: value.mpesaReference.trim().toUpperCase(),
      items,
      website: value.website,
    },
  };
}
