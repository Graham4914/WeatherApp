async function fetchWeather(city) {
    const apiKey = '146b3d5f97484a4ca4594300240607';
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7`);
    const data = await response.json();
    return data;
}

export { fetchWeather };