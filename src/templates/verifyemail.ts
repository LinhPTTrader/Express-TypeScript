import { ur } from "@faker-js/faker"


export const VerifyEmailTemplate = (url: string, name: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style type="text/css">
            .email {
                width: 500px;
                height: 500px;
                border: 1px solid white;
                border-radius: 10px;
                text-align: center;
                box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
                padding-top: 50px;
            }
    
            .containerEmail {
                height: 100vh;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
    
            .headermail {
                padding: 20px 20px;
                background-color: salmon;
            }
    
            .btnEmail {
                padding: 10px 10px;
                color: white;
                background-color: salmon;
                border: 1px solid white;
                cursor: pointer;
                border-radius: 5px;
            }
    
            .logo {
                margin-bottom: 20px;
            }
            .VerifyEmail {
                cursor: pointer;
            }
        </style>
    </head>
    
    <body>
        <div class="containerEmail">
            <div class="email">
    
                <div class="headermail">
                    <h1>Email Verification</h1>
                </div>
                <div>
    
                    <p>Hi ${name}, You have successfully
                        registered an account at TwitterClone,
                        please click the button below
                        to verify your email</p>
                </div>
                <div>
                    <a class="VerifyEmail" href="${url}">
                        <button class="btnEmail">
                            Verifial my email address
                        </button>
                    </a>
                </div>
    
            </div>
        </div>
    </body>
    
    </html>
    `
}