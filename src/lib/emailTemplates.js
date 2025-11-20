// Base email template with consistent design
export const baseEmailTemplate = ({
  name,
  title = "Welcome to Drivest!",
  greeting = `Hi ${name},`,
  body,
  buttonText = "Go to App",
  buttonUrl = "https://yourwebsite.com/login",
  footerText = `© ${new Date().getFullYear()} Drivest. All rights reserved.`,
}) => `
  <div style="
    font-family: Arial, sans-serif;
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
  ">
    <div style="
      max-width: 500px;
      background: #ffffff;
      margin: auto;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      padding: 20px;
    ">
      <h2 style="color: #4f46e5; text-align: center;">🎉 ${title}</h2>
      <p>${greeting}</p>
      ${body}
      ${
        buttonText && buttonUrl
          ? `
            <p style="text-align:center;">
              <a href="${buttonUrl}" 
                 style="background-color:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
                 ${buttonText}
              </a>
            </p>
          `
          : ""
      }
      <hr/>
      <p style="font-size:12px;color:#666;text-align:center;">
        ${footerText}
      </p>
    </div>
  </div>
`;

// Welcome email template using the base template
export const welcomeEmailTemplate = (name) => {
  const body = `
    <p>We’re excited to have you on board! Your account has been successfully created, and your 7-day free trial is now active.</p>
    <p>Start exploring and enjoy all the features available to you.</p>
  `;
  return baseEmailTemplate({
    name,
    title: "Welcome to Drivest!",
    body,
    buttonText: "Go to App",
    buttonUrl: "drivest://login",
  });
};

// OTP email template with prominent OTP display
export const otpEmailTemplate = (name, otpCode) => {
  const body = `
    <p>You have requested a one-time password (OTP) to verify your account.</p>
    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #4f46e5; letter-spacing: 2px; background: #f0f0f0; padding: 10px; border-radius: 5px;">
      ${otpCode}
    </p>
    <p>Please use this OTP within the next 10 minutes to complete your verification. If you did not request this, please ignore this email.</p>
  `;
  return baseEmailTemplate({
    name,
    title: "Your OTP Code",
    body,
    buttonText: "Verify Now",
    buttonUrl: "drivest://verify-otp",
  });
};

// Password reset success email template
export const passwordResetTemplate = (name) => {
  const body = `
    <p>Your password has been successfully reset for your Drivest account! 🔒</p>
    <p>You can now log in using your new password.</p>
    <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
  `;
  return baseEmailTemplate({
    name,
    title: "Password Reset Successful",
    body,
    buttonText: "Log In Now",
    buttonUrl: "drivest://login",
  });
};


// Subscription success email template using the base template
export const subscriptionSuccessTemplate = (name) => {
  const body = `
    <p>Your subscription was successful! 🎉</p>
    <p>You now have full access to all features.</p>
    <p>Thank you for choosing our platform.</p>
  `;
  return baseEmailTemplate({
    name,
    title: "Subscription Successful!",
    body,
    buttonText: "Explore Now",
    buttonUrl: "drivest://login",
  });
};


// Subscription success email template using the base template
export const deactivateMail = (name) => {
  const body = `
    <p>Your Account is now deactivate!</p>
    <p>You now have not access to all features.</p>
    <p>Thank you for choosing our platform.</p>
  `;
  return baseEmailTemplate({
    name,
    title: "Deactive The Account!",
    body,
    buttonText: "Explore Now",
    buttonUrl: "drivest://login",
  });
};