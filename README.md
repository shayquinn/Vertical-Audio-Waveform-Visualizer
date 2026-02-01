# Vertical Audio Waveform Visualizer

A beautiful, real-time audio visualization userscript that displays a vertical, gradient-colored frequency spectrum bar on the right side of any webpage playing audio or video.

![Visualizer Preview](https://img.shields.io/badge/Type-Userscript-blue) ![Version](https://img.shields.io/badge/Version-1.2-green)

## ✨ Features

- 🎵 **Real-time Audio Visualization** - Displays live frequency bars that animate with your audio
- 🌈 **Rainbow Gradient Colors** - Beautiful color transitions from pink → purple → blue → cyan → green
- 🔄 **Center-Mirrored Design** - Bars radiate outward from the center in both directions
- 🎭 **Glow Effects** - Dynamic glow effects on active bars for enhanced visual appeal
- 🔇 **Auto-Detection** - Automatically detects and visualizes any audio/video on the page
- 👻 **Non-Intrusive** - Pointer-events disabled so it won't interfere with page interactions
- 📱 **Responsive** - Adapts to window resizing and high DPI displays
- ⚡ **Performance Optimized** - Pauses when tab is hidden to save resources

## 📋 What It Does

The visualizer creates a 120px wide vertical bar on the right edge of your browser window that:
- Appears automatically when audio/video starts playing (and isn't muted)
- Shows real-time frequency analysis with 40 mirrored bars
- Displays a smooth gradient effect that flows from the center outward
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

1. Navigate to any webpage with audio or video content
2. Play the media (make sure it's not muted)
3. The visualizer automatically appears on the right side
4. When you pause or stop the audio, the visualizer disappears
5. Works across all tabs - each tab gets its own visualizer

### Supported Sites

- ✅ YouTube
- ✅ Netflix
- ✅ Spotify Web Player
- ✅ SoundCloud
- ✅ Twitch
- ✅ Any HTML5 video/audio player
- ✅ Local media files (if opened in browser)

## ⚙️ Configuration

You can customize the visualizer by editing these values in the `CONFIG` object (lines 15-23):

```javascript
const CONFIG = {
    barWidth: 120,              // Width of the visualization bar (in pixels)
    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Background color
    borderColor: 'rgba(255, 255, 255, 0.3)',  // Border color
    smoothing: 0.8,             // Audio smoothing (0-1, higher = smoother)
    numBars: 40,                // Number of frequency bars
    barSpacing: 2,              // Space between bars
    barColor: '#00ff88'         // Glow effect color
};
```

## 🐛 Troubleshooting

**Visualizer doesn't appear:**
- Make sure the audio/video is not muted
- Check that Greasemonkey/Tampermonkey is enabled
- Open browser console (F12) and look for `[Visualizer]` messages
- Try refreshing the page

**Visualizer goes blank:**
- This has been fixed in v1.2 - make sure you're using the latest version
- Try switching tabs away and back

**No audio data detected:**
- Some sites may have audio protection that prevents visualization
- Try a different website to confirm the script works

## 📝 Technical Details

- **Audio Analysis**: Uses Web Audio API's AnalyserNode with FFT size of 256
- **Rendering**: HTML5 Canvas with requestAnimationFrame for smooth 60fps animation
- **Compatibility**: Works with all modern browsers supporting Web Audio API
- **Performance**: Automatically pauses animation when tab is hidden

## 📄 License

This userscript is provided as-is for personal use. Feel free to modify and share!

## 🔄 Version History

### v1.2 (Current)
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
