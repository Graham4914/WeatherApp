
import './style.css';
import { fetchWeather } from './weather';
import conditions from './conditions.json';

const BASE_ICON_URL = 'https://cdn.weatherapi.com/weather/64x64/'; // Set the base URL for the icons

let isCelsius = true;


document.getElementById('search-button').addEventListener('click', async () => {
    const city = document.getElementById('search-input').value;
    if (city) {
        try {
            const weatherData = await fetchWeather(city);
            displayWeather(weatherData);
        } catch (error) {
            document.getElementById('weather-info').innerHTML = '<p>Please use a correct city name</p>';
        }
    }
});

document.getElementById('toggle-unit').addEventListener('click', () => {
    isCelsius = !isCelsius;
    document.getElementById('toggle-unit').textContent = isCelsius ? '°C' : '°F';
    const weatherData = JSON.parse(localStorage.getItem('weatherData'));
    if (weatherData) {
        displayWeather(weatherData);
    }
});


function getWeatherIcon(conditionCode, isDaytime) {
    const condition = conditions.find(cond => cond.code === conditionCode);
    if (!condition) {
        return '';
    }

    const iconCode = condition.icon;
    const iconUrl = isDaytime ? `${BASE_ICON_URL}day/${iconCode}.png` : `${BASE_ICON_URL}night/${iconCode}.png`;

    console.log('Weather icon URL:', iconUrl); // Log the URL to check if it's correct
    return iconUrl;
}


function createCarouselControls(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.log(`Container ${containerSelector} not found`);
        return;
    }
    const prevButton = document.createElement('button');
    prevButton.classList.add('carousel-control', 'prev');
    prevButton.innerHTML = '&lt;';
    prevButton.addEventListener('click', () => {
        console.log(`Prev button clicked for ${containerSelector}`);
        slideCarousel(containerSelector, 'prev');
    });

    const nextButton = document.createElement('button');
    nextButton.classList.add('carousel-control', 'next');
    nextButton.innerHTML = '&gt;';
    nextButton.addEventListener('click', () => {
        console.log(`Next button clicked for ${containerSelector}`);
        slideCarousel(containerSelector, 'next');
    });

    container.appendChild(prevButton);
    container.appendChild(nextButton);
}

function slideCarousel(containerSelector, direction) {
    console.log(`Sliding ${direction} in container ${containerSelector}`);
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.log(`Container ${containerSelector} not found in slideCarousel`);
        return;
    }

    const carousel = container.querySelector('.carousel-content');
    if (!carousel) {
        console.log(`Carousel not found in container ${containerSelector}`);
        return;
    }

    const scrollAmount = container.clientWidth;
    const currentScroll = carousel.scrollLeft;

    console.log(`Current scroll position: ${currentScroll}`);
    console.log(`Scroll amount: ${scrollAmount}`);

    if (direction === 'prev') {
        carousel.scrollLeft = currentScroll - scrollAmount;
    } else if (direction === 'next') {
        carousel.scrollLeft = currentScroll + scrollAmount;
    }

    console.log(`New scroll position: ${carousel.scrollLeft}`);
}


function displayWeather(data) {
    localStorage.setItem('weatherData', JSON.stringify(data));
    const weatherInfoDiv = document.getElementById('weather-info');
    const current = data.current;
    const location = data.location;
    const forecast = data.forecast.forecastday;

    const tempUnit = isCelsius ? '°C' : '°F';
    const temp = isCelsius ? current.temp_c : current.temp_f;
    const feelsLike = isCelsius ? current.feelslike_c : current.feelslike_f;
    const windSpeed = isCelsius ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`;

    const isDaytime = current.is_day === 1; // Determine if it's daytime

    const currentIcon = getWeatherIcon(current.condition.code, isDaytime);

    const chanceOfRain = forecast[0].day.daily_chance_of_rain;

    weatherInfoDiv.innerHTML = `
        <div class="weather-container">
            <div class="current-weather">
                <h2>${location.name}, ${location.country}</h2>
                <p>${new Date(location.localtime).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <div class="weather-main">
                    <img src="${currentIcon}" alt="${current.condition.text}" class="weather-icon">
                    <p class="temperature">${temp} ${tempUnit}</p>
                </div>
                <p class="condition">${current.condition.text}</p>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fas fa-thermometer-half icon"></i>
                    <div>
                        <p class="heading">Feels Like</p>
                        <p class="value">${feelsLike} ${tempUnit}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-wind icon"></i>
                    <div>
                        <p class="heading">Wind Speed</p>
                        <p class="value">${windSpeed}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-tint icon"></i>
                    <div>
                        <p class="heading">Humidity</p>
                        <p class="value">${current.humidity} %</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-cloud-rain icon"></i>
                    <div>
                        <p class="heading">Chance of Rain</p>
                        <p class="value">${chanceOfRain} %</p>
                    </div>
                </div>
            </div>
        </div>
              <div class="hourly-forecast-container">
            <div class="carousel-content hourly-forecast">
                ${data.forecast.forecastday[0].hour.map(hour => {
        const hourIsDaytime = new Date(hour.time).getHours() >= 6 && new Date(hour.time).getHours() < 18;
        return `
                    <div class="hour">
                        <p>${new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                        <img src="${getWeatherIcon(hour.condition.code, hourIsDaytime)}" alt="${hour.condition.text}">
                        <p>${isCelsius ? hour.temp_c : hour.temp_f} ${tempUnit}</p>
                    </div>
                `}).join('')}
            </div>
        </div>
                            <div class="forecast-container">
            <div class="carousel-content forecast">
                ${forecast.map(day => `
                    <div class="forecast-day">
                        <p>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                        <p>${new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                        <img src="${getWeatherIcon(day.day.condition.code, true)}" alt="${day.day.condition.text}" class="forecast-icon">
                        <p class="max-temp">${isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f} ${tempUnit}</p>
                        <p class="min-temp">${isCelsius ? day.day.mintemp_c : day.day.mintemp_f} ${tempUnit}</p>
                        <p class="condition">${day.day.condition.text}</p>
                        <p class="chance-of-rain">Chance of Rain: <span class="chance-value">${day.day.daily_chance_of_rain} %</span></p>
                    </div>
                `).join('')}
            </div>
        </div>

    `;

    createCarouselControls('.hourly-forecast-container');
    createCarouselControls('.forecast-container');


    const currentHour = new Date(current.last_updated).getHours();
    const hourElements = document.querySelectorAll('.hourly-forecast .hour');
    const hourWidth = hourElements[0].offsetWidth;
    const carouselContent = document.querySelector('.hourly-forecast-container .carousel-content');
    const scrollToPosition = hourWidth * currentHour - (carouselContent.offsetWidth / 2) + (hourWidth / 2);

    carouselContent.scrollLeft = scrollToPosition;
}