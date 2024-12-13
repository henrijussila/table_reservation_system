document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get login info
    const credentials = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    console.log(credentials);

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (response.ok) {
        // Login successful, redirect to homepage
        window.location.href = '/main'; // Redirect to homepage
    } else {
        // Handle error response
        const data = await response.json();
        const messageElement = document.getElementById('message');
        messageElement.textContent = data.message; // Display error message
        messageElement.style.color = 'red';
    }
});


