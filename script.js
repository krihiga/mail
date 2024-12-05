document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const data = {
        email,
        subject,
        message
    };

    fetch('https://mail-rose.vercel.app/api/sendMail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            // Check if the response is not OK (status not in range 200-299)
            throw new Error('Failed to send email');
        }
        return response.json();
    })
    .then(data => {
        // Assuming the backend returns a success message
        alert(data.message || 'Email sent successfully!');
    })
    .catch(error => {
        // Display detailed error message for debugging
        console.error('Error sending email:', error);
        alert('Error sending email: ' + error.message);
    });
});
