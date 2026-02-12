import { useRef, useState, useEffect, useCallback } from 'react';
import { sortPlacesByDistance } from './loc.js'
import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';

let localSelectedPlaces = JSON.parse(localStorage.getItem("localSelectedPlaces") ?? "[]");
let initialSelection = AVAILABLE_PLACES.filter(place => localSelectedPlaces.includes(place.id));

function App() {
  const modal = useRef();
  const selectedPlace = useRef();
  const [pickedPlaces, setPickedPlaces] = useState(initialSelection);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [modalOpenStatus, setModalOpenStatus] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      );
      setAvailablePlaces(sortedPlaces);
    })
  }, []);

  function handleStartRemovePlace(id) {
    setModalOpenStatus(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setModalOpenStatus(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    localSelectedPlaces = JSON.parse(localStorage.getItem("localSelectedPlaces") ?? "[]");
    if (localSelectedPlaces.indexOf(id) === -1) {
      localStorage.setItem("localSelectedPlaces", JSON.stringify([id, ...localSelectedPlaces]));
    }
  }

  const handleRemovePlace = useCallback(function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    setModalOpenStatus(false);
    localSelectedPlaces = JSON.parse(localStorage.getItem("localSelectedPlaces"));
    let updatedLocalSelectedPlaces = localSelectedPlaces.filter((id) => id !== selectedPlace.current)
    localStorage.setItem("localSelectedPlaces", JSON.stringify(updatedLocalSelectedPlaces));
  }, [])

  return (
    <>
      <Modal open={modalOpenStatus} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
