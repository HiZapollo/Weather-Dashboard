/*
    When I search for a city:
        - Given present conditions
        - Given future conditions
        - City name added to the history
*/
var key = '231c6abe771a86ebc8c5f444b69ef6f2';
var baseUrl = 'https://api.openweathermap.org';
var history = [];

var historyElement = document.querySelector("#history");
var searchBarElement = document.querySelector("#search-bar");
var searchFormElement =  document.querySelector("#search-form");
var todayContainerElement = document.querySelector("#today");
var forecastContainerElement = document.querySelector("#forecast");

// plugins for dayjs timezones
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function getTodaysWeather(city, weather){
    var date = dayjs().format('(M/D/YYYY)');
    var icon = 'https://openweathermap.org/img/w/'+weather.weather[0].icon+'.png';
    var iconAlt = weather.weather[0].description;
    var temp = weather.main.temp;
    var wind = weather.wind.speed;
    var humid = weather.main.humidity;
    
    var container = document.createElement('div');
    var heading = document.createElement('h2');
    var iconElement = document.createElement('img');
    var tempElement = document.createElement('p');
    var windElement = document.createElement('p');
    var humidElement = document.createElement('p');

    container.setAttribute('class', 'container');
    heading.setAttribute('class', 'dayHead');
    tempElement.setAttribute('class', 'weatherText');
    windElement.setAttribute('class', 'weatherText');
    humidElement.setAttribute('class', 'weatherText');

    heading.textContent = city+' '+date;
    iconElement.setAttribute('src', icon);
    iconElement.setAttribute('alt', iconAlt);
    heading.append(iconElement);
    tempElement.textContent = 'Temp: '+temp+"°F";
    windElement.textContent = 'Wind: '+wind+" MPH";
    humidElement.textContent = 'Humidity: '+humid+' %';

    container.append(heading,tempElement,windElement,humidElement);

    todayContainerElement.innerHTML = '';
    todayContainerElement.append(container);
}

function makeCard(forecast) {
    var icon = 'https://openweathermap.org/img/w/'+forecast.weather[0].icon+'.png';
    var iconAlt = forecast.weather[0].description;
    var temp = forecast.main.temp;
    var wind = forecast.wind.speed;
    var humid = forecast.main.humidity;

    var column = document.createElement('div');
    var card = document.createElement('div');
    var cardHead = document.createElement('h4');
    var iconElement = document.createElement('img');
    var tempElement = document.createElement('p');
    var windElement = document.createElement('p');
    var humidElement = document.createElement('p');

    column.setAttribute('class', 'col-md');
    column.classList.add("forecast-card");
    cardHead.setAttribute('class', 'forehead');
    tempElement.setAttribute('class', 'foretext');
    windElement.setAttribute('class', 'foretext');
    humidElement.setAttribute('class', 'foretext');

    column.append(card);
    card.append(cardHead,iconElement,tempElement,windElement,humidElement);

    cardHead.textContent = dayjs(forecast.dt_txt).format("M/D/YYYY");
    iconElement.setAttribute('src', icon);
    iconElement.setAttribute('alt', iconAlt);
    tempElement.textContent = 'Temp: '+temp+"°F";
    windElement.textContent = 'Wind: '+wind+" MPH";
    humidElement.textContent = 'Humidity: '+humid+' %';

    forecastContainerElement.append(column);
}

function getForecast(forecast) {
    var start = dayjs().add(1, 'day').startOf('day').unix();
    var end = dayjs().add(6, 'day').startOf('day').unix();

    var container = document.createElement('div');
    var heading = document.createElement('h3');
    container.setAttribute('class', 'col-12');
    heading.setAttribute('class', 'dayHead');
    
    heading.textContent = '5-Day Forecast:';
    container.append(heading);

    forecastContainerElement.innerHTML = '';
    forecastContainerElement.append(container);

    for(var i = 0; i < forecast.length; i++) {
        if (forecast[i].dt >= start && forecast[i].dt < end){
            if(forecast[i].dt_txt.slice(11,13) == "12"){
                makeCard(forecast[i]);
            }
        }
    }
}

function getWeather(cityInput){
    var lat = cityInput.lat;
    var lon = cityInput.lon;
    var city = cityInput.name;

    var url = baseUrl + '/data/2.5/forecast?lat='+lat+'&lon='+lon+'&units=imperial&appid='+key;
    fetch(url)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            getTodaysWeather(city, data.list[0], data.city.timezone);
            getForecast(data.list);
        })
        .catch(function(error){
            console.error(error);
        });
}

function getCoordinates(cityInput){
    var url = baseUrl + '/geo/1.0/direct?q=' + cityInput + '&limit=5&appid=' + key;
    fetch(url)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            if(!data[0]){
                alert('Not Found');
            } else {
                //addHistory(cityInput);
                getWeather(data[0]);
            }
        })
        .catch(function(error){
            console.error(error);
        });
}

function handleSearchButton(event) {
    if (searchBarElement.value == ''){
        return;
    }

    event.preventDefault();
    getCoordinates(searchBarElement.value.trim());
    searchBarElement.value = '';
}

searchFormElement.addEventListener("submit", handleSearchButton);