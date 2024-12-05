document.getElementById('emailForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('to', document.getElementById('to').value);
    formData.append('subject', document.getElementById('subject').value);
    formData.append('body', document.getElementById('body').value);
    formData.append('file', document.getElementById('file').files[0]);

    const response = await fetch('api/sendMail', {
        method: 'POST',
        body: formData
    });

    const result = await response.text();
    alert(result);
});
