class Game {
  constructor() {
    this.originalCanvas = document.getElementById("canvas-original");
    this.originalContext = this.originalCanvas.getContext("2d");
    this.canvasGrid = document.getElementById("canvas-grid");
    this.ctxGrid = this.canvasGrid.getContext("2d");
    this.canvasGridUnderlay = document.getElementById("canvas-grid-underlay");
    this.ctxGridOverlay = this.canvasGridUnderlay.getContext("2d");
    this.colorPickerElement = document.getElementById("color-picker");
    this.boundDraw = this.draw.bind(this);
  }

  setup(imgUrl) {
    this.loadOriginalImage(imgUrl);
    this.drawGrid();
    this.setupGridDrawing();
  }

  loadOriginalImage(imgSrc) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    fetch(imgSrc, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        let url = URL.createObjectURL(blob);
        img.src = url;
      })
      .catch((error) => {
        console.error("Error loading image:", error);
      });
    img.onload = () => {
      this.originalContext.drawImage(img, 0, 0, 500, 500);
    };
  }

  drawGrid() {
    this.ctxGridOverlay.strokeStyle = "black";
    this.ctxGridOverlay.lineWidth = 0.5;
    for (let i = 0; i <= 500; i += 10) {
      this.ctxGridOverlay.beginPath();
      this.ctxGridOverlay.moveTo(i, 0);
      this.ctxGridOverlay.lineTo(i, 500);
      this.ctxGridOverlay.stroke();
    }
    for (let i = 0; i <= 500; i += 10) {
      this.ctxGridOverlay.beginPath();
      this.ctxGridOverlay.moveTo(0, i);
      this.ctxGridOverlay.lineTo(500, i);
      this.ctxGridOverlay.stroke();
    }
  }

  getGridCursorPosition(event) {
    const rect = this.canvasGrid.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  startDrawing = (event) => {
    document.addEventListener("mousemove", this.boundDraw);
  };

  stopDrawing = () => {
    document.removeEventListener("mousemove", this.boundDraw);
  };

  getGridCursorPosition(event) {
    const rect = this.canvasGrid.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  draw(event) {
    const cursorPosition = this.getGridCursorPosition(event);
    const currentColor = this.colorPickerElement.value;
    let x = Math.floor(cursorPosition.x / 10) * 10;
    let y = Math.floor(cursorPosition.y / 10) * 10;
    this.ctxGrid.fillStyle = currentColor;
    this.ctxGrid.fillRect(x, y, 10, 10);
  }

  setupGridDrawing() {
    this.canvasGrid.addEventListener("mousedown", (event) => {
      this.startDrawing(event);
    });
    document.addEventListener("mouseup", () => {
      this.stopDrawing();
    });
  }

  toggleGridLayer() {
    this.canvasGridUnderlay.style.display =
      this.canvasGridUnderlay.style.display === "none" ? "block" : "none";
  }

  finishDrawing() {
    const dataURL = this.canvasGrid.toDataURL("image/png");
    const newTab = window.open("about:blank", "image from canvas");
    newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");
  }
}
