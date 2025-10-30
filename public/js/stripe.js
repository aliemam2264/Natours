/* eslint-disable */

import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51SMOcYRtLhrMLIZvOfkkgozjpNpCGNSDFAA1wMLMId3cIlqGmbKhdXsVZEiLm0mKthnbp2dZh0sylzgyI5koyZcs0008b0fZO9',
);

const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API.
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2) Create checkout from + charge credit card.
    window.location.href = session.data.session.url;
  } catch (err) {
    showAlert('error', err);
  }
};

// GET BOOKING BUTTON
const bookBtn = document.getElementById('book-tour');
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
