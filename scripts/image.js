document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded, script running...");

  const heroBg = document.querySelector(".hero-bg");
  if (!heroBg) {
    console.error("Error: .hero-bg element not found in the DOM.");
    return;
  }
  console.log("Found .hero-bg element:", heroBg);

  const totalImages = 8;
  const images = Array.from({ length: totalImages }, (_, i) => 
    `/images/banners/Image${i + 1}.png`
  );
  console.log("Image array:", images);

  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];
  console.log("Selected image:", selectedImage);

  // Apply the background image
  heroBg.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${selectedImage}')`;
  console.log("Background image set to:", heroBg.style.backgroundImage);

  // Test if the image is fetchable
  const img = new Image();
  img.src = selectedImage;
  img.onload = () => console.log(`Image ${selectedImage} loaded successfully`);
  img.onerror = () => console.error(`Failed to load image: ${selectedImage}`);
});