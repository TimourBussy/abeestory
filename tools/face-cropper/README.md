# Face Cropper Tool

An interactive web-based tool for cropping square face images from larger images.

## Features

✨ **Interactive Canvas Cropping**

- Drag the crop box to position it
- Adjust crop size with a slider (50px - 600px)
- Real-time preview of the cropped area
- Mobile-friendly touch support

🎨 **User-Friendly Interface**

- Clean, modern UI with gradient styling
- Responsive design for all devices
- Live preview of the final image
- Status feedback for user actions

💾 **Automatic Saving**

- Saves cropped images as PNG
- Auto-naming: `[originalname]_face.png`
- Saves to `public/sprites/` directory
- Server-side processing for maximum quality

## How to Use

The Face Cropper is included in the main docker-compose setup:

```bash
# Start the service
docker compose up face-cropper -d

# Access at http://localhost:3001
```

## Usage Flow

1. **Select Image**: Click "Choose Image" to select a PNG/JPG from your device
2. **Position Crop**: Drag the blue dashed box to position the face
3. **Adjust Size**: Use the slider to change the crop area size (in pixels)
4. **Preview**: See the final result in real-time on the right side
5. **Save**: Click "Save as PNG" to save `[name]_face.png` to `public/sprites/`

## Output

Cropped images are saved as:

- **Location**: `public/sprites/[originalname]_face.png`
- **Format**: PNG with full transparency support
- **Size**: Square (width = height = crop size)

## Architecture

```
face-cropper/
├── index.html           # Main UI
├── style.css            # Styling
├── src/
│   ├── server.ts        # Express server + image saving
│   └── script.ts        # Canvas logic & interactions
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── Dockerfile           # Docker configuration
```

## Technical Stack

- **Frontend**: HTML5 Canvas, TypeScript, CSS3
- **Backend**: Express.js, Node.js Canvas API
- **Deployment**: Docker

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

## Notes

- Maximum recommended image size: 2000x2000px
- Supports common formats: PNG, JPG, GIF, WebP
- All processing happens server-side for best quality
- Cross-browser compatible (modern browsers)
