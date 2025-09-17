import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Card } from '@material-ui/core'
import WeatherCard from '../components/WeatherCard'
import { getStoredOptions, getStoredCities, LocalStorageOptions } from '../utils/storage'
import { Messages } from '../utils/messages'
import './contentScript.css'

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)
  const [cities, setCities] = useState<string[]>([])   // 👈 cities bhi load karenge
  const [isActive, setIsActive] = useState<boolean>(false)

  useEffect(() => {
    getStoredOptions().then((options) => {
      setOptions(options)
      setIsActive(options.hasAutoOverlay)
    })
    getStoredCities().then((c) => setCities(c))  // 👈 popup me jo cities add hue vo bhi fetch karenge
  }, [])

  const handleMessages = (msg: Messages) => {
    if (msg === Messages.TOGGLE_OVERLAY) {
      setIsActive(!isActive)
    }
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessages)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages)
    }
  }, [isActive])

  if (!options) {
    return null
  }

  // 👇 logic: homeCity set ho to wahi dikhao, warna cities[0] dikhao
  const cityToShow =
    options.homeCity && options.homeCity.trim() !== ''
      ? options.homeCity
      : cities.length > 0
      ? cities[0]
      : null

  return (
    <>
      {isActive && cityToShow && (
        <Card className="overlayCard">
          <WeatherCard
            city={cityToShow}
            tempScale={options.tempScale}
            onDelete={() => setIsActive(false)}
          />
        </Card>
      )}
    </>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
