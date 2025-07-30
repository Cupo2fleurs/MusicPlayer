package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Structure du Json
type Album struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Artist string `json:"artist"`
	ImgSrc string `json:"img_src"`
}

type Song struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Artist  string `json:"artist"`
	ImgSrc  string `json:"img_src"`
	Src     string `json:"src"`
	AlbumID int    `json:"album_id"`
}

type Data struct {
	Albums []Album `json:"albums"`
	Songs  []Song  `json:"songs"`
}

// Permet de lire le fichier data.json afin de charger les informations
func loadData() (Data, error) {
	var data Data
	bytes, err := os.ReadFile("data.json")
	if err != nil {
		return data, err
	}
	if err := json.Unmarshal(bytes, &data); err != nil {
		return data, err
	}
	return data, nil
}

// Permet d'écrire des informations de le fichier Json
func saveData(data Data) error {
	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile("data.json", bytes, 0644)
}

// Permet de suprimer un fichier si il n'est pas utilisé dans les albums ou les sons
func deleteFileIfUnused(path string, data Data, excludedSongID int) {
	cleanPath := filepath.Clean("." + path)

	isUsed := false

	// Vérifie l’usage pour les images
	for _, song := range data.Songs {
		if song.ID != excludedSongID && (song.ImgSrc == path || song.Src == path) {
			isUsed = true
			break
		}
	}
	for _, album := range data.Albums {
		if album.ImgSrc == path {
			isUsed = true
			break
		}
	}

	if !isUsed {
		fmt.Println("Suppression de :", cleanPath)
		if err := os.Remove(cleanPath); err != nil && !os.IsNotExist(err) {
			fmt.Printf("Erreur lors de la suppression du fichier %s : %v\n", cleanPath, err)
		}
	}
}

func main() {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTION"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	r.Static("/image", "../public/image")
	r.Static("/audio", "../public/audio")

	os.MkdirAll("../public/image/cover", 0755)
	os.MkdirAll("../public/audio", 0755)

	//Récupérer les sons et les albums dans la base de données
	r.GET("/albums", func(c *gin.Context) {
		data, err := loadData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, data.Albums)
	})

	r.GET("/songs", func(c *gin.Context) {
		data, err := loadData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, data.Songs)
	})

	// Ajouter un album
	r.POST("/albums", func(c *gin.Context) {
		var newAlbum Album
		if err := c.ShouldBindJSON(&newAlbum); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		//Récupère les infos présente dans data.json
		data, err := loadData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Génère un nouvel ID unique
		maxID := 0
		for _, a := range data.Albums {
			if a.ID > maxID {
				maxID = a.ID
			}
		}
		newAlbum.ID = maxID + 1

		data.Albums = append(data.Albums, newAlbum) //on ajoute le nouvelle album au Json
		if err := saveData(data); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, newAlbum)
	})

	//Ajouter un son dans la playlist
	r.POST("/songs", func(c *gin.Context) {
		var newSong Song
		if err := c.ShouldBindJSON(&newSong); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		//Récupère les info présente dans data.json
		data, err := loadData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		//Genere un nouvel id unique
		maxID := 0
		for _, s := range data.Songs {
			if s.ID > maxID {
				maxID = s.ID
			}
		}
		newSong.ID = maxID + 1

		data.Songs = append(data.Songs, newSong) //ajout du son dans le data.json
		if err := saveData(data); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, newSong)
	})

	r.POST("/upload", func(c *gin.Context) {
		file, err := c.FormFile("file") //reçoit le fichier à upload
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
			return
		}

		// Vérifier le type de fichier
		contentType := file.Header.Get("Content-Type")
		fmt.Printf("Type de fichier détecté: %s\n", contentType)

		var dst string
		if strings.HasPrefix(contentType, "image/") { //verifie le type de l'image puis ajoute le chemin vers le fichier cover
			dst = filepath.Join("../public", "image", "cover", file.Filename)
		} else if strings.HasPrefix(contentType, "audio/") || //verifie le type de l'audio puis ajoute le chemin vers le fichier audio
			strings.HasSuffix(strings.ToLower(file.Filename), ".mp3") ||
			strings.HasSuffix(strings.ToLower(file.Filename), ".wav") ||
			strings.HasSuffix(strings.ToLower(file.Filename), ".ogg") {
			dst = filepath.Join("../public", "audio", file.Filename)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Type de fichier non supporté: %s", contentType)})
			return
		}

		// Sauvegarder le fichier
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Retourner le chemin relatif pour l'accès web
		relativePath := strings.TrimPrefix(dst, "./public")
		relativePath = strings.ReplaceAll(relativePath, "\\", "/") // Pour Windows
		if !strings.HasPrefix(relativePath, "/") {
			relativePath = "/" + relativePath
		}

		fmt.Printf("Fichier sauvegardé dans: %s\n", dst)
		fmt.Printf("Chemin relatif retourné: %s\n", relativePath)

		c.JSON(http.StatusOK, gin.H{"path": relativePath})
	})

	//Fonction de supression d'un song
	r.DELETE("/songs/:id", func(c *gin.Context) {
		idParam := c.Param("id") //on Récupère l'id envoyer dans le fetch
		id, err := strconv.Atoi(idParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID invalide"})
			return
		}

		// Charger les données depuis le fichier
		data, err := loadData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur de chargement des données"})
			return
		}

		// Trouver l'index du son
		index := -1
		var deletedSong Song
		for i, s := range data.Songs {
			if s.ID == id {
				index = i
				deletedSong = s
				break
			}
		}

		if index == -1 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Chanson non trouvée"})
			return
		}
		//supprime le son avec l'index
		data.Songs = append(data.Songs[:index], data.Songs[index+1:]...)

		//Supprime les fichiers audio et image associés si ils ne sont pas utilisés ailleurs
		deleteFileIfUnused(deletedSong.ImgSrc, data, deletedSong.ID)
		deleteFileIfUnused(deletedSong.Src, data, deletedSong.ID)

		// Sauvegarder les données modifiées
		if err := saveData(data); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la sauvegarde"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Chanson supprimée avec succès"})
	})

	//Fonction de supression de l'album
	r.DELETE("/albums/:id", func(c *gin.Context) {
		idParam := c.Param("id") //on Récupère l'id envoyer dans le fetch
		id, err := strconv.Atoi(idParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID invalide"})
			return
		}

		// Charger les données depuis le fichier
		data, err := loadData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur de chargement des données"})
			return
		}

		// Trouver l'index de l'album
		var deletedAlbum Album
		index := -1
		for i, s := range data.Albums {
			if s.ID == id {
				index = i
				deletedAlbum = s
				break
			}
		}

		if index == -1 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Album non trouvée"})
			return
		}
		//supprime l'album avec l'index
		data.Albums = append(data.Albums[:index], data.Albums[index+1:]...)

		// Supprime l'image de l'album si elle n'est pas utilisée ailleurs
		deleteFileIfUnused(deletedAlbum.ImgSrc, data, -1)

		// Supprime tous les sons de l'album
		newSongs := []Song{}
		for _, song := range data.Songs {
			if song.AlbumID != id {
				newSongs = append(newSongs, song)
				continue
			}

			// Vérifie si l'audio n'est pas utilisé avant suppression du fichier audio
			deleteFileIfUnused(song.Src, data, song.ID)

			// Vérifie si l'image n'est pas utilisé avant suppression de l'image
			deleteFileIfUnused(song.ImgSrc, data, song.ID)
		}
		data.Songs = newSongs // Met à jour la liste des sons

		// Sauvegarder les données modifiées
		if err := saveData(data); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la sauvegarde"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Album supprimée avec succès"})

	})

	fmt.Println("Serveur démarré sur :8080")

	r.Run(":8080")
}
