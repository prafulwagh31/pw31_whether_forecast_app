// All DOM Elements
const defaultCity = document.getElementById("defaultCity");
const defaultTemp = document.getElementById("defaultTemp");
const defaultWind = document.getElementById("defaultWind");
const defaultHumidity = document.getElementById("defaultHumidity");
const defaultImg = document.getElementById("defaultImg");
const feels = document.getElementById("feels");
const defaultDate = document.getElementById("date");
const cards = document.querySelector(".cards");
const cities = document.getElementById("cities");
const cityName = document.querySelector("input");
const searchBtn = document.querySelector("#search")
const currentLocation = document.querySelector("#currentLocation")
const previousCity = new Set();
const previousStoreCity = JSON.parse(localStorage.getItem("previousCity")) || [];
const date = new Date();
defaultDate.textContent = date.toLocaleDateString();

// Latitude & Longitude
let cityLatitude = undefined;
let cityLongitude = undefined;

// Add Event Listener for search
searchBtn.addEventListener("click", () => {
    if (!cityName.value) {
        alert("Please enter City Name");
    } else {
        fetchForecastapp(false, false, cityName.value);
        showPosition(false, cityName.value);
    }
})

// Get Curret Location
currentLocation.addEventListener("click", () => {
    getCurrentLocation();
})

// Search for city that are stored in the local
cities.addEventListener("change", (e) => {
    let item = e.target.value
    fetchForecastapp(false, false, item);
    showPosition(false, item);
})

if (previousStoreCity) {
    previousStoreCity.forEach(item => {
        previousCity.add(item)
    });
}

// Function to show loader
const showLoader = () => {
    document.querySelector(".container").style.display = "none";
}

// Function to hide loader
const hideLoader = () => {
    document.querySelector(".container").style.display = "flex";
}

// Get current location & location permission
const getCurrentLocation = () => {
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            console.log("Geolocation is not supported by this browser, try another browser.");
        }
    }
    const showError = (err) => {
        alert(err.message)
        return console.warn(err)
    }
    getLocation();
}

// Fetch 5 days forecast
const fetchForecastapp = async (cityLatitude, cityLongitude, location = false) => {

    let response = undefined;
    showLoader();
    if (location) {
        try {
            response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${"83b73559849ba273f8675156c9796076"}&units=metric`);
        } catch (error) {
            console.log(error)
        }

    } else {
        try {
            response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cityLatitude}&lon=${cityLongitude}&appid=${"83b73559849ba273f8675156c9796076"}&units=metric`);
        } catch (error) {
            console.log(error)
        }
    }

    const data = await response.json();
    data && hideLoader();
    if (data.cod == 404) {
        alert("Invalid City")
        document.location.reload();
    }
    if (data.city.name) {
        previousCity.add(data.city.name);
        localStorage.setItem("previousCity", JSON.stringify(Array.from(previousCity)));
        setPrevLocations();
    }
    const forecast = data.list.filter((item, index) => {
        return index % 8 === 0;
    })
    cards.innerHTML = "";
    forecastMap(forecast)
}

// Display forecast
const forecastMap = (forecast) => {
    forecast.map((item) => {
        const cardContent = document.createElement("div");
        cardContent.classList.add("card", "w-full", "xs:w-[13rem]", "p-4", "backdrop-blur-sm", "bg-blue-600", "transition-all", "hover:bg-blue-800", "border", "border-white");

        cardContent.innerHTML = `
            <img
              src="http://openweathermap.org/img/w/${item.weather[0].icon}.png"
              width="100px"
              alt=""
            />
            <h3>(${item.dt_txt.split(" ")[0]})</h3>
            <p>Temperature: ${item.main.temp}°C</p>
            <p>Wind: ${item.wind.speed} M/S</p>
            <p>Humidity: ${item.main.humidity}%</p>
        `
        cards.appendChild(cardContent);
    })
}

// Fetch location  
const showPosition = async (position, location = false) => {
    if (location) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${"83b73559849ba273f8675156c9796076"}&units=metric`)
            const data = await response.json();
            setMainData(data);
        } catch (error) {
            console.log(error)
        }
    } else {
        cityLatitude = position.coords.latitude;
        cityLongitude = position.coords.longitude;
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${cityLatitude}&lon=${cityLongitude}&appid=${"83b73559849ba273f8675156c9796076"}&units=metric`)
            const data = await response.json();
            setMainData(data);
            fetchForecastapp(cityLatitude, cityLongitude);
        } catch (error) {
            console.log(error)
        }
    }
}

// Display previous location
const setPrevLocations = () => {
    cities.innerHTML = `<option value="-1" selected disabled>Select City</option>`;
    Array.from(previousStoreCity).map((item) => {
        let node = document.createElement("option");
        node.classList.add("prevLocationSearch")
        node.value = item;
        node.textContent = item;
        return cities.appendChild(node);
    })

}

// Weather Data
const setMainData = (data) => {
    defaultCity.textContent = data.name;
    defaultTemp.textContent = data.main.temp;
    defaultWind.textContent = data.wind.speed;
    defaultHumidity.textContent = data.main.humidity;
    defaultImg.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    feels.textContent = data.weather[0].description;
}

// function call to get current location
getCurrentLocation();

