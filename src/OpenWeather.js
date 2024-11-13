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
import Logger from './Logger.js';

const logger = new Logger();

// for some reason, OpenWeather doesn't convert all fields to imperial units "For temperature in Fahrenheit and wind speed in miles/hour, use units=imperial"
const km_to_miles = 0.621371;
const mm_to_inches = 0.0393701;
const mbar_to_inHg = 0.029529983071445;

export const getOpenWeatherData = async function() {
  const responses = await Promise.all(
    cityLocations.map(async (city) => {
      const cityData = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?exclude=minutely,alerts&units=imperial&lat=${city.latitude}&lon=${city.longitude}&appid=${process.env.OPENWEATHER_KEY}`
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
  return responses;
};

export const processOpenWeatherData = function(openWeather) {
  const weatherData = {};

  // Process the weather data
  openWeather.forEach((city) => {
    // Process the weather data for each city
    weatherData[city.cityName] = {
      'timestamp': city.current.dt,
      'astronomical': {
        'sunrise': city.daily[0].sunrise,
        'sunset': city.daily[0].sunset,
        'moonrise': city.daily[0].moonrise,
        'moonset': city.daily[0].moonset,
        'moon_phase': city.daily[0].moon_phase,
      },
      'weather': {
        'temp': city.current.temp,
        'feels_like': city.current.feels_like,
        'humidity': city.current.humidity,
        'pressure': (city.current.pressure * mbar_to_inHg).toFixed(2),
        'uvi': city.current.uvi,
        'visibility': (city.current.visibility * km_to_miles).toFixed(2),
        'wind_speed': city.current.wind_speed,
        'weather_id': city.current.weather[0].id,
        'bluebird' : (city.hourly[i].weather[0].id >= 800 && city.hourly[i].weather[0].id < 900 && (city.current.visibility * km_to_miles) > 50),
        'forecast': {},
      },
    };
    // process hourly data, for the first 24 hours, looking for snow and summing percipitation
    let snow = false;
    let precipitation = 0;
    for (let i = 0; i < 24; i++) {
      if (city.hourly[i].weather[0].id >= 600 && city.hourly[i].weather[0].id < 700) {
        snow = true;
      }
      // need to sum both rain and snow, which may not be present if not available in the feed
      precipitation += city.hourly[i].rain ? city.hourly[i].rain['1h'] : 0;
      precipitation += city.hourly[i].snow ? city.hourly[i].snow['1h'] : 0;
    }
    weatherData[city.cityName].weather.forecast.snow = snow;
    weatherData[city.cityName].weather.forecast.precipitation = (precipitation * mm_to_inches).toFixed(2);
  });

  return weatherData;
};
