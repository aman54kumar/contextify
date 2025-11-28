// DISTANCE CONTEXTS
export const LANDMARKS = [
  { name: "Blue Whales", value: 30, unit: "m", icon: "🐋" },
  { name: "Football Fields", value: 105, unit: "m", icon: "⚽" },
  { name: "Eiffel Towers", value: 300, unit: "m", icon: "🗼" },
  { name: "Burj Khalifas", value: 828, unit: "m", icon: "🏙️" },
  { name: "Mount Everests", value: 8849, unit: "m", icon: "🏔️" },
  { name: "Marathons", value: 42195, unit: "m", icon: "🏃" },
  { name: "Trips to the Moon", value: 384400000, unit: "m", icon: "🌕" },
  { name: "Sun's Diameter", value: 1392700000, unit: "m", icon: "☀️" },
  { name: "Trips to Mars (min)", value: 54600000000, unit: "m", icon: "🚀" },
  { name: "Trips to Pluto", value: 7500000000000, unit: "m", icon: "🪐" },
  { name: "Voyager 1 Travel Distance (1 year)", value: 18921600000000, unit: "m", icon: "🛰️" },
  { name: "Light Years", value: 9460730472580800, unit: "m", icon: "✨" },
  { name: "Parsecs", value: 30856775814913700, unit: "m", icon: "🌌" },
  { name: "Milky Way Diameters", value: 9.46e20, unit: "m", icon: "milky_way" },
];

// WEIGHT CONTEXTS (in kg)
export const WEIGHT_CONTEXTS = [
  { name: "Apples", value: 0.2, icon: "🍎" },
  { name: "Cats", value: 4.5, icon: "🐱" },
  { name: "Dogs (Labrador)", value: 30, icon: "🐕" },
  { name: "Adult Humans", value: 70, icon: "🧍" },
  { name: "Motorcycles", value: 200, icon: "🏍️" },
  { name: "Cows", value: 400, icon: "🐄" },
  { name: "Cars", value: 1500, icon: "🚗" },
  { name: "Elephants", value: 5000, icon: "🐘" },
  { name: "Buses", value: 12000, icon: "🚌" },
  { name: "Blue Whales", value: 150000, icon: "🐋" },
  { name: "Statue of Libertys", value: 225000, icon: "🗽" },
  { name: "Eiffel Towers", value: 10100000, icon: "🗼" },
  { name: "Great Pyramids", value: 5750000000, icon: "pyramid" },
  { name: "All Humans Combined", value: 560000000000, icon: "👥" },
  { name: "Water in all Oceans", value: 1.4e21, icon: "🌊" },
  { name: "Earths", value: 5.972e24, icon: "🌍" },
  { name: "Suns", value: 1.989e30, icon: "☀️" },
  { name: "Milky Way Galaxies", value: 1.5e42, icon: "🌌" },
];

// TEMPERATURE CONTEXTS (in Celsius)
export const TEMPERATURE_CONTEXTS = [
  { name: "Absolute Zero", value: -273.15, icon: "❄️", description: "Coldest possible temperature" },
  { name: "Liquid Nitrogen", value: -196, icon: "🧪", description: "Boiling point of nitrogen" },
  { name: "Arctic Winter", value: -40, icon: "🥶", description: "Extreme cold" },
  { name: "Freezing Point", value: 0, icon: "🧊", description: "Water freezes" },
  { name: "Spring Day", value: 15, icon: "🌸", description: "Pleasant weather" },
  { name: "Room Temperature", value: 22, icon: "🏠", description: "Comfortable indoors" },
  { name: "Beach Weather", value: 30, icon: "🏖️", description: "Hot summer day" },
  { name: "Body Temperature", value: 37, icon: "🌡️", description: "Human normal" },
  { name: "Dubai Summer", value: 45, icon: "🔥", description: "Extreme heat" },
  { name: "Boiling Point", value: 100, icon: "💧", description: "Water boils" },
  { name: "Baking Bread", value: 200, icon: "🍞", description: "Oven temperature" },
  { name: "Melting Lead", value: 327, icon: "🫠", description: "Lead melts" },
  { name: "Lava", value: 1200, icon: "🌋", description: "Molten rock" },
  { name: "Surface of Sun", value: 5500, icon: "☀️", description: "Solar surface" },
  { name: "Lightning Bolt", value: 30000, icon: "⚡", description: "Hotter than sun surface" },
  { name: "Core of Sun", value: 15000000, icon: "🔥", description: "Solar core" },
];

