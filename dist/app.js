const previews = {
  setup: { name: 'Wedding planner setup', image: 'assets/planner-setup.png' },
  budget: { name: 'Wedding budget', image: 'assets/planner-budget.png' },
  guests: { name: 'Guest list', image: 'assets/planner-guests.png' },
  tasks: { name: 'Task tracker & checklist', image: 'assets/planner-tasks.png' },
  music: { name: 'Music playlist', image: 'assets/planner-music.png' }
};
let selectedPreview = 'setup';
const tabs = [...document.querySelectorAll('[data-preview]')];
const purchaseDialog = document.getElementById('purchase-dialog');
const imageDialog = document.getElementById('image-dialog');
function selectPreview(key, focus = false) {
  selectedPreview = key;
  tabs.forEach(tab => { const active = tab.dataset.preview === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && focus) tab.focus(); });
  const item = previews[key];
  const image = document.getElementById('preview-image');
  image.src = item.image; image.alt = `${item.name} worksheet preview`;
  document.getElementById('preview-name').textContent = item.name;
  document.getElementById('preview-panel').setAttribute('aria-labelledby', `tab-${key}`);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPreview(tab.dataset.preview));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectPreview(tabs[next].dataset.preview, true); }
  });
});
document.getElementById('zoom-preview').addEventListener('click', () => {
  const item = previews[selectedPreview];
  const image = document.getElementById('large-preview-image');
  image.src = item.image; image.alt = `Enlarged ${item.name.toLowerCase()} worksheet`;
  document.getElementById('large-preview-name').textContent = item.name;
  imageDialog.showModal();
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
let checkout;
try { const value = window.ADOREREVE?.checkoutUrl; if (value) { const url = new URL(value); if (url.protocol === 'https:') checkout = url.href; } } catch { /* Keep honest coming-soon state for an invalid link. */ }
document.querySelectorAll('[data-purchase]').forEach(button => button.addEventListener('click', () => { if (checkout) window.location.assign(checkout); else purchaseDialog.showModal(); }));
if (checkout) {
  document.querySelector('.availability').textContent = 'Continue to secure checkout';
  document.querySelector('.faq-list details:last-child p').textContent = 'Select Get my planner to continue to our checkout. The Soft Y2K Wedding Planner is RM30. Review payment and delivery details there before placing your order.';
}
document.getElementById('year').textContent = new Date().getFullYear();
