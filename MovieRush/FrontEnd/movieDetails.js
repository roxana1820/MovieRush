document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  const posterEl = document.getElementById("moviePoster");
  const titleEl = document.getElementById("movieTitle");
  const ratingEl = document.getElementById("movieRating");
  const actorsEl = document.getElementById("movieActors");
  const overviewEl = document.getElementById("movieOverview");
  const trailerBtn = document.getElementById("watchTrailerBtn");
  const favoriteBtn = document.getElementById("favoriteBtn");

  const isLoggedIn = await initCommonFunctions();
  
   const video = document.getElementById("bg-video");
    if (video) {
        video.play().catch(() => {
            document.body.addEventListener("touchstart", () => {
                video.play();
            }, { once: true });
        });
    }


  async function toggleFavorite() {
    if (!isLoggedIn) {
      alert("Please log in to add to favorites.");
      return;
    }

    const isAdded = favoriteBtn.classList.contains("added");
    const endpoint = isAdded ? "/remove" : "/add";
    const body = { movieId: movieId.toString() };

    try {
      console.log("Toggling favorite:", endpoint, "for movie:", movieId);
      const res = await fetch(`${API_BASE}/api/favorites${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle favorite");
      }

      const data = await res.json();
      console.log("Favorites updated:", data.favorites);

      if (isAdded) {
        favoriteBtn.textContent = "♡";
        favoriteBtn.classList.remove("added");
        console.log("Removed from favorites");
      } else {
        favoriteBtn.textContent = "❤️";
        favoriteBtn.classList.add("added");
        console.log("Added to favorites");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Error updating favorites. Please try again.");
    }
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", toggleFavorite);
  }

  if (!movieId) {
    titleEl.textContent = "No movie selected.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/movies/details/${movieId}`);
    const movie = await response.json();

    const creditsResponse = await fetch(
      `${API_BASE}/api/movies/details/${movieId}/credits`
    );
    const credits = await creditsResponse.json();
    const topCast = credits.cast
      .slice(0, 5)
      .map((actor) => actor.name)
      .join(", ");

    const releaseYear = movie.release_date
      ? movie.release_date.split("-")[0]
      : "N/A";

    posterEl.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    posterEl.alt = movie.title;
    titleEl.textContent = `${movie.title} (${releaseYear})`;
    ratingEl.innerHTML = `<strong>Rating:</strong> ⭐ ${movie.vote_average}`;
    actorsEl.innerHTML = `<strong>Main Actors:</strong> ${topCast}`;
    overviewEl.innerHTML = `<strong>Description:</strong> ${movie.overview}`;

    if (isLoggedIn && favoriteBtn) {
      try {
        const favRes = await fetch(`${API_BASE}/api/favorites`, {
          credentials: "include",
        });
        if (favRes.ok) {
          const favData = await favRes.json();
          const isAdded = favData.favorites.some(
            (id) => id.toString() === movieId.toString()
          );
          if (isAdded) {
            favoriteBtn.textContent = "❤️";
            favoriteBtn.classList.add("added");
          } else {
            favoriteBtn.textContent = "♡";
            favoriteBtn.classList.remove("added");
          }
        }
      } catch (favErr) {
        console.error("Error checking favorites:", favErr);
      }
    }

    trailerBtn.addEventListener("click", async () => {
      try {
        const videosResponse = await fetch(
          `${API_BASE}/api/movies/details/${movieId}/videos`
        );
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
  } catch (error) {
    console.error("Error loading movie details:", error);
    titleEl.textContent = `Error loading details: ${error.message}`;
  }
});