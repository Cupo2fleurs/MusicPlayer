import React, { useRef , useState, useEffect} from 'react';
import "./Audioplayer.css";
import '@mantine/core/styles.css';
import { MantineProvider,Button,Text} from '@mantine/core';
import Header from "./Header";
import { FaPlay,FaPause } from "react-icons/fa";
import { IoIosArrowBack,IoIosArrowForward } from "react-icons/io";

//Audioplayer permet la lecture des musiques 
function Audioplayer (props){
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    const currentSong = props.songs[props.currentSongIndex];


    useEffect(() => {
    if (!currentSong) return; // Ajouté pour éviter l'erreur si currentSong est pas définie
    const audio = audioRef.current;
    if (audio) {
        // Fonction pour gérer les événements
        const onTimeUpdate = () => handleTimeUpdate();
        const onLoadedMetadata = () => handleLoadedMetadata();
        const onEnded = () => handleEnded();
        
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("ended", onEnded);

        return () => {
            if (audio) {
                audio.removeEventListener("timeupdate", onTimeUpdate);
                audio.removeEventListener("loadedmetadata", onLoadedMetadata);
                audio.removeEventListener("ended", onEnded);
            }
        };
    }
}, [currentSong && currentSong.src]); // Dépendance ajoutée pour relancer l'effet si l'audio change
    
    //Fonction pour le changement de musique à la fin de la musique en cours
    useEffect(() => {
        if (audioRef.current) {
            const wasPlaying = isPlaying;
            setCurrentTime(0);
            
            // Si la musique était en cours de lecture, on continue avec la nouvelle
            if (wasPlaying) {
                audioRef.current.load(); // Recharge l'audio
                audioRef.current.play().catch(console.error);
            }
        }
    }, [props.currentSongIndex]);


    if (!currentSong) { //permet de ne pas lancer de musique si il n'y en a pas dans la playlist
        return (
            <div>
                <MantineProvider>
                    <Header />
                    <div className="container">
                        <div className='player-card'>
                            <div className="marquee-container">
                            <span className="marquee-text">
                                Aucune chanson a jouer !
                            </span>
                        </div>
                        </div>
                    </div>
                </MantineProvider>
            </div>
        );
    }

    
    // Fonction de la barre d'avancement du son
    const handleSeek = (e) => {
        if (audioRef.current) {
            audioRef.current.currentTime = e.target.value;
            setCurrentTime(e.target.value);
        }
    }
    
    // Fonction pour formater la durée
    function formatDuration(durationSeconds) {
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = Math.floor(durationSeconds % 60);
        const formattedSeconds = seconds.toString().padStart(2, "0");
        return `${minutes}:${formattedSeconds}`;
    }
    
    // Fonction pour mettre à jour le temps de la musique
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };
    
    // Fonction pour charger les métadonnées audio
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };
    
    // Fonction pour play la musique
    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };
    //Fonction pour pause la musique
    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };
    
    // Fonction du bouton play stop
    const handlePlayPause = () => {
        if(isPlaying) {
            handlePause();
        } else {
            handlePlay();
        }
    };

    // Fonction appelée quand la musique se termine
    const handleEnded = () => {
        SkipSongRight();
    };
    //Fonction pour passer au son suivant
    const SkipSongRight = () => {
            props.setCurrentSongIndex(() => {
                let temp = props.currentSongIndex;
                temp++;

                if (temp > props.songs.length -1){
                    temp =0;
                }
                return temp;
            });
        } 
        //Fonction pour passer au son précédent
    const SkipSongLeft = () => {
            props.setCurrentSongIndex(() => {
                let temp = props.currentSongIndex;
                temp--;

                if (temp <0){
                    temp = props.songs.length -1;
                }
                return temp;
            });
        }
    
    return(
        <div>
            <MantineProvider>
                <Header />
                <div className="container">
                <div className='player-card'>
                            <div className='img-details'>
                                <img src={currentSong.img_src} alt="" />
                            </div>
                            <div style={{textAlign:"center"}}>
                            <Text fw={700} size="xl" className='details-title'>{currentSong.title}</Text>
                            <Text fw={700} size="md" c="dimmed" className='details-artist'>{currentSong.artist}</Text>
                            </div>
                    <input type="range" className='player-bar' min="0" max={duration} value={currentTime} onChange={handleSeek} />
                    <audio ref={audioRef} src={currentSong.src}/>
                    <div className="track-duration">
                        <p>{formatDuration(currentTime)}</p>
                        <p>{formatDuration(duration)}</p>
                    </div>
                    <div className='align-center'>
                        <Button variant="subtle" color="black" radius="xl" size="xl" onClick={SkipSongLeft}><IoIosArrowBack /></Button>
                    <Button className="pause-play-button" variant="subtle" color="black" radius="xl" size="xl" onClick={handlePlayPause} >
                        <span className="material-symbols-rounded">
                            {isPlaying ? <FaPause /> : <FaPlay/>}
                        </span>
                    </Button>
                    <Button variant="subtle" color="black" radius="xl" size="xl" onClick={SkipSongRight}><IoIosArrowForward /></Button>
                    {props.songs[props.nextSongIndex] ? (
                        <p>
                            <strong>Next is: </strong>
                            {props.songs[props.nextSongIndex].title} by {props.songs[props.nextSongIndex].artist}
                        </p>
                    ) : (
                        <p><strong>Next is: </strong>aucune chanson</p>
                    )}
                    </div>
                </div>
                </div>
            </MantineProvider>
        </div>
    );
};

export default Audioplayer;

