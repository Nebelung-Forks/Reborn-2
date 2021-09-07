package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strings"
)

func HandleErr(err error, msg string) {
	if err != nil {
		log.Println(msg)
		log.Fatal(err)
	}
}

func checkBin(path string) bool {
	_, err := os.Stat(path)
	return os.IsNotExist(err)
}

func checkService(service string) bool {
	out, err := exec.Command("systemctl", "is-active", service).Output()
	if err != nil {
		return false
	}

	return (string(out) != "active\n")
}

func checkPipPackage(pack string, pipBin string) bool {
	out, err := exec.Command(pipBin, "show", pack).Output()
	if err != nil {
		return false
	}

	return (string(out) == "WARNING: Package(s) not found: "+pack+"\n")
}

func restartService(service string) error {
	_, err := exec.Command("systemctl", "restart", service).Output()

	return err
}

func enableStartService(service string) error {
	_, err := exec.Command("systemctl", "enable", service).Output()
	if err != nil {
		return err
	}

	_, err = exec.Command("systemctl", "start", service).Output()
	return err
}

func gitClone(repo string, path string, gitBin string) error {
	_, err := exec.Command(gitBin, "clone", repo, path).Output()

	return err
}

func npmInstall(path string, npmBin string) error {
	_, err := exec.Command(npmBin, "--prefix", path, "install", path).Output()

	return err
}

func replaceCorrosion(port string, path string) error {
	input, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}

	lines := strings.Split(string(input), "\n")

	for i, line := range lines {
		if strings.Contains(line, "codec: ") {
			lines[i] = "codec: 'xor', prefix: '/fetch/'"
		}
		if strings.Contains(line, "443") {
			lines[i] = "}).on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead)).listen(" + port + ");"
		}
	}

	output := strings.Join(lines, "\n")
	err = ioutil.WriteFile(path, []byte(output), 0644)

	return err
}

func AddDomains(installPath string, rebornPort string, corrosionPort string, nginxSiteConfig string, certbotBin string) {
	fmt.Print("Point some domains on serve. and @. to this server, then enter a list of comma separated domains (or type 'n' to setup domains later): ")
	reader := bufio.NewReader(os.Stdin)

	input, err := reader.ReadString('\n')
	HandleErr(err, "Unable to read domains.")

	input = strings.TrimSuffix(input, "\n")

	if input == "n" {
		return
	}

	if !strings.Contains(input, ",") {
		input = input + ","
	}

	nginxTemplateBytes, _ := ef.ReadFile("nginxConfig.txt")
	totalConfig := ""

	domains := strings.Split(input, ",")
	for _, domain := range domains {
		if domain == "" {
			continue
		}

		newConfig := string(nginxTemplateBytes)
		domain = strings.TrimPrefix(domain, " ")

		newConfig = strings.Replace(newConfig, "{{domain}}", domain, -1)
		newConfig = strings.Replace(newConfig, "{{installPath}}", installPath, -1)
		newConfig = strings.Replace(newConfig, "{{rebornPort}}", rebornPort, -1)
		newConfig = strings.Replace(newConfig, "{{corrosionPort}}", corrosionPort, -1)

		totalConfig = totalConfig + newConfig + "\n\n"
	}

	f, err := os.OpenFile(nginxSiteConfig, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0755)
	HandleErr(err, "Unable to create the nginx site config. Are you running with permissions?")

	defer f.Close()

	_, err = f.Write([]byte(totalConfig))
	HandleErr(err, "Unable to append to the nginx site config. Are you running with permissions?")

	err = restartService("nginx")
	HandleErr(err, "Failed to restart nginx. This is a problem with the install script. `systemctl status nginx` to investigate")

	args := []string{"--nginx", "--non-interactive", "--agree-tos", "-m", "reborn@reborn.com"}
	for _, domain := range domains {
		if domain == "" {
			continue
		}

		args = append(args, "-d")
		args = append(args, domain)
	}

	log.Println("[*] Obtaining SSL certificates.")

	cb, err := exec.Command(certbotBin, args...).Output()
	HandleErr(err, "Unable to run certbot.\n\n"+string(cb)+"\n\nYou might want to manually run\n"+certbotBin+" "+strings.Join(args, " "))
}

