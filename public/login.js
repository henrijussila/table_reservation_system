document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get login info
    const credentials = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    console.log("Original Credentials:", credentials); // Verify original values

    // Encrypt the credentials
    const encryptedCredentials = {
        email: CryptoJS.AES.encrypt(credentials.email, 'your-very-secure-key').toString(),
        password: CryptoJS.AES.encrypt(credentials.password, 'your-very-secure-key').toString()
    };

    console.log("Front Encrypted Credentials Sent:", encryptedCredentials);

    // Send the encrypted credentials
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(encryptedCredentials),
    });

    if (response.ok) {
        window.location.href = '/main'; // Redirect to homepage
    } else {
        const data = await response.json();
        const messageElement = document.getElementById('message');
        messageElement.textContent = data.message;
        messageElement.style.color = 'red';
    }
});
