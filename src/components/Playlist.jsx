import "./Playlist.css";
import '@mantine/core/styles.css';
import {MantineProvider,SimpleGrid,Text,Button,ActionIcon,Menu} from '@mantine/core';
import Header from "./Header";
import { FaPlay,FaTrashAlt } from "react-icons/fa";
import { Link,useNavigate } from "react-router-dom";


//Playlist est la liste des albums
function Playlist(props) {
    const albums = props.album || [];
    console.log("Albums reçus :", albums);
    const navigate = useNavigate();

    //Lorsque le bouton supprimer est clické appelle la methode DELETE du go avec un Fetch vers l'album avec l'id de l'album à supprimer
    const handleDelete = async (albumId) =>{
        try{
            const response = await fetch(`http://localhost:8080/albums/${albumId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Échec de la suppression de l"album');
        }
        console.log("Album supprimée avec succès");
        alert("Au chiotte l'album !");
        }
        catch(error) {
            console.error("Erreur:", error);
            alert(error.message);
        }
    }
    //permet de récupérer l'id de l'album lorsque clické
    const handleAlbumClick = (albumId) => {
        if (props.onAlbumSelect) {
            props.onAlbumSelect(albumId);
        }
    };
    return(
    <div>
        <MantineProvider>
            <Header />
            <div className="header-playlist"> <h1 className="page-title">Mes Albums</h1> 
                        </div>
        <div className='list-playlist'>
                <SimpleGrid cols={5}>
                    {albums.length === 0 ? (
                        <>
                            <Text c="white" size="xl">Aucun album trouvé.</Text>
                        </>
                            ) : (
                                <>
                                {albums.map((album, idx) => (
                                    <div className='album' key={album.id || idx} >
                                        <Link to={`/MusicPlayer/Playlist/Musica/${album.id}`}>
                                            <img className='album_img' src={album.img_src} alt={album.title} style={{ cursor: "pointer" }} onClick={() => handleAlbumClick(album.id)} />
                                        </Link> 
                                            <Button className="play-button" radius="xl" color="yellow"  onClick={() => {handleAlbumClick(album.id); navigate("/Audio");}} >
                                                < FaPlay />
                                            </Button>
                                            <Menu shadow="md" width={200} position="bottom-end"  withArrow >
                                                <Menu.Target>
                                                    <ActionIcon className="sup-button"variant="subtle" aria-label="sup" size="md" color="rgba(255, 255, 255, 1)" style={{width:"30px", height:"30px"}}>
                                                        <FaTrashAlt className="trash" style={{width:"23px", height:"23px"}}/>
                                                    </ActionIcon>
                                                </Menu.Target>
                                                    <Menu.Dropdown bg={"#242424"}>
                                                        <Menu.Item color="red" onClick={() => { handleDelete(album.id); console.log("Au chiotte l'album");window.location.reload(false); }}>
                                                            Supprimer
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                            </Menu>
                                        <Text fw={700} size="xl" c="white"className='details-album'>{album.title}</Text>
                                        <Text fw={700} size="md" c="dimmed" className='details-album'>{album.artist}</Text>
                                    </div>
                                ))}
    
                                </>
                            )}
                            <Link to={"/MusicPlayer/Playlist/NewAlbum"} style={{ textDecoration: 'none' }}>
                                    <div className="album add-album">
                                    <div className="add-icon">+</div>
                                    <Text fw={700} size="md" c="white" align="center">
                                        Ajouter un album
                                    </Text>
                                    </div>
                                </Link>
                </SimpleGrid>
        </div>
        </MantineProvider>
    </div>
    );
};

export default Playlist;