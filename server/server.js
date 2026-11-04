const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res)=>{
  res.json("Hi, welcome to the Abhishek Portfolio!")
});

app.post("/send", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  if (!process.env.RESEND_API_KEY || !process.env.MAIL_USER || !process.env.MAIL_FROM) {
    console.error("Missing RESEND_API_KEY, MAIL_USER, or MAIL_FROM configuration");
    return res.status(500).json({ error: "Email service is not configured." });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [process.env.MAIL_USER],
        reply_to: email,
        subject: `Contact Us Form Submission: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return res.status(502).json({ error: "Unable to send message." });
    }

    return res.status(200).json({ message: "Message Sent!" });
  } catch (error) {
    console.error("Email request failed:", error);
    return res.status(502).json({ error: "Unable to send message." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
