export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Puedes cambiar '*' por 'http://192.168.1.229:4200' si prefieres limitar el acceso
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Manejo de preflight (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== 'POST') {
      return new Response('Método no permitido', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const { email, name } = await request.json();

      const apiKey = 're_GaEyT1Q7_Kj4XX5mvsKmBFnoUCpikHUBf'; // API Key de Resend

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

      return new Response(JSON.stringify({ message: 'Correos enviados correctamente' }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: `Error al enviar correos: ${error}` }), {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      });
    }
  }
};
