#!/bin/bash

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 15

# Initialize replica set
echo "Initializing replica set..."
mongosh --eval "
try {
  // Check if replica set is already initialized
  const status = rs.status();
  print('Replica set already initialized:', status.set);
} catch (error) {
  if (error.message.includes('no replset config has been received')) {
    print('Initializing replica set rs0...');
    
    // Initialize the replica set
    const result = rs.initiate({
      _id: 'rs0',
      members: [
        {
          _id: 0,
          host: 'mongo:27017',
          priority: 1
        }
      ]
    });
    
    print('Replica set initialization result:', result);
    
    // Wait for the replica set to be ready
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const status = rs.status();
        if (status.myState === 1) { // PRIMARY
          print('✅ Replica set is ready! Current status:', status.myState);
          break;
        }
        print('Waiting for replica set to be ready... Attempt:', attempts + 1);
        sleep(2000); // Wait 2 seconds
        attempts++;
      } catch (e) {
        print('Waiting for replica set status... Attempt:', attempts + 1);
        sleep(2000);
        attempts++;
      }
    }
    
    if (attempts >= maxAttempts) {
      print('Warning: Replica set initialization may not be complete');
    } else {
      print('✅ Replica set rs0 successfully initialized and ready!');
    }
  } else {
    print('Error checking replica set status:', error.message);
  }
}
"

