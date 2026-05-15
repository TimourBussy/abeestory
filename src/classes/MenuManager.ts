export class MenuManager {
  private _gameStarted: boolean = false;
  private _playBtnX: number = 0;
  private _playBtnY: number = 0;
  private _playBtnWidth: number = 200;
  private _playBtnHeight: number = 80;

  private _mouseX: number = 0;
  private _mouseY: number = 0;

  // Constants
  private readonly BEE_SIZE = 120;
  private readonly TITLE_SPACING = 20;

  get gameStarted(): boolean {
    return this._gameStarted;
  }

  set gameStarted(value: boolean) {
    this._gameStarted = value;
  }

  get playButtonBounds() {
    return {
      x: this._playBtnX,
      y: this._playBtnY,
      width: this._playBtnWidth,
      height: this._playBtnHeight,
    };
  }

  setMousePosition(x: number, y: number): void {
    this._mouseX = x;
    this._mouseY = y;
  }

  isMouseOverPlayButton(): boolean {
    return (
      this._mouseX >= this._playBtnX &&
      this._mouseX <= this._playBtnX + this._playBtnWidth &&
      this._mouseY >= this._playBtnY &&
      this._mouseY <= this._playBtnY + this._playBtnHeight
    );
  }

  isClickOnPlayButton(clickX: number, clickY: number): boolean {
    // Recalculate button dimensions to ensure they're current
    this._playBtnX = 640 - this._playBtnWidth / 2; // Assuming canvas center is 640
    this._playBtnY = 360 + 100; // Assuming canvas center Y is 360

    return (
      clickX >= this._playBtnX &&
      clickX <= this._playBtnX + this._playBtnWidth &&
      clickY >= this._playBtnY &&
      clickY <= this._playBtnY + this._playBtnHeight
    );
  }

  updateButtonPosition(centerX: number, centerY: number): void {
    this._playBtnX = centerX - this._playBtnWidth / 2;
    this._playBtnY = centerY + 100;
  }

  drawMenu(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    beeSprite: HTMLImageElement | null,
  ): void {
    // Background
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, width, height);

    // Title "A BEE STORY" with bee sprite in place of BEE
    ctx.fillStyle = "black";
    ctx.font = "bold 80px Papyrus";
    ctx.textBaseline = "middle";

    const centerY = height / 2 - 60;

    // Measure text widths
    const aWidth = ctx.measureText("A").width;

    // Calculate total width and starting position
    let startX =
      width / 2 -
      (aWidth +
        this.TITLE_SPACING +
        this.BEE_SIZE +
        this.TITLE_SPACING +
        ctx.measureText("STORY").width) /
        2;

    // Draw "A" text
    ctx.textAlign = "left";
    ctx.fillText("A", startX, centerY);
    startX += aWidth + this.TITLE_SPACING;

    // Draw bee sprite
    if (beeSprite) {
      ctx.drawImage(
        beeSprite,
        0,
        0,
        152, // Bee.FRAME_W
        152, // Bee.FRAME_H
        startX,
        height / 2 - 142,
        this.BEE_SIZE,
        this.BEE_SIZE,
      );
    }
    startX += this.BEE_SIZE + this.TITLE_SPACING;

    // Draw "STORY" text
    ctx.fillText("STORY", startX, centerY);

    // Update button position
    this.updateButtonPosition(width / 2, height / 2);

    // Draw play button
    ctx.fillStyle = "rgba(255, 140, 0, 0.8)";
    ctx.beginPath();
    ctx.roundRect(
      this._playBtnX,
      this._playBtnY,
      this._playBtnWidth,
      this._playBtnHeight,
      15,
    );
    ctx.fill();

    // Button border
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Button text
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Papyrus";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "PLAY",
      width / 2,
      this._playBtnY + this._playBtnHeight / 2 + 7, // empiric adjustment for better vertical alignment
    );
  }
}
