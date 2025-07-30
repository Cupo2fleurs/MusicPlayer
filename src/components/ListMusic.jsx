
import '@mantine/core/styles.css';
import { MantineProvider,Stack,Text,Button,ActionIcon,Menu} from '@mantine/core';
import Header from "./Header";
import "./Playlist.css";
import { FaPlay } from "react-icons/fa";
import { useParams,useNavigate,Link} from "react-router-dom";
import { CgMoreVerticalAlt } from "react-icons/cg";


//ListMusic est la liste des musique d'un album

function ListMusic({songs = [], album = [], onPlaySong }) {
    const { albumId } = useParams();
    const navigate = useNavigate();
    const albumSongs = songs.filter(song => song.album_id === Number(albumId));
    const albumAdd = album.filter(album => album.id !== Number(albumId));
    const currentAlbum = album.find(a => a.id === Number(albumId));
    
//Lorsque le bouton supprimer est clické appelle la methode DELETE du go avec un Fetch vers le song avec l'id du son à supprimer
    const handleDelete = async (songId) =>{ 
    console.log("Son,id", songId, "supprimé");
    try {
        const response = await fetch(`http://localhost:8080/songs/${songId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Échec de la suppression de la chanson');
    }
    else{alert("Oculus Disparo Musico !");}

    console.log("Chanson supprimée avec succès");
    } catch (error) {
        console.error("Erreur:", error);
        alert(error.message);
    }
}
//Permet d'ajouter un song d'un album vers un
    const handleAdd = async (song,albumAddId) => {
        //Créer une copie du song 
        const songAdd = {
        ...song,
        album_id: albumAddId,
        id: undefined
      };
      delete songAdd.id;

        const res = await fetch("http://localhost:8080/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songAdd),
      });
      if (res.ok) {
        alert("Chanson ajoutée avec succès !");
        window.location.reload(false);
      }else{
        const errorData = await res.json();
        alert(`Erreur lors de l'ajout: ${errorData.error}`);
      }
    }

    return(
    <div>
        <MantineProvider>
            <Header />
                <div className='header-playlist' style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <h1 className="page-title">{currentAlbum ? currentAlbum.title : albumId}</h1>
                            <Button radius="xl" color="yellow"  onClick={() =>  navigate("/Audio")}>< FaPlay /></Button>
                </div> 

            <Stack h={300} align="stretch" justify="flex-start" gap="md" bg="#242424" style={{paddingLeft:"200px", paddingRight:"200px"}}>
            {albumSongs.length === 0 ? (
                        <div className="marquee-container">
                            <span className="marquee-text">
                                Aucune musique dans cet album !
                            </span>
                        </div>
                    ) : (
                        albumSongs.map(song => (     
                            <div className='song-case' style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingRight:"20px" }} key={song.id}>
                                <div style={{display:"flex", alignItems:"center"}}>
                                    <img className='song-img' src={song.img_src.replace('./', '/')} alt={song.title}
                                    style={{ width:"100px", height:"100px", margin: "10px"}}/>
                                        <div  style={{ display: "flex", flexDirection: "column",marginLeft: "50px" }}>
                                            <Text fw={700} size="lg" c="white">{song.title}</Text>
                                            <Text fw={700} size="xs" c="dimmed" >{song.artist}</Text>

                                        </div>
                                        
                                        <Button className="play-on-hover" radius="xl" color="yellow" onClick={() => navigate("/Audio")}>
                                                    < FaPlay />
                                        </Button>
                                        </div> 
                                        <div style={{justifyContent:"space-between"}}> 

                                            <Menu shadow="md" width={200} position="bottom-end"  withArrow >
                                                
                                                <Menu.Target>
                                        <ActionIcon variant="subtle" aria-label="Settings" size="xl" color="rgba(255, 255, 255, 1)" style={{width:"50px", height:"50px"}}>
                                            <CgMoreVerticalAlt style={{width:"30px", height:"30px"}}/>
                                        </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown bg={"#242424"}>

                                                    <Menu.Sub  width={200}>
                                                        <Menu.Sub.Target>
                                                            <Menu.Sub.Item color="white" onClick={() => {console.log('Ajouter à un album');}}>
                                                                Ajouter à un album
                                                            </Menu.Sub.Item>
                                                        </Menu.Sub.Target>

                                                        <Menu.Sub.Dropdown bg={"#242424"}>
                                                            {albumAdd.length === 0 ? (
                                                                <>
                                                                <Menu.Item color="white" >Aucune album disponible !</Menu.Item>
                                                                </>
                                                            ) : (
                                                                albumAdd.map(album => (
                                                                   <Menu.Item className="list-add-album"color="white" onClick={() => {handleAdd(song,album.id)}}>
                                                                    <div className="add-case-album"style={{display:"flex"}}>
                                                                        <img src={album.img_src} style={{width:"50px",height:"50px",margin:"0px"}}/>
                                                                            <div style={{display:"flex",flexDirection: "column"}}>
                                                                                <Text className='Texte-add-album'>{album.title}</Text>
                                                                                <Text className='Texte-add-album' size="xs" c="dimmed">{album.artist}</Text>
                                                                            </div>
                                                                    </div>
                                                                   
                                                                   </Menu.Item>
                                                                ))
                                                            )}
                                                            
                                                        </Menu.Sub.Dropdown>
                                                    </Menu.Sub>  



                                                    <Menu.Item color="red" onClick={() => { handleDelete(song.id); console.log('Supprimer la chanson');window.location.reload(false);}}>
                                                        Supprimer
                                                    </Menu.Item>
                                                 </Menu.Dropdown>
                                            </Menu>     
                                    </div>
                                    
                            </div>
                            
                        ))
                        
                    )}
                    <Link to={`/MusicPlayer/Playlist/Musica/NewSong/${albumId}`} style={{ textDecoration: 'none' }}>  {/*Redirige vers NewSong */}
                                    <div className="add-song">
                                    <div className="add-icon">+</div>
                                        <Text fw={700} size="md" c="white" align="center">
                                            Ajouter un son
                                        </Text>
                                    </div>
                                </Link>
    </Stack>
    
        </MantineProvider>
    </div>
    );
};

export default ListMusic;
