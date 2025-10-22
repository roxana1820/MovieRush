const API_BASE = config.API_BASE;

function waitForHeader() {
  return new Promise((resolve) => {
    if (document.getElementById('header').innerHTML.trim() !== '') {
      resolve();
    } else {
      document.addEventListener('headerLoaded', resolve, { once: true });
      setTimeout(resolve, 5000);
    }
  });
}

async function checkLoginStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
      mode: 'cors'
    });

    if (!res.ok) throw new Error(res.status);

    const data = await res.json();
    return data.loggedIn === true || data.user;
  } catch (err) {
    console.error('Login check error:', err);
    return false;
  }
}

async function loadGenres() {
  try {
    const response = await fetch(`${API_BASE}/api/movies/genres`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

function renderGenres(genres, categoriesDropdown) {
  categoriesDropdown.innerHTML = '';
  
  const homeItem = document.createElement('div');
  homeItem.className = 'category-item';
  homeItem.textContent = '🏠 Home';
  homeItem.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  categoriesDropdown.appendChild(homeItem);

  genres.forEach(genre => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.textContent = genre.name;
    item.addEventListener('click', () => selectGenre(genre.id, genre.name));
    categoriesDropdown.appendChild(item);
  });
}

async function selectGenre(genreId, genreName) {
  try {
    const categoriesDropdown = document.getElementById('categoriesDropdown');
    categoriesDropdown.classList.remove('show');

    const response = await fetch(`${API_BASE}/api/movies/by-genre/${genreId}`);
    const movies = await response.json();

    document.querySelector('.main-content')?.style.setProperty('display', 'none');

    document.querySelectorAll('.movie-section').forEach(section => {
      section.style.display = 'none';
    });

    showGenreMovies(movies, genreName);

  } catch (error) {
    console.error('Error fetching movies by genre:', error);
  }
}

function showGenreMovies(movies, genreName) {
  document.getElementById('genreSection')?.remove();

  const genreSection = document.createElement('div');
  genreSection.className = 'movie-section';
  genreSection.id = 'genreSection';
  genreSection.innerHTML = `
    <div style="margin-bottom: 20px;">
      <button id="backToHomeBtn" class="go-back-btn">← Back</button>
      <h3 style="margin: 10px 0 0 0;"> 🎬 ${genreName} Movies</h3>
    </div>
    <div class="movie-list-container">
      <div class="movie-list" id="genreMoviesList" style="flex-wrap: wrap; justify-content: flex-start;"></div>
    </div>
  `;

  document.body.appendChild(genreSection);

  const moviesList = genreSection.querySelector('#genreMoviesList');
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;

    card.addEventListener("click", () => {
      window.location.href = `movieDetails.html?id=${movie.id}`;
    });

    moviesList.appendChild(card);
  });

  document.getElementById('backToHomeBtn').addEventListener('click', () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent ) mainContent.style.display = 'flex';
    
     document.querySelectorAll('.movie-section').forEach(section => {
      if (section.id !== 'genreSection' && section.id !== 'searchResultsSection' && section.id !== 'favoritesSection') {
        section.style.display = 'block';
      }
    });
    genreSection.remove();
  });

  genreSection.scrollIntoView({ behavior: 'smooth' });
}

function initCategoriesDropdown() {
  const categoriesBtn = document.getElementById('categoriesBtn');
  const categoriesDropdown = document.getElementById('categoriesDropdown');
  let isDropdownOpen = false;

  if (categoriesBtn) {
    categoriesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isDropdownOpen = !isDropdownOpen;
      categoriesDropdown.classList.toggle('show', isDropdownOpen);
    });
  }

  document.addEventListener('click', (e) => {
    if (categoriesBtn && !categoriesBtn.contains(e.target) && !categoriesDropdown.contains(e.target)) {
      categoriesDropdown.classList.remove('show');
      isDropdownOpen = false;
    }
  });
}

