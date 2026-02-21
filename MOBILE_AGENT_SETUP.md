# Mobile AI Agent Setup (OpenClaw via Termux)

This guide explains how to run an **OpenClaw AI Agent** locally on an Android device using Termux, operating 24/7 without a PC or cloud server, and making it accessible via the BNB Edge DePIN Dashboard.

## Requirements
* Stable internet connection
* Gemini API key (from Google AI Studio)
* Android device connected to power
* Termux (installed from **F-Droid**, NOT the Play Store)

## 1. Install Termux & Ubuntu Proot
1. Go to [F-Droid.org](https://f-droid.org/) and install the F-Droid app.
2. Search for **Termux** in F-Droid and install it.
3. Open Termux and run the following commands:

```bash
pkg update && pkg upgrade -y

# Install proot-distro
pkg install proot-distro -y

# Install and login to Ubuntu
proot-distro install ubuntu
proot-distro login ubuntu
```

## 2. Setup Node.js & Dependencies
Inside the Ubuntu environment, run:

```bash
# Update system
apt update && apt upgrade -y

# Install curl
apt install -y curl

# Add NodeSource repo for Node 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node -v
npm -v

# Install git
apt update
apt install -y git
```

## 3. Install OpenClaw
```bash
npm install -g openclaw@latest

# Verify installation
openclaw --version
```

## 4. Fix Android Network Interface Error
Termux proot environments can struggle with `os.networkInterfaces()`. Create a hijack script to bypass this.

```bash
cat <<EOF > /root/hijack.js
const os = require('os');
os.networkInterfaces = () => ({});
EOF

# Make it load automatically:
echo 'export NODE_OPTIONS="-r /root/hijack.js"' >> ~/.bashrc
source ~/.bashrc
```

## 5. Run OpenClaw Setup Wizard
Start the onboarding process:
```bash
openclaw onboard
```
*Note: When prompted for **Gateway Bind**, select `127.0.0.1 (Loopback)`.*

## 6. Launch the Gateway
Start the OpenClaw agent gateway:
```bash
openclaw gateway --verbose
```

## 7. Access the Web Dashboard
Open your mobile browser or access via your local network:
`http://127.0.0.1:18789`

**To get your gateway token:**
Start a new terminal session in Termux, login to Ubuntu (`proot-distro login ubuntu`), and run:
```bash
openclaw config get gateway.auth.token
# Or alternatively:
cat ~/.openclaw/openclaw.json
```
Paste this token into the BNB Edge Dashboard or OpenClaw login screen.

## 8. Useful Agent Commands
* `/status` - Check agent health.
* `/think high` - Enable deep reasoning mode.
* `/reset` - Clear memory and restart the session.

## 9. Stability Tips for 24/7 Operation
* **Prevent Termux from Sleeping:** Run `termux-wake-lock` in the Termux terminal.
* **Disable Battery Optimization:**
  1. Go to Android Settings
  2. Apps → Termux
  3. Battery → Disable optimization (set to "Unrestricted")
* **Keep Device Plugged In:** Ensure continuous power for uninterrupted node operation.

## 10. Security Tips
* Never share your Gemini API keys publicly.
* **Do not share your gateway token.**
* Use a separate Google account for AI keys if possible.
