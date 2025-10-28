export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { status: 405 });
    }

    try {
      const { email, name } = await request.json();

      const apiKey = 're_GaEyT1Q7_Kj4XX5mvsKmBFnoUCpikHUBf'; // Reemplaza con tu API Key de Resend

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };

      const userEmailPayload = {
        from: 'AgroConecta <no-reply@agroconecta.site>',
        to: email,
        subject: '¡Bienvenido a AgroConecta!',
        html: `
          <h2>Hola ${name || email},</h2>
          <p>Gracias por registrarte en AgroConecta.</p>
          <p>Para activar tu cuenta, contacta al administrador:</p>
          <p><strong>Email:</strong> admin@agroconecta.site</p>
        `
      };

      const adminEmails = ['c.espana@abx.gt', 'admin2@agroconecta.site'];

      // Enviar correo al usuario
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify(userEmailPayload)
      });

      // Enviar correos a administradores
      for (const adminEmail of adminEmails) {
        const adminPayload = {
          from: 'AgroConecta <no-reply@agroconecta.site>',
          to: adminEmail,
          subject: 'Nuevo usuario registrado',
          html: `
            <p>Se ha registrado un nuevo usuario:</p>
            <ul>
              <li><strong>Nombre:</strong> ${name}</li>
              <li><strong>Correo:</strong> ${email}</li>
            </ul>
            <p>Revisa el panel de administración para activarlo.</p>
          `
        };

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers,
          body: JSON.stringify(adminPayload)
        });
      }

      return new Response('Correos enviados correctamente', { status: 200 });
    } catch (error) {
      return new Response(`Error al enviar correos: ${error}`, { status: 500 });
    }
  }
};