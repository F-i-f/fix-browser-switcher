// SPDX-License-Identifier: GPL-3.0-or-later
// Browser detection and management for Gnome Browser Switcher

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

/**
 * BrowserManager handles browser detection, default browser management,
 * and monitoring of browser changes.
 */
class BrowserManager {
    constructor() {
        this._browsers = [];
        this._currentDefault = null;
        this._changeCallbacks = [];
        this._fileMonitor = null;
        this._fileMonitorSignalId = null;

        // Initialize browser list (this is sync but just reads files, which is ok)
        this._detectBrowsers();
    }

    /**
     * Asynchronously initializes the manager by fetching the current default browser.
     * This should be called from the extension's enable() method.
     * @returns {Promise<string|null>} Promise resolving to the initial default browser ID
     */
    async initialize() {
        this._currentDefault = await this.getCurrentDefaultBrowser();
        console.log(`Browser Switcher: Initial default browser is ${this._currentDefault}`);

        // Set up monitoring *after* getting the initial value
        this._setupFileMonitor();

        return this._currentDefault;
    }

    /**
     * Scans standard XDG directories for .desktop files and detects browsers
     * @returns {Array} Array of browser objects
     */
    getInstalledBrowsers() {
        return this._browsers;
    }

    /**
     * Detects all installed browsers by scanning .desktop files
     * @private
     */
    _detectBrowsers() {
        this._browsers = [];

        // Standard XDG directories to scan
        const searchPaths = [
            '/usr/share/applications',
            '/usr/local/share/applications',
            GLib.build_filenamev([GLib.get_home_dir(), '.local/share/applications'])
        ];

        for (const path of searchPaths) {
            this._scanDirectory(path);
        }

        if (this._browsers.length === 0) {
            console.warn('Browser Switcher: No browsers found! Please install a web browser.');
        } else {
            console.log(`Browser Switcher: Found ${this._browsers.length} browsers`);
        }
    }

    /**
     * Scans a directory for .desktop files
     * @param {string} dirPath - Directory path to scan
     * @private
     */
    _scanDirectory(dirPath) {
        const dir = Gio.File.new_for_path(dirPath);

        try {
            const enumerator = dir.enumerate_children(
                'standard::name,standard::type',
                Gio.FileQueryInfoFlags.NONE,
                null
            );

            let fileInfo;
            while ((fileInfo = enumerator.next_file(null)) !== null) {
                const fileName = fileInfo.get_name();

                if (fileName.endsWith('.desktop')) {
                    const filePath = GLib.build_filenamev([dirPath, fileName]);
                    this._parseDesktopFile(filePath, fileName);
                }
            }

            enumerator.close(null);
        } catch (e) {
            // Directory doesn't exist or can't be read - this is normal
            // log(`Browser Switcher: Could not scan ${dirPath}: ${e.message}`);
        }
    }

    /**
     * Parses a .desktop file and extracts browser information
     * @param {string} filePath - Path to .desktop file
     * @param {string} fileName - Name of the file
     * @private
     */
    _parseDesktopFile(filePath, fileName) {
        const keyFile = new GLib.KeyFile();

        try {
            keyFile.load_from_file(filePath, GLib.KeyFileFlags.NONE);

            // Check if this is a web browser - silently skip non-browsers
            try {
                const categories = keyFile.get_string('Desktop Entry', 'Categories');
                if (!categories || !categories.includes('WebBrowser')) {
                    return;
                }
            } catch (e) {
                // No Categories field - not a browser, skip silently
                return;
            }

            // Extract browser information
            const name = keyFile.get_string('Desktop Entry', 'Name');
            const exec = keyFile.get_string('Desktop Entry', 'Exec');
            let icon = 'web-browser'; // Default fallback

            try {
                icon = keyFile.get_string('Desktop Entry', 'Icon');
            } catch (e) {
                // Icon field is optional
            }

            // Create browser object
            const browser = {
                id: fileName,
                name: name,
                icon: icon,
                execPath: exec.split(' ')[0], // Get just the executable path
                desktopFile: filePath
            };

            // Check for duplicates - avoid adding the same browser twice
            // Check by both ID and executable path to catch different .desktop files for the same browser
            const existingBrowser = this._browsers.find(b =>
                b.id === browser.id || b.execPath === browser.execPath
            );
            if (!existingBrowser) {
                this._browsers.push(browser);
                console.log(`Browser Switcher: Added browser: ${browser.name} (${browser.id}) - ${browser.execPath}`);
            } else {
                console.log(`Browser Switcher: Skipped duplicate: ${browser.name} (${browser.id}) - already have ${existingBrowser.id}`);
            }

        } catch (e) {
            // Failed to parse desktop file - skip silently (likely not a valid desktop file)
        }
    }

