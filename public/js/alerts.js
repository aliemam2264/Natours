/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg, time = 7) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  // Hide all alerts after 5 sec.
  window.setTimeout(hideAlert, time * 1000);
};

const alertMsg = document.querySelector('body').dataset.alert;
if (alertMsg) showAlert('success', alertMsg, 20);
