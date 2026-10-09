"""Static sample data used by seed.py. Kept separate so the seeding logic stays short."""

UNSPLASH = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=1200&q=80"

# One hand-picked cover photo per listing, keyed by title. Every cover is different
# (seed.py checks this), so no two cards on the home page share a front photo.
COVERS: dict[str, str] = {
    "Beachfront villa with private pool": "1520250497591-112f2f40a3f4",
    "Cozy studio steps from Anjuna beach": "1499793983690-e29da59ef1c2",
    "Portuguese heritage home in Fontainhas": "1568605114967-8130f3a36994",
    "Palolem beach hut with sea view": "1597475681177-809cfdc76cd2",
    "Lakeside cottage on the Vembanad backwaters": "1598924957326-0446ac30341e",
    "Tea estate bungalow with valley views": "1449158743715-0a90ebb6d2d8",
    "Cliffside room overlooking Varkala beach": "1695259496167-c05f25f1d793",
    "Traditional tharavad in Fort Kochi": "1570129477492-45c003edd2be",
    "Pine wood cabin with mountain views": "1510798831971-661eb04b3739",
    "Apple orchard cottage in Old Manali": "1512411233342-92208dfe81af",
    "Himalayan A-frame by the Parvati river": "1587061949409-02df41d5e562",
    "Colonial cottage near the Shimla ridge": "1518780664697-55e3ad937233",
    "Riverside retreat near Rishikesh": "1680645944941-da9198d7f6aa",
    "Lake-view home in Nainital": "1763051339093-61c59f40ba28",
    "Forest cabin in Mukteshwar": "1697807650304-907257330a3e",
    "Haveli suite in the Pink City": "1566073771259-6a8506099945",
    "Lake Pichola view heritage room": "1707691888016-85d630302247",
    "Desert villa with pool near the dunes": "1613490493576-7fde63acd811",
    "Rooftop studio near Hawa Mahal": "1545324418-cc1a3fa10c00",
    "Sea-facing apartment in Bandra": "1502672260266-1c1ef2d93688",
    "Art deco flat in Colaba": "1560448204-e02f11c3d0e2",
    "Modern loft in Indiranagar": "1522708323590-d24dbb6b0267",
    "Garden home in Lutyens' Delhi": "1564013799919-ab600027ffc6",
    "Boutique stay in Hauz Khas Village": "1628592102751-ba83b0314276",
    "Coffee estate villa in Coorg": "1628624747186-a941c476b7ef",
    "Infinity pool villa near Lonavala": "1600596542815-ffad4c1539a9",
    "Farmhouse with pool in Alibaug": "1596178067639-5c6e68aea6dc",
    "French Quarter heritage home": "1723108034000-e7fd897e3be0",
    "Beach cottage near Auroville": "1528913775512-624d24b27b96",
    "Houseboat stay on Dal Lake": "1631528858266-5ebeb8bfc6f5",
    "Tea garden cottage in Darjeeling": "1475087542963-13ab5e611954",
    "Cliffside villa with plunge pool": "1694967832949-09984640b143",
}

# Interior photos, shared between listings (only the covers need to be unique).
# Each listing gets one living room, one photo per bedroom, a kitchen and a bathroom.
ROOM_PHOTOS: dict[str, list[str]] = {
    "living": [
        "1493809842364-78817add7ffb",
        "1586023492125-27b2c045efd7",
        "1583847268964-b28dc8f51f92",
        "1600210492486-724fe5c67fb0",
        "1616594039964-ae9021a400a0",
        "1600607687939-ce8a6c25118c",
    ],
    "bedroom": [
        "1505691938895-1758d7feb511",
        "1631049307264-da0ec9d70304",
        "1595526114035-0d45ed16cfbf",
        "1617806118233-18e1de247200",
        "1522771739844-6a9f6d5f14af",
        "1582719478250-c89cae4dc85b",
        "1611892440504-42a792e24d32",
        "1629140727571-9b5c6f6267b4",
        "1711059985570-4c32ed12a12c",
        "1568495248636-6432b97bd949",
        "1576354302919-96748cb8299e",
        "1630660664869-c9d3cc676880",
        "1667125095636-dce94dcbdd96",
        "1549638441-b787d2e11f14",
        "1512918728675-ed5a9ecdebfd",
        "1721369483526-62f48a00b949",
    ],
    "kitchen": [
        "1484154218962-a197022b5858",
        "1556909114-f6e7ad7d3136",
        "1556911220-bff31c812dba",
        "1600566753190-17f0baa2a6c3",
    ],
    "bathroom": [
        "1552321554-5fefe8c9ef14",
        "1584622650111-993a426fbf0a",
        "1620626011761-996317b8d101",
    ],
}

