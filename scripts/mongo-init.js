// MongoDB initialization script
db = db.getSiblingDB("url-shortener");

// Create the urls collection
db.createCollection("urls");

// Create indexes for better performance
db.urls.createIndex({ shortCode: 1 }, { unique: true });
db.urls.createIndex({ originalUrl: 1 });
db.urls.createIndex({ createdAt: 1 });

// Insert sample data for testing (optional)
if (db.urls.countDocuments() === 0) {
  db.urls.insertOne({
    originalUrl: "https://example.com",
    shortCode: "sample1",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  print("✅ Sample URL record inserted");
}

print("✅ MongoDB initialization completed for url-shortener database");