    /**
     * Gets the current default browser asynchronously.
     * This is now async to avoid blocking the main thread.
     * @returns {Promise<string|null>} Promise resolving to the browser ID or null
     */
    async getCurrentDefaultBrowser() {
        // Try xdg-settings using async subprocess (primary method)
        try {
            const proc = Gio.Subprocess.new(
                ['xdg-settings', 'get', 'default-web-browser'],
                Gio.SubprocessFlags.STDOUT_PIPE
            );

            // Wait for process to complete and get output
            const [stdout] = await new Promise((resolve, reject) => {
                proc.communicate_utf8_async(null, null, (proc, res) => {
                    try {
                        const [, stdout] = proc.communicate_utf8_finish(res);
                        resolve([stdout]);
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            if (stdout) {
                const browserId = stdout.trim();
                if (browserId) {
                    this._currentDefault = browserId;
                    return browserId;
                }
            }
        } catch (e) {
            // xdg-settings not available or failed - this is the primary detection method
            console.log('Browser Switcher: xdg-settings not available, trying fallback methods');
        }

        // Fallback to GSettings (may not be available on all systems)
        // Note: This schema is not always present, especially on non-GNOME systems
        try {
            const settings = new Gio.Settings({
                schema_id: 'org.gnome.desktop.default-applications.web'
            });

            const browserId = settings.get_string('browser');
            if (browserId) {
                this._currentDefault = browserId;
                return browserId;
            }
        } catch (e) {
            // GSettings schema not available - this is expected on some systems
            // xdg-settings is the primary method anyway
        }

        return null;
    }

    /**
     * Returns the cached current default browser.
     * Use initialize() or getCurrentDefaultBrowser() to fetch/update the value.
     * @returns {string|null}
     */
    getCachedDefaultBrowser() {
        return this._currentDefault;
    }

    /**
     * Sets the default browser asynchronously
     * @param {string} browserId - Browser ID (desktop file name)
     */
    async setDefaultBrowser(browserId) {
        if (!browserId) {
            console.error('Browser Switcher: Invalid browser ID');
            return;
        }

        try {
            // Use async subprocess
            const proc = Gio.Subprocess.new(
                ['xdg-settings', 'set', 'default-web-browser', browserId],
                Gio.SubprocessFlags.NONE
            );

            const success = await proc.wait_check_async(null);

            if (success) {
                console.log(`Browser Switcher: Set default browser to ${browserId}`);
                // Update our internal state *after* success
                if (this._currentDefault !== browserId) {
                    this._currentDefault = browserId;
                    this._notifyChange(browserId);
                }
                return;
            }
        } catch (e) {
            console.error(`Browser Switcher: Failed to set default browser: ${e.message}`);
        }
    }

    /**
     * Watches for changes to the default browser
     * @param {Function} callback - Callback function to call when browser changes
     */
    watchDefaultBrowser(callback) {
        if (callback && typeof callback === 'function') {
            this._changeCallbacks.push(callback);
        }

        // Monitoring is now set up in initialize()
    }

    /**
     * Sets up file system monitoring for browser changes
     * @private
     */
    _setupFileMonitor() {
        // Monitor the mimeapps.list file which xdg-settings modifies
        const configPath = GLib.build_filenamev([
            GLib.get_user_config_dir(),
            'mimeapps.list'
        ]);

        const file = Gio.File.new_for_path(configPath);

        try {
            this._fileMonitor = file.monitor_file(Gio.FileMonitorFlags.NONE, null);

            // Store signal ID for proper cleanup in destroy()
            this._fileMonitorSignalId = this._fileMonitor.connect('changed', () => {
                this._onBrowserConfigChanged();
            });

            console.log('Browser Switcher: File monitor set up successfully');
        } catch (e) {
            console.error(`Browser Switcher: Could not set up file monitor: ${e.message}`);
        }
    }

    /**
     * Handles browser configuration file changes
     * @private
     */
    _onBrowserConfigChanged() {
        // Get the new default asynchronously
        this.getCurrentDefaultBrowser().then(newDefault => {
            if (newDefault && newDefault !== this._currentDefault) {
                console.log(`Browser Switcher: Browser changed from ${this._currentDefault} to ${newDefault}`);
                this._currentDefault = newDefault;
                this._notifyChange(newDefault);
            }
        }).catch(e => {
            console.error(`Browser Switcher: Error checking browser change: ${e.message}`);
        });
    }

    /**
     * Notifies all registered callbacks of browser change
     * @param {string} browserId - New browser ID
     * @private
     */
    _notifyChange(browserId) {
        for (const callback of this._changeCallbacks) {
            try {
                callback(browserId);
            } catch (e) {
                console.error(`Browser Switcher: Callback error: ${e.message}`);
            }
        }
    }

    /**
     * Cleans up resources
     */
    destroy() {
        // Disconnect file monitor signal before cancelling
        if (this._fileMonitor) {
            if (this._fileMonitorSignalId) {
                this._fileMonitor.disconnect(this._fileMonitorSignalId);
                this._fileMonitorSignalId = null;
            }
            this._fileMonitor.cancel();
            this._fileMonitor = null;
        }

        this._changeCallbacks = [];
        this._browsers = [];
        this._currentDefault = null;
    }
}

export { BrowserManager };
