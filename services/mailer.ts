// NOTA DE ARQUITECTURA:
// Este archivo está diseñado para ejecutarse en un entorno Node.js (Backend/API).
// En esta demostración de navegador, la importación de 'nodemailer' está comentada 
// para evitar errores de compilación, pero el código es funcional para servidor.

// import nodemailer from 'nodemailer'; 

const SMTP_CONFIG = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465, false para otros puertos
  auth: {
    // Estas variables deben estar en process.env en el servidor
    user: process.env.EMAIL_USER || 'vassarbogota@gmail.com',
    pass: process.env.EMAIL_PASS || 'tu-contraseña-app-16-digitos',
  },
};

/**
 * Envía un correo electrónico utilizando la configuración SMTP de Gmail.
 * @param to Dirección de correo del destinatario
 * @param subject Asunto del correo
 * @param html Contenido del correo en formato HTML
 */
export const sendSchoolEmail = async (to: string, subject: string, html: string) => {
  console.log(`[SERVIDOR] Iniciando proceso de envío a: ${to}`);

  // --- IMPLEMENTACIÓN REAL (Para copiar a tu Backend Node.js) ---
  /*
  try {
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    const info = await transporter.sendMail({
      from: `"Casino Escolar" <${SMTP_CONFIG.auth.user}>`, // Remitente personalizado
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Mensaje enviado ID: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return { success: false, error };
  }
  */

  // --- SIMULACIÓN (Para que funcione en esta Demo) ---
  return new Promise((resolve) => {
    setTimeout(() => {
      console.group('📧 [SIMULACIÓN SMTP] Correo Enviado Exitosamente');
      console.log('Host:', SMTP_CONFIG.host);
      console.log('From:', `"Casino Escolar" <${SMTP_CONFIG.auth.user}>`);
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Auth User:', SMTP_CONFIG.auth.user);
      console.groupEnd();
      resolve({ success: true });
    }, 1500); // Simulamos delay de red
  });
};