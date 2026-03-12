document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('partials/header.html');
    const html = await response.text();
    document.getElementById('header').innerHTML = html;
    
   
    document.dispatchEvent(new CustomEvent('headerLoaded'));
  } catch (error) {
    console.error('Error loading header:', error);
  }
});