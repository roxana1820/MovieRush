document.addEventListener("DOMContentLoaded", async function () {
  const API_BASE = config.API_BASE;
  console.log('API_BASE:', API_BASE);

  let allMovies;
  try {
    const response = await fetch(`${API_BASE}/api/movies/all`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    allMovies = await response.json();
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    alert(`⚠️ Unable to load movies. There was an error connecting to the server ${API_BASE}. Please check your connection and try again.`);
    return; // Exit early if we can't load movies
  }

  const categoriesBtn = document.getElementById('categoriesBtn');
  const categoriesDropdown = document.getElementById('categoriesDropdown');
  let genres = [];
  let isDropdownOpen = false;

  const profileBtn = document.getElementById('profileBtn');
  profileBtn.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include'
    });

    console.log('Response status:', res.status);

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Full response data:', data);


    if (data.loggedIn === true || data.user) {
      profileBtn.style.display = 'block';
      console.log('User logged in – button shown');
    } else {
      profileBtn.style.display = 'none';
      console.log('User not logged in – button hidden');
    }
  } catch (err) {
    console.error('Fetch error details:', err.message);
    profileBtn.style.display = 'none';
    console.log('Error occurred – button hidden');
  }

  async function loadGenres() {
    try {
      const response = await fetch(`${API_BASE}/api/movies/genres`);
      genres = await response.json();
      renderGenres();

    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  }

  function renderGenres() {
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
      categoriesDropdown.classList.remove('show');
      isDropdownOpen = false;

      const response = await fetch(`${API_BASE}/api/movies/by-genre/${genreId}`);
      const movies = await response.json();

      document.querySelector('.main-content').style.display = 'none';

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
      document.querySelector('.main-content').style.display = 'flex';
      document.querySelectorAll('.movie-section').forEach(section => {
        if (section.id !== 'genreSection') {
          section.style.display = 'block';
        }
      });
      genreSection.remove();
    });

    genreSection.scrollIntoView({ behavior: 'smooth' });
  }

  categoriesBtn.addEventListener('click', (e) => {
    console.log('Button clicked!');
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    console.log('isDropdownOpen:', isDropdownOpen);
    categoriesDropdown.classList.toggle('show', isDropdownOpen);
    console.log('Dropdown classes:', categoriesDropdown.classList.toString());
  });

  document.addEventListener('click', (e) => {
    if (!categoriesBtn.contains(e.target) && !categoriesDropdown.contains(e.target)) {
      categoriesDropdown.classList.remove('show');
      isDropdownOpen = false;
    }
  });

  loadGenres();

  let currentIndex = 0;
  let topRatedPage = 1;
  let isLoading = false;

  const featuredImage = document.getElementById('featuredImage');
  const featuredTitle = document.getElementById('featuredTitle');
  const featuredDescription = document.getElementById('featuredDescription');
  const upNextList = document.getElementById('upNextList');
  const topRatedList = document.getElementById('topRatedList');
  const searchInput = document.getElementById("searchInput");

  function updateFeaturedMovie() {
    const movie = allMovies.popular[currentIndex];
    featuredImage.src = `https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`;
    featuredTitle.textContent = movie.title;
    featuredDescription.textContent = movie.overview;

    upNextList.innerHTML = '';
    const nextMovies = allMovies.popular.slice(currentIndex + 1, currentIndex + 9)
      .concat(allMovies.popular.slice(0, Math.max(0, 8 - (allMovies.popular.length - currentIndex - 1))));
    nextMovies.forEach(movie => {
      const item = document.createElement('div');
      item.classList.add('up-next-item');
      item.innerHTML = `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}"><span>${movie.title}</span>`;

      item.addEventListener("click", () => {
        currentIndex = allMovies.popular.findIndex(m => m.id === movie.id);
        updateFeaturedMovie();
      });

      upNextList.appendChild(item);
    });
  }

  document.getElementById('prevBtn').addEventListener('click', function () {
    currentIndex = (currentIndex - 1 + allMovies.popular.length) % allMovies.popular.length;
    updateFeaturedMovie();
  });

  document.getElementById('nextBtn').addEventListener('click', function () {
    currentIndex = (currentIndex + 1) % allMovies.popular.length;
    updateFeaturedMovie();
  });

  updateFeaturedMovie();

  function renderSection(sectionId, movies) {
    const list = document.getElementById(sectionId);
    movies.forEach(movie => {
      const card = document.createElement('div');
      card.classList.add('movie-card');
      card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <p>${movie.title}</p>
        `;
      card.addEventListener("click", () => {
        window.location.href = `movieDetails.html?id=${movie.id}`;
      });
      list.appendChild(card);
    });
  }
  renderSection("topRatedList", allMovies.topRated);
  renderSection("upcomingList", allMovies.upcoming);
  renderSection("mostWatchedList", allMovies.nowPlaying);

  document.querySelectorAll(".movie-list-container").forEach(container => {
    const sectionId = container.dataset.section;

    const prevBtn = document.createElement("button");
    prevBtn.className = "scroll-btn prev-movie-btn";
    prevBtn.innerHTML = "&lt;";
    prevBtn.addEventListener("click", () => {
      document.getElementById(sectionId).scrollBy({ left: -300, behavior: "smooth" });
    });

    const nextBtn = document.createElement("button");
    nextBtn.className = "scroll-btn next-movie-btn";
    nextBtn.innerHTML = "&gt;";
    nextBtn.addEventListener("click", () => {
      document.getElementById(sectionId).scrollBy({ left: 300, behavior: "smooth" });
    });

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
  });

  const searchButton = document.createElement("button");
  searchButton.id = "searchBtn";
  searchButton.style.marginLeft = "5px";
  searchButton.style.cursor = "pointer";
  searchButton.style.background = "transparent";
  searchButton.style.border = "none";
  searchButton.style.fontSize = "18px";
  searchInput.parentNode.appendChild(searchButton);

  function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    document.getElementById("searchResultsSection")?.remove();

    const results = [
      ...allMovies.popular,
      ...allMovies.topRated,
      ...allMovies.upcoming,
      ...allMovies.nowPlaying
    ].filter(movie => movie.title.toLowerCase().includes(query));

    const resultsSection = document.createElement("div");
    resultsSection.className = "movie-section";
    resultsSection.id = "searchResultsSection";
    resultsSection.innerHTML = `<h3>Search Results for "${query}"</h3><div class="movie-list-container"><div class="movie-list"></div></div>`;

    const resultsList = resultsSection.querySelector(".movie-list");
    if (results.length > 0) {
      results.forEach(movie => {
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
      resultsList.innerHTML = `<p style="color:white; font-size:1rem;">No results found.</p>`;
    }

    document.querySelectorAll(".movie-section").forEach(section => {
      if (section.id !== "searchResultsSection") section.style.display = "none";
    });

    document.body.appendChild(resultsSection);

    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  searchButton.addEventListener("click", handleSearch);

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") handleSearch();
  });

  //for favorites
  const favoritesLink = document.getElementById('favoritesLink');
  if (favoritesLink) {
    favoritesLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await showFavoritesList();
    });
  }

  async function showFavoritesList() {
    try {
      const res = await fetch(`${API_BASE}/api/favorites`, {
        credentials: 'include'
      });

      if (!res.ok) {
        alert('Please log in to view your favorite movies.');
        return;
      }

      const data = await res.json();


      document.querySelector('.main-content').style.display = 'none';
      document.querySelectorAll('.movie-section').forEach(section => {
        section.style.display = 'none';
      });


      document.getElementById('favoritesSection')?.remove();


      const favoritesSection = document.createElement('div');
      favoritesSection.className = 'movie-section';
      favoritesSection.id = 'favoritesSection';
      favoritesSection.innerHTML = `
      <div style="margin-bottom: 20px;">
        <button id="backToHomeBtn" class="go-back-btn">← Back</button>
        <h3 style="margin: 10px 0 0 0;"> ❤️ Your Favorites</h3>
      </div>
      <div class="movie-list-container">
        <div class="movie-list" id="favoritesList" style="flex-wrap: wrap; justify-content: flex-start;"></div>
      </div>
    `;

      document.body.appendChild(favoritesSection);

      const favoritesList = favoritesSection.querySelector('#favoritesList');

      if (data.favorites.length === 0) {
        favoritesList.innerHTML = `<p style="color:white">You don't have any favorite movies yet.</p>`;
      } else {
        for (const movieId of data.favorites) {
          const movieRes = await fetch(`${API_BASE}/api/movies/details/${movieId}`);
          const movie = await movieRes.json();

          const card = document.createElement('div');
          card.className = 'movie-card';
          card.innerHTML = `
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
        }
      }

      favoritesSection.querySelector('#backToHomeBtn').addEventListener('click', () => {
        document.querySelector('.main-content').style.display = 'flex';
        document.querySelectorAll('.movie-section').forEach(section => {
          if (section.id !== 'favoritesSection') {
            section.style.display = 'block';
          }
        });
        favoritesSection.remove();
      });

      favoritesSection.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      alert('Error loading favorites.');
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
      alert("Error removing from favorites. Please try again.");
    }
  }

  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {

        const res = await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Logout error: ' + res.status);
        }

        const data = await res.json();

        window.location.href = 'index.html';

      } catch (err) {
        console.error('Logout failed:', err);
        alert('Error logging out – please try again.');
      }
    });
  }


});
