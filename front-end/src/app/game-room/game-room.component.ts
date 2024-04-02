import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styles: [
  ]
})
export class GameRoomComponent implements AfterViewInit {

  @ViewChild('canvasOriginal') originalCanvas: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('canvasGrid') canvasGrid: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('canvasGridUnderlay') canvasGridUnderlay: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('colorPicker') colorPickerElement: ElementRef<HTMLInputElement> | undefined;

  originalContext: CanvasRenderingContext2D | undefined;
  ctxGrid: CanvasRenderingContext2D | undefined;
  ctxGridOverlay: CanvasRenderingContext2D | undefined;
  boundDraw: any;

  constructor(private httpClient: HttpClient) {
    this.boundDraw = this.draw.bind(this);
  }

  ngAfterViewInit(): void {
    this.originalContext = this.originalCanvas?.nativeElement.getContext("2d")!;
    this.ctxGrid = this.canvasGrid?.nativeElement?.getContext("2d")!;
    this.ctxGridOverlay = this.canvasGridUnderlay?.nativeElement.getContext("2d")!;
    this.setup("http://127.0.0.1:3000/img/obama.jpg");
  }

  setup(imgUrl: string) {
    this.loadOriginalImage(imgUrl);
    this.drawGrid();
    this.setupGridDrawing();
  }

  loadOriginalImage(imgSrc: string) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    this.httpClient.get(imgSrc, { responseType: 'blob' })
      .subscribe((blob: Blob) => {
        let url = URL.createObjectURL(blob);
        img.src = url;
      });
    img.onload = () => {
      this.originalContext?.drawImage(img, 0, 0, 500, 500);
    };
  }

  drawGrid() {
    this.ctxGridOverlay!.strokeStyle = "black";
    this.ctxGridOverlay!.lineWidth = 0.5;
    for (let i = 0; i <= 500; i += 10) {
      this.ctxGridOverlay?.beginPath();
      this.ctxGridOverlay?.moveTo(i, 0);
      this.ctxGridOverlay?.lineTo(i, 500);
      this.ctxGridOverlay?.stroke();
    }
    for (let i = 0; i <= 500; i += 10) {
      this.ctxGridOverlay?.beginPath();
      this.ctxGridOverlay?.moveTo(0, i);
      this.ctxGridOverlay?.lineTo(500, i);
      this.ctxGridOverlay?.stroke();
    }
  }

  startDrawing = (event: MouseEvent) => {
    document.addEventListener("mousemove", this.boundDraw);
  };

  stopDrawing = () => {
    document.removeEventListener("mousemove", this.boundDraw);
  };

  getGridCursorPosition(event: MouseEvent) {
    const rect = this.canvasGrid?.nativeElement?.getBoundingClientRect()!;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  draw(event: MouseEvent) {
    const cursorPosition = this.getGridCursorPosition(event);
    const currentColor = this.colorPickerElement?.nativeElement.value!;
    let x = Math.floor(cursorPosition.x / 10) * 10;
    let y = Math.floor(cursorPosition.y / 10) * 10;
    this.ctxGrid!.fillStyle = currentColor;
    this.ctxGrid!.fillRect(x, y, 10, 10);
  }

  setupGridDrawing() {
    this.canvasGrid?.nativeElement.addEventListener("mousedown", (event) => {
      this.startDrawing(event);
    });
    document.addEventListener("mouseup", () => {
      this.stopDrawing();
    });
  }

  toggleGridLayer() {
    this.canvasGridUnderlay!.nativeElement.style.display =
      this.canvasGridUnderlay?.nativeElement.style.display === "none" ? "block" : "none";
  }

  onTimeOver(event: boolean) {
    this.finishDrawing();
  }

  finishDrawing() {
    const dataURL = this.canvasGrid?.nativeElement.toDataURL("image/png");
    const newTab = window.open("about:blank", "image from canvas")!;
    newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");
  }

  clearDrawing() {
    this.ctxGrid?.clearRect(0, 0, 500, 500);
  }

}