# (name, email, is_superhost, bio). The first 6 own listings (hosts); the rest are guests only.
USERS = [
    ("Priya Nair", "priya@example.com", True, "Born in Kochi, hosting travellers for 6 years. I love sharing Kerala's food and backwaters."),
    ("Rohan Mehta", "rohan@example.com", True, "Architect turned host. I restore old homes and turn them into places to slow down."),
    ("Ananya Iyer", "ananya@example.com", False, "Mountain person. Ask me for trail recommendations around Himachal and Uttarakhand."),
    ("Kabir Singh", "kabir@example.com", True, "Hosting in Rajasthan and Goa. Happy to help plan your days and local food stops."),
    ("Meera Kapoor", "meera@example.com", False, "City apartments with good coffee and fast Wi-Fi, made for remote work."),
    ("Arjun Reddy", "arjun@example.com", False, "Family-run villas and estates in Karnataka and Maharashtra."),
    ("Aisha Khan", "aisha@example.com", False, None),
    ("Vikram Joshi", "vikram@example.com", False, None),
    ("Sneha Pillai", "sneha@example.com", False, None),
    ("Rahul Verma", "rahul@example.com", False, None),
    ("Fatima Sheikh", "fatima@example.com", False, None),
    ("Dev Malhotra", "dev@example.com", False, None),
]

# (name, icon key for the frontend)
AMENITIES = [
    ("Wifi", "wifi"),
    ("Kitchen", "kitchen"),
    ("Free parking", "parking"),
    ("Air conditioning", "ac"),
    ("Washer", "washer"),
    ("TV", "tv"),
    ("Dedicated workspace", "workspace"),
    ("Pool", "pool"),
    ("Hot tub", "hot_tub"),
    ("Beach access", "beach"),
    ("Mountain view", "mountain_view"),
    ("Lake view", "lake_view"),
    ("Fireplace", "fireplace"),
    ("BBQ grill", "bbq"),
    ("Breakfast", "breakfast"),
    ("Garden", "garden"),
]

BASE_AMENITIES = ["Wifi", "Kitchen", "Air conditioning", "TV"]
CATEGORY_AMENITIES = {
    "Beachfront": ["Beach access", "BBQ grill"],
    "Amazing views": ["Mountain view", "Fireplace"],
    "Cabins": ["Mountain view", "Fireplace", "Free parking"],
    "Amazing pools": ["Pool", "Free parking", "BBQ grill"],
    "Countryside": ["Garden", "Free parking", "Breakfast"],
    "Iconic cities": ["Dedicated workspace", "Washer"],
    "Historical homes": ["Breakfast", "Garden"],
    "Lakefront": ["Lake view", "Breakfast"],
}
EXTRA_AMENITIES = ["Washer", "Free parking", "Dedicated workspace", "Hot tub", "Breakfast", "Garden"]

