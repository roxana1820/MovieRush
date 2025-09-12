const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/top-rated', async (req, res) => {
    try {
        const page = req.query.page || 1;
        console.log(`Fetching top-rated movies for page ${page}`);
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
        );
        console.log('TMDB response:', response.data.results.length, 'movies');
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching top rated movies:', error.message);
        res.status(500).json({ error: 'Failed to fetch top rated movies' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const [popular, topRated, upcoming, nowPlaying] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
        ]);

        res.json({
            popular: popular.data.results,
            topRated: topRated.data.results,
            upcoming: upcoming.data.results,
            nowPlaying: nowPlaying.data.results,
        });
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

module.exports = router;