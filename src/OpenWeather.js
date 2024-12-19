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
import aqiBreakpoints from '../data/AQIBreakpoints.js';

const logger = new Logger();

// for some reason, OpenWeather doesn't convert all fields to imperial units "For temperature in Fahrenheit and wind speed in miles/hour, use units=imperial"
const m_to_miles = 0.000621371;
const mm_to_inches = 0.0393701;
const mbar_to_inHg = 0.029529983071445;

/**
 * Get the open weather data for the specified cities. This makes two calls to the OpenWeather API, one for the weather data and one for the air quality data.
 * 
 * @returns 
 */
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

// Function to calculate AQI for a pollutant
function calculateAQI(concentration, breakpoints) {
  const { C_low, C_high, I_low, I_high } = breakpoints;

  // AQI Formula
  return ((I_high - I_low) / (C_high - C_low)) * (concentration - C_low) + I_low;
}

// Function to find the correct breakpoints and calculate AQI
// NOTE: that we ignore "no" in this calculation, as it is not a pollutant that is commonly measured
// we also need to split ozone into 1h and 8h averages
function computeUSAQI(aqiComponents) {
  let aqi = 0;
  let modifiedComponents = {};
  Object.entries(aqiComponents).forEach(([pollutant, concentration]) => {
    if (pollutant == "o3") {
      modifiedComponents["o3_1h"] = concentration;
      modifiedComponents["o3_8h"] = concentration;
    } else if (pollutant == "no" || pollutant == "nh3") {
      // skip this pollutant
    } else {
      modifiedComponents[pollutant] = concentration;
    }
  });
  
  // iterate over the components of the AQI, computing their value
  Object.entries(modifiedComponents).forEach(([pollutant, concentration]) => {
    let breakpoints = aqiBreakpoints[pollutant];
    let aqiComponent = 0;
        
    // Find appropriate breakpoint for the given concentration
    for (let i = 0; i < breakpoints.length; i++) {
      const bp = breakpoints[i];
      if (concentration >= bp.C_low && concentration <= bp.C_high) {
        aqiComponent = calculateAQI(concentration, bp);
        break;
      }
    }
    logger.debug(`Pollutant: ${pollutant}, Concentration: ${concentration}, AQI: ${aqiComponent}`);
    // Update the overall AQI
    aqi = Math.max(aqi, aqiComponent);
  });
  
  return Math.round(aqi);
}

/**
 * Compute a weather condition based on the OpenWeather weather ID
 * @param {*} weatherId
 * @returns 
 */
function getWeatherCondition(weatherId) {
  if (weatherId == 800) {
    return 1;
  } else if (weatherId > 800 && weatherId < 804) {
    return 2;
  } else if (weatherId == 804) {
    return 3;
  } else if (weatherId >= 300 && weatherId < 400) {
    return 4;
  } else if (weatherId >= 500 && weatherId < 600) {
    return 5;
  } else if  (weatherId >= 200 && weatherId < 300) {
    return 6;
  } else if (weatherId >= 600 && weatherId < 700) {
    return 7;
  } else if (weatherId >= 900) {
    return 8;
  } else if (weatherId == 741) {
    return 9;
  } else if (weatherId == 711) {
    return 10;
  } else {
    // default to 0
    return 0;
  }
}

/**
 * convert the dataset received from OpenWeather into a JSON format that is easier to work with
 * on our client.
 * @param {*} openWeather 
 * @returns 
 */
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
        'visibility': (city.current.visibility * m_to_miles).toFixed(2),
        'wind_speed': city.current.wind_speed,
        'weather_id': city.current.weather[0].id,
        'condition': getWeatherCondition(city.current.weather[0].id),
        'bluebird' : (city.current.weather[0].id == 800 && (city.current.visibility * m_to_miles) > 6),
        'forecast': {},
        'aqi': computeUSAQI(city.airQuality.list[0].components),
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