func Install(nodeBin string, npmBin string, certbotBin string, nginxBin string, gitBin string, pythonBin string, pipBin string, nginxSiteConfig string, installPath string, corrosionRepo string, rebornPort string, corrosionPort string) {
	if checkBin(nodeBin) {
		panic("Requires: nodejs. Either install nodejs or specify its path with --node")
	}

	if checkBin(npmBin) {
		panic("Requires: npm. Either install npm or specify its path with --npm")
	}

	if checkBin(certbotBin) {
		panic("Requires: certbot. Either install certbot or specify its path with --certbot")
	}

	if checkBin(nginxBin) {
		panic("Requires: nginx. Either install nginx or specify its path with --nginx")
	}

	if checkBin(gitBin) {
		panic("Requires: git. Either install git or specify its path with --git")
	}

	if checkBin(pythonBin) {
		panic("Requires: python3. Either install python or specify its path with --python")
	}

	if checkBin(pipBin) {
		panic("Requires: pip3. Either install pip3 or specify its path with --pip")
	}

	if checkPipPackage("certbot-nginx", pipBin) {
		panic("Requires: python3-certbot-nginx. Install certbot-nginx with pip or apt.")
	}

	if !checkBin(nginxSiteConfig) {
		os.Remove(nginxSiteConfig)
	}

	err := restartService("nginx")
	if err != nil {
		panic("Your nginx service failed to restart. This could mean an error in your configuration, a disabled service, or port 80/443 is in use by Apache or another process.")
	}

	if checkService("nginx") {
		panic("Your nginx service is not running. This could mean an error in your configuration, a disabled service, or port 80/443 is in use by Apache or another process.")
	}

	log.Println("[*] All checks passed.")

	if !checkBin(installPath) {
		os.RemoveAll(installPath)
	}

	err = os.MkdirAll(installPath, 0755)
	HandleErr(err, "Unable to create directory "+installPath+". Are you running with permissions?")

	log.Println("[*] Cloning " + corrosionRepo)

	err = gitClone(corrosionRepo, installPath+"/corrosion", gitBin)
	HandleErr(err, "Unable to clone Corrosion repo to "+installPath+"/corrosion. Are you running with permissions?")

	log.Println("[*] Running `npm install`")

	err = npmInstall(installPath+"/corrosion", npmBin)
	HandleErr(err, "Unable to run `npm install` for Corrosion.")

	err = replaceCorrosion(corrosionPort, installPath+"/corrosion/demo/index.js")
	HandleErr(err, "Unable to edit corrosion config.")

	log.Println("[*] Writing nginx config")

	err = ioutil.WriteFile(nginxSiteConfig, []byte("# Reborn auto-install config\n\n\nmap $http_user_agent $pp {\n\tdefault https://127.0.0.1:9771; # corrosion\n\t~lightspeedSystemsCrawler http://127.0.0.1:9339;\n}\n\nmap $http_user_agent $ppp {\n\tdefault http://127.0.0.1:9770; # corrosion\n\t~lightspeedSystemsCrawler http://127.0.0.1:9339;\n}\n\nmap $http_user_agent $pppp {\n\tdefault https://slider.kz/; # corrosion\n\t~lightspeedSystemsCrawler http://127.0.0.1:9339;\n}"), 0755)
	HandleErr(err, "Unable to create the nginx site config. Are you running with permissions?")

	AddDomains(installPath, rebornPort, corrosionPort, nginxSiteConfig, certbotBin)

	log.Println("[*] Dropping bin in " + installPath)

	exe, err := os.Executable()
	HandleErr(err, "Unable to detect self executable path. Did you delete me? :(")

	err = os.Chmod(exe, 0777)
	HandleErr(err, "Unable to detect self permissions. Did you delete me? :(")

	err = os.Rename(exe, installPath+"/reborn")
	HandleErr(err, "Unable to drop self in "+installPath+". Are you running with permissions?")

	log.Println("[*] Writing systemd services")

	corrosionServiceNew := strings.Replace(corrosionService, "{{installPath}}", installPath, -1)
	corrosionServiceNew = strings.Replace(corrosionServiceNew, "{{nodeBin}}", nodeBin, -1)

	rebornServiceNew := strings.Replace(rebornService, "{{installPath}}", installPath, -1)

	err = ioutil.WriteFile("/lib/systemd/system/corrosion.service", []byte(corrosionServiceNew), 0644)
	HandleErr(err, "Unable to write systemd service. Are you running with permissions?")

	err = ioutil.WriteFile("/lib/systemd/system/reborn.service", []byte(rebornServiceNew), 0644)
	HandleErr(err, "Unable to write systemd service. Are you running with permissions?")

	log.Println("[*] Starting systemd services")

	_, err = exec.Command("systemctl", "daemon-reload").Output()
	HandleErr(err, "Unable to reload systemd daemons. Idfk")

	err = enableStartService("reborn")
	HandleErr(err, "Unable to start reborn service. This is an issue with the installer.")

	err = enableStartService("corrosion")
	HandleErr(err, "Unable to start corrosion service. This is an issue with the installer.")

	log.Println("[*] Done installing!")
}
