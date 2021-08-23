package main

import (
	"io/fs"
	"log"
	"net/http"
)

func Serve(port string) {
	serverRoot, err := fs.Sub(html, "static")
	HandleErr(err, "Failed to get static files")

	var staticFS = http.FS(serverRoot)
	fss := http.FileServer(staticFS)

	http.Handle("/", fss)

	log.Println("Listening on " + port)

	err = http.ListenAndServe(":"+port, nil)
	HandleErr(err, "Server crashed. Sorry")
}
