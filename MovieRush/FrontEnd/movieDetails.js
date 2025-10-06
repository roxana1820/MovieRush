document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = config.API_BASE;
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  const posterEl = document.getElementById("moviePoster");
  const titleEl = document.getElementById("movieTitle");
  const ratingEl = document.getElementById("movieRating");
  const actorsEl = document.getElementById("movieActors");
  const overviewEl = document.getElementById("movieOverview");
  const trailerBtn = document.getElementById("watchTrailerBtn");
  const favoriteBtn = document.getElementById("favoriteBtn");
 
  const profileBtn = document.getElementById('profileBtn');
  profileBtn.style.display = 'none';

  if (favoriteBtn) favoriteBtn.style.display = 'none';
  let isLoggedIn = false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error(res.status);

    const data = await res.json();
    if (data.loggedIn === true || data.user) {
      profileBtn.style.display = 'block';
      if(favoriteBtn) favoriteBtn.style.display = 'block';
      isLoggedIn = true;
    } else {
      profileBtn.style.display = 'none';
      if(favoriteBtn) favoriteBtn.style.display ='none';
    }
  } catch (err) {
    profileBtn.style.display = 'none';
  }

  // favorites
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

      document.getElementById('favoritesSection')?.remove();

      const favoritesSection = document.createElement('div');
      favoritesSection.className = 'movie-section';
      favoritesSection.id = 'favoritesSection';
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

      const favoritesList = favoritesSection.querySelector('#favoritesList');

      if (data.favorites.length === 0) {
        favoritesList.innerHTML = `<p style="color:white; font-size:1rem;">You don't have any favorite movies yet.</p>`;
      } else {
        for (const movieId of data.favorites) {
          const movieRes = await fetch(`${API_BASE}/api/movies/details/${movieId}`);
          const movie = await movieRes.json();

          const card = document.createElement('div');
          card.className = 'movie-card';
          card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <p>${movie.title}</p>
          `;
          card.addEventListener("click", () => {
            window.location.href = `movieDetails.html?id=${movie.id}`;
          });
          favoritesList.appendChild(card);
        }
      }

      favoritesSection.querySelector('#backToHomeBtn').addEventListener('click', () => {
        document.querySelector('.main-content').style.display = 'block';
        favoritesSection.remove();
      });

      favoritesSection.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      alert('Error loading favorites.');
    }
  }

  async function toggleFavorite() {
    if(!isLoggedIn) {
      alert('Please log in to add to favorites.');
      return;
    }

    const isAdded = favoriteBtn.classList.contains('added');
    const endpoint = isAdded ? '/remove' : '/add';
    const body = { movieId: parseInt(movieId) };

    try {
      const res = await fetch(`${API_BASE}/api/favorites${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await res.json();
      console.log('Favorites updated:', data.favorites);

     if (isAdded) {
        favoriteBtn.textContent = '♡';
        favoriteBtn.classList.remove('added');
        console.log('Removed from favorites');
      } else {
        favoriteBtn.textContent = '❤️';
        favoriteBtn.classList.add('added');
        console.log('Added to favorites');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Error updating favorites. Please try again.');
    }
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', toggleFavorite);
  }



  // logout
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

  if (!movieId) {
    titleEl.textContent = "No movie selected.";
    return;
  }
  
  try {
    // Movie details
    const response = await fetch(`${API_BASE}/api/movies/details/${movieId}`);
    const movie = await response.json();

    // Credits
    const creditsResponse = await fetch(`${API_BASE}/api/movies/details/${movieId}/credits`);
    const credits = await creditsResponse.json();
    const topCast = credits.cast.slice(0, 5).map(actor => actor.name).join(", ");

    const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

    posterEl.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    posterEl.alt = movie.title;
    titleEl.textContent = `${movie.title} (${releaseYear})`;
    ratingEl.innerHTML = `<strong>Rating:</strong> ⭐ ${movie.vote_average}`;
    actorsEl.innerHTML = `<strong>Main Actors:</strong> ${topCast}`;
    overviewEl.innerHTML = `<strong>Description:</strong> ${movie.overview}`;

    if (isLoggedIn && favoriteBtn) {
      try {
        const favRes = await fetch(`${API_BASE}/api/favorites`, { credentials: 'include' });
        if (favRes.ok) {
          const favData = await favRes.json();
          const isAdded = favData.favorites.includes(parseInt(movieId));
          if (isAdded) {
            favoriteBtn.textContent = '❤️';
            favoriteBtn.classList.add('added');
          } else {
            favoriteBtn.textContent = '♡';
            favoriteBtn.classList.remove('added');
          }
        }
      } catch (favErr) {
        console.error('Error checking favorites:', favErr);
      }
    }

    trailerBtn.addEventListener("click", async () => {
      try {
        const videosResponse = await fetch(`${API_BASE}/api/movies/details/${movieId}/videos`);
        const videos = await videosResponse.json();
        const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");

        if (trailer) {
          window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
        } else {
          alert("No trailer available for this movie.");
        }
      } catch (err) {
        console.error(err);
        alert("Error loading trailer");
      }
    });
  } catch (error) {
    console.error("Error loading movie details:", error);
    titleEl.textContent = `Error loading details: ${error.message}`;
  }
});