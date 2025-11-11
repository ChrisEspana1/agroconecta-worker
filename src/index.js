export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    const adminEmail = 'adagroconecta@gmail.com'; // Dirección del administrador
    const adworker ='admin@agroconecta.site';
    const apiKey = 're_GaEyT1Q7_Kj4XX5mvsKmBFnoUCpikHUBf';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Método no permitido', { status: 405, headers: corsHeaders });
    }

    try {
      const { email, name, origen } = await request.json();

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };

      let html = '';
      let notificarAdmin = false;

      if (origen === 'admin') {
        // Caso: creado por el administrador
        html = `
          <h2>Hola ${name || email},</h2>
          <p>Tu cuenta ha sido creada por el administrador de AgroConecta.</p>
          <p>Ya puedes acceder a la plataforma con tu correo electrónico.</p>
          <p>Si tienes dudas, contacta a: <strong>${adworker}</strong></p>
        `;
      } else {
        // Caso: autoregistro
        html = `
          <h2>¡Bienvenido a AgroConecta, ${name || email}!</h2>
<p>Gracias por registrarte en nuestra plataforma. Tu cuenta ha sido creada exitosamente y está pendiente de activación por parte del equipo administrador.</p>

<p>¿Qué significa esto?</p>
<ul>
  <li>Un administrador revisará tu solicitud para garantizar la seguridad de la comunidad.</li>
  <li>Recibirás un correo de confirmación cuando tu cuenta esté activa.</li>
</ul>

<p>Si necesitas ayuda o tienes alguna pregunta, puedes escribirnos a:</p>
<p><strong>Correo del administrador:</strong> admin@agroconecta.site</p>

<p style="margin-top:20px;">¡Gracias por confiar en AgroConecta! Estamos trabajando para ofrecerte la mejor experiencia.</p>
        `;
        notificarAdmin = true;
      }

      // Enviar correo al usuario
      const userEmailPayload = {
        from: `AgroConecta <no-reply@agroconecta.site>`,
        to: email,
        subject: '¡Bienvenido a AgroConecta!',
        html
      };

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify(userEmailPayload)
      });

      // Si el usuario se autoregistró, notificar al administrador
      if (notificarAdmin) {
        const adminHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Nuevo Usuario Registrado</title>
</head>
<body style="margin:0; padding:0; background-image:url('https://app.agroconecta.site/assets/images/agroconecta.png'); background-size:cover; background-repeat:no-repeat; font-family: Arial, sans-serif;">
<table width="100%" height="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.85);">
  <tr>
    <td align="center">
      <table style="max-width:600px; background:#ffffff; border-radius:8px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
        <tr>
          <td style="text-align:center; padding-bottom:16px;">
            <h2 style="margin:0; color:#2f855a;">Nuevo usuario pendiente de activación</h2>
          </td>
        </tr>
        <tr>
          <td style="font-size:15px; color:#333; line-height:1.6;">
            <p>Hola, administrador(a):</p>
            <p>Se ha registrado un nuevo usuario en la plataforma <strong>Agroconecta</strong>. La cuenta requiere ser activada.</p>
            
            <p><strong>Datos del usuario:</strong></p>
            <p>Nombre: ${name || 'No especificado'}<br>Email: ${email}</p>
            
            <p>Por favor, ingresa al panel de administración y procede a activar o rechazar la solicitud:</p>
            
            <p style="text-align:center; margin:24px 0;">
              https://app.agroconecta.site/admin/users
            </p>
            
            <p>Si no esperabas esta solicitud, ignora este mensaje.</p>
            <p style="margin-top:32px;">Saludos,<br>Equipo Agroconecta</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
        `;

        const adminEmailPayload = {
          from: `AgroConecta <no-reply@agroconecta.site>`,
          to: adminEmail,
          subject: 'Nuevo usuario pendiente de activación',
          html: adminHtml
        };

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers,
          body: JSON.stringify(adminEmailPayload)
        });
      }

      return new Response(JSON.stringify({ message: 'Correos enviados correctamente' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: `Error al enviar correo: ${error}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};