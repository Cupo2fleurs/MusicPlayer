import Audioplayer from "./components/Audioplayer";
import Playlist from "./components/Playlist";
import ListMusic from "./components/ListMusic";
import NewAlbum from "./components/NewAlbum";
import NewSong from "./components/NewSong";
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {useState,useEffect} from 'react';


/*App est la ou ce centralise chaque page.
 Elles recoivent les informations par App via les Router qui permette aussi le déplacement entre les pages.
 App va aussi recevoir les information de l'API Go comme les albums et les sons.
*/
  function App() {

    const [songs, setSongs] = useState([]); // Chansons dynamiques
    const [albums, setAlbums] = useState([]); // Albums dynamiques
    const [selectedAlbumId, setSelectedAlbumId] = useState(null); // Album selectionné
    const [currentSongIndex, setCurrentSongIndex] = useState(0); //Son actuel
    const [nextSongIndex, setNextSongIndex] = useState(currentSongIndex + 1); // Prochain son


     const filteredSongs = selectedAlbumId ? songs.filter(song => song.album_id === selectedAlbumId): songs; 
     //permet de récupérer seulement les sons de l'album choisi avec le albumId


     useEffect(() => {  //permet de récupérer le son suivant pour pouvoir récupérer dans Audioplayer les informations 
    setNextSongIndex(() => {
      if (currentSongIndex + 1 > filteredSongs.length - 1) {
        return 0;
      } else {
        return currentSongIndex + 1;
      }
    });
  }, [currentSongIndex, filteredSongs.length]);
    
   // Charger les albums depuis l'API Go
   //on fetch un localhost créé par le go ou l'on vas trouver le Json et le lire
  useEffect(() => {
    fetch("http://localhost:8080/albums")
      .then(res => res.json())
      .then(data => setAlbums(data)) // data reprèsente les informations des albums
      .catch(err => console.error(err));  //lorsque on lit du Json on lit un Byte et un err 
  }, []);

  // Charger les chansons depuis l'API Go
  //on fetch un localhost créé par le go ou l'on vas trouver le Json et le lire
  useEffect(() => {
    fetch("http://localhost:8080/songs")
      .then(res => res.json())
      .then(data => setSongs(data)) // data reprèsente les informations des sons
      .catch(err => console.error(err));
  }, []);



 return <div><MantineProvider>
  <BrowserRouter> {/*Liste des chemins vers chaque page du site */}
    <Routes>
      <Route index element={<Audioplayer album={albums} onAlbumSelect={setSelectedAlbumId}/>}/>
      <Route path="/Audio" element={<Audioplayer currentSongIndex={currentSongIndex} setCurrentSongIndex={setCurrentSongIndex} nextSongIndex={nextSongIndex} songs={filteredSongs}/>}/>
      <Route path="/Playlist" element={<Playlist album={albums} onAlbumSelect={setSelectedAlbumId}/>}/>
      <Route path="/Playlist/Musica/:albumId" element={<ListMusic songs={songs} album={albums} onPlaySong={setCurrentSongIndex}/>}/>
      <Route path="/Playlist/NewAlbum" element={<NewAlbum/>}/>
      <Route path="/Playlist/Musica/NewSong/:albumId" element={<NewSong album={albums}/>}/>
    </Routes>
  </BrowserRouter>
  </MantineProvider>
 </div>

};

export default App;
