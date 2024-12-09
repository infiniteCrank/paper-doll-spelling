window.onload = function() {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);

    function preload() {
        // Load your assets here if needed
    }

    function create() {
        this.add.text(100, 100, 'Hello Phaser!', { fill: '#0f0' });

        // Login form example
        this.add.text(100, 150, 'Enter your username and password:', { fill: '#0f0' });

        // Simple demonstration of handling login and fetching secure words
        login('test', 'password'); // Mock login
      
        // Secure API call
        fetchSecuredWords();
    }

    function update() {
        // Game loop logic
    }

    // Function to handle user login
    function login(username, password) {
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            // Assuming the server responds with the token
            console.log('Login successful. Token:', data.token);
            document.cookie = `token=${data.token}; Path=/;`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Function to fetch secured words
    function fetchSecuredWords() {
        fetch('/words', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('token') // Add JWT to the request
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch secured words');
            }
            return response.json();
        })
        .then(data => {
            console.log('Secured words:', data);
        })
        .catch(error => {
            console.error('Error fetching secured words:', error);
        });
    }

    // Function to get the JWT from cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
}