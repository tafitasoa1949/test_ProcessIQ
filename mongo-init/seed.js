db = db.getSiblingDB("processiq");
db.createCollection("users");
db.createCollection("documents");
function generateUser(index) {
  const firstNames = [
    "Jean",
    "Marie",
    "Pierre",
    "Sophie",
    "Thomas",
    "Emma",
    "Lucas",
    "Léa",
    "Hugo",
    "Chloé",
    "Louis",
    "Camille",
    "Nathan",
    "Manon",
    "Théo",
    "Julie",
    "Alexis",
    "Laura",
    "Maxime",
    "Sarah",
  ];

  const lastNames = [
    "Martin",
    "Bernard",
    "Dubois",
    "Thomas",
    "Robert",
    "Richard",
    "Petit",
    "Durand",
    "Leroy",
    "Moreau",
    "Simon",
    "Laurent",
    "Lefebvre",
    "Michel",
    "Garcia",
    "David",
    "Bertrand",
    "Roux",
    "Vincent",
    "Fournier",
  ];

  const cities = [
    "Paris",
    "Lyon",
    "Marseille",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
    "Montpellier",
    "Bordeaux",
    "Lille",
    "Rennes",
    "Reims",
    "Toulon",
    "Grenoble",
  ];

  const formations = [
    "BTS Informatique",
    "BUT Informatique",
    "Licence Pro Développement",
    "Master Informatique",
    "BTS Gestion",
    "BUT GEA",
    "CAP Cuisine",
    "BTS Commerce",
    "Licence RH",
    "Master Management",
  ];

  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const city = cities[index % cities.length];
  const formation = formations[index % formations.length];

  return {
    _id: new ObjectId(),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`,
    phone: `+33${Math.floor(600000000 + Math.random() * 99999999)}`,
    address: {
      street: `${index + 1} rue de la Paix`,
      city,
      zipCode: `${Math.floor(10000 + Math.random() * 89999)}`,
      country: "France",
    },
    formation,
    apprenticeshipContract: {
      startDate: new Date(2024, 8, 1),
      endDate: new Date(2026, 6, 31),
      company: `Entreprise ${(index % 50) + 1}`,
      mentor: `Mentor ${(index % 20) + 1}`,
    },
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

print("Début du seed : 1000 utilisateurs...");

const BATCH_SIZE = 100;
const TOTAL = 1000;
let inserted = 0;

for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
  const batch = [];
  for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL); j++) {
    batch.push(generateUser(j));
  }
  db.users.insertMany(batch);
  inserted += batch.length;
  print(`${inserted}/${TOTAL} utilisateurs insérés`);
}

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ lastName: 1 });
db.users.createIndex({ "address.city": 1 });
db.documents.createIndex({ userId: 1 });
db.documents.createIndex({ createdAt: -1 });

print("Seed terminé avec succès !");
print(`Total utilisateurs : ${db.users.countDocuments()}`);
