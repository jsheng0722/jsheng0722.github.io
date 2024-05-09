const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    auth: {
      user: "sheng.jih@northeastern.edu",
      pass: ""
    }
  });

  const { firstname, lastname, email, message } = JSON.parse(event.body);

  await transporter.sendMail({
    from: `${email}`,
    to: 'sheng.jih@northeastern.edu',
    subject: `New Contact from ${firstname}.${lastname}`,
    text: `${message}`,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Email sent" })
  };
};
