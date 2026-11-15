import { EventEmitter } from "node:events";
import { sendEmail } from "../email/nodemailer.email.js";
import {template} from "../email/generateHTML.js";
import { emailSubjects } from "../enums/email.enum.js";

export const emailEvent = new EventEmitter();
emailEvent.on("sendEmail", async (data) => {
    await sendEmail(
        {
            to : data.to,
         subject:emailSubjects.confirmEmail,
         html:template(data.code, data.firstName, emailSubjects.confirmEmail)
        }).catch((err) => {
            console.log(err);
        })
        });

emailEvent.on("forgetPassword", async (data) => {
    await sendEmail(
        {
            to : data.to,
         subject:emailSubjects.resetPassword,
         html:template(data.code, data.firstName, emailSubjects.resetPassword)
        }).catch((err) => {
            console.log(err);
        })
        });