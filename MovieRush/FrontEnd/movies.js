document.addEventListener("DOMContentLoaded", async function () {
    const response = await fetch("http://localhost:5001/api/movies/all");
    const allMovies = await response.json();

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
        const nextMovies = allMovies.popular.slice(currentIndex + 1, currentIndex + 6)
            .concat(allMovies.popular.slice(0, Math.max(0, 5 - (allMovies.popular.length - currentIndex - 1))));
        nextMovies.forEach(movie => {
            const item = document.createElement('div');
            item.classList.add('up-next-item');
            item.innerHTML = `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}"><span>${movie.title}</span>`;
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
            list.appendChild(card);
        });
    }

    renderSection("topRatedList", allMovies.topRated);
    renderSection("upcomingList", allMovies.upcoming);
    renderSection("mostWatchedList", allMovies.nowPlaying); 

    // --- Scroll бутони за секции ---
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
    searchButton.innerHTML = "🔎"; 
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

    searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") handleSearch();
    });
});
