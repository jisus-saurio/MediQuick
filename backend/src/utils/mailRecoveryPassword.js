import nodemailer from "nodemailer"

import { config } from "../config.js"

//configurar quien lo envia 

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: config.emailUser.USER_EMAIL,
        pass: config.emailUser.USER_PASS,
    },
})

// a quien le voy a mandar el correo

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Soporte Epa"<stanleyarce51@gmail.com>',
            to,
            subject,
            text,
            html,
        })

        return info
    } catch (error) {
        console.error("Error sending email:", error)
    }
}


//generar html para el correo

const HTMLRecoveryEmail = (code) => {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            font-size: 16px;
            color: #555;
            line-height: 1.5;
        }
        .codigo {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #fff;
            background-color: #ff7f50;
            border-radius: 5px;
            border: 1px solid #e67e22;
        }
        .vencimiento {
            font-size: 14px;
            color: #777;
            line-height: 1.5;
        }
        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 20px 0;
        }
        footer {
            font-size: 12px;
            color: #aaa;
        }
        .countdown {
            font-size: 16px;
            color: #e74c3c;
            font-weight: bold;
        }
    </style>
    <script>
        let timeLeft = 600; // 10 minutos en segundos
        function startCountdown() {
            const countdownElement = document.getElementById('countdown');
            const interval = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                countdownElement.textContent = \`\${minutes}:\${seconds < 10 ? '0' : ''}\${seconds}\`;
                timeLeft--;

                if (timeLeft < 0) {
                    clearInterval(interval);
                    countdownElement.textContent = 'Código expirado';
                }
            }, 1000);
        }
        window.onload = startCountdown;
    </script>
</head>
<body>
    <div class="container">
        <h1>Recuperación de Contraseña</h1>
        <p>Hola, hemos recibido una solicitud para restablecer tu contraseña. Usa el código de verificación a continuación para continuar:</p>
        <div class="codigo" id="codigo">${code}</div> 
        <p class="vencimiento">Este código es válido por los próximos <span id="countdown" class="countdown">10:00</span> minutos.</p>
        <hr>
        <footer>
            Si necesitas más asistencia, contacta a nuestro equipo de soporte en
            <a href="mailto:support@gmail.com" style="color: #3498db; text-decoration: none;">support@gmail.com</a>.
        </footer>
    </div>
</body>
</html>



`;
};

export { sendEmail, HTMLRecoveryEmail };
