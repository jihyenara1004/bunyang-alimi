const gdInterestDialog = document.querySelector('.gd-interest-dialog');
const gdInlineInterest = document.querySelector('#gd-inline-interest');
if (gdInterestDialog && gdInlineInterest) {
  const form = gdInlineInterest.querySelector('form');
  const panel = gdInterestDialog.querySelector('.gd-interest-panel');
  function openInterest() {
    if (gdInterestDialog.open) return;
    panel.append(form);
    gdInterestDialog.showModal();
  }
  for (const button of document.querySelectorAll('[data-gd-interest-open]')) {
    button.addEventListener('click', openInterest);
  }
  gdInterestDialog.querySelector('[data-gd-interest-close]').addEventListener('click', () => gdInterestDialog.close());
  gdInterestDialog.addEventListener('click', event => {
    if (event.target === gdInterestDialog) gdInterestDialog.close();
  });
  gdInterestDialog.addEventListener('close', () => gdInlineInterest.append(form));
  if (location.hash === '#interest-gdmetro') openInterest();
}