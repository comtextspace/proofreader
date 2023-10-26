const viewer = new Viewer(document.getElementById('image'), {
    inline: true,
    toolbar: {
        zoomIn: 1,
        zoomOut: 1,
        oneToOne: 1,
        reset: 1,
        prev: false,
        play: false,
        next: false,
        rotateLeft: 1,
        rotateRight: 1,
        flipHorizontal: false,
        flipVertical: false,
    },
    navbar: false,
});