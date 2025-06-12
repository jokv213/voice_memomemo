import {serve} from 'https://deno.land/std@0.177.0/http/server.ts';
import {corsHeaders} from '../_shared/cors.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@trainingvoicememo.com';

interface RequestBody {
  email: string;
  password: string;
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders});
  }

  try {
    const {email, password}: RequestBody = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({error: 'Email and password are required'}), {
        status: 400,
        headers: {...corsHeaders, 'Content-Type': 'application/json'},
      });
    }

    // If SendGrid API key is not configured, just return success
    if (!SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not configured, skipping email send');
      return new Response(JSON.stringify({message: 'Email skipped (no API key)'}), {
        status: 200,
        headers: {...corsHeaders, 'Content-Type': 'application/json'},
      });
    }

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Training Voice Memo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .credentials {
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .credential-item {
      margin: 10px 0;
    }
    .label {
      font-weight: bold;
      color: #495057;
    }
    .value {
      color: #007bff;
      font-family: monospace;
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      padding: 15px;
      margin-top: 20px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 Welcome to Training Voice Memo!</h1>
    
    <p>Your account has been successfully created. Here are your login credentials:</p>
    
    <div class="credentials">
      <div class="credential-item">
        <span class="label">Email:</span> <span class="value">${email}</span>
      </div>
      <div class="credential-item">
        <span class="label">Password:</span> <span class="value">${password}</span>
      </div>
    </div>
    
    <div class="warning">
      ⚠️ <strong>Note:</strong> このメールは開発環境専用です。本番ではテンプレートを変更してください。
    </div>
  </div>
</body>
</html>
`;

    const textBody = `
🎉 Welcome to Training Voice Memo!

Email: ${email}
Password: ${password}

※ このメールは開発環境専用です。本番ではテンプレートを変更してください
`;

    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{email}],
          },
        ],
        from: {
          email: FROM_EMAIL,
          name: 'Training Voice Memo',
        },
        subject: 'Welcome to Training Voice Memo - Your Credentials',
        content: [
          {
            type: 'text/plain',
            value: textBody,
          },
          {
            type: 'text/html',
            value: emailBody,
          },
        ],
      }),
    });

    if (!sendGridResponse.ok) {
      const error = await sendGridResponse.text();
      console.error('SendGrid error:', error);
      throw new Error(`Failed to send email: ${sendGridResponse.status}`);
    }

    return new Response(JSON.stringify({message: 'Email sent successfully'}), {
      status: 200,
      headers: {...corsHeaders, 'Content-Type': 'application/json'},
    });
  } catch (error) {
    console.error('Error in send-confirm-dev function:', error);
    return new Response(JSON.stringify({error: error.message}), {
      status: 500,
      headers: {...corsHeaders, 'Content-Type': 'application/json'},
    });
  }
});
