#!/bin/bash
# Verification script to confirm the icon fix is working

echo "=========================================="
echo "Icon Fix Verification"
echo "=========================================="
echo ""

# Set Chrome as default
echo "1. Setting Chrome as default browser..."
xdg-settings set default-web-browser com.google.Chrome.desktop
sleep 1

# Verify
current=$(xdg-settings get default-web-browser)
echo "   Current default: $current"
echo ""

# Reload extension
echo "2. Reloading extension..."
gnome-extensions disable browser-switcher@totoshko88.github.io 2>/dev/null
sleep 1
gnome-extensions enable browser-switcher@totoshko88.github.io
sleep 3
echo "   ✓ Extension reloaded"
echo ""

# Check logs for icon update
echo "3. Checking logs for icon updates..."
echo "=========================================="
journalctl -b -o cat --since "10 seconds ago" | grep "Browser Switcher" | grep -E "(Setting icon|Initial browser|Post-initialization)"
echo "=========================================="
echo ""

# Check if correct icon message appears
if journalctl -b -o cat --since "10 seconds ago" | grep "Browser Switcher" | grep -q "Setting icon to google-chrome"; then
    echo "✅ SUCCESS: Chrome icon was set correctly!"
    echo ""
    echo "The fix is working! The icon update is happening."
    echo ""
    echo "📝 Next step: Test Gnome Shell restart"
    echo "   - On X11: Press Alt+F2, type 'r', press Enter"
    echo "   - On Wayland: Log out and log back in"
    echo "   - Verify the Chrome icon appears immediately"
    exit 0
else
    echo "❌ FAILED: Chrome icon was not set"
    echo ""
    echo "Please check the full logs:"
    echo "journalctl -f -o cat | grep 'Browser Switcher'"
    exit 1
fi
