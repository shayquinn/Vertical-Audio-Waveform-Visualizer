# Vertical Audio Waveform Visualizer

A beautiful, interactive, real-time audio visualization userscript that displays a customizable vertical frequency spectrum bar on the right side of any webpage playing audio or video.

![Visualizer Preview](https://img.shields.io/badge/Type-Userscript-blue) ![Version](https://img.shields.io/badge/Version-1.3-green) ![Interactive](https://img.shields.io/badge/Interactive-Yes-brightgreen)

## ✨ Features

- 🎵 **Real-time Audio Visualization** - Displays live frequency bars that animate with your audio
- 🌈 **Rainbow Gradient Colors** - Beautiful color transitions from pink → purple → blue → cyan → green
- 🎨 **Interactive Color Control** - Drag vertically to rotate through the full color spectrum in real-time
- 📊 **Adjustable Bar Density** - Drag horizontally to increase/decrease the number of bars (10-80 bars)
- 🔄 **Center-Mirrored Design** - Bars radiate outward from the center in both directions
- 🎭 **Dynamic Glow Effects** - Glow effects that change color along with the gradient
- 📍 **Peak Indicators** - White markers show peak audio levels that decay smoothly
- � **Quick Reset** - Double-click or use reset button to restore default settings
- �🔇 **Auto-Detection** - Automatically detects and visualizes any audio/video on the page
- 🖱️ **Intuitive Controls** - Grab cursor shows the visualizer is interactive
- 📱 **Responsive** - Adapts to window resizing and high DPI displays
- ⚡ **Performance Optimized** - Pauses when tab is hidden to save resources

## 📋 What It Does

The visualizer creates a 120px wide vertical bar on the right edge of your browser window that:
- Appears automatically when audio/video starts playing (and isn't muted)
- Shows real-time frequency analysis with a single center bar and mirrored frequency bars
- Displays a smooth gradient effect that flows from the center outward
- Responds to mouse interaction for customization:
  - **Drag Up/Down**: Rotate colors through the full spectrum
  - **Drag Left/Right**: Adjust number of bars (fewer/more)
- Shows peak indicators that track maximum audio levels
- Disappears when audio stops or is paused
- Works on any website including YouTube, Netflix, Spotify Web Player, SoundCloud, etc.

## 🚀 Installation

### Using Greasemonkey (Firefox)

1. **Install Greasemonkey Extension**
   - Go to [Greasemonkey's Firefox Add-ons page](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
   - Click "Add to Firefox"
   - Approve the installation

2. **Create New User Script**
   - Click the Greasemonkey icon in your Firefox toolbar
   - Select **"New user script..."** from the dropdown menu

3. **Paste the Script**
   - Delete any default content in the editor
   - Open `Audio_Waveform_Visualizer.user.js` from this folder
   - Copy all the content (Ctrl+A, Ctrl+C)
   - Paste it into the Greasemonkey editor (Ctrl+V)

4. **Save and Enable**
   - Click **File → Save** (or press Ctrl+S)
   - Close the editor
   - The script is now active!

### Using Tampermonkey (Chrome, Edge, Firefox, Safari, Opera)

1. **Install Tampermonkey Extension**
   - Visit [Tampermonkey's website](https://www.tampermonkey.net/)
   - Click on your browser to install

2. **Install the Script**
   - Click the Tampermonkey icon in your browser toolbar
   - Select **"Create a new script..."**
   - Delete the default template
   - Copy and paste the entire content from `Audio_Waveform_Visualizer.user.js`
   - Press **File → Save** (or Ctrl+S)

3. **Verify Installation**
   - Go to any page with audio/video (like YouTube)
   - Play a video
   - You should see the visualizer appear on the right side!

## 🎮 Usage

### Basic Usage

1. Navigate to any webpage with audio or video content
2. Play the media (make sure it's not muted)
3. The visualizer automatically appears on the right side
4. When you pause or stop the audio, the visualizer disappears
5. Works across all tabs - each tab gets its own visualizer

### Interactive Controls

The visualizer is fully interactive! Hover over it and you'll see a "grab" cursor.

**🎨 Change Colors (Vertical Drag):**
- Click and drag **up** or **down** on the visualizer
- Watch the colors rotate through the full spectrum
- All gradient colors and glow effects change together
- Create your perfect color scheme!

**📊 Adjust Bar Density (Horizontal Drag):**
- Click and drag **left** to decrease bars (larger, fewer bars: 10 minimum)
- Click and drag **right** to increase bars (smaller, more bars: 80 maximum)
- Find the perfect balance between detail and smoothness
- Great for different types of music (fewer bars for bass-heavy, more for detailed treble)

**� Reset to Defaults:**
- **Double-click** anywhere on the visualizer to instantly reset colors and bar count
- Or click the **↺ reset button** in the top-right corner of the visualizer
- Resets hue rotation to 0° (original rainbow gradient)
- Resets bar count to 40 (default density)
- Quick way to start fresh without refreshing the page

**�💡 Tips:**
- You can drag diagonally to change both color and density simultaneously
- Your settings persist while the visualizer is active
- Double-click anytime to reset to default colors and bar count
- The reset button (↺) in the top-right corner provides a click alternative to double-click
- Settings reset when you refresh the page or start new media

## 🎛️ Managing the Script

### Disable/Enable the Script

**In Greasemonkey (Firefox):**
1. Click the Greasemonkey icon in your toolbar
2. Find "Vertical Audio Waveform Visualizer" in the list
3. Click the toggle switch next to it to disable/enable
4. Refresh any open tabs for changes to take effect

**In Tampermonkey:**
1. Click the Tampermonkey icon in your toolbar
2. Find "Vertical Audio Waveform Visualizer" in the dashboard
3. Toggle the switch to enable/disable
4. Or click the icon and toggle directly from the popup menu

### Disable for Specific Sites Only

**In Greasemonkey:**
1. Navigate to the site where you want to disable it
2. Click the Greasemonkey icon
3. Click the gear icon next to "Vertical Audio Waveform Visualizer"
4. Select "Add exclude" and confirm

**In Tampermonkey:**
1. Click the Tampermonkey icon → Dashboard
2. Click "Vertical Audio Waveform Visualizer"
3. Go to the "Settings" tab
4. Add URLs to "Excludes" (e.g., `https://banking-site.com/*`)

### Uninstall the Script

**In Greasemonkey:**
1. Click the Greasemonkey icon in your toolbar
2. Select "Manage user scripts"
3. Find "Vertical Audio Waveform Visualizer"
4. Click the trash/delete icon
5. Confirm deletion

**In Tampermonkey:**
1. Click the Tampermonkey icon → Dashboard
2. Find "Vertical Audio Waveform Visualizer" in the list
3. Click the trash icon on the right side
4. Confirm deletion
5. The script is completely removed

**Note:** Uninstalling removes all traces of the script. You can always reinstall it later using the installation instructions above.

### Supported Sites

- ✅ YouTube
- ✅ Netflix
- ✅ Spotify Web Player
- ✅ SoundCloud
- ✅ Twitch
- ✅ Any HTML5 video/audio player
- ✅ Local media files (if opened in browser)

## ⚙️ Configuration

You can customize the default visualizer settings by editing these values in the `CONFIG` object (lines 15-26):

```javascript
const CONFIG = {
    barWidth: 120,              // Width of the visualization bar (in pixels)
    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Background color
    borderColor: 'rgba(255, 255, 255, 0.3)',  // Border color
    smoothing: 0.8,             // Audio smoothing (0-1, higher = smoother)
    numBars: 40,                // Default number of frequency bars (adjustable via drag)
    barSpacing: 2,              // Space between bars
    barColor: '#00ff88',        // Base glow effect color (rotates with drag)
    animationSpeed: 0.15,       // Animation smoothing speed
    peakHold: true,             // Show peak indicators
    peakDecay: 0.97             // How fast peaks fall (0-1, higher = slower)
};
```

**Note:** While `numBars` sets the initial count, you can change it on-the-fly by dragging horizontally on the visualizer (range: 10-80 bars).

## � Safety & Privacy

### Is This Script Safe? ✅

**YES** - This script is completely safe and privacy-focused:

- ✅ **No data collection** - Doesn't collect, store, or transmit any user data
- ✅ **No external requests** - Doesn't connect to any external servers
- ✅ **No tracking** - Doesn't monitor your browsing or behavior
- ✅ **No audio recording** - Only analyzes audio frequencies, never records or saves audio
- ✅ **Open source** - All code is visible and can be reviewed
- ✅ **Minimal permissions** - Only uses `GM_addStyle` (for potential future styling)
- ✅ **Local execution** - Everything runs entirely in your browser
- ✅ **Read-only access** - Only reads audio data, doesn't modify media playback

### What the Script Does Access

1. **Audio Analysis Only** - Connects to Web Audio API to read frequency data in real-time
2. **DOM Access** - Adds a single visualization container to the page (no modifications to existing content)
3. **Media Elements** - Detects `<audio>` and `<video>` elements to visualize their audio

### What the Script CANNOT Do

- ❌ Cannot record your audio or video
- ❌ Cannot access your microphone or camera
- ❌ Cannot see what you're watching/listening to
- ❌ Cannot send data to external servers
- ❌ Cannot access passwords, cookies, or personal information
- ❌ Cannot modify page content or inject ads
- ❌ Cannot track your browsing history

### Potential Concerns & Mitigations

**1. Runs on All Websites (`@match *://*/*`)**
- **Why**: Needs to work on any site with audio/video
- **Mitigation**: You can restrict this in Greasemonkey/Tampermonkey settings to specific sites
- **How**: Edit the script and change line 7 to only match specific domains:
  ```javascript
  // @match        https://www.youtube.com/*
  // @match        https://www.netflix.com/*
  ```

**2. Performance Impact**
- **Concern**: Canvas animation uses CPU/GPU resources
- **Mitigation**: Automatically pauses when tab is hidden
- **Impact**: Minimal on modern hardware (~1-2% CPU)

**3. Audio Context Conflicts**
- **Concern**: Might interfere with sites that use Web Audio API
- **Mitigation**: Uses error handling to gracefully fail if audio is already connected
- **Fallback**: Attempts visualization anyway using existing audio connection

### Best Practices

- Review the code yourself before installing (it's short and readable!)
- Only install from trusted sources (this repository or your own copy)
- Keep your browser and userscript manager updated
- Disable on sensitive sites if you prefer (banking, work sites, etc.)
- Monitor console for any unexpected `[Visualizer]` error messages

### Browser Permissions

The script uses standard web APIs available to all websites:
- **Web Audio API** - For audio frequency analysis
- **Canvas API** - For drawing visualizations
- **DOM API** - For adding the visualizer element

No special browser permissions required beyond what userscript managers normally have.

## 🐛 Troubleshooting

**Visualizer doesn't appear:**
- Make sure the audio/video is not muted
- Check that Greasemonkey/Tampermonkey is enabled
- Open browser console (F12) and look for `[Visualizer]` messages
- Try refreshing the page

**Dragging changes page scroll/selection instead:**
- This has been fixed - the visualizer prevents default browser behaviors
- If issues persist, try clicking and holding for a moment before dragging

**Colors or bars won't change when dragging:**
- Make sure you're dragging on the visualizer itself (right edge of screen)
- Look for the "grab" cursor to confirm you're hovering over the interactive area
- Try refreshing the page if the controls become unresponsive

**Visualizer goes blank:**
- This has been fixed in v1.2 - make sure you're using the latest version
- Try switching tabs away and back

**No audio data detected:**
- Some sites may have audio protection that prevents visualization
- Try a different website to confirm the script works

**Concerned about a specific site:**
- You can disable the script for specific domains in your userscript manager settings
- Click the Greasemonkey/Tampermonkey icon → Dashboard → Click the script → Settings tab

## 📝 Technical Details

- **Audio Analysis**: Uses Web Audio API's AnalyserNode with FFT size of 256
- **Rendering**: HTML5 Canvas with requestAnimationFrame for smooth 60fps animation
- **Color Manipulation**: Real-time HSL color rotation with hex conversion
- **Peak Tracking**: Decay algorithm for smooth peak indicator animations
- **Interaction**: Mouse event handlers with drag detection and prevention of default behaviors
- **Dynamic Scaling**: Bar count adjustment with automatic frequency bin mapping
- **Compatibility**: Works with all modern browsers supporting Web Audio API
- **Performance**: Automatically pauses animation when tab is hidden, throttled resize events

## 📄 License

This userscript is provided as-is for personal use. Feel free to modify and share!

## 🔄 Version History

### v1.3 (Current)
- ✨ **Interactive Color Control** - Drag vertically to rotate through color spectrum
- 📊 **Adjustable Bar Density** - Drag horizontally to change bar count (10-80)
- 🎨 **Dynamic Hue Rotation** - All colors and glows rotate together
- 📍 **Peak Indicators** - White markers show and hold peak levels
- � **Reset Functionality** - Double-click or reset button to restore defaults
- 📱 **Touch Support** - Mobile touch gestures for drag controls
- 🎨 **Color Caching** - Improved performance with cached color calculations
- �🖱️ **Enhanced Interaction** - Grab/grabbing cursor, prevents page interference
- 🔧 **Multiple Audio Source Handling** - Better switching between different media
- 🧹 **Memory Leak Prevention** - Proper cleanup of audio resources
- ⚡ **Performance Enhancements** - Throttled resize events, visibility detection

### v1.2
- Added center-mirrored visualization design
- Fixed tab switching blank screen issue
- Improved canvas context handling
- Enhanced error handling and logging
- Better CSP compatibility

### v1.1
- Changed to gradient bar visualization
- Increased bar width to 120px
- Improved audio detection

### v1.0
- Initial release
- Basic waveform visualization

---

**Enjoy your music with beautiful visualizations! 🎵✨**
