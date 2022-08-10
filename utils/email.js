const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'd21c764b326bd8',
      pass: '1b69cfbd6a1dc3',
    },
  });

  const mailOptions = {
    from: 'me@abv.bg',
    to: 'someone@abv.bg',
    subject: options.subject,
    text: options.text,
  };

  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
