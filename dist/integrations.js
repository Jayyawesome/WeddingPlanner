const form = document.getElementById('connect-form');
const button = document.getElementById('connect-button');
const status = document.getElementById('status');
form.addEventListener('submit', async event => {
  event.preventDefault(); button.disabled = true; status.textContent = 'Opening secure account connection…';
  try {
    const response = await fetch('/api/pipedream/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app: document.getElementById('app').value.trim() }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Connection could not start.');
    window.location.assign(data.connectLinkUrl);
  } catch (error) { status.textContent = error.message; button.disabled = false; }
});
