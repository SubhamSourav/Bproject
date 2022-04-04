const nodemailer = require("nodemailer");
const { options } = require("../app");

const mailHelper = async (option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    },
  });

  const message = {
    from: 'subhamsourav175@gmail.com', // sender address
    to: option.email, // list of receivers
    subject: option.subject, // Subject line
    text: option.message, // plain text body
    // html: "<a>Hello world?</a>", // html body
  };

  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailHelper