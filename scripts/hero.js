// document.addEventListener("DOMContentLoaded", () => {
//     const heroBg = document.getElementById("hero-bg");
//     const BACKEND_URL = 'http://localhost:3000';
  
//     if (heroBg) {
//       fetch(`${BACKEND_URL}/background`)
//         .then(response => {
//           if (!response.ok) {
//             throw new Error('Failed to fetch background image path');
//           }
//           return response.json();
//         })
//         .then(data => {
//           const imageUrl = `${BACKEND_URL}${data.path}`;
//           // Preload the image to ensure it loads
//           const img = new Image();
//           img.src = imageUrl;
//           img.onload = () => {
//             console.log(`Hero background loaded: ${imageUrl}`);
//             heroBg.style.backgroundImage = `url('${imageUrl}')`;
//           };
//           img.onerror = () => {
//             console.error(`Failed to load hero background image: ${imageUrl}`);
//             // Fallback to a default background color (already set in CSS)
//           };
//         })
//         .catch(error => {
//           console.error('Error fetching hero background:', error);
//           // Fallback to a default background color (already set in CSS)
//         });
//     } else {
//       console.log('Hero background element not found on this page');
//     }
//   });