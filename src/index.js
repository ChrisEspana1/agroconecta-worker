export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

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
      const { email, name, origen } = await request.json();

      const apiKey = 're_GaEyT1Q7_Kj4XX5mvsKmBFnoUCpikHUBf';

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };

      let html = '';

      if (origen === 'admin') {
        html = `
          <h2>Hola ${name || email},</h2>
          <p>Tu cuenta ha sido creada por el administrador de AgroConecta.</p>
          <p>Ya puedes acceder a la plataforma con tu correo electrónico.</p>
          <p>Si tienes dudas, contacta a: <strong>admin@agroconecta.site</strong></p>
        `;
      } else {
        html = `
          <h2>Hola ${name || email},</h2>
          <p>Gracias por registrarte en AgroConecta.</p>
          <p>Tu cuenta está en proceso de activación.</p>
          <p>Contacta al administrador: <strong>admin@agroconecta.site</strong></p>
        `;
      }

      const userEmailPayload = {
        from: 'AgroConecta <no-reply@agroconecta.site>',
        to: email,
        subject: '¡Bienvenido a AgroConecta!',
        html
      };

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify(userEmailPayload)
      });

      return new Response(JSON.stringify({ message: 'Correo enviado correctamente al usuario' }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: `Error al enviar correo: ${error}` }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};