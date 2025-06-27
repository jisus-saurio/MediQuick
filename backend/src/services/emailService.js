import nodemailer from 'nodemailer';
import { config } from '../config.js';

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Configuración para Gmail (puedes cambiar por otro proveedor)
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.email?.EMAIL_USER || process.env.EMAIL_USER,
                    pass: config.email?.EMAIL_PASS || process.env.EMAIL_PASS
                }
            });

            // Verificar conexión
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ Error en configuración de email:', error);
                } else {
                    console.log('✅ Servicio de email configurado correctamente');
                }
            });
        } catch (error) {
            console.error('❌ Error inicializando servicio de email:', error);
        }
    }

    generateVerificationCode() {
        // Generar código de 6 dígitos
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendVerificationEmail(email, verificationCode, userName) {
        try {
            const mailOptions = {
                from: `"MediQuick" <${config.email?.EMAIL_USER || process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Código de Verificación - MediQuick',
                html: `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verificación de Email - MediQuick</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #84C1D9 0%, #a8d1e7 100%); padding: 30px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                                    🏥 MediQuick
                                </h1>
                                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                    Tu farmacia de confianza
                                </p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 40px 30px;">
                                <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">
                                    ¡Hola ${userName}! 👋
                                </h2>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                    Gracias por registrarte en <strong>MediQuick</strong>. Para completar tu registro y verificar tu cuenta, necesitamos que confirmes tu dirección de correo electrónico.
                                </p>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                    Ingresa el siguiente código de verificación en la aplicación:
                                </p>
                                
                                <!-- Verification Code -->
                                <div style="background: linear-gradient(135deg, #D65414 0%, #f97316 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                                    <div style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                        ${verificationCode}
                                    </div>
                                    <p style="color: white; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                                        Código de verificación
                                    </p>
                                </div>
                                
                                <div style="background: #f8fafc; border-left: 4px solid #84C1D9; padding: 15px; margin: 25px 0; border-radius: 5px;">
                                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                                        <strong>⏰ Este código es válido por 10 minutos.</strong><br>
                                        Si no solicitaste este código, puedes ignorar este mensaje.
                                    </p>
                                </div>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 25px 0 0 0; font-size: 16px;">
                                    Una vez verificado tu email, podrás acceder a todas las funcionalidades de nuestra plataforma, incluyendo:
                                </p>
                                
                                <ul style="color: #64748b; line-height: 1.8; margin: 15px 0; padding-left: 20px;">
                                    <li>🛒 Realizar compras online</li>
                                    <li>📋 Ver tu historial de pedidos</li>
                                    <li>⭐ Valorar productos</li>
                                    <li>🚚 Seguimiento de entregas</li>
                                </ul>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                                    <strong>MediQuick</strong> - Tu salud es nuestra prioridad
                                </p>
                                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                    Este es un correo automático, por favor no responder directamente.
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer spacer -->
                        <div style="padding: 20px; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                © 2024 MediQuick. Todos los derechos reservados.
                            </p>
                        </div>
                    </body>
                    </html>
                `,
                text: `
                    Hola ${userName},
                    
                    Gracias por registrarte en MediQuick.
                    
                    Tu código de verificación es: ${verificationCode}
                    
                    Este código es válido por 10 minutos.
                    
                    Si no solicitaste este código, puedes ignorar este mensaje.
                    
                    Saludos,
                    Equipo MediQuick
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de verificación enviado:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error enviando email de verificación:', error);
            return { success: false, error: error.message };
        }
    }

    async sendWelcomeEmail(email, userName) {
        try {
            const mailOptions = {
                from: `"MediQuick" <${config.email?.EMAIL_USER || process.env.EMAIL_USER}>`,
                to: email,
                subject: '🎉 ¡Bienvenido a MediQuick!',
                html: `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Bienvenido a MediQuick</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #84C1D9 0%, #a8d1e7 100%); padding: 30px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                                    🏥 MediQuick
                                </h1>
                                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                    ¡Cuenta verificada exitosamente!
                                </p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 40px 30px; text-align: center;">
                                <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">
                                    ¡Bienvenido a la familia MediQuick, ${userName}! 🎉
                                </h2>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                    Tu cuenta ha sido verificada exitosamente. Ahora puedes disfrutar de todos nuestros servicios.
                                </p>
                                
                                <div style="background: linear-gradient(135deg, #D65414 0%, #f97316 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                                    <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">
                                        🚀 ¡Tu cuenta está lista!
                                    </h3>
                                    <p style="color: white; margin: 0; opacity: 0.9;">
                                        Explora nuestro catálogo y realiza tu primera compra
                                    </p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de bienvenida enviado:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error enviando email de bienvenida:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new EmailService();