# (title, city, state, lat, lng, category, property_type, price, guests, bedrooms, beds, baths, host_index)
LISTINGS = [
    ("Beachfront villa with private pool", "Candolim", "Goa", 15.5180, 73.7620, "Beachfront", "Villa", 18500, 8, 4, 5, 4, 3),
    ("Cozy studio steps from Anjuna beach", "Anjuna", "Goa", 15.5733, 73.7400, "Beachfront", "Apartment", 3200, 2, 1, 1, 1, 3),
    ("Portuguese heritage home in Fontainhas", "Panaji", "Goa", 15.4989, 73.8278, "Historical homes", "House", 7800, 6, 3, 3, 3, 1),
    ("Palolem beach hut with sea view", "Canacona", "Goa", 15.0100, 74.0232, "Beachfront", "Cottage", 2600, 2, 1, 1, 1, 3),
    ("Lakeside cottage on the Vembanad backwaters", "Kumarakom", "Kerala", 9.6175, 76.4301, "Lakefront", "Cottage", 6500, 4, 2, 2, 2, 0),
    ("Tea estate bungalow with valley views", "Munnar", "Kerala", 10.0889, 77.0595, "Amazing views", "House", 9200, 6, 3, 4, 3, 0),
    ("Cliffside room overlooking Varkala beach", "Varkala", "Kerala", 8.7379, 76.7163, "Beachfront", "Guesthouse", 3500, 2, 1, 1, 1, 0),
    ("Traditional tharavad in Fort Kochi", "Kochi", "Kerala", 9.9658, 76.2421, "Historical homes", "House", 5400, 5, 2, 3, 2, 0),
    ("Pine wood cabin with mountain views", "Manali", "Himachal Pradesh", 32.2432, 77.1892, "Cabins", "Cabin", 4800, 4, 2, 2, 1, 2),
    ("Apple orchard cottage in Old Manali", "Manali", "Himachal Pradesh", 32.2560, 77.1780, "Countryside", "Cottage", 3900, 3, 1, 2, 1, 2),
    ("Himalayan A-frame by the Parvati river", "Kasol", "Himachal Pradesh", 32.0100, 77.3150, "Cabins", "Cabin", 3600, 3, 1, 2, 1, 2),
    ("Colonial cottage near the Shimla ridge", "Shimla", "Himachal Pradesh", 31.1048, 77.1734, "Amazing views", "Cottage", 6100, 4, 2, 2, 2, 2),
    ("Riverside retreat near Rishikesh", "Rishikesh", "Uttarakhand", 30.0869, 78.2676, "Amazing views", "Guesthouse", 4200, 4, 2, 2, 2, 2),
    ("Lake-view home in Nainital", "Nainital", "Uttarakhand", 29.3919, 79.4542, "Lakefront", "House", 5600, 5, 2, 3, 2, 2),
    ("Forest cabin in Mukteshwar", "Mukteshwar", "Uttarakhand", 29.4722, 79.6479, "Cabins", "Cabin", 5200, 4, 2, 2, 2, 2),
    ("Haveli suite in the Pink City", "Jaipur", "Rajasthan", 26.9124, 75.7873, "Historical homes", "Guesthouse", 6800, 3, 1, 2, 1, 3),
    ("Lake Pichola view heritage room", "Udaipur", "Rajasthan", 24.5764, 73.6800, "Lakefront", "Guesthouse", 7400, 2, 1, 1, 1, 3),
    ("Desert villa with pool near the dunes", "Jaisalmer", "Rajasthan", 26.9157, 70.9083, "Amazing pools", "Villa", 11500, 6, 3, 3, 3, 3),
    ("Rooftop studio near Hawa Mahal", "Jaipur", "Rajasthan", 26.9239, 75.8267, "Iconic cities", "Apartment", 2900, 2, 1, 1, 1, 1),
    ("Sea-facing apartment in Bandra", "Mumbai", "Maharashtra", 19.0596, 72.8295, "Iconic cities", "Apartment", 8900, 4, 2, 2, 2, 4),
    ("Art deco flat in Colaba", "Mumbai", "Maharashtra", 18.9067, 72.8147, "Iconic cities", "Apartment", 7200, 3, 1, 2, 1, 4),
    ("Modern loft in Indiranagar", "Bengaluru", "Karnataka", 12.9719, 77.6412, "Iconic cities", "Apartment", 4500, 3, 1, 2, 1, 4),
    ("Garden home in Lutyens' Delhi", "New Delhi", "Delhi", 28.6000, 77.2100, "Iconic cities", "House", 12500, 6, 3, 4, 3, 1),
    ("Boutique stay in Hauz Khas Village", "New Delhi", "Delhi", 28.5535, 77.1940, "Iconic cities", "Apartment", 3800, 2, 1, 1, 1, 4),
    ("Coffee estate villa in Coorg", "Madikeri", "Karnataka", 12.4244, 75.7382, "Countryside", "Villa", 9800, 8, 4, 5, 4, 5),
    ("Infinity pool villa near Lonavala", "Lonavala", "Maharashtra", 18.7546, 73.4062, "Amazing pools", "Villa", 15500, 10, 5, 6, 5, 5),
    ("Farmhouse with pool in Alibaug", "Alibaug", "Maharashtra", 18.6414, 72.8722, "Amazing pools", "House", 13200, 8, 4, 4, 4, 5),
    ("French Quarter heritage home", "Puducherry", "Puducherry", 11.9341, 79.8350, "Historical homes", "House", 6900, 6, 3, 3, 3, 1),
    ("Beach cottage near Auroville", "Auroville", "Tamil Nadu", 12.0052, 79.8069, "Beachfront", "Cottage", 4100, 3, 1, 2, 1, 1),
    ("Houseboat stay on Dal Lake", "Srinagar", "Jammu and Kashmir", 34.1100, 74.8600, "Lakefront", "Houseboat", 6200, 4, 2, 2, 2, 1),
    ("Tea garden cottage in Darjeeling", "Darjeeling", "West Bengal", 27.0410, 88.2663, "Amazing views", "Cottage", 4700, 4, 2, 2, 1, 2),
    ("Cliffside villa with plunge pool", "Gokarna", "Karnataka", 14.5479, 74.3188, "Amazing pools", "Villa", 10800, 6, 3, 3, 3, 5),
]

REVIEW_COMMENTS = {
    5: [
        "Absolutely loved our stay. The place looked exactly like the photos and the host was super responsive.",
        "One of the best stays we've had in India. Spotless, comfortable and the location was perfect.",
        "Beautiful home with stunning views. We didn't want to leave!",
        "Everything was thoughtfully arranged. Great beds, great Wi-Fi and a lovely host.",
        "Perfect for our family trip. Kids loved it and the kitchen had everything we needed.",
        "Felt like home from the moment we arrived. Would definitely book again.",
        "Super clean, peaceful and very well located. Highly recommend.",
    ],
    4: [
        "Great stay overall. A few small things could be improved but the host fixed them quickly.",
        "Lovely place and very comfortable. The road to get there is a bit rough, so plan ahead.",
        "Good value for money and a helpful host. Wi-Fi was a little slow in the evenings.",
        "Nice and cosy. Would have liked a few more kitchen supplies, but we had a wonderful time.",
    ],
    3: [
        "Decent stay. The location is great but the place needs some maintenance.",
        "It was okay. Photos make it look a bit bigger than it is.",
    ],
}
