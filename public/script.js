document.getElementById('emailForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('to', document.getElementById('to').value);
  formData.append('subject', document.getElementById('subject').value);
  formData.append('message', document.getElementById('message').value);
  formData.append('file', document.getElementById('file').files[0]);

  try {
      const response = await fetch('/api/send-email', {
          method: 'POST',
          body: formData,
      });

      const result = await response.json();
      alert(result.message);
  } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send email. Please try again.');
  }
});
