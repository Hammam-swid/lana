const { htmlToText } = require("html-to-text");
const nodemailer = require("nodemailer");
const pug = require("pug");
class Email {
  constructor(user, url) {
    this.to = user.email;
    const nameArray = user.fullName.split(" ");
    this.firstName =
      nameArray[0] === "عبد" ? nameArray[0] + nameArray[1] : nameArray[0];
    this.url = url;
    this.from = "lanasocial00@gmail.com";
    this.verificationCode = user.verificationCode;
  }

  createTransport() {
    return nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        verificationCode: this.verificationCode,
      }
    );
    const mailOptions = {
      to: this.to,
      from: this.from,
      html,
      subject,
      text: htmlToText(html),
    };
    await this.createTransport().sendMail(mailOptions);
  }
  async sendConfirmSignup() {
    await this.send("confirmSignUp", "تأكيد عملية إنشاء الحساب");
  }
  async sendResetPassword() {
    await this.send("resetPassword", "إعادة تعيين كلمة المرور");
  }
  async sendConfirmDeactivate() {
    await this.send("confirmSignUp", "تأكيد عملية إلغاء تفعيل الحساب");
  }
}

module.exports = Email;
