document.addEventListener("DOMContentLoaded", function () {
    const movies = [
        { id: 1, title: "Inception", poster: "inception.jpg", description: "A mind-bending heist movie." },
        { id: 2, title: "Avatar", poster: "avatarMovie.jpg", description: "A dark tale of a hero." },
        { id: 3, title: "Titanic", poster: "titanicMovie.jpg", description: "An epic sci-fi adventure." },
        { id: 4, title: "Karate Kid", poster: "karateKid.jpg", description: "A journey through space." },
        { id: 5, title: "Interstellar", poster: "interstellarMovie.jpg", description: "A journey through space."}
    ];

    let currentIndex = 0;

    function updateFeaturedMovie() {
        const movie = movies[currentIndex];
        document.getElementById('featuredImage').src = movie.poster;
        document.getElementById('featuredTitle').textContent = movie.title;
        document.getElementById('featuredDescription').textContent = movie.description;
    }

    function updateUpNext() {
        const upNextList = document.getElementById('upNextList');
        upNextList.innerHTML = '';
        const nextMovies = movies.slice(currentIndex + 1, currentIndex + 4).concat(movies.slice(0, Math.max(0, 3 - (movies.length - currentIndex - 1))));
        nextMovies.forEach(movie => {
            const item = document.createElement('div');
            item.classList.add('up-next-item');
            item.innerHTML = `<img src="${movie.poster}" alt="${movie.title}"><span>${movie.title}</span>`;
            upNextList.appendChild(item);
        });
    }

    document.getElementById('prevBtn').addEventListener('click', function () {
        currentIndex = (currentIndex - 1 + movies.length) % movies.length;
        updateFeaturedMovie();
        updateUpNext();
    });

    document.getElementById('nextBtn').addEventListener('click', function () {
        currentIndex = (currentIndex + 1) % movies.length;
        updateFeaturedMovie();
        updateUpNext();
    });

    // Initial load
    updateFeaturedMovie();
    updateUpNext();
});