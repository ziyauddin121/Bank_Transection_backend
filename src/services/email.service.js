const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    }
});

//Verify the connection configuration
transporter.verify((error,success) =>{
    if(error){
        console.error('Error connection to email server',error);
    } else {
        console.log('Email Server is ready to send mail');
    }
});

// hamara server transporter ka use karke smptp server se connect hota hai mail bhejne ke liye

//function to send email
const sendEmail = async ({to , subject, text, html}) =>{
    try{
        const info = await transporter.sendMail({
            from: `"Backend_lad" <${process.env.EMAIL_USER}>`,
            to, // LIST OF RECEIVERS
            subject, //subject line
            text, // plain text
            html, //html body
        });
    
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch(error){
        console.error('Error sending email:', error);
    }
}

async function sendRegistrationEmail(userEmail,name){
    const subject = 'Welcome to backend-lad';
    const text = `Hello ${name}, \n\n thanks for creating an account.`;
    const html = `<p>Hello ${name}, </p><p>thanks for creating an account.</p>`;

    await sendEmail({to: userEmail,subject,text,html})
}

async function sendTransactionEmail(userEmail,name,amount,toAccount){
    const subject = "Transaction Notification";
    const text = `Hello ${name}, \n\n your transaction of amount ${amount} to ${toAccount} has been completed.`;
    const html = `<p>Hello ${name}, </p><p>your transaction of amount ${amount} to ${toAccount} has been completed.</p>`;

    await sendEmail({to: userEmail,subject,text,html})
}

async function sendTransactionFailureEmail(userEmail,name,amount,toAccount) {
    const subject = "transaction failure";
    const text = `Hello ${name}, \n\n your transaction of amount ${amount} to ${toAccount} has been failed.`;
    const html = `<p>Hello ${name}, </p><p>your transaction of amount ${amount} to ${toAccount} has been failed.</p>`;

    await sendEmail({to: userEmail,subject,text,html})
}

async function sendInsufficientBalanceEmail(userEmail,name,amount,toAccount) {
    const subject = "Insufficient Balance";
    const text = `Hello ${name}, \n\n your transaction of amount ${amount} to ${toAccount} has been failed due to insufficient balance.`;
    const html = `<p>Hello ${name}, </p><p>your transaction of amount ${amount} to ${toAccount} has been failed due to insufficient balance.</p>`;

    await sendEmail({to: userEmail,subject,text,html})
}

module.exports = {sendRegistrationEmail,sendTransactionEmail,sendTransactionFailureEmail,sendInsufficientBalanceEmail}