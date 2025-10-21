document.addEventListener("DOMContentLoaded", async function () {
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
    return;
  }

  await initCommonFunctions();

  let currentIndex = 0;
  const featuredImage = document.getElementById('featuredImage');
  const featuredTitle = document.getElementById('featuredTitle');
  const featuredDescription = document.getElementById('featuredDescription');
  const upNextList = document.getElementById('upNextList');
  const trailerBtn = document.getElementById("playBtn");

  function truncateText(text, maxLength) {
    if(!text) return '';
    if(text.length <= maxLength) return text;
    return text.slice(0,maxLength) + '...';
  }


  function updateFeaturedMovie() {
    const movie = allMovies.popular[currentIndex];
    featuredImage.src = `https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`;
    featuredTitle.textContent = movie.title;
    featuredDescription.textContent = truncateText(movie.overview, 150);

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

  trailerBtn.addEventListener("click", async () => {
    const currentMovie = allMovies.popular[currentIndex];
    const movieId = currentMovie.id;

    try {
      const videosResponse = await fetch(`${API_BASE}/api/movies/details/${movieId}/videos`);
      const videos = await videosResponse.json();
      const trailer = videos.results.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );

      if (trailer) {
        const trailerUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&playsinline=1`;

         window.location.href = trailerUrl;
      } else {
        alert("No trailer available for this movie.");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading trailer");
    }
  });

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
});