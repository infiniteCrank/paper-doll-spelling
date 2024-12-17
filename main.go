package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"paper-doll-spelling/auth"

	_ "github.com/mattn/go-sqlite3"
)

// Data models
type Word struct {
	ID         int    `json:"id"`
	Spelling   string `json:"spelling"`
	Definition string `json:"definition"`
}

// Initialize SQLite database
func initDB() *sql.DB {
	db, err := sql.Open("sqlite3", "./game.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create table
	stmt := `
	CREATE TABLE IF NOT EXISTS words (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		spelling TEXT,
		definition TEXT
	);
	`
	_, err = db.Exec(stmt)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

// Handler functions
func addWordHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var word Word
		json.NewDecoder(r.Body).Decode(&word)

		stmt, err := db.Prepare("INSERT INTO words (spelling, definition) VALUES (?, ?)")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = stmt.Exec(word.Spelling, word.Definition)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}

func getWordsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, spelling, definition FROM words")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var words []Word
		for rows.Next() {
			var word Word
			rows.Scan(&word.ID, &word.Spelling, &word.Definition)
			words = append(words, word)
		}
		json.NewEncoder(w).Encode(words)
	}
}

func main() {
	db := initDB()
	defer db.Close()
	http.Handle("/", http.FileServer(http.Dir("./public"))) // Serve client files
	http.HandleFunc("POST /login", auth.LoginHandler)
	http.HandleFunc("POST /words", addWordHandler(db))
	http.HandleFunc("GET /words", getWordsHandler(db))
	log.Println("Server started on :8080")
	err := http.ListenAndServe(":8080", nil) // Start listening on port 8080
	if err != nil {
		log.Fatal("ListenAndServe: ", err) // Log any errors starting the server
	}
}
