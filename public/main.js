//Changes the active form to be shown
document.addEventListener('DOMContentLoaded', function () {
    const tableForm = document.getElementById('tableForm');
    const questListForm = document.getElementById('questListForm');
    const reservationRadio = document.querySelector('input[name="formType"][value="table"]');
    const questListRadio = document.querySelector('input[name="formType"][value="list"]');
    const userDetails = document.getElementById('userDetails');

    
    fetch('/session-info')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            // Display the logged-in user's email
            console.log('Logged-in user email:', data.email);
            userDetails.textContent = `Logged in as ${data.email}`;
            
            // Check remaining time for the session
            if (data.remainingTime) {
                //console.log(`Remaining session time: ${data.remainingTime / 1000} seconds`);

                // Set a timeout to redirect to the login page when session expires
                setTimeout(() => {
                    alert('Session has expired, logging you out...');
                    window.location.href = '/login'; // Redirect to login after session expires
                }, data.remainingTime);
            }
        } else {
            window.location.href = '/login'; // Redirect if not logged in
        }
    })
    .catch(error => console.error('Error fetching session info:', error));

    function updateFormDisplay() {
        if (reservationRadio.checked) {
            tableForm.classList.add('active');
            questListForm.classList.remove('active');
        } else {
            tableForm.classList.remove('active');
            questListForm.classList.add('active');
        }
    }

    // Initial display based on the default checked radio button
    updateFormDisplay();

    // Update form display when the radio button changes
    reservationRadio.addEventListener('change', updateFormDisplay);
    questListRadio.addEventListener('change', updateFormDisplay);
});

// Logout Functionality
document.getElementById('logoutButton').addEventListener('click', function() {
    fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin' // Ensures cookies are sent with the request
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url; // Redirect to the login page after logout
        }
    })
    .catch(error => console.error('Error logging out:', error));
});

// TABLE FUNCTIONALITY

document.getElementById('date').addEventListener('change', function () {
    const date = this.value;

    // Fetch available tables
    fetch(`/tables?date=${date}`)
        .then(response => response.json())
        .then(data => {
            const tableSelect = document.getElementById('table');
            tableSelect.innerHTML = '';

            if (data.length > 0) {
                data.forEach(table => {
                    const option = document.createElement('option');
                    option.value = table;
                    option.textContent = table;
                    tableSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No available tables';
                tableSelect.appendChild(option);
            }
        })
        .catch(error => console.error('Error fetching tables:', error));

    // Fetch reservations for the chosen date
    fetch(`/reservations?date=${date}`)

        .then(response => response.json())
        .then(data => {
            const reservationsContainer = document.getElementById('reservationsContainer');
            //const downloadButton = document.getElementById('downloadButton');
            reservationsContainer.innerHTML = '';
            const downloadDate = document.getElementById('date').value;

            if (data.length > 0) {
                downloadButton.disabled = false;
                const ul = document.createElement('ul');
                data.forEach(reservation => {
                    const li = document.createElement('li');
                    const removeButton = document.createElement('button');
                    const customerDiv = document.createElement('div');
                    customerDiv.id = "customerDiv";
                    removeButton.textContent = "Delete";
                    removeButton.id = "removeButton";
                    console.log(downloadDate, reservation.email);
                    removeButton.addEventListener('click', () => {
                        deleteReservation(downloadDate, reservation.email);
                    });

                    li.textContent = `${reservation.firstname} ${reservation.lastname} - Table: ${reservation.table} - Phone: ${reservation.phone} - Notes: ${reservation.notes}`;
                    customerDiv.appendChild(li);
                    customerDiv.appendChild(removeButton);
                    ul.appendChild(customerDiv);
                });
                reservationsContainer.appendChild(ul);

            } else {
                reservationsContainer.textContent = 'No reservations for chosen date.';
                downloadButton.disabled = true; // Disable download button
            }
        })
        .catch(error => console.error('Error fetching reservations:', error));
});

// Handle the PDF download for Tables
function downloadReservations() {
    const downloadDate = document.getElementById('date').value;
    fetch(`/download?date=${downloadDate}`)
        .then(response => response.blob())
        .then(blob => {
            if (blob.size > 0) {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reservations.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert('No reservations for chosen date.');
            }
        })
        .catch(error => console.error('Error downloading reservations:', error));
}

// Handle the deletion of a Table reservation
function deleteReservation(date, email) {
    fetch(`/reservations`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, email })
    })
        .then(response => {
            if (response.ok) {
                alert('Reservation deleted successfully.');
                // Refresh the reservations list
                document.getElementById('date').dispatchEvent(new Event('change'));

            } else {
                alert('Failed to delete reservation.');
            }
        })
        .catch(error => console.error('Error deleting reservation:', error));
}

