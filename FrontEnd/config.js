window.config = {
  // Automatically use production URL if on Render, otherwise use local
  API_BASE: window.location.hostname.includes('render.com') 
    ? "https://movie-rush-qxcb.onrender.com"  // Production backend URL
    : "http://127.0.0.1:5001"  // Local development
};

