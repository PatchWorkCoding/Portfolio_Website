function updateZoomScale() {
    const baseWidth = 100;
    const zoom = window.devicePixelRatio || 1;
    document.documentElement.style.setProperty('--zoom-Scale', zoom);
    console.log(zoom);
}

// Run on load & on zoom (resize often triggers zoom changes)
window.addEventListener('load', () => {
    //updateZoomScale();
});

window.addEventListener('resize', updateZoomScale);
