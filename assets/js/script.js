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

// plugins for dayjs timezones
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function getWeather(cityInput){
    var lat = cityInput.lat;
    var lon = cityInput.lon;
    var city = cityInput.name;

    var url = baseUrl + '/data/2.5/forecast?lat='+lat+'&lon='+lon+'&appid='+key;
    fetch(url)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            //getTodaysWeather(city, data.list[0], data.city.timezone);
            //getForecast(data.list);
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