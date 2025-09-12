document.addEventListener("DOMContentLoaded", async function () {
    const response = await fetch("http://localhost:5001/api/movies/all");
    const allMovies = await response.json();

    console.log("Initial movies:", allMovies);

    let currentIndex = 0;
    let topRatedPage = 1;
    let isLoading = false;

    const featuredImage = document.getElementById('featuredImage');
    const featuredTitle = document.getElementById('featuredTitle');
    const featuredDescription = document.getElementById('featuredDescription');
    const upNextList = document.getElementById('upNextList');
    const topRatedList = document.getElementById('topRatedList');

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
    renderSection("nowPlayingList", allMovies.nowPlaying);

    async function loadMoreTopRatedMovies() {
        if (isLoading) return;
        isLoading = true;
        topRatedList.classList.add('loading');
        console.log(`Loading more movies for page ${topRatedPage + 1}`);

        try {
            const response = await fetch(`http://localhost:5001/api/movies/top-rated?page=${topRatedPage + 1}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const newMovies = await response.json();
            console.log('New movies:', newMovies);
            if (newMovies.length > 0) {
                topRatedPage++;
                renderSection("topRatedList", newMovies);
            } else {
                console.log('No more movies to load');
            }
        } catch (error) {
            console.error("Error loading more movies:", error);
        } finally {
            isLoading = false;
            topRatedList.classList.remove('loading');
        }
    }

    const observer = new IntersectionObserver((entries) => {
        console.log('IntersectionObserver triggered', entries[0].isIntersecting);
        if (entries[0].isIntersecting && !isLoading) {
            loadMoreTopRatedMovies();
        }
    }, { threshold: 0.1 });

    const sentinel = document.getElementById('sentinel');
    if (sentinel) {
        observer.observe(sentinel);
    } else {
        console.warn('Sentinel element not found');
    }

    // Автоматично добавяне на скрол бутони за всяка секция
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
