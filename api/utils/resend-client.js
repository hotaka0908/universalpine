const { Resend } = require('resend');

let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    if (!process.env.resend_key) {
      console.error('resend_key environment variable is not set');
      return null;
    }
    
    resendClient = new Resend(process.env.resend_key);
    console.log('Resend client initialized');
  }
  
  return resendClient;
}

function isResendConfigured() {
  return !!process.env.resend_key;
}

module.exports = {
  getResendClient,
  isResendConfigured
};
