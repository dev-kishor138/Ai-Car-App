import nodemailer from "nodemailer";

let transporter = null; // Lazy init

const createTransporter = () => {
  if (!transporter) {
    // console.log(
    //   "Creating transporter... EMAIL_USER:",
    //   process.env.EMAIL_USER ? "***LOADED***" : "MISSING"
    // );
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporterInstance = createTransporter(); // Lazy create here
    const info = await transporterInstance.sendMail({
     from: `"Drivest" <${process.env.EMAIL_USER}>`, // Plain from (like inline) - avoid named for now
      to,
      subject,
      html,
      text,
    });
    // console.log("✅ Email sent:", info.response);
    return info; // Optional return
  } catch (err) {
    console.error("❌ Email send error:", err);
    throw err;
  }
};

// export const transporter = nodemailer.createTransport({
//   service: "gmail", // Or use another email service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export const sendEmail = async ({ to, subject, html, text }) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Drivest" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//       text,
//     });
//     console.log("✅ Email sent:", info.response);
//   } catch (err) {
//     console.error("❌ Email send error:", err);
//     throw err;
//   }
// };
