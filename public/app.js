// State management
let currentCategory = '';
let currentPage = 1;
let totalPages = 1;
let allItems = [];

// DOM elements
const landingScreen = document.getElementById('landing-screen');
const listScreen = document.getElementById('list-screen');
const detailScreen = document.getElementById('detail-screen');
const categoryCards = document.querySelectorAll('.category-card');
const backToCategoriesBtn = document.getElementById('back-to-categories');
const backToListBtn = document.getElementById('back-to-list');
const listTitle = document.getElementById('list-title');
const itemsList = document.getElementById('items-list');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const detailContent = document.getElementById('detail-content');
const detailImage = document.getElementById('detail-image');
const homeLink = document.getElementById('home-link');

// Cache for character images from alternative API
let characterImagesCache = null;

async function loadCharacterImages() {
  if (characterImagesCache) return characterImagesCache;

  try {
    const response = await fetch('https://akabab.github.io/starwars-api/api/all.json');
    const characters = await response.json();

    // Create a lookup by name
    characterImagesCache = {};
    characters.forEach(char => {
      characterImagesCache[char.name.toLowerCase()] = char.image;
    });

    return characterImagesCache;
  } catch (error) {
    console.error('Failed to load character images:', error);
    return {};
  }
}

async function getImageUrl(item) {
  const name = (item.name || item.title || '').toLowerCase();
  const category = currentCategory;

  // For people category, use the character images API
  if (category === 'people') {
    const images = await loadCharacterImages();
    if (images[name]) {
      return images[name];
    }
  }

  // For other categories, use placeholder images based on category
  const placeholders = {
    films: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
    planets: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=600&fit=crop',
    species: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    starships: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=600&fit=crop',
    vehicles: 'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=400&h=600&fit=crop'
  };

  return placeholders[category] || null;
}

// Event listeners
categoryCards.forEach(card => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    showListScreen(category);
  });
});

backToCategoriesBtn.addEventListener('click', showLandingScreen);
backToListBtn.addEventListener('click', () => showListScreen(currentCategory));
prevPageBtn.addEventListener('click', () => changePage(-1));
nextPageBtn.addEventListener('click', () => changePage(1));
homeLink.addEventListener('click', showLandingScreen);

// Screen navigation
function showLandingScreen() {
  landingScreen.classList.add('active');
  listScreen.classList.remove('active');
  detailScreen.classList.remove('active');
  currentCategory = '';
  currentPage = 1;
}

function showListScreen(category) {
  currentCategory = category;
  currentPage = 1;
  landingScreen.classList.remove('active');
  listScreen.classList.add('active');
  detailScreen.classList.remove('active');
  listTitle.textContent = category;
  loadCategoryItems();
}

function showDetailScreen(item) {
  listScreen.classList.remove('active');
  detailScreen.classList.add('active');
  displayItemDetails(item);
}

// API calls
async function loadCategoryItems() {
  itemsList.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const response = await fetch(`/api/${currentCategory}?page=${currentPage}`);
    const data = await response.json();

    allItems = data.results;
    totalPages = Math.ceil(data.count / 10);

    displayItems(data.results);
    updatePagination();
  } catch (error) {
    itemsList.innerHTML = '<div class="loading">Error loading data</div>';
    console.error('Error:', error);
  }
}

function displayItems(items) {
  itemsList.innerHTML = '';

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    // Get the display name based on category
    const name = item.name || item.title || 'Unknown';

    // Create thumbnail container
    const thumbnail = document.createElement('div');
    thumbnail.className = 'item-thumbnail';
    thumbnail.innerHTML = '<div class="loading-small">Loading...</div>';

    // Load image asynchronously
    getImageUrl(item).then(imageUrl => {
      if (imageUrl) {
        thumbnail.innerHTML = `<img src="${imageUrl}" alt="${name}" />`;
      } else {
        thumbnail.innerHTML = '<div class="no-image">No Image</div>';
      }
    });

    const nameDiv = document.createElement('h3');
    nameDiv.textContent = name;

    card.appendChild(thumbnail);
    card.appendChild(nameDiv);

    card.addEventListener('click', () => showDetailScreen(item));
    itemsList.appendChild(card);
  });
}

function displayItemDetails(item) {
  detailContent.innerHTML = '';
  detailImage.innerHTML = '';

  // Get the display name
  const name = item.name || item.title || 'Unknown';

  const title = document.createElement('h2');
  title.textContent = name;
  detailContent.appendChild(title);

  // Display all properties except URLs
  for (const [key, value] of Object.entries(item)) {
    if (key === 'url' || key === 'created' || key === 'edited') continue;

    // Skip array properties that are URLs
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].startsWith('http')) {
      continue;
    }

    const row = document.createElement('div');
    row.className = 'detail-row';

    const label = document.createElement('div');
    label.className = 'detail-label';
    label.textContent = key.replace(/_/g, ' ') + ':';

    const valueDiv = document.createElement('div');
    valueDiv.className = 'detail-value';

    if (Array.isArray(value)) {
      valueDiv.textContent = value.join(', ');
    } else {
      valueDiv.textContent = value;
    }

    row.appendChild(label);
    row.appendChild(valueDiv);
    detailContent.appendChild(row);
  }

  // Display image (async)
  detailImage.innerHTML = '<div class="loading">Loading image...</div>';
  getImageUrl(item).then(imageUrl => {
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = name;
      img.onerror = function() {
        detailImage.innerHTML = '<div class="loading">Image not available</div>';
      };
      detailImage.innerHTML = '';
      detailImage.appendChild(img);
    } else {
      detailImage.innerHTML = '<div class="loading">Image not available</div>';
    }
  });
}

function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

function changePage(direction) {
  currentPage += direction;
  loadCategoryItems();
}

// Initialize app
showLandingScreen();
