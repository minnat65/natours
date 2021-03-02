const nodemailer= require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
//const { options } = require('../routes/tourRoutes');

module.exports = class Email{
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Minnat Ali <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){
        if(process.env.NODE_ENV== 'production'){
            //SENDGRID
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            })
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth:{
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
    
        });
    }
    //send actual email
    async send(template, subject){
        //1 render HTML based on pug template
        const html= pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //2 Define email option
        const mailOptions= {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }
        //3create a transporter and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the Tours family');
    }

    async sendPasswordReset(){
        await this.send('forgotPassword', 'Password Reset link will be valid for 10 minutes.');
    }
}
