# Reborn

A frontend design for the [Corrosion web proxy](https://github.com/titaniumnetwork-dev/Corrosion)

## Dependencies

- NodeJS and NPM
- Certbot and python3-certbot-nginx
- Git
- Python and Pip
- Nginx
- Golang (if compiling Reborn)

## Pre-Installation

- I recommend installing Debian or Ubuntu on a VPS. Really, any OS that uses systemd will do. 
- Point some domains at your server. Make A records on @ (root) and serve., pointing to your server's IP address.

## Installation 

- Either grab the release binary, or compile for yourself with `go build`.
- `./reborn --install`
- If you get dependency errors, resolve them by installing the above software.
    - If you still get dependency errors after installing everything, point the reborn installer to the proper paths (see all options by running `./reborn --help`).
    - For example, if you installed certbot with pip, use `./reborn --install --pip /opt/certbot/bin/pip --certbot /opt/certbot/bin/certbot`
- Enter your domains separated by commas, or just one domain. Press enter.
- It should be working now, if no errors present themselves.

## Management

### Adding Domains

- `./reborn --addDomain`
- Enter your domains separated by commas, or just one domain. Press enter.

### Restarting

- `systemctl restart reborn`
- `systemctl restart corrosion`

### Updating Corrosion

- `cd /usr/local/reborn/Corrosion`
- `git pull origin master`
- `npm install`
- `systemctl restart corrosion`