async function handleSearch(query) {
  if (!query.trim()) {
     resetSearchBar();
     return;
  } 

  document.getElementById("searchResultsSection")?.remove();

  try {
    const response = await fetch(`${API_BASE}/api/movies/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const results = await response.json();

    const resultsSection = document.createElement("div");
    resultsSection.className = "movie-section";
    resultsSection.id = "searchResultsSection";
    resultsSection.innerHTML = `
      <div style="margin-bottom: 20px;">
        <button id="backToHomeFromSearch" class="go-back-btn">← Back</button>
        <h3 style="margin: 10px 0 0 0;"> Search Results for "${query}"</h3>
      </div>
      <div class="movie-list-container">
        <div class="movie-list" id="searchResultsList" style="flex-wrap: wrap; justify-content: flex-start;"></div>
      </div>
    `;

    const resultsList = resultsSection.querySelector("#searchResultsList");

    if (results.length > 0) {
      results.forEach(movie => {
        if (!movie.poster_path) return;

        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
          <p>${movie.title}</p>
        `;
        card.addEventListener("click", () => {
          window.location.href = `movieDetails.html?id=${movie.id}`;
        });
        resultsList.appendChild(card);
      });
    } else {
      resultsList.innerHTML = `<p style="color:white; font-size:1rem;">No results found for "${query}".</p>`;
    }

    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.display = 'none';
    
    document.querySelectorAll(".movie-section").forEach(section => {
      if (section.id !== "searchResultsSection") {
        section.style.display = "none";
      }
    });

    document.body.appendChild(resultsSection);

    document.getElementById('backToHomeFromSearch').addEventListener('click', () => {
      if (mainContent) mainContent.style.display = 'flex';
      document.querySelectorAll('.movie-section').forEach(section => {
        if (section.id !== 'searchResultsSection') {
          section.style.display = 'block';
        }
      });
      resultsSection.remove();
    });

    resultsSection.scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error('Search error:', error);
    alert('Error searching movies. Please try again.');
  }
}

function resetSearchBar() {
  const searchInput = document.getElementById("searchInput");
  const siteTitle = document.querySelector('.site-title');
  const categoriesBtn = document.getElementById('categoriesBtn');
  const searchBtn = document.getElementById('searchBtn');
  const cancelSearchBtn = document.getElementById('cancelSearchBtn');

  if(window.innerWidth <= 768) {
    searchInput.style.display = 'none';
    siteTitle.style.display = 'block';
    categoriesBtn.style.display = 'block';
    searchBtn.style.display = 'block';

    if(cancelSearchBtn) cancelSearchBtn.style.display = 'none';
    searchInput.value = '';
  }
}


function initSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const header = document.querySelector('.header');
  let cancelSearchBtn = document.getElementById('cancelSearchBtn');

  if(!cancelSearchBtn) {
    cancelSearchBtn = document.createElement('button');
    cancelSearchBtn.id = 'cancelSearchBtn';
    cancelSearchBtn.textContent ='X';
    cancelSearchBtn.className = 'cancel-search-btn';
    header.appendChild(cancelSearchBtn);
  }

  if(searchBtn) {
    searchBtn.addEventListener("click", () => {
      if(window.innerWidth <= 768) {
        const siteTitle = document.querySelector('.site-title');
        const categoriesBtn = document.getElementById('categoriesBtn');

        if(searchInput.style.display === 'block') {
          handleSearch(searchInput.value);
        } else {
          siteTitle.style.display = 'none';
          categoriesBtn.style.display = 'none';
          searchBtn.style.display = 'none';
          searchInput.style.display = 'block';
          cancelSearchBtn.style.display = 'block';
          searchInput.focus();
        }
      } else {
        handleSearch(searchInput.value);
      }
    });
  }

  if(cancelSearchBtn) {
    cancelSearchBtn.addEventListener('click', () => {
      resetSearchBar();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleSearch(searchInput.value);
    });
  }
}

async function removeFromFavorites(movieIdToRemove) {
  const body = { movieId: movieIdToRemove.toString() };

  try {
    console.log("Removing movie ID:", movieIdToRemove);
    const res = await fetch(`${API_BASE}/api/favorites/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    console.log("Remove response status:", res.status);

    if (!res.ok) {
      throw new Error("Failed to remove from favorites");
    }

    const data = await res.json();
    console.log("Favorite removed:", data.favorites);
  } catch (err) {
    console.error("Error removing favorite:", err);
    throw err;
  }
}

async function showFavoritesList() {
  try {
    console.log("Fetching favorites...");
    const res = await fetch(`${API_BASE}/api/favorites`, {
      credentials: "include",
    });

    console.log("Favorites response status:", res.status);

    if (!res.ok) {
      alert("Please log in to view your favorite movies.");
      return;
    }

    const data = await res.json();
    console.log("Fetched favorites data:", data);

    const mainContent = document.querySelector(".main-content");
    if (mainContent) mainContent.style.display = "none";
    
    document.querySelectorAll(".movie-section").forEach(section => {
      if (section.id !== 'favoritesSection') {
        section.style.display = 'none';
      }
    });
    document.getElementById("favoritesSection")?.remove();

    const favoritesSection = document.createElement("div");
    favoritesSection.className = "movie-section";
    favoritesSection.id = "favoritesSection";
    favoritesSection.innerHTML = `
      <div style="margin-bottom: 20px;">
        <button id="backToHomeBtn" class="go-back-btn" style="position: static; display: block; margin: 0 0 20px 0;">← Back</button>
        <h3 style="margin: 10px 0 0 0;"> ❤️ Your Favorites</h3>
      </div>
      <div class="movie-list-container">
        <div class="movie-list" id="favoritesList" style="flex-wrap: wrap; justify-content: flex-start;"></div>
      </div>
    `;
    document.body.appendChild(favoritesSection);
    console.log("Appended favorites section to body");

    const favoritesList = favoritesSection.querySelector("#favoritesList");

    if (data.favorites.length === 0) {
      favoritesList.innerHTML = `<p style="color:white; font-size:1rem;">You don't have any favorite movies yet.</p>`;
      console.log("No favorites, set empty message");
    } else {
      console.log(`Loading ${data.favorites.length} favorites...`);
      let loadedCount = 0;
      for (const movieId of data.favorites) {
        try {
          console.log("Loading movie ID:", movieId);
          const movieRes = await fetch(`${API_BASE}/api/movies/details/${movieId}`);
          console.log("Movie response status for", movieId, ":", movieRes.status);
          
          if (!movieRes.ok) {
            console.error(`Failed to fetch movie ${movieId}`);
            continue;
          }
          const movie = await movieRes.json();
          console.log("Movie data for", movieId, ":", movie);

          const card = document.createElement("div");
          card.className = "movie-card";
          card.innerHTML = `
            <div style="position: relative;">
              <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
              <p>${movie.title}</p>
              <button class="remove-btn" style="position: absolute; 
              top: 5px; right: 5px; background: rgba(238, 231, 231, 0.7); color: black; border: none; border-radius: 50%;
              width: 25px; height: 25px; cursor: pointer; font-size: 18px; font-weight: bold; z-index: 10;">×</button>
            </div>
          `;

          card.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-btn")) return;
            window.location.href = `movieDetails.html?id=${movie.id}`;
          });

          const removeBtn = card.querySelector(".remove-btn");
          removeBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
              await removeFromFavorites(movieId);
              card.remove();
              if (!favoritesList.querySelector(".movie-card")) {
                favoritesList.innerHTML = `<p style="color:white; font-size:1rem;">You don't have any favorite movies yet.</p>`;
              }
              console.log(`Movie ${movieId} removed from favorites`);
            } catch (err) {
              console.error(`Error removing movie ${movieId}:`, err);
              alert("Error removing from favorites. Please try again.");
            }
          });

          favoritesList.appendChild(card);
          console.log("Appended card for movie:", movie.title);
          loadedCount++;
        } catch (movieErr) {
          console.error(`Error loading movie ${movieId}:`, movieErr);
          continue;
        }
      }
      if (loadedCount === 0) {
        favoritesList.innerHTML = `<p style="color:white; font-size:1rem;">Error loading favorite movies. Please try again later.</p>`;
        console.log("No movies loaded, set error message");
      } else {
        console.log(`Successfully loaded ${loadedCount} movies`);
      }
    }

   document.getElementById('backToHomeBtn').addEventListener('click', () => {
    if (mainContent) mainContent.style.display = 'flex';
    
    document.querySelectorAll('.movie-section').forEach(section => {
      if (section.id !== 'genreSection' && section.id !== 'searchResultsSection' && section.id !== 'favoritesSection') {
        section.style.display = 'block';
      }
    });
      favoritesSection.remove();
      resetSearchBar();
  });

    favoritesSection.scrollIntoView({ behavior: "smooth" }); 
  } catch (err) {
    console.error("Error in showFavoritesList:", err);
    alert("Error loading favorites.");
  }
}

function initSiteTitle() {
  const siteTitle = document.querySelector('.site-title');
  if (siteTitle) {
    siteTitle.addEventListener('click', () => {
      siteTitle.style.cursor = "pointer";
      window.location.href = 'movies.html';
    });
  }
}

function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = 'index.html';
    });
  }
}

async function initCommonFunctions() {
  await waitForHeader();
  
  const isLoggedIn = await checkLoginStatus();
  const profileBtn = document.getElementById('profileBtn');
  const searchBar = document.querySelector('.search-bar');
  const searchBtn = document.getElementById('searchBtn');
  
  if (profileBtn) {
    profileBtn.style.display = isLoggedIn ? 'block' : 'none';
  }

if (searchBtn) {
  if (!isLoggedIn) {
    searchBtn.classList.add('right');
  } else {
    searchBtn.classList.remove('right');
  }
}

  const genres = await loadGenres();
  const categoriesDropdown = document.getElementById('categoriesDropdown');
  if (categoriesDropdown) {
    renderGenres(genres, categoriesDropdown);
  }

  initCategoriesDropdown();
  initSearch();
  initSiteTitle();
  initLogout();

  const favoritesLink = document.getElementById('favoritesLink');
  if (favoritesLink) {
    favoritesLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await showFavoritesList();
    });
  }

  return isLoggedIn;
}