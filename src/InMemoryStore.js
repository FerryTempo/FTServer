class InMemoryStore {
  constructor() {
    this.nextAppDataId = 1;
    this.nextWeatherDataId = 1;
    this.nextUpdateCheckId = 1;
    this.appData = [];
    this.weatherData = [];
    this.updateChecks = [];
  }

  getNow() {
    return Math.floor(Date.now() / 1000);
  }

  withoutId(event) {
    if (!event) {
      return undefined;
    }

    const { id, ...eventData } = event;
    return eventData;
  }

  insertAppData(vesselData, ferryTempoData) {
    this.appData.push({
      id: this.nextAppDataId++,
      saveDate: this.getNow(),
      vesselData: JSON.stringify(vesselData),
      ferryTempoData: JSON.stringify(ferryTempoData),
    });
    this.purgeAppDataBefore(this.getNow() - (60 * 60));
  }

  purgeAppDataBefore(expirationTime) {
    this.appData = this.appData.filter((event) => event.saveDate > expirationTime);
  }

  getLatestAppData() {
    return this.withoutId(this.appData[this.appData.length - 1]);
  }

  getRecentAppData(limit = 1000) {
    return this.appData.toReversed().slice(0, limit).map((event) => this.withoutId(event));
  }

  getAllAppData() {
    return this.appData.toReversed().map((event) => this.withoutId(event));
  }

  insertWeatherData(openWeather, weatherData) {
    this.weatherData.push({
      id: this.nextWeatherDataId++,
      saveDate: this.getNow(),
      openWeather: JSON.stringify(openWeather),
      weatherData: JSON.stringify(weatherData),
    });
    this.purgeWeatherDataBefore(this.getNow() - (60 * 60));
  }

  purgeWeatherDataBefore(expirationTime) {
    this.weatherData = this.weatherData.filter((event) => event.saveDate > expirationTime);
  }

  getLatestWeatherData() {
    return this.withoutId(this.weatherData[this.weatherData.length - 1]);
  }

  getAllWeatherData() {
    return this.weatherData.toReversed().map((event) => this.withoutId(event));
  }

  insertUpdateCheck(updateCheck) {
    this.updateChecks.push({
      id: this.nextUpdateCheckId++,
      ...updateCheck,
    });
  }

  getUpdateChecksForSummary() {
    return this.updateChecks
        .toSorted((first, second) => second.saveDate - first.saveDate || second.id - first.id);
  }

  getRecentUpdateChecks(limit = 500) {
    return this.updateChecks.toReversed().slice(0, limit);
  }
}

export default InMemoryStore;
