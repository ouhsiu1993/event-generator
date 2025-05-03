export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response('', {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method === 'POST') {
      const body = await request.text();

      // 需要在本地開發時替換為實際的 Google Apps Script URL
      const gasUrl = 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL';

      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body
      });

      const text = await response.text();
      return new Response(text, {
        status: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response('Only POST supported', {
      status: 405,
      headers: corsHeaders()
    });
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
