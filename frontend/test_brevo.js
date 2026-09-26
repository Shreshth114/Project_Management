async function test() {
  const req = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      // Just test a fake key to see if it complains about schema validation
      "api-key": "xkeysib-fake"
    },
    body: JSON.stringify({
      sender: { name: "Test", email: "test@example.com" },
      to: [{ email: "test@example.com" }],
      subject: "Test",
      htmlContent: "test",
      attachments: [{ name: "test.txt", content: "dGVzdA==" }]
    })
  });
  console.log("Response for 'attachments':", await req.text());

  const req2 = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": "xkeysib-fake"
    },
    body: JSON.stringify({
      sender: { name: "Test", email: "test@example.com" },
      to: [{ email: "test@example.com" }],
      subject: "Test",
      htmlContent: "test",
      attachment: [{ name: "test.txt", content: "dGVzdA==" }]
    })
  });
  console.log("Response for 'attachment':", await req2.text());
}
test();
