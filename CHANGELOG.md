# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-11-22

### Fixed
- Replaced synchronous `GLib.spawn_command_line_sync()` with asynchronous `Gio.Subprocess` implementation
- Extension now complies with extensions.gnome.org guidelines (no sync subprocess calls)
- Removed duplicate `getCachedDefaultBrowser()` method definition

### Improved
- Cleaner logs: reduced noise from non-browser .desktop files
- Better error handling with informative messages
- Added fallback comments explaining expected behavior
- Removed unused variables (stderr)

### Changed
- `getCurrentDefaultBrowser()` now uses Promise-based async subprocess
- `setDefaultBrowser()` now uses async subprocess with `wait_check_async()`
- Parse errors for non-browser .desktop files are now silent

## [1.0.0] - 2024-11-21

### Added
- Initial release
- One-click browser switching from system panel
- Auto-detection of installed browsers
- Real-time icon updates
- File monitoring for external browser changes
- Support for Gnome Shell 45-49
