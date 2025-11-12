// SPDX-License-Identifier: GPL-3.0-or-later
// Gnome Browser Switcher Extension Entry Point

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// Import extension components
import { BrowserManager } from './browserManager.js';
import { BrowserIndicator } from './indicator.js';
import { MenuBuilder } from './menuBuilder.js';

/**
 * Extension class for Browser Switcher
 */
export default class BrowserSwitcherExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._browserManager = null;
        this._indicator = null;
        this._menuBuilder = null;
    }

    /**
     * Enable the extension
     * Called when the extension is enabled
     */
    enable() {
        console.log('Browser Switcher: Enabling extension');
        
        try {
            // Instantiate browser manager
            this._browserManager = new BrowserManager();
            
            // Create indicator with browser manager reference
            this._indicator = new BrowserIndicator(this._browserManager);
            
            // Add indicator to system panel
            Main.panel.addToStatusArea('browser-switcher-indicator', this._indicator);
            
            // Connect indicator to menu builder
            this._menuBuilder = new MenuBuilder(this._indicator, this._browserManager);
            
            // Show the indicator
            this._indicator.show();
            
            console.log('Browser Switcher: Extension enabled successfully');
            
        } catch (e) {
            console.error(`Browser Switcher: Error enabling extension: ${e.message}`);
            console.error(`Browser Switcher: Stack trace: ${e.stack}`);
            
            // Ensure graceful degradation - cleanup any partially initialized components
            this._cleanupOnError();
        }
    }

    /**
     * Disable the extension
     * Called when the extension is disabled or Gnome Shell restarts
     */
    disable() {
        console.log('Browser Switcher: Disabling extension');
        
        try {
            // Cleanup menu builder
            if (this._menuBuilder) {
                this._menuBuilder.destroy();
                this._menuBuilder = null;
            }
            
            // Cleanup and remove indicator
            if (this._indicator) {
                this._indicator.destroy();
                this._indicator = null;
            }
            
            // Cleanup browser manager
            if (this._browserManager) {
                this._browserManager.destroy();
                this._browserManager = null;
            }
            
            console.log('Browser Switcher: Extension disabled successfully');
            
        } catch (e) {
            console.error(`Browser Switcher: Error disabling extension: ${e.message}`);
            console.error(`Browser Switcher: Stack trace: ${e.stack}`);
            
            // Force cleanup even if errors occurred
            this._menuBuilder = null;
            this._indicator = null;
            this._browserManager = null;
        }
    }

    /**
     * Cleanup helper for error scenarios during enable()
     * Ensures graceful degradation if initialization fails
     * @private
     */
    _cleanupOnError() {
        try {
            if (this._menuBuilder) {
                this._menuBuilder.destroy();
                this._menuBuilder = null;
            }
        } catch (e) {
            console.error(`Browser Switcher: Error cleaning up menu builder: ${e.message}`);
        }
        
        try {
            if (this._indicator) {
                this._indicator.destroy();
                this._indicator = null;
            }
        } catch (e) {
            console.error(`Browser Switcher: Error cleaning up indicator: ${e.message}`);
        }
        
        try {
            if (this._browserManager) {
                this._browserManager.destroy();
                this._browserManager = null;
            }
        } catch (e) {
            console.error(`Browser Switcher: Error cleaning up browser manager: ${e.message}`);
        }
    }
}
