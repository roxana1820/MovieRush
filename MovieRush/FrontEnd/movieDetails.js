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
