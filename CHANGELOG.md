# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-01-02

### Fixed
- Changed `enable()` from async to sync (GNOME extensions guidelines compliance)
- File monitor signal now properly disconnected in `destroy()` (stored signal ID)
- Removed async handler in file monitor callback (prevents potential issues)
- Removed trailing whitespace in all source files
- Removed unused imports: `Main` from indicator.js, `GObject` and `Gio` from menuBuilder.js
- Fixed unused variable `id` in menuBuilder.js (changed to `[, item]` destructuring)
- Fixed inconsistent indentation in indicator.js
- Added missing newline at end of files

### Added
- ESLint configuration (`.eslintrc.json`) for code quality checks
- GitHub Actions workflow for automated releases on tag push

### Improved
- README.md restructured for better readability:
  - Added centered header with icon
  - Navigation links at top
  - Features displayed as table
  - Cleaner section organization
  - Removed redundant information

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
