let sslcSuccessUrl = `${process.env.APP_URL}/payment-success`;
let sslcFailUrl = `${process.env.APP_URL}/payment-fail`;
let sslcCancelUrl = `${process.env.APP_URL}/payment-cancel`;
let sslcIPNUrl = `${process.env.APP_URL}/ipn`;
export default {
  sslcSuccessUrl,sslcFailUrl,sslcCancelUrl,sslcIPNUrl
}