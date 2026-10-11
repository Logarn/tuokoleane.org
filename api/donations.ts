import {
  TI_PAYMENT_DETAILS,
  validateDonationSubmission,
} from "../src/donations.js";

const kenyaCurrency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return kenyaCurrency.format(amount).replace(/\u00a0/g, " ");
}

function json(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getEnvironment() {
  return (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env ?? {};
}

function requestComesFromSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function buildNotificationText(
  validation: Extract<ReturnType<typeof validateDonationSubmission>, { ok: true }>,
) {
  const { submission, total } = validation;
  const itemLines = submission.items.map((item) => {
    const value = item.unitAmount
      ? formatCurrency(item.unitAmount * item.quantity)
      : "Time contribution";
    return `- ${item.title} x ${item.quantity}: ${value}`;
  });

  return [
    total > 0
      ? "A donor has submitted donation details through the Tuokoleane website."
      : "Someone has submitted an offer of time through the Tuokoleane website.",
    "",
    total > 0
      ? "Status: Donor-submitted. Match the M-PESA code against TI records before confirming receipt."
      : "Status: Interest submitted. Confirm fit, availability and safeguarding before arranging an activity.",
    `Submission reference: ${submission.reference}`,
    `Total: ${total > 0 ? formatCurrency(total) : "No monetary contribution"}`,
    total > 0 ? `M-PESA confirmation: ${submission.mpesaReference}` : "M-PESA confirmation: Not applicable",
    "",
    "Cause details:",
    ...itemLines,
    "",
    `Donor: ${submission.donor.anonymous ? "Anonymous donor" : submission.donor.name}`,
    `Email: ${submission.donor.email}`,
    `Phone: ${submission.donor.phone || "Not provided"}`,
    `Note: ${submission.note || "No note provided"}`,
  ].join("\n");
}

async function handleDonation(request: Request) {
  if (!requestComesFromSameOrigin(request)) {
    return json({ error: "This donation request could not be accepted." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 30_000) {
    return json({ error: "The donation request is too large." }, 413);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "The donation details could not be read." }, 400);
  }

  const validation = validateDonationSubmission(payload);
  if (!validation.ok) return json({ error: validation.error }, 400);

  if (validation.submission.website) {
    return json({ reference: validation.submission.reference }, 202);
  }

  const environment = getEnvironment();
  const apiKey = environment.RESEND_API_KEY;
  const from = environment.DONATION_EMAIL_FROM;
  const to = environment.DONATION_NOTIFICATION_TO ?? TI_PAYMENT_DETAILS.notificationEmail;

  if (!apiKey || !from) {
    console.error("Donation notification email is not configured.");
    return json({
      error: `We could not notify the TI team. Please keep your M-PESA message and contact ${TI_PAYMENT_DETAILS.confirmationPhoneDisplay}.`,
    }, 503);
  }

  const { submission, total } = validation;
  const causes = submission.items.map((item) => item.title);
  const subject = total > 0
    ? `New donation submitted: ${formatCurrency(total)} for ${causes.length === 1 ? causes[0] : `${causes.length} causes`}`
    : `New volunteer interest: ${causes.length === 1 ? causes[0] : `${causes.length} activities`}`;

  let emailResponse: Response;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `donation-${submission.reference}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: buildNotificationText(validation),
      }),
    });
  } catch (error) {
    console.error("Donation notification request failed.", error);
    return json({ error: "We could not reach the TI team. Please try again." }, 502);
  }

  if (!emailResponse.ok) {
    console.error("Donation notification email was rejected.", {
      status: emailResponse.status,
      requestId: emailResponse.headers.get("x-request-id"),
    });
    return json({ error: "We could not notify the TI team. Please try again." }, 502);
  }

  return json({ reference: submission.reference }, 201);
}

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }
    return handleDonation(request);
  },
};
