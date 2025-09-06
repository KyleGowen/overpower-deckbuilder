const fs = require('fs');
const path = require('path');

// Script to assign existing decks to the kyle user
async function assignExistingDecksToKyle() {
    try {
        const decksFilePath = path.join(process.cwd(), 'data', 'decks.json');
        
        if (!fs.existsSync(decksFilePath)) {
            console.log('No existing decks file found. Nothing to assign.');
            return;
        }
        
        const data = fs.readFileSync(decksFilePath, 'utf-8');
        const decks = JSON.parse(data);
        
        let updatedCount = 0;
        const kyleUserId = 'kyle-001'; // This should match the ID from userPersistence.ts
        
        // Update each deck to be owned by kyle
        const updatedDecks = decks.map(deck => {
            if (!deck.metadata.userId) {
                deck.metadata.userId = kyleUserId;
                updatedCount++;
                console.log(`✅ Assigned deck "${deck.metadata.name}" to kyle`);
            }
            return deck;
        });
        
        if (updatedCount > 0) {
            // Save the updated decks
            fs.writeFileSync(decksFilePath, JSON.stringify(updatedDecks, null, 2));
            console.log(`🎉 Successfully assigned ${updatedCount} decks to kyle user`);
        } else {
            console.log('All decks already have user assignments');
        }
        
    } catch (error) {
        console.error('Error assigning decks to kyle:', error);
    }
}

// Run the script
assignExistingDecksToKyle();
