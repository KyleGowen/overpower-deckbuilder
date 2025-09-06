const fs = require('fs');
const path = require('path');

// Script to add a guest user
async function addGuestUser() {
    try {
        const usersFilePath = path.join(process.cwd(), 'src/persistence/users/users.json');
        
        // Ensure the directory exists
        const usersDir = path.dirname(usersFilePath);
        if (!fs.existsSync(usersDir)) {
            fs.mkdirSync(usersDir, { recursive: true });
        }
        
        let users = [];
        
        // Load existing users if file exists
        if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath, 'utf-8');
            users = JSON.parse(data);
        }
        
        // Check if guest user already exists
        const existingGuest = users.find(user => user.username === 'guest');
        if (existingGuest) {
            console.log('Guest user already exists');
            return;
        }
        
        // Create guest user
        const guestUser = {
            id: 'guest-001',
            username: 'guest',
            password: 'guest',
            createdAt: new Date().toISOString(),
            lastLoginAt: null
        };
        
        users.push(guestUser);
        
        // Save users
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log('✅ Successfully created guest user with password "guest"');
        
    } catch (error) {
        console.error('Error creating guest user:', error);
    }
}

// Run the script
addGuestUser();
