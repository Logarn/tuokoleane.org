import { afterEach, describe, expect, it, vi } from "vitest";
import donationsFunction from "../api/donations";
import type { DonationSubmission } from "./donations";

const validSubmission: DonationSubmission = {
  reference: "TI-ABC12345",
  donor: {
    name: "Amina Donor",
    email: "amina@example.com",
    phone: "0740123456",
    anonymous: false,
  },
  note: "Please use this for the next family meal.",
  mpesaReference: "TAA1B2C3D4",
  items: [{
    packageId: "meal",
    title: "Buy a meal",
    kind: "fixed",
    quantity: 1,
    unitAmount: 500,
  }],
  website: "",
};

function donationRequest(body: unknown) {
  return new Request("https://tuokoleane.org/api/donations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://tuokoleane.org",
    },
    body: JSON.stringify(body),
  });
}

describe("donation notification function", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("sends a short, structured donation email to the TI team", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("DONATION_EMAIL_FROM", "Tuokoleane Initiative <donations@tuokoleane.org>");
    vi.stubEnv("DONATION_NOTIFICATION_TO", "tuokoleaneinitiative@gmail.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await donationsFunction.fetch(donationRequest(validSubmission));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ reference: "TI-ABC12345" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(request.headers).toMatchObject({
      Authorization: "Bearer re_test_key",
      "Idempotency-Key": "donation-TI-ABC12345",
    });
    const email = JSON.parse(String(request.body));
    expect(email).toMatchObject({
      from: "Tuokoleane Initiative <donations@tuokoleane.org>",
      to: ["tuokoleaneinitiative@gmail.com"],
      subject: "New donation submitted: Ksh 500 for Buy a meal",
    });
    expect(email.text).toContain("Total: Ksh 500");
    expect(email.text).toContain("M-PESA confirmation: TAA1B2C3D4");
    expect(email.text).toContain("- Buy a meal x 1: Ksh 500");
    expect(email.text).toContain("Note: Please use this for the next family meal.");
  });

  it("rejects incomplete payment details before calling the email provider", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await donationsFunction.fetch(donationRequest({
      ...validSubmission,
      mpesaReference: "",
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Add the phone number used for M-PESA and the confirmation code." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not report success when email delivery is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("DONATION_EMAIL_FROM", "");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await donationsFunction.fetch(donationRequest(validSubmission));

    expect(response.status).toBe(503);
    expect((await response.json()) as { error: string }).toEqual({
      error: "We could not notify the TI team. Please keep your M-PESA message and contact 0740 603 626.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith("Donation notification email is not configured.");
  });

  it("routes a time offer without requiring an M-PESA code", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("DONATION_EMAIL_FROM", "Tuokoleane Initiative <donations@tuokoleane.org>");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email_456" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await donationsFunction.fetch(donationRequest({
      ...validSubmission,
      donor: { ...validSubmission.donor, phone: "" },
      mpesaReference: "",
      items: [{
        packageId: "listen",
        title: "Listen to someone",
        kind: "time",
        quantity: 1,
        unitAmount: 0,
      }],
    }));

    expect(response.status).toBe(201);
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const email = JSON.parse(String(request.body));
    expect(email.subject).toBe("New volunteer interest: Listen to someone");
    expect(email.text).toContain("Status: Interest submitted.");
  });
});
