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
import { isSolstice, isEquinox } from './Utils.js';

const logger = new Logger();

// for some reason, OpenWeather doesn't convert all fields to imperial units "For temperature in Fahrenheit and wind speed in miles/hour, use units=imperial"
const m_to_miles = 0.000621371;
const mm_to_inches = 0.0393701;
const mbar_to_inHg = 0.029529983071445;

export const getOpenWeatherData = async function() {
  const responses = await Promise.all(
    cityLocations.map(async (city) => {
      // Fetch weather data for the city
      const cityData = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?exclude=minutely,alerts&units=imperial&lat=${city.latitude}&lon=${city.longitude}&appid=${process.env.OPENWEATHER_KEY}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        });

      // Fetch air quality data for the city
      const airQualityData = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.latitude}&lon=${city.longitude}&appid=${process.env.OPENWEATHER_KEY}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        });

      // Add city name and air quality data to the weather data
      cityData.cityName = city.cityName;
      cityData.airQuality = airQualityData;

      return cityData;
    })
  );

  // Return the JSON string with both weather and air quality data
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
        'solstice' : isSolstice(city.current.dt),
        'equinox' : isEquinox(city.current.dt),
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
        'bluebird' : (city.current.weather[0].id == 800 && (city.current.visibility * km_to_miles) > 50),
        'forecast': {},
        'aqi': city.airQuality.list[0].main.aqi,
      },
    };
    // process hourly data, for the first 24 hours, looking for snow and summing percipitation
    let snow = false;
    let precipitation = 0;
    for (let i = 0; i < 24; i++) {
      // any instance of snow in the upcoming 24 hours will be flagged as snow
      if (snow == false && city.hourly[i].weather[0].id >= 600 && city.hourly[i].weather[0].id < 700) {
        snow = true;
      }
      // need to sum both rain and snow, which may not be present if not available in the feed
      precipitation += city.hourly[i].rain ? city.hourly[i].rain['1h'] : 0;
      precipitation += city.hourly[i].snow ? city.hourly[i].snow['1h'] : 0;
    }
    weatherData[city.cityName].weather.forecast.snowIn24 = snow;
    weatherData[city.cityName].weather.forecast.precipitation = (precipitation * mm_to_inches).toFixed(2);

    // look at the next six hours to determine if the pressure is trending upward or downward
    let pressureTrend = 0;
    for (let i = 0; i < 6; i++) {
      pressureTrend += (city.hourly[i+1].pressure - city.hourly[i].pressure);
    }
    if (pressureTrend != 0) {
      weatherData[city.cityName].weather.forecast.pressureTrend = pressureTrend/6 > 0 ? 1 : -1;
    } else {
      weatherData[city.cityName].weather.forecast.pressureTrend = 0;
    }
  });

  return weatherData;
};
