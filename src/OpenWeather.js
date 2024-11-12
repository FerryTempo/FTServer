/**
 * OpenWeather.js
 * ============
 * Handling Open Weather data for the specified cities that we are interested in.
 *
 * WSDOT JSON data specification is located here:
 * https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations#response-json
 */
import fetch from 'node-fetch';
import cityLocations from '../data/CityLocations.js';

export const getOpenWeatherData = async function() {
  const responses = await Promise.all(
    cityLocations.map(async (city) => {
      const cityData = await fetch(
        'https://api.openweathermap.org/data/3.0/onecall?exclude=minutely,hourly,alerts&lat=${city.latitude}&lon=${city.longitude}&appid=${process.env.OPENWEATHER_API_KEY}'
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        });

      // Add the city name to the response data
      cityData.cityName = city.cityName;

      return cityData;
    })
  );

  // Return the JSON string
  return JSON.stringify(responses);
};

export const processOpenWeatherData = function(openWeather) {
  const weatherData = {};

  // Process the weather data
  openWeather.forEach((city) => {
    // Process the weather data for each city
    weatherData[city.cityName] = {
      'current': {
        'temp': city.current.temp,
        'feels_like': city.current.feels_like,
        'humidity': city.current.humidity,
        'wind_speed': city.current.wind_speed,
        'weather': city.current.weather[0].description,
      },
      'daily': city.daily.map((day) => {
        return {
          'temp': day.temp.day,
          'feels_like': day.feels_like.day,
          'humidity': day.humidity,
          'wind_speed': day.wind_speed,
          'weather': day.weather[0].description,
        };
      }),
    };
  });

  return weatherData;
};
