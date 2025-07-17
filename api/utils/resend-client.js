const { Resend } = require('resend');

let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return null;
    }
    
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend client initialized');
  }
  
  return resendClient;
}

function isResendConfigured() {
  return !!process.env.RESEND_API_KEY;
}

module.exports = {
  getResendClient,
  isResendConfigured
};