// QUESTLIST functionality
// Handle the form submission for Questlist
document.getElementById('questListFormId').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form inputs
    const formData = {
        questListDate: document.getElementById('questListDate').value,
        firstname: document.getElementById('listFirstname').value,
        lastname: document.getElementById('listLastname').value,
        people: document.getElementById('listPeople').value,
        notes: document.getElementById('listNotes').value
    };

    fetch('/questlist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // Sending the data as JSON
    })
        .then(response => response.json())
        .then(result => {

            if (result.success) {
                // Reset the form if the submission was successful
                console.log('Form submitted successfully:', result);
                const reservationsContainer = document.getElementById('questlistContainer');
                reservationsContainer.innerHTML = '';
                this.reset();

                // Optionally, reload the page if needed
                // window.location.reload();

            } else {
                alert('Error submitting the form.');
            }

        })
        .catch(error => console.error('Error:', error));



});
// Show reservations for the chosen date
document.getElementById('questListDate').addEventListener('change', function () {
    const date = this.value;

    // Fetch reservations for the chosen date
    fetch(`/questlist?date=${date}`)

        .then(response => response.json())
        .then(data => {
            const reservationsContainer = document.getElementById('questlistContainer');
            const listDownloadButton = document.getElementById('listDownloadButton');
            reservationsContainer.innerHTML = '';

            if (data.length > 0) {
                listDownloadButton.disabled = false;
                const ul = document.createElement('ul');
                data.forEach(reservation => {
                    const li = document.createElement('li');
                    const removeButton = document.createElement('button');
                    const customerDiv = document.createElement('div');
                    customerDiv.id = "customerDiv";
                    removeButton.textContent = "Delete";
                    removeButton.id = "removeButton";
                    removeButton.addEventListener('click', () => {
                        console.log("Delete clicked on ", date);
                        deleteQuest(date, reservation.firstname, reservation.lastname);
                    });

                    li.textContent = `${reservation.firstname} ${reservation.lastname} - People: ${reservation.people} - Notes: ${reservation.notes}`;
                    customerDiv.appendChild(li);
                    customerDiv.appendChild(removeButton);
                    ul.appendChild(customerDiv);
                });
                reservationsContainer.appendChild(ul);
            } else {
                reservationsContainer.textContent = 'No reservations for chosen date.';
                listDownloadButton.disabled = true; // Disable download button
            }
        })
        .catch(error => console.error('Error fetching reservations:', error));
});



// Handle the PDF download for Questlist
function downloadQuestList() {
    const downloadDate = document.getElementById('questListDate').value;
    fetch(`/download-questlist?date=${downloadDate}`)
        .then(response => response.blob())
        .then(blob => {
            if (blob.size > 0) {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'questlist.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert('No reservations for chosen date.');
            }
        })
        .catch(error => console.error('Error downloading reservations:', error));
};

// Handle the deletion of a Table reservation
function deleteQuest(date, firstname, lastname) {
    fetch(`/questlist`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, firstname, lastname })
    })
        .then(response => {
            if (response.ok) {
                alert('Person deleted successfully.');
                // Refresh the reservations list
                document.getElementById('questListDate').dispatchEvent(new Event('change'));

            } else {
                alert('Failed to delete from Questlist.');
            }
        })
        .catch(error => console.error('Error deleting Questlist:', error));
};