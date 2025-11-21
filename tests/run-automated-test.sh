#!/bin/bash
# Automated test script for icon fix verification

set -e

EXTENSION_ID="browser-switcher@totoshko88.github.io"
TEST_BROWSERS=("com.google.Chrome.desktop" "com.microsoft.Edge.desktop" "vivaldi-stable.desktop" "firefox.desktop")

echo "=========================================="
echo "Automated Icon Fix Test"
echo "=========================================="
echo ""

# Function to reload extension
reload_extension() {
    echo "🔄 Reloading extension..."
    gnome-extensions disable "$EXTENSION_ID" 2>/dev/null || true
    sleep 1
    gnome-extensions enable "$EXTENSION_ID"
    sleep 3
    echo "✓ Extension reloaded"
}

# Function to check logs for post-initialization message
check_logs() {
    local browser=$1
    echo "📋 Checking logs for: $browser"
    
    # Get the last 50 lines and look for our message
    local log_output=$(journalctl -b -o cat --since "10 seconds ago" | grep "Browser Switcher" | grep -i "post-initialization" || echo "")
    
    if [ -n "$log_output" ]; then
        echo "✅ Found post-initialization log:"
        echo "$log_output"
        return 0
    else
        echo "❌ Post-initialization log not found"
        return 1
    fi
}

# Function to get current default browser
get_default_browser() {
    xdg-settings get default-web-browser 2>/dev/null || echo "unknown"
}

# Test each browser
test_count=0
pass_count=0

for browser in "${TEST_BROWSERS[@]}"; do
    test_count=$((test_count + 1))
    echo ""
    echo "=========================================="
    echo "Test $test_count: Testing with $browser"
    echo "=========================================="
    
    # Set browser as default
    echo "🌐 Setting $browser as default..."
    xdg-settings set default-web-browser "$browser" 2>/dev/null || {
        echo "⚠️  Could not set $browser as default (may not be installed)"
        continue
    }
    
    sleep 1
    
    # Verify it was set
    current=$(get_default_browser)
    if [ "$current" != "$browser" ]; then
        echo "❌ Failed to set $browser as default (got: $current)"
        continue
    fi
    echo "✓ Default browser set to: $current"
    
    # Reload extension
    reload_extension
    
    # Check logs
    if check_logs "$browser"; then
        pass_count=$((pass_count + 1))
        echo "✅ Test PASSED for $browser"
    else
        echo "❌ Test FAILED for $browser"
        echo "   Expected to find 'Post-initialization icon update' in logs"
    fi
done

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Tests run: $test_count"
echo "Tests passed: $pass_count"
echo "Tests failed: $((test_count - pass_count))"
echo ""

if [ $pass_count -eq $test_count ] && [ $test_count -gt 0 ]; then
    echo "✅ All tests PASSED!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Restart Gnome Shell to verify icon persists"
    echo "2. Check that icon appears within 500ms of restart"
    echo "3. Verify no fallback 'web-browser' icon appears"
    exit 0
else
    echo "❌ Some tests FAILED"
    echo ""
    echo "Please check:"
    echo "1. Are the browsers installed?"
    echo "2. Is the extension properly installed?"
    echo "3. Check full logs: journalctl -f -o cat | grep 'Browser Switcher'"
    exit 1
fi
