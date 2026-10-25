/**
 * Brevo (formerly Sendinblue) Transactional Email API Client
 * --------------------------------------------------------
 * Sends transactional emails (Password Resets, Welcome Notifications, Audit Alerts).
 * Features automatic graceful fallback to mock mode if BREVO_API_KEY is omitted or network fails.
 */

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; messageId?: string; providerUsed: "brevo" | "console_mock" }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@aisms.dev";
  const senderName = process.env.BREVO_SENDER_NAME || "AISMS System";

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_brevo_api_key_here") {
    console.log(`\n📧 [Mock Brevo Email Dispatcher]`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Status: Sent via Console Mock (Set BREVO_API_KEY in backend/.env for live Brevo delivery)\n`);
    return { success: true, providerUsed: "console_mock" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: options.to, name: options.toName || options.to.split("@")[0] }],
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Brevo API Response Error:", errText);
      return { success: true, providerUsed: "console_mock" };
    }

    const data = (await response.json()) as { messageId?: string };
    console.log(`✅ Live Brevo Email sent to ${options.to} (MessageId: ${data.messageId || "N/A"})`);
    return { success: true, messageId: data.messageId, providerUsed: "brevo" };
  } catch (err) {
    console.warn("Brevo email dispatch exception, falling back to mock:", err);
    return { success: true, providerUsed: "console_mock" };
  }
}
