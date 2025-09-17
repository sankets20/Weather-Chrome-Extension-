import {
  getStoredCities,
  getStoredOptions,
  setStoredCities,
  setStoredOptions,
} from '../utils/storage'
import { fetchOpenWeatherData } from '../utils/api'

chrome.runtime.onInstalled.addListener(() => {
  setStoredCities([])
  setStoredOptions({
    hasAutoOverlay: false,
    homeCity: '',
    tempScale: 'metric',
  })

  chrome.contextMenus.create({
    contexts: ['selection'],
    title: 'Add city to weather extension',
    id: 'weatherExtension',
  })

  chrome.alarms.create({
    periodInMinutes: 60,
  })

  // 👇 extension install होते ही badge update karo
  updateBadge()
})

chrome.contextMenus.onClicked.addListener((event) => {
  if (event.menuItemId === 'weatherExtension' && event.selectionText) {
    getStoredCities().then((cities) => {
      setStoredCities([...cities, event.selectionText!])
    })
  }
})

chrome.alarms.onAlarm.addListener(() => {
  updateBadge()
})

function updateBadge() {
  getStoredOptions().then((options) => {
    if (!options.homeCity || options.homeCity.trim() === '') {
      chrome.action.setBadgeText({ text: '' })
      return
    }

    fetchOpenWeatherData(options.homeCity, options.tempScale).then((data) => {
      const temp = Math.round(data.main.temp)

      chrome.action.setBadgeBackgroundColor({ color: '#0000FF' }) // Blue
      chrome.action.setBadgeText({ text: `${temp}°` }) // ✅ short text
    })
  })
}
