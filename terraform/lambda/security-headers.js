exports.handler = async (event) => {
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    // Add security headers
    headers['strict-transport-security'] = [{
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains'
    }];

    headers['content-security-policy'] = [{
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://i4tar1ds8e.execute-api.us-east-1.amazonaws.com https://*.execute-api.us-east-1.amazonaws.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    }];

    headers['x-content-type-options'] = [{
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    }];

    headers['x-frame-options'] = [{
        key: 'X-Frame-Options',
        value: 'DENY'
    }];

    headers['x-xss-protection'] = [{
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    }];

    headers['referrer-policy'] = [{
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
    }];

    headers['permissions-policy'] = [{
        key: 'Permissions-Policy',
        value: 'geolocation=(), microphone=(), camera=()'
    }];

    return response;
};