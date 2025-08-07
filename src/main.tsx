import React from "react";
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PWAManager } from '@/utils/pwa';

// Initialize PWA functionality
const pwaManager = PWAManager.getInstance();
pwaManager.initialize().catch(console.error);

// Add meta tags for mobile optimization
const head = document.head;

// Viewport meta tag for mobile responsive design
const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
head.appendChild(viewport);

// Theme color for browser UI
const themeColor = document.createElement('meta');
themeColor.name = 'theme-color';
themeColor.content = '#22c55e';
head.appendChild(themeColor);

// Apple specific meta tags
const appleMobileWebApp = document.createElement('meta');
appleMobileWebApp.name = 'apple-mobile-web-app-capable';
appleMobileWebApp.content = 'yes';
head.appendChild(appleMobileWebApp);

const appleStatusBar = document.createElement('meta');
appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
appleStatusBar.content = 'default';
head.appendChild(appleStatusBar);

const appleTitle = document.createElement('meta');
appleTitle.name = 'apple-mobile-web-app-title';
appleTitle.content = 'Vendora';
head.appendChild(appleTitle);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
