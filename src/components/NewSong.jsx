
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import "./New.css";
import { useState } from "react";
import Header from "./Header";
import { MantineProvider,Button,TextInput, Container,SimpleGrid,Text} from '@mantine/core';
import { Dropzone,IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useParams,useNavigate} from "react-router-dom";



function NewSong({ album = [] }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [imageFile, setImageFile] = useState(null); // Stocker le fichier image
  const [audioFile, setAudioFile] = useState(null); // Stocker le fichier audio
  const [imgSrc, setImgSrc] = useState("");
  const [src, setSrc] = useState("");
  const { albumId } = useParams();
  const navigate = useNavigate();

  ////Permet l'ajout dans le fichier Image/cover de l'image submit et de l'audio, connexion avec le go
  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      //envoie des infos dans le serveur
      const res = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`${type} uploadé avec succès:`, data.path);
        return data.path;
      } else {
        const errorData = await res.json();
        console.error("Erreur serveur:", errorData);
        throw new Error(`Erreur lors de l'upload ${type}: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      throw new Error("Erreur de réseau lors de l'upload");
    }
  };

  //Permet de récuperer le fichier selectionné par le Drag and drop Image
  const handleImageDrop = (files) => {
    if (files && files[0]) {
      setImageFile(files[0]);
      console.log("Image sélectionnée:", files[0].name);
    }
  };
//Permet de récuperer le fichier selectionné par le Drag and drop Audio
  const handleAudioDrop = (files) => {
    if (files && files[0]) {
      setAudioFile(files[0]);
      console.log("Audio sélectionné:", files[0].name);
    }
  };
//Action une fois le submit effectué
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification que tous les champs sont remplis
    if (!title || !artist || !imageFile || !audioFile) {
      alert("Veuillez remplir tous les champs et sélectionner une image et un audio");
      return;
    }

    try {
      // Upload de l'image
      console.log("Upload de l'image...");
      const uploadedImgPath = await uploadFile(imageFile, "image");
      setImgSrc(uploadedImgPath);

      // Upload de l'audio
      console.log("Upload de l'audio...");
      const uploadedAudioPath = await uploadFile(audioFile, "audio");
      setSrc(uploadedAudioPath);

      // Créer la chanson avec les chemins des fichiers uploadés
      const song = {
        title,
        artist,
        img_src: uploadedImgPath,
        src: uploadedAudioPath,
        album_id: Number(albumId),
      };

      // Envoyer la chanson au serveur
      const res = await fetch("http://localhost:8080/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      });

      if (res.ok) {
        alert("Chanson ajoutée avec succès !");
        // Réinitialiser le formulaire
        setTitle("");
        setArtist("");
        setImageFile(null);
        setAudioFile(null);
        setImgSrc("");
        setSrc("");
        navigate(`/MusicPlayer/Playlist/Musica/${albumId}`);
      } else {
        const errorData = await res.json();
        alert(`Erreur lors de l'ajout: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.message);
    }
  };


  return (
    <MantineProvider>
        <Header />
        <h1 className='new-title'>Nouveau Son</h1>
        <div className="container-newsong">
        <Container bg="var(--mantine-color-yellow-light)" size="lg" style={{padding:"20px", borderRadius:"20px"}}>
            <form onSubmit={handleSubmit}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
                <TextInput className="text-form1" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} required />
                <TextInput className="text-form1" placeholder="Artiste" value={artist} onChange={e => setArtist(e.target.value)} required />
                </SimpleGrid>
                <Dropzone className="Drop-image" onDrop={handleImageDrop}  maxSize={5 * 1024 ** 2} accept={IMAGE_MIME_TYPE}>
                    <div>
                <Text size="xl" inline>
                  Dépose une image ou cherche dans tes fichiers.
                </Text>
                {imageFile && (
                  <Text size="sm" color="blue" style={{ marginTop: '10px' }}>
                    Image sélectionnée: {imageFile.name}
                  </Text>
                )}
                {imgSrc && (
                  <Text size="sm" color="green" style={{ marginTop: '5px' }}>
                    Image uploadée: {imgSrc}
                  </Text>
                )}
              </div>
                </Dropzone>

                <Dropzone className="Drop-image" onDrop={handleAudioDrop}  maxSize={50 * 1024 ** 2} accept={['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']}>

                    <div>
                <Text size="xl" inline>
                  Dépose un audio ou cherche dans tes fichiers.
                </Text>
                {audioFile && (
                  <Text size="sm" color="blue" style={{ marginTop: '10px' }}>
                    Audio sélectionné: {audioFile.name}
                  </Text>
                )}
                {src && (
                  <Text size="sm" color="green" style={{ marginTop: '5px' }}>
                    Audio uploadé: {src}
                  </Text>
                )}
              </div>
                </Dropzone>
                <div style={{ textAlign:"center"}}>
                <Button type="submit" variant="light" color="yellow" size="lg">Ajouter la chanson</Button>
                </div>
            </form>
        </Container>
        </div>
    </MantineProvider>
  );
}

export default NewSong;
