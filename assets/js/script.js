
var key = '231c6abe771a86ebc8c5f444b69ef6f2';//api key
var baseUrl = 'https://api.openweathermap.org';
var searchHistory = [];

var historyElement = document.querySelector("#history");
var searchBarElement = document.querySelector("#search-bar");
var searchFormElement =  document.querySelector("#search-form");
var todayContainerElement = document.querySelector("#today");
var forecastContainerElement = document.querySelector("#forecast");

// plugins for dayjs timezones
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

//this function takes the name of the city and it's current weather information
//and creates the container and all of its children to display that information
function getTodaysWeather(city, weather){
    var date = dayjs().format('(M/D/YYYY)');
    var icon = 'https://openweathermap.org/img/w/'+weather.weather[0].icon+'.png';//gets the icon image link
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

    todayContainerElement.innerHTML = '';//clears whatever is already there just in case
    todayContainerElement.append(container);
}

//this function takes the forecast info from the day it is given and creates all the
//elements to display it.
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

    column.setAttribute('class', 'col-md');//using bootstrap css
    column.classList.add("forecast-card");//custom css
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

//this function gets all the forecast information and sorts them to find the info
//for the next five days at noon. Also creates the header and container.
function getForecast(forecast) {
    var start = dayjs().add(1, 'day').startOf('day').unix();//start of 5-day forcast time period in unix
    var end = dayjs().add(6, 'day').startOf('day').unix();//end of time period

    var container = document.createElement('div');
    var heading = document.createElement('h3');
    container.setAttribute('class', 'col-12');
    heading.setAttribute('class', 'dayHead');
    
    heading.textContent = '5-Day Forecast:';
    container.append(heading);

    forecastContainerElement.innerHTML = '';//clears container incase it's not empty
    forecastContainerElement.append(container);

    for(var i = 0; i < forecast.length; i++) {//loops through all of the forecasts
        if (forecast[i].dt >= start && forecast[i].dt < end){//checks the unix timestamp for each forecast to see if it's within the time period
            if(forecast[i].dt_txt.slice(11,13) == "12"){//if the forecast is recorded at noon, make the card for it.(ensures a single day can't print twice, while also choosing the middle of the day for the most accurate forecast)
                makeCard(forecast[i]);
            }
        }
    }
}

//creates the history buttons
function displayHistory() {
    historyElement.innerHTML = '';

    for(var i = searchHistory.length -1; i >= 0; i--) {
        var btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('class', 'history-btn');

        btn.setAttribute('data-city', searchHistory[i]);//gives easy access to the city for the click event
        btn.textContent = searchHistory[i];
        historyElement.append(btn);
    }
}

//adds the input to the history and the local storage
function addHistory(cityInput) {
    //ensures that the input isn't already in the history
    if(searchHistory.indexOf(cityInput) !== -1){
        return
    }
    searchHistory.push(cityInput);

    localStorage.setItem('history', JSON.stringify(searchHistory));
    displayHistory();
}

//gets the history from local storage and adds it to the history variable if it exists
function startupHistory() {
    var rememberedHistory = localStorage.getItem('history');
    if (rememberedHistory) {
        searchHistory = JSON.parse(rememberedHistory);
    }
    displayHistory();
}

//gets the forcast information based on the coordinates given from the getCoordinates function
function getWeather(cityInput){
    var lat = cityInput.lat;//--------------------------
    var lon = cityInput.lon;//          local variables
    var city = cityInput.name;//------------------------

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

//takes the cityInput and gets the coordinates
function getCoordinates(cityInput){
    var url = baseUrl + '/geo/1.0/direct?q=' + cityInput + '&limit=5&appid=' + key;//modified link
    fetch(url)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            if(!data[0]){
                alert('Not Found');
            } else {
                addHistory(cityInput);
                getWeather(data[0]);//sends the first location object through the getWeather function
            }
        })
        .catch(function(error){
            console.error(error);
        });
}

//when the value is not empty, it will be trimmed and ran through the getCoordinates function
function handleSearchButton(event) {
    if (searchBarElement.value == ''){
        return;
    }

    event.preventDefault();
    getCoordinates(searchBarElement.value.trim());
    searchBarElement.value = '';
}

//
function handleHistoryButton(event) {
    if(!event.target.matches('.history-btn')){
        return;
    }

    var btn = event.target;
    var city = btn.getAttribute('data-city');
    getCoordinates(city);
}

//events and startup function call
searchFormElement.addEventListener("submit", handleSearchButton);
historyElement.addEventListener("click", handleHistoryButton);
startupHistory();