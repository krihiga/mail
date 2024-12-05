document.getElementById('emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const to = document.getElementById('to').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const filePath = document.getElementById('file').value;

    console.log(from, subject, message, filePath);
    const response = await fetch('/api/sendMail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, message }),
    });
  
    const result = await response.json();
    document.getElementById('status').textContent = result.message;
  });
  