const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize the JWKS client
const client = jwksClient({
  jwksUri: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_u7btsbyLO/.well-known/jwks.json',
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000 // 10 minutes
});

// Function to get the signing key
const getSigningKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  // Verify the token
  jwt.verify(token, getSigningKey, {
    algorithms: ['RS256'],
    issuer: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_u7btsbyLO`
  }, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Add the decoded token to the request object
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;