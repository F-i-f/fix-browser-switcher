# Gnome Browser Switcher

A lightweight Gnome Shell extension for quick default browser switching through the system panel.

## Features

- 🚀 **Simple & Fast** - One-click browser switching
- 🎯 **Zero Configuration** - Works out of the box
- 🪶 **Lightweight** - No external dependencies
- 🔄 **Auto-Detection** - Finds all installed browsers automatically
- 🎨 **Native Integration** - Matches Gnome Shell design

## Use Case

Perfect for users who work with different browser profiles for different tasks (e.g., separate work and personal SSO authentication).

## Installation

### From extensions.gnome.org (Recommended)

Coming soon after initial release.

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/username/gnome-browser-switcher.git
cd gnome-browser-switcher
```

2. Copy files to the extensions directory:
```bash
mkdir -p ~/.local/share/gnome-shell/extensions/browser-switcher@gnome-shell-extensions
cp -r * ~/.local/share/gnome-shell/extensions/browser-switcher@gnome-shell-extensions/
```

3. Enable the extension:
```bash
gnome-extensions enable browser-switcher@gnome-shell-extensions
```

4. Restart Gnome Shell:
   - On X11: Press `Alt+F2`, type `r`, and press Enter
   - On Wayland: Log out and log back in

### Installation from ZIP Package

If you have a ZIP package:

```bash
gnome-extensions install browser-switcher@gnome-shell-extensions.zip
gnome-extensions enable browser-switcher@gnome-shell-extensions
```

### Uninstallation

```bash
gnome-extensions disable browser-switcher@gnome-shell-extensions
gnome-extensions uninstall browser-switcher@gnome-shell-extensions
```

## Requirements

- Gnome Shell 45 or 46
- xdg-utils (typically pre-installed)

## Development

See [.kiro/specs/gnome-browser-switcher/](.kiro/specs/gnome-browser-switcher/) for detailed requirements and design documentation.

## License

GPL-3.0 - See [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please ensure:
- Code follows existing style
- Extension remains simple and lightweight
- No external dependencies added
- Tested on Gnome Shell 45 and 46
