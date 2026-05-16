import { Bee } from "./Bee";
import { NPC } from "./NPC";
import { DialogManager } from "./DialogManager";

export class RenderManager {
  private _ctx: CanvasRenderingContext2D;
  private readonly _width: number;
  private readonly _height: number;

  // Images
  private _skyImage: HTMLImageElement | null = null;
  private _beeSprite: HTMLImageElement | null = null;
  private _groundImage: HTMLImageElement | null = null;
  private _textboxImage: HTMLImageElement | null = null;
  private _soundBtnSprite: HTMLImageElement | null = null;
  private _npcImages: Map<string, HTMLImageElement> = new Map();
  private _npcFaceImages: Map<string, HTMLImageElement> = new Map();
  private _groundHeight: number = 62;

  // Constants
  private readonly SKY_BACKUP_COLOR = "lightblue";
  private readonly SKY_SCALE = 1.2;
  private readonly FONT_WEIGHT = "bold";
  private readonly FONT_FAMILY = "Papyrus";

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this._ctx = ctx;
    this._width = width;
    this._height = height;
  }

  get skyImage(): HTMLImageElement | null {
    return this._skyImage;
  }

  set skyImage(value: HTMLImageElement | null) {
    this._skyImage = value;
  }

  get beeSprite(): HTMLImageElement | null {
    return this._beeSprite;
  }

  set beeSprite(value: HTMLImageElement | null) {
    this._beeSprite = value;
  }

  get groundImage(): HTMLImageElement | null {
    return this._groundImage;
  }

  set groundImage(value: HTMLImageElement | null) {
    this._groundImage = value;
    if (value) {
      this._groundHeight = value.naturalHeight - 62;
    }
  }

  get textboxImage(): HTMLImageElement | null {
    return this._textboxImage;
  }

  set textboxImage(value: HTMLImageElement | null) {
    this._textboxImage = value;
  }

  get soundBtnSprite(): HTMLImageElement | null {
    return this._soundBtnSprite;
  }

  set soundBtnSprite(value: HTMLImageElement | null) {
    this._soundBtnSprite = value;
  }

  get npcImages(): Map<string, HTMLImageElement> {
    return this._npcImages;
  }

  get npcFaceImages(): Map<string, HTMLImageElement> {
    return this._npcFaceImages;
  }

  get groundHeight(): number {
    return this._groundHeight;
  }

  setNpcImage(src: string, image: HTMLImageElement) {
    this._npcImages.set(src, image);
  }

  setNpcFaceImage(src: string, image: HTMLImageElement) {
    this._npcFaceImages.set(src, image);
  }

  drawLoadingScreen() {
    this._ctx.fillStyle = this.SKY_BACKUP_COLOR;
    this._ctx.fillRect(0, 0, this._width, this._height);
    this._ctx.fillStyle = "black";
    this._ctx.font = "20px sans-serif";
    this._ctx.fillText("Loading...", this._width / 2 - 50, this._height / 2);
  }

  isLoadingComplete(): boolean {
    return !!(this._skyImage && this._beeSprite && this._groundImage);
  }

  drawGame(
    bee: Bee,
    npcs: NPC[],
    cameraX: number,
    dialogManager: DialogManager,
    tick: number,
  ): void {
    // Background
    this._ctx.fillStyle = this.SKY_BACKUP_COLOR;
    this._ctx.fillRect(0, 0, this._width, this._height);

    // Sky with parallax effect
    const skyW = this._skyImage!.naturalWidth * this.SKY_SCALE;
    for (
      let x = -(cameraX * 0.05) % skyW;
      x < this._width;
      x += skyW
    ) {
      this._ctx.drawImage(
        this._skyImage!,
        x,
        0,
        skyW,
        this._skyImage!.naturalHeight * this.SKY_SCALE,
      );
    }

    // Ground
    const groundW = this._groundImage!.naturalWidth;
    for (
      let x = -(cameraX % groundW);
      x < this._width;
      x += groundW - 1
    ) {
      this._ctx.drawImage(
        this._groundImage!,
        x,
        this._height - this._groundImage!.naturalHeight,
      );
    }

    // NPCs
    for (const npc of npcs) {
      const npcImage = this._npcImages.get(npc.imageSrc);
      if (!npcImage) continue;

      this._ctx.save();
      this._ctx.translate(
        npc.x - cameraX + (npcImage.naturalWidth * npc.scale) / 2,
        0,
      );
      this._ctx.drawImage(
        npcImage,
        0,
        0,
        npcImage.naturalWidth,
        npcImage.naturalHeight,
        -(npcImage.naturalWidth * npc.scale) / 2,
        npc.y,
        npcImage.naturalWidth * npc.scale,
        npcImage.naturalHeight * npc.scale,
      );
      this._ctx.restore();

      if (!npc.isNearBee(bee, npcImage.naturalWidth * npc.scale, npcImage.naturalHeight * npc.scale))
        continue;

      this.drawTriangle(
        npc.x -
          cameraX +
          (npcImage.naturalWidth * npc.scale) / 2 +
          npc.triangleOffsetX,
        npc.y - 23 + Math.sin(tick * 0.1) * 4, // up and down movement
        "down",
        "orange",
      );
    }

    // Bee
    const screenX = bee.x - cameraX;
    const screenY = bee.y;
    const col = bee.frameIndex % Bee.SPRITE_COLS;
    const row = Math.floor(bee.frameIndex / Bee.SPRITE_COLS);

    this._ctx.save();
    if (bee.direction === -1) {
      this._ctx.translate(screenX + Bee.SIZE, screenY);
      this._ctx.scale(-1, 1);
      this._ctx.drawImage(
        this._beeSprite!,
        col * Bee.FRAME_W,
        row * Bee.FRAME_H,
        Bee.FRAME_W,
        Bee.FRAME_H,
        0,
        0,
        Bee.SIZE,
        Bee.SIZE,
      );
    } else
      this._ctx.drawImage(
        this._beeSprite!,
        col * Bee.FRAME_W,
        row * Bee.FRAME_H,
        Bee.FRAME_W,
        Bee.FRAME_H,
        screenX,
        screenY,
        Bee.SIZE,
        Bee.SIZE,
      );
    this._ctx.restore();

    // Draw textbox if dialog is active
    if (dialogManager.activeDialogNPC && this._textboxImage) {
      bee.isFrozen = true;
      const textboxWidth = this._width * 0.6;
      const textboxHeight =
        textboxWidth *
        (this._textboxImage.naturalHeight / this._textboxImage.naturalWidth);
      const textboxX = (this._width - textboxWidth) / 2;
      const textboxY = this._height - textboxHeight;

      // Draw textbox background
      this._ctx.drawImage(
        this._textboxImage,
        textboxX,
        textboxY,
        textboxWidth,
        textboxHeight,
      );

      // Draw NPC head (face image if available)
      const activeNPC = dialogManager.activeDialogNPC!;
      const npcFaceImage = this._npcFaceImages.get(activeNPC.imageSrc);
      if (npcFaceImage) {
        const faceSize = textboxHeight * 0.53;
        const faceX = textboxX + textboxWidth * 0.081;
        const faceY = textboxY + textboxHeight * 0.227;
        const faceW = faceSize * 0.951;
        const faceH = faceSize;

        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.roundRect(faceX, faceY, faceW, faceH, 7);
        this._ctx.clip();

        this._ctx.drawImage(npcFaceImage, faceX, faceY, faceW, faceH);

        this._ctx.restore();
      }

      // Draw text
      this._ctx.fillStyle = "yellow";
      this._ctx.font = `bold ${Math.round(
        this.fitNameToWidth(
          activeNPC.name,
          textboxWidth * 0.23,
          Math.round((textboxWidth / 960) * 21),
        ),
      )}px Papyrus`;
      this._ctx.textBaseline = "middle";
      this._ctx.textAlign = "center";
      this._ctx.fillText(
        activeNPC.name,
        textboxX + textboxWidth * 0.396,
        textboxY + textboxHeight * 0.259,
      );

      this._ctx.fillStyle = "black";
      this._ctx.font = `bold ${Math.round((textboxWidth / 960) * 26)}px Papyrus`;
      this._ctx.textBaseline = "top";
      this._ctx.textAlign = "left";

      for (const [index, line] of this.wrapDialog(
        activeNPC.message[dialogManager.messageIndex],
        textboxWidth * 0.65,
      ).entries())
        this._ctx.fillText(
          line,
          textboxX + textboxWidth * 0.29,
          textboxY + textboxHeight * 0.4 + index * 30,
        );

      this.drawTriangle(
        textboxX + textboxWidth - 67,
        textboxY + textboxHeight - 45,
        "down",
      );
    } else bee.isFrozen = false;
  }

  drawSoundButtonOnScreen(isMuted: boolean): void {
    this.drawSoundButton(isMuted);
  }

  private fitNameToWidth(
    text: string,
    maxWidth: number,
    baseFontSize: number,
  ): number {
    let fontSize = baseFontSize;
    this._ctx.font = `${this.FONT_WEIGHT} ${Math.round(fontSize)}px ${this.FONT_FAMILY}`;
    let textWidth = this._ctx.measureText(text).width;

    while (textWidth > maxWidth - 20 && fontSize > 8) {
      fontSize -= 0.5;
      this._ctx.font = `${this.FONT_WEIGHT} ${Math.round(fontSize)}px ${this.FONT_FAMILY}`;
      textWidth = this._ctx.measureText(text).width;
    }

    return fontSize;
  }

  private wrapDialog(text: string, maxWidth: number): string[] {
    if (!text) return [""];
    const lines: string[] = [];
    let currentLine = "";

    for (const word of text.split(" ")) {
      const testLine = currentLine + (currentLine ? " " : "") + word;

      if (this._ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private drawTriangle(
    x: number,
    y: number,
    direction: "up" | "right" | "down" | "left",
    color: string = "black",
  ): void {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.beginPath();

    if (direction === "up") {
      this._ctx.moveTo(x, y - 12);
      this._ctx.lineTo(x - 8, y);
      this._ctx.lineTo(x + 8, y);
    } else if (direction === "right") {
      this._ctx.moveTo(x + 12, y);
      this._ctx.lineTo(x, y - 8);
      this._ctx.lineTo(x, y + 8);
    } else if (direction === "down") {
      this._ctx.moveTo(x, y + 12);
      this._ctx.lineTo(x - 8, y);
      this._ctx.lineTo(x + 8, y);
    } else if (direction === "left") {
      this._ctx.moveTo(x - 12, y);
      this._ctx.lineTo(x, y - 8);
      this._ctx.lineTo(x, y + 8);
    }

    this._ctx.closePath();
    this._ctx.fill();
    this._ctx.restore();
  }

  drawSoundButton(isMuted: boolean): void {
    if (!this._soundBtnSprite) return;

    const buttonSize = 80;
    const padding = 20;

    // Sprite sheet is 1124px wide, divided into 2 sprites of 562px each
    // Left sprite (0-562px): unmuted, Right sprite (562-1124px): muted
    const spriteWidth = this._soundBtnSprite.naturalWidth / 2;

    this._ctx.drawImage(
      this._soundBtnSprite,
      isMuted ? spriteWidth : 0,
      0,
      spriteWidth,
      this._soundBtnSprite.naturalHeight,
      this._width - buttonSize - padding,
      padding,
      buttonSize,
      buttonSize,
    );
  }

  isClickOnSoundButton(clickX: number, clickY: number): boolean {
    const buttonSize = 80;
    const padding = 20;
    const x = this._width - buttonSize - padding;
    const y = padding;

    return (
      clickX >= x &&
      clickX <= x + buttonSize &&
      clickY >= y &&
      clickY <= y + buttonSize
    );
  }

  isMouseOverSoundButton(mouseX: number, mouseY: number): boolean {
    const buttonSize = 80;
    const padding = 20;
    const x = this._width - buttonSize - padding;
    const y = padding;

    return (
      mouseX >= x &&
      mouseX <= x + buttonSize &&
      mouseY >= y &&
      mouseY <= y + buttonSize
    );
  }
}
