# Image Webshop

A modern image webshop built with React and TypeScript using Vite. Browse beautiful images by category in a carousel, add them to your cart, and complete your purchase.

## Features

- Image carousel with navigation
- Category filtering (Nature, Abstract, Portrait, Architecture)
- Blurred background that changes with the selected image
- Add images to cart with prices
- Shopping cart with item management
- Simulated checkout process
- Smooth animations and transitions
- Responsive design
- Built with React, TypeScript, and Vite

## Getting Started

### Prerequisites

- Node.js (version 20.19+ or 22.12+ recommended)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   `ash
   npm install
   `

### Running the App

To start the development server:
`ash
npm run dev
`

The app will be available at http://localhost:5173/

### Building for Production

`ash
npm run build
`

### Preview Production Build

`ash
npm run preview
`

## Customization

- Replace the placeholder image URLs in src/App.tsx with your own images, update prices, and assign categories
- Adjust the blur intensity in src/App.css by modifying the ilter: blur(10px) value
- Customize animations and styles in src/App.css

## Technologies Used

- React 19
- TypeScript
- Vite
- CSS for styling and animations
