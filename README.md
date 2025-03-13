# Next.js Audio Visualizer

A beautiful, interactive audio visualizer built with Next.js and the Web Audio API. Upload your audio files and watch them come to life with stunning visualizations.

![Audio Visualizer Demo](https://i.imgur.com/example.gif)

## Features

- **Multiple Visualization Types**:

  - Bars: Classic frequency bar visualization
  - Wave: Smooth waveform visualization with glow effect
  - Circular: Radial visualization with dynamic lines
  - Flashing Lights: Dynamic light show that pulses with the music

- **Easy File Upload**:

  - Drag and drop support
  - Traditional file picker
  - Supports MP3, WAV, OGG, and other audio formats

- **Responsive Design**:
  - Works on desktop and mobile devices
  - Adapts to different screen sizes

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/nextjs-audiovisualizer.git
   cd nextjs-audiovisualizer
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload an audio file by clicking on the upload area or dragging and dropping a file.
2. Select a visualization type using the buttons below the upload area.
3. Press the play button to start the visualization.
4. Enjoy the visual representation of your audio!

## How It Works

The visualizer uses the Web Audio API to analyze audio data in real-time and render visualizations on an HTML canvas. For a detailed explanation of how the waveform visualization works, see [docs/audio-visualizer-explained.md](docs/audio-visualizer-explained.md).

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Audio processing
- [HTML Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Visualization rendering
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Contributing

Contributions are welcome! Here are some ways you can contribute:

- Add new visualization types
- Improve existing visualizations
- Fix bugs
- Add new features
- Improve documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by various audio visualization projects
- Thanks to the Next.js team for the amazing framework
- Thanks to the Web Audio API for making audio processing possible in the browser