// TIME CONTEXTS (in minutes)
export const TIME_CONTEXTS = [
  { name: "Blinks of an Eye", value: 0.005, icon: "👁️" }, // ~300ms
  { name: "Heartbeats", value: 0.012, icon: "💓" }, // ~0.8s
  { name: "Coffee Breaks", value: 15, icon: "☕" },
  { name: "TV Episodes", value: 45, icon: "📺" },
  { name: "Soccer Matches", value: 90, icon: "⚽" },
  { name: "Average Movies", value: 120, icon: "🎬" },
  { name: "Titanic (movie)", value: 195, icon: "🚢" },
  { name: "Work Days", value: 480, icon: "💼" },
  { name: "Sleep Cycles", value: 480, icon: "😴" },
  { name: "NYC to LA Flights", value: 360, icon: "✈️" },
  { name: "London to Tokyo Flights", value: 720, icon: "🌏" },
  { name: "Years", value: 525600, icon: "📅" },
  { name: "Human Lifetimes", value: 42048000, icon: "👶" }, // ~80 years
  { name: "Recorded History", value: 2628000000, icon: "📜" }, // ~5000 years
  { name: "Age of Pyramids", value: 2365000000, icon: "pyramid" }, // ~4500 years
  { name: "Time since Dinosaurs", value: 3.4e13, icon: "🦖" }, // ~65 million years
  { name: "Galactic Years", value: 1.156e14, icon: "🌌" }, // ~230 million years
  { name: "Age of Universe", value: 7.25e15, icon: "✨" }, // ~13.8 billion years
];

// CURRENCY RATES (relative to USD)
export const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150,
  CNY: 7.25,
  INR: 83,
  THB: 36,
  BRL: 4.95,
  AUD: 1.52,
  CAD: 1.36,
  MXN: 17.5,
  AED: 3.67,
  EGP: 49,
  ZAR: 18.5,
};

// PURCHASING POWER BY CITY
export const PURCHASING_POWER = {
  "New York": {
    currency: "USD",
    continent: "North America",
    items: [
      { name: "Coffees", cost: 5, icon: "☕", priority: true },
      { name: "Subway Rides", cost: 2.9, icon: "🚇", priority: true },
      { name: "Pizza Slices", cost: 3, icon: "🍕", priority: true },
      { name: "Lunches", cost: 25, icon: "🥗", priority: false },
      { name: "Movie Tickets", cost: 18, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 3500, icon: "🏠", priority: false },
    ],
  },
  "Mexico City": {
    currency: "MXN",
    continent: "North America",
    items: [
      { name: "Tacos", cost: 15, icon: "🌮", priority: true },
      { name: "Metro Rides", cost: 5, icon: "🚇", priority: true },
      { name: "Coffees", cost: 40, icon: "☕", priority: true },
      { name: "Tortas", cost: 50, icon: "🥪", priority: true },
      { name: "Movie Tickets", cost: 80, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 8000, icon: "🏠", priority: false },
    ],
  },
  "Toronto": {
    currency: "CAD",
    continent: "North America",
    items: [
      { name: "Coffees", cost: 4, icon: "☕", priority: true },
      { name: "Poutines", cost: 8, icon: "🍟", priority: true },
      { name: "TTC Rides", cost: 3.25, icon: "🚇", priority: true },
      { name: "Lunches", cost: 18, icon: "🥗", priority: false },
      { name: "Movie Tickets", cost: 14, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 2200, icon: "🏠", priority: false },
    ],
  },
  "São Paulo": {
    currency: "BRL",
    continent: "South America",
    items: [
      { name: "Coffees", cost: 6, icon: "☕", priority: true },
      { name: "Pão de Queijo", cost: 3, icon: "🧀", priority: true },
      { name: "Metro Rides", cost: 5, icon: "🚇", priority: true },
      { name: "Lunches", cost: 30, icon: "🍽️", priority: false },
      { name: "Movie Tickets", cost: 40, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 2500, icon: "🏠", priority: false },
    ],
  },
  "Buenos Aires": {
    currency: "USD",
    continent: "South America",
    items: [
      { name: "Empanadas", cost: 1.5, icon: "🥟", priority: true },
      { name: "Coffees", cost: 2, icon: "☕", priority: true },
      { name: "Subway Rides", cost: 0.3, icon: "🚇", priority: true },
      { name: "Asado Meals", cost: 15, icon: "🥩", priority: true },
      { name: "Movie Tickets", cost: 5, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 400, icon: "🏠", priority: false },
    ],
  },
  "Paris": {
    currency: "EUR",
    continent: "Europe",
    items: [
      { name: "Croissants", cost: 1.5, icon: "🥐", priority: true },
      { name: "Metro Tickets", cost: 2.1, icon: "🚇", priority: true },
      { name: "Cafés au Lait", cost: 4, icon: "☕", priority: true },
      { name: "Baguettes", cost: 1.2, icon: "🥖", priority: true },
      { name: "Bistro Lunches", cost: 20, icon: "🍽️", priority: false },
      { name: "Monthly Rents", cost: 1200, icon: "🏠", priority: false },
    ],
  },
  "London": {
    currency: "GBP",
    continent: "Europe",
    items: [
      { name: "Teas", cost: 3, icon: "🫖", priority: true },
      { name: "Tube Rides", cost: 2.8, icon: "🚇", priority: true },
      { name: "Fish & Chips", cost: 9, icon: "🐟", priority: true },
      { name: "Pints", cost: 6, icon: "🍺", priority: true },
      { name: "Lunches", cost: 12, icon: "🥗", priority: false },
      { name: "Monthly Rents", cost: 1800, icon: "🏠", priority: false },
    ],
  },
  "Berlin": {
    currency: "EUR",
    continent: "Europe",
    items: [
      { name: "Currywursts", cost: 3.5, icon: "🌭", priority: true },
      { name: "Coffees", cost: 3, icon: "☕", priority: true },
      { name: "Metro Tickets", cost: 3.2, icon: "🚇", priority: true },
      { name: "Döner Kebabs", cost: 5, icon: "🥙", priority: true },
      { name: "Movie Tickets", cost: 12, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 900, icon: "🏠", priority: false },
    ],
  },
  "Tokyo": {
    currency: "JPY",
    continent: "Asia",
    items: [
      { name: "Ramen Bowls", cost: 1000, icon: "🍜", priority: true },
      { name: "Train Rides", cost: 200, icon: "🚇", priority: true },
      { name: "Onigiri", cost: 150, icon: "🍙", priority: true },
      { name: "Sushi Sets", cost: 1500, icon: "🍣", priority: true },
      { name: "Capsule Hotel Nights", cost: 4000, icon: "🛏️", priority: false },
      { name: "Monthly Rents", cost: 100000, icon: "🏢", priority: false },
    ],
  },
  "Mumbai": {
    currency: "INR",
    continent: "Asia",
    items: [
      { name: "Chai Cups", cost: 15, icon: "☕", priority: true },
      { name: "Vada Pavs", cost: 20, icon: "🍔", priority: true },
      { name: "Auto Rides (3km)", cost: 50, icon: "🛺", priority: true },
      { name: "Thali Meals", cost: 150, icon: "🍛", priority: true },
      { name: "Movie Tickets", cost: 250, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 25000, icon: "🏠", priority: false },
    ],
  },
  "Bangkok": {
    currency: "THB",
    continent: "Asia",
    items: [
      { name: "Street Food Meals", cost: 60, icon: "🍜", priority: true },
      { name: "Tuk-Tuk Rides", cost: 100, icon: "🛺", priority: true },
      { name: "Thai Iced Teas", cost: 30, icon: "🧋", priority: true },
      { name: "Pad Thais", cost: 80, icon: "🍝", priority: true },
      { name: "Massages", cost: 300, icon: "💆", priority: false },
      { name: "Monthly Rents", cost: 15000, icon: "🏢", priority: false },
    ],
  },
  "Dubai": {
    currency: "AED",
    continent: "Asia",
    items: [
      { name: "Shawarmas", cost: 10, icon: "🌯", priority: true },
      { name: "Metro Rides", cost: 5, icon: "🚇", priority: true },
      { name: "Coffees", cost: 15, icon: "☕", priority: true },
      { name: "Gold (1 gram)", cost: 250, icon: "💰", priority: true },
      { name: "Taxi Rides (10km)", cost: 30, icon: "🚕", priority: false },
      { name: "Monthly Rents", cost: 5000, icon: "🏠", priority: false },
    ],
  },
  "Shanghai": {
    currency: "CNY",
    continent: "Asia",
    items: [
      { name: "Dumplings (10pc)", cost: 15, icon: "🥟", priority: true },
      { name: "Metro Rides", cost: 5, icon: "🚇", priority: true },
      { name: "Bubble Teas", cost: 12, icon: "🧋", priority: true },
      { name: "Noodle Bowls", cost: 20, icon: "🍜", priority: true },
      { name: "Movie Tickets", cost: 50, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 6000, icon: "🏠", priority: false },
    ],
  },
  "Cairo": {
    currency: "EGP",
    continent: "Africa",
    items: [
      { name: "Koshari Plates", cost: 30, icon: "🍛", priority: true },
      { name: "Metro Rides", cost: 5, icon: "🚇", priority: true },
      { name: "Falafel Sandwiches", cost: 15, icon: "🥙", priority: true },
      { name: "Teas", cost: 10, icon: "☕", priority: true },
      { name: "Movie Tickets", cost: 80, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 5000, icon: "🏠", priority: false },
    ],
  },
  "Lagos": {
    currency: "USD",
    continent: "Africa",
    items: [
      { name: "Jollof Rice Plates", cost: 3, icon: "🍛", priority: true },
      { name: "Bus Rides", cost: 0.5, icon: "🚌", priority: true },
      { name: "Suya Sticks", cost: 2, icon: "�串", priority: true },
      { name: "Soft Drinks", cost: 1, icon: "🥤", priority: true },
      { name: "Movie Tickets", cost: 5, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 400, icon: "🏠", priority: false },
    ],
  },
  "Sydney": {
    currency: "AUD",
    continent: "Oceania",
    items: [
      { name: "Coffees", cost: 5, icon: "☕", priority: true },
      { name: "Ferry Rides", cost: 8, icon: "⛴️", priority: true },
      { name: "Meat Pies", cost: 6, icon: "🥧", priority: true },
      { name: "Fish & Chips", cost: 15, icon: "🐟", priority: true },
      { name: "Movie Tickets", cost: 22, icon: "🎬", priority: false },
      { name: "Monthly Rents", cost: 2500, icon: "🏠", priority: false },
    ],
  },
};
