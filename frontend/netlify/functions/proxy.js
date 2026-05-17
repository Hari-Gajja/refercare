const getTargetUrl = (event) => {
  const baseUrl = process.env.BACKEND_URL || '';
  const path = event.path.replace('/.netlify/functions/proxy', '');
  return `${baseUrl}${path}${event.rawQuery ? `?${event.rawQuery}` : ''}`;
};

const getAllowedOrigin = () => process.env.CORS_ORIGIN || '*';

exports.handler = async (event) => {
  const targetUrl = getTargetUrl(event);
  if (!targetUrl) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'BACKEND_URL is not configured.' }),
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': getAllowedOrigin(),
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, otp-token',
      },
      body: '',
    };
  }

  const headers = {
    'Content-Type': event.headers['content-type'] || 'application/json',
  };

  if (event.headers.authorization) {
    headers.Authorization = event.headers.authorization;
  }
  if (event.headers['otp-token']) {
    headers['otp-token'] = event.headers['otp-token'];
  }

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers,
      body: event.body && event.httpMethod !== 'GET' ? event.body : undefined,
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': getAllowedOrigin(),
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Proxy request failed', error: error?.message }),
    };
  }
};
