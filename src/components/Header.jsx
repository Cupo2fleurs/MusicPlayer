import "./Header.css";
import '@mantine/core/styles.css';
import { MantineProvider,Button,Container,Avatar } from '@mantine/core';
import { Link,useNavigate } from "react-router-dom";

//Header est la barre de navigation présente sur chaque page qui permet de retourner en arrière et de naviguer vers la Playlist ou l'audio
const Header = () => {

    const navigate = useNavigate();

    return(
        <div><MantineProvider>
            <nav className="navbar">
            <img src="/image/logo/MyLogo.png" alt="test logo" id="MyLogo"/>
                <Container className="navigation" bg="var(--mantine-color-yellow-light)">
                    <Link to="/MusicPlayer/Playlist">
                        <Button variant="subtle" color="white" size="md" radius="md" className='button_navigation'>Playlists</Button>
                    </Link>
                    <Link to="/MusicPlayer/Audio">
                        <Button variant="subtle" color="white" size="md" radius="md">Ecouter</Button>
                    </Link>
                        <Button variant="subtle" color="white" size="md" radius="md" onClick={()=> navigate(-1)}>Retour</Button>
                </Container>
            </nav>
            </MantineProvider>
        </div>

    );
};

export default Header;