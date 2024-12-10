const API_URL = 'http://localhost:5000/api/auth';

// User Registration
$('#registerButton').click(function() {
    const username = $('#registerUsername').val();
    const password = $('#registerPassword').val();
    $.post(`${API_URL}/register`, { username, password })
        .done(function(response) {
            alert('Registration successful!');
        })
        .fail(function(err) {
            alert('Registration failed: ' + err.responseText);
        });
});

// User Login
$('#loginButton').click(function() {
    const username = $('#loginUsername').val();
    const password = $('#loginPassword').val();
    $.post(`${API_URL}/login`, { username, password })
        .done(function(data) {
            alert('Login successful!');
            localStorage.setItem('jwt', data.accessToken); // Store access token
        })
        .fail(function(err) {
            alert('Login failed: ' + err.responseText);
        });
});

// Fetch User Profile
$('#getProfileButton').click(function() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert('Please log in first.');
    return;
}

$.ajax({
    url: `${API_URL}/profile`,
    type: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token // Include JWT in headers
    },
    success: function(data) {
        $('#profileInfo').html(`<p>ID: ${data.id}</p><p>Username: ${data.username}</p>`);
    },
    error: function(err) {
        alert('Failed to fetch profile: ' + err.responseText);
        localStorage.removeItem('jwt'); // Clear JWT if unauthorized
    }
});
});

// Update User Profile
$('#updateProfileButton').click(function() {
const newUsername = $('#updateUsername').val();
const token = localStorage.getItem('jwt');

$.ajax({
    url: `${API_URL}/profile`,
    type: 'PUT',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    data: { username: newUsername },
    success: function(data) {
        alert('Profile updated: ' + data.username);
    },
    error: function(err) {
        alert('Failed to update profile: ' + err.responseText);
    }
});
});

// Reset User Password
$('#resetPasswordButton').click(function() {
const newPassword = $('#resetPassword').val();
const token = localStorage.getItem('jwt');

$.ajax({
    url: `${API_URL}/reset-password`,
    type: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    data: { newPassword: newPassword },
    success: function() {
        alert('Password has been reset successfully.');
    },
    error: function(err) {
        alert('Failed to reset password: ' + err.responseText);
    }
});
});

// Handle User Logout
$('#logoutButton').click(function() {
$.post(`${API_URL}/logout`, {}, function() {
    alert('Logged out successfully!');
    localStorage.removeItem('jwt'); // Remove access token from local storage
    $('#profileInfo').html(''); // Clear profile info
}).fail(function(err) {
    alert('Failed to log out: ' + err.responseText);
});
});

