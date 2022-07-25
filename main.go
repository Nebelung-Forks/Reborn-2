package main

import (
	"embed"
	"flag"
)

var (
	//go:embed nginxConfig.txt
	ef embed.FS

	//go:embed reborn.service
	rebornService string

	//go:embed corrosion.service
	corrosionService string

	//go:embed edufau.service
	edufauService string

	//go:embed static
	html embed.FS
)

func main() {
	var install = flag.Bool("install", false, "Install Reborn")
	var addDomain = flag.Bool("addDomain", false, "Add domains")
	var serve = flag.Bool("serve", false, "Start server")

	var nodeBin = flag.String("node", "/usr/bin/node", "Path to NodeJS")
	var npmBin = flag.String("npm", "/usr/bin/npm", "Path to NPM")
	var certbotBin = flag.String("certbot", "/usr/local/bin/certbot", "Path to certbot")
	var nginxBin = flag.String("nginx", "/usr/sbin/nginx", "Path to nginx")
	var gitBin = flag.String("git", "/usr/bin/git", "Path to git")
	var pythonBin = flag.String("python", "/usr/bin/python3", "Path to python")
	var pipBin = flag.String("pip", "/usr/bin/pip3", "Path to pip")

	var installPath = flag.String("installPath", "/usr/local/reborn", "Reborn installation path")
	var corrosionRepo = flag.String("corrosion", "https://github.com/Titanium-Network/Corrosion", "Corrosion repo")
	var edufauRepo = flag.String("edufauRepo", "https://github.com/elitwo/edufau", "Edufau repo")
	var nginxSiteConfig = flag.String("nginxSiteConfig", "/etc/nginx/sites-enabled/reborn-auto", "Nginx site config path")

	var rebornPort = flag.String("rebornPort", "9770", "Reborn Static Port")
	var corrosionPort = flag.String("corrosionPort", "9771", "Corrosion Port")
	var edufauPort = flag.String("edufauPort", "9772", "Edufau Port")

	flag.Parse()

	if *install {
		Install(*nodeBin, *npmBin, *certbotBin, *nginxBin, *gitBin, *pythonBin, *pipBin, *nginxSiteConfig, *installPath, *corrosionRepo, *edufauRepo, *rebornPort, *corrosionPort, *edufauPort)
		return
	}

	if *addDomain {
		AddDomains(*installPath, *rebornPort, *corrosionPort, *nginxSiteConfig, *certbotBin)
		return
	}

	if *serve {
		Serve(*rebornPort)
		return
	}
}
