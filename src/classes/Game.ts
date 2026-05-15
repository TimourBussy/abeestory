import { Bee } from "./Bee";
import { NPC } from "./NPC";
import { DialogManager } from "./DialogManager";

export class Game {
  static readonly WORLD_WIDTH = 5000;
  static readonly GAME_WIDTH = 1280;
  static readonly GAME_HEIGHT = 720;
  static readonly SKY_BACKUP_COLOR = "lightblue";
  static readonly SKY_SCALE = 1.2;
  static readonly KEY_CODES = {
    up: ["ArrowUp", "KeyW"],
    left: ["ArrowLeft", "KeyA"],
    right: ["ArrowRight", "KeyD"],
  };
  static readonly FONT_WEIGHT = "bold";
  static readonly FONT_FAMILY = "Papyrus";

  // ============ CANVAS & RENDERING ============
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _rootElement: HTMLElement;
  private _width: number;
  private _height: number;

  // ============ TIMING ============
  private _tick: number = 0;
  private _lastTime: number = 0;

  // ============ INPUT ============
  private _keys: {
    up: boolean;
    left: boolean;
    right: boolean;
  };
  private _mouseX: number = 0;
  private _mouseY: number = 0;

  // ============ IMAGES ============
  private _skyImage: HTMLImageElement | null = null;
  private _beeSprite: HTMLImageElement | null = null;
  private _groundImage: HTMLImageElement | null = null;
  private _textboxImage: HTMLImageElement | null = null;
  private _npcImages: Map<string, HTMLImageElement> = new Map();
  private _npcFaceImages: Map<string, HTMLImageElement> = new Map();
  private _groundHeight: number = 62; // default value until ground image is loaded

  // ============ GAME WORLD (Actors) ============
  private _bee: Bee;
  private _npcs: NPC[] = [];

  // ============ SYSTEMS ============
  private _dialogManager: DialogManager;
  private _cameraX: number = 0;

  // ============ AUDIO ============
  private _bgMusic: HTMLAudioElement;

  // ============ MENU ============
  private _gameStarted: boolean = false;
  private _playBtnX: number = 0;
  private _playBtnY: number = 0;
  private _playBtnWidth: number = 0;
  private _playBtnHeight: number = 0;

  constructor(rootElement: HTMLElement) {
    this._rootElement = rootElement;

    // Canvas setup
    this._canvas = document.createElement("canvas");
    this._canvas.width = Game.GAME_WIDTH;
    this._canvas.height = Game.GAME_HEIGHT;
    this._rootElement.appendChild(this._canvas);

    this._ctx = this._canvas.getContext("2d")!;
    this._width = Game.GAME_WIDTH;
    this._height = Game.GAME_HEIGHT;

    window.addEventListener("resize", () => {
      const scale = Math.min(
        window.innerWidth / Game.GAME_WIDTH,
        window.innerHeight / Game.GAME_HEIGHT,
      );
      this._canvas.style.width = `${Game.GAME_WIDTH * scale}px`;
      this._canvas.style.height = `${Game.GAME_HEIGHT * scale}px`;
    });
    // Immediate trigger to set initial canvas size
    window.dispatchEvent(new Event("resize"));

    // Create NPCs
    this._npcs.push(
      new NPC(
        1000,
        "Apiculteur Connecté",
        [
          "Salut petite abeille ! Moi, je surveille les ruches grâce à des capteurs connectés.",
          "Ils me donnent des infos comme la température, l’humidité… et même l’activité des abeilles !",
          "Grâce à ça, je peux m’assurer que la ruche est en bonne santé sans la déranger.",
        ],
        "/sprites/npc1.png",
        15, // triangle x offset to better align with the character's head
      ),
    );
    this._npcs.push(
      new NPC(
        1500,
        "Gardienne des Fleurs",
        [
          "Bonjour petite abeille ! Tu sais pourquoi les fleurs ont autant de couleurs différentes ?",
          "Certaines attirent les abeilles avec leurs couleurs ou leur odeur pour être pollinisées.",
          "Quand tu transportes du pollen d’une fleur à une autre, tu aides les plantes à produire des fruits et des graines !",
          "Sans les abeilles, beaucoup de plantes auraient du mal à se reproduire.",
        ],
        "/sprites/npc2.png",
      ),
    );
    this._npcs.push(
      new NPC(
        2000,
        "Jardinière du Verger",
        [
          "Coucou petite abeille !",
          "Les abeilles ne fabriquent pas seulement du miel. Elles aident aussi les agriculteurs et les jardiniers.",
          "Beaucoup de fruits comme les pommes, les fraises ou les cerises dépendent de la pollinisation.",
          "Quand les abeilles disparaissent d’une zone, les récoltes peuvent devenir beaucoup plus petites.",
          "Chaque petite visite que tu fais sur une fleur aide la nature à rester en bonne santé !",
        ],
        "/sprites/npc3.png",
      ),
    );
    this._npcs.push(
      new NPC(
        2500,
        "Maître Apiculteur",
        [
          "Bonjour petite abeille ! Tu vois ce cadre rempli d’alvéoles ? C’est là que les abeilles stockent le miel.",
          "Pour fabriquer une petite quantité de miel, une colonie doit visiter des milliers de fleurs.",
          "Les abeilles transforment le nectar en miel directement dans la ruche grâce à leur travail collectif.",
          "Chaque abeille a un rôle important : certaines récoltent le nectar, d’autres protègent la ruche ou s’occupent des larves.",
          "Une ruche fonctionne un peu comme une grande équipe parfaitement organisée !",
        ],
        "/sprites/npc4.png",
        10,
      ),
    );
    this._npcs.push(
      new NPC(
        3000,
        "Jeune Apiculteur",
        [
          "Salut petite abeille ! Tu savais que les abeilles communiquent entre elles grâce à une danse ?",
          "Quand une abeille trouve beaucoup de fleurs, elle retourne à la ruche pour indiquer leur position aux autres.",
          "La direction et les mouvements de la danse permettent aux abeilles de savoir où aller !",
          "Même sans parler, toute la colonie peut ainsi travailler ensemble très efficacement.",
          "Les scientifiques étudient encore aujourd’hui ce comportement fascinant !",
        ],
        "/sprites/npc5.png",
        -5,
      ),
    );
    this._npcs.push(
      new NPC(
        3500,
        "Récolteuse de Graines",
        [
          "Bonjour petite abeille ! Après la pollinisation, certaines fleurs peuvent produire des graines.",
          "Ces graines permettent aux plantes de repousser et de créer de nouvelles fleurs.",
          "Les abeilles participent donc au renouvellement de nombreuses plantes dans la nature.",
          "Sans pollinisateurs, certains paysages seraient beaucoup moins colorés et beaucoup moins vivants.",
          "Chaque fleur pollinisée aide un peu la biodiversité !",
        ],
        "/sprites/npc6.png",
        -22,
      ),
    );
    this._npcs.push(
      new NPC(
        4000,
        "Gardien des Collines",
        [
          "Bonjour petite abeille. Même les endroits rocheux comme celui-ci peuvent être utiles aux pollinisateurs.",
          "Certaines abeilles sauvages ne vivent pas dans des ruches. Elles construisent leurs nids dans le sol ou entre les pierres.",
          "Il existe des milliers d’espèces d’abeilles différentes dans le monde, et beaucoup ne produisent même pas de miel.",
          "Toutes ces espèces jouent pourtant un rôle important pour la pollinisation des plantes !",
          "Protéger les abeilles, ce n’est pas seulement protéger une ruche… c’est protéger tout un écosystème.",
        ],
        "/sprites/npc7.png",
        -57,
      ),
    );

    // Create bee
    this._bee = new Bee(100, this._height - Bee.SIZE - this._groundHeight);
    this._keys = { up: false, left: false, right: false };

    // Initialize dialog manager
    this._dialogManager = new DialogManager();

    // Setup background music
    this._bgMusic = new Audio("/audio/bg_music.wav");
    this._bgMusic.loop = true;
    this._bgMusic.volume = 0.5;

    // Load all images via Promise.all
    (async (): Promise<void> => {
      // Collect unique NPC image sources
      const npcSrcs = [...new Set(this._npcs.map((npc) => npc.imageSrc))];

      const [sky, bee, ground, textbox, ...npcImgs] = await Promise.all([
        this.loadImage("/sprites/sky.png"),
        this.loadImage("/sprites/bee.png"),
        this.loadImage("/sprites/ground.png"),
        this.loadImage("/sprites/textbox.png"),
        ...npcSrcs.map((src) => this.loadImage(src)),
      ]);

      this._skyImage = sky;
      this._beeSprite = bee;
      this._groundImage = ground;
      this._textboxImage = textbox;
      this._groundHeight = ground.naturalHeight - 62;

      for (const [i, src] of npcSrcs.entries())
        this._npcImages.set(src, npcImgs[i]);

      // Load NPC face images if they exist
      const faceSrcs = npcSrcs.map((src) => {
        const name = src.split("/").pop()?.split(".")[0];
        return `/sprites/${name}_face.png`;
      });

      const faceImgs = await Promise.allSettled(
        faceSrcs.map((src) => this.loadImage(src)),
      );

      for (const [i, result] of faceImgs.entries())
        if (result.status === "fulfilled")
          this._npcFaceImages.set(npcSrcs[i], result.value);
    })();
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  start() {
    // Setup event listeners
    window.addEventListener("keydown", (e) => {
      if (Game.KEY_CODES.up.includes(e.code)) this._keys.up = true;
      if (Game.KEY_CODES.left.includes(e.code)) this._keys.left = true;
      if (Game.KEY_CODES.right.includes(e.code)) this._keys.right = true;

      // Handle space bar for dialog interaction
      if (e.code === "Space") {
        e.preventDefault();
        if (this._dialogManager.activeDialogNPC) {
          this._dialogManager.nextDialog();
        } else {
          this._dialogManager.handleInteraction(
            this._npcs,
            this._bee,
            this.getNPCDimensionsMap(),
          );
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (Game.KEY_CODES.up.includes(e.code)) this._keys.up = false;
      if (Game.KEY_CODES.left.includes(e.code)) this._keys.left = false;
      if (Game.KEY_CODES.right.includes(e.code)) this._keys.right = false;
    });

    window.addEventListener("mousemove", (e) => {
      const rect = this._canvas.getBoundingClientRect();
      this._mouseX = ((e.clientX - rect.left) * Game.GAME_WIDTH) / rect.width;
      this._mouseY = ((e.clientY - rect.top) * Game.GAME_HEIGHT) / rect.height;
    });

    window.addEventListener("click", (e) => {
      if (!this._gameStarted) {
        const rect = this._canvas.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) * Game.GAME_WIDTH) / rect.width;
        const clickY =
          ((e.clientY - rect.top) * Game.GAME_HEIGHT) / rect.height;

        if (
          clickX >= this._playBtnX &&
          clickX <= this._playBtnX + this._playBtnWidth &&
          clickY >= this._playBtnY &&
          clickY <= this._playBtnY + this._playBtnHeight
        ) {
          this._gameStarted = true;
          this._bgMusic
            .play()
            .catch((err) => console.log("Audio playback failed:", err));
        }
        return;
      }

      // Handle game interactions
      if (this._dialogManager.activeDialogNPC) {
        this._dialogManager.nextDialog();
      }
    });

    // Setup animation
    setInterval(() => {
      if (this._bee.isFrozen) {
        // If frozen and on ground: show sleeping frame
        // If frozen but in air: keep animating
        if (this._bee.y + Bee.SIZE >= this._height - this._groundHeight) {
          this._bee.frameIndex = 2; // sleeping frame when frozen on ground
        } else {
          this._bee.frameIndex = (this._bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
        }
      } else if (this._keys.up || this._keys.left || this._keys.right) {
        this._bee.frameIndex = (this._bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
      } else {
        this._bee.frameIndex = 2; // sleeping frame
      }
    }, 25);

    // Start game loop
    const loop = (timestamp: number) => {
      const dt = this._lastTime
        ? Math.min((timestamp - this._lastTime) / 1000, 0.05)
        : 0.016;
      this._lastTime = timestamp;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private getNPCDimensionsMap(): Map<NPC, { width: number; height: number }> {
    const dimensions = new Map<NPC, { width: number; height: number }>();
    for (const npc of this._npcs) {
      const npcImage = this._npcImages.get(npc.imageSrc);
      if (npcImage) {
        dimensions.set(npc, {
          width: npcImage.naturalWidth * npc.scale,
          height: npcImage.naturalHeight * npc.scale,
        });
      }
    }
    return dimensions;
  }

  private update(dt: number = 1) {
    if (!this._bee.isFrozen)
      this._bee.update(
        this._keys,
        Game.WORLD_WIDTH,
        this._height,
        this._groundHeight,
        dt,
      );

    for (const npc of this._npcs) {
      const npcImage = this._npcImages.get(npc.imageSrc);
      if (npcImage) {
        npc.y =
          this._height -
          npcImage.naturalHeight * npc.scale -
          this._groundHeight -
          npc.randomYOffset;
      }
      npc.update();
    }

    // Camera follows the bee horizontally
    this._cameraX +=
      (this._bee.x - this._width / 2 + Bee.SIZE / 2 - this._cameraX) *
      (1 - Math.pow(0.01, dt));
    if (this._cameraX < 0) this._cameraX = 0;

    this._tick += dt * 60;
  }

  private drawMenu() {
    // Background
    this._ctx.fillStyle = Game.SKY_BACKUP_COLOR;
    this._ctx.fillRect(0, 0, this._width, this._height);

    // Title "A BEE STORY" with bee sprite in place of BEE
    this._ctx.fillStyle = "black";
    this._ctx.font = "bold 80px Papyrus";
    this._ctx.textBaseline = "middle";

    const centerY = this._height / 2 - 60;
    const beeSize = 120;
    const spacing = 20;

    // Measure text widths
    const aWidth = this._ctx.measureText("A").width;

    // Calculate total width and starting position
    let startX =
      this._width / 2 -
      (aWidth +
        spacing +
        beeSize +
        spacing +
        this._ctx.measureText("STORY").width) /
        2;

    // Draw "A" text
    this._ctx.textAlign = "left";
    this._ctx.fillText("A", startX, centerY);
    startX += aWidth + spacing;

    // Draw bee sprite
    if (this._beeSprite) {
      this._ctx.drawImage(
        this._beeSprite,
        0,
        0,
        Bee.FRAME_W,
        Bee.FRAME_H,
        startX,
        this._height / 2 - 142,
        beeSize,
        beeSize,
      );
    }
    startX += beeSize + spacing;

    // Draw "STORY" text
    this._ctx.fillText("STORY", startX, centerY);

    // Draw play button
    this._playBtnWidth = 200;
    this._playBtnHeight = 80;
    this._playBtnX = this._width / 2 - this._playBtnWidth / 2;
    this._playBtnY = this._height / 2 + 100;

    // Button background
    this._ctx.fillStyle = "rgba(255, 140, 0, 0.8)";
    this._ctx.beginPath();
    this._ctx.roundRect(
      this._playBtnX,
      this._playBtnY,
      this._playBtnWidth,
      this._playBtnHeight,
      15,
    );
    this._ctx.fill();

    // Button border
    this._ctx.strokeStyle = "black";
    this._ctx.lineWidth = 3;
    this._ctx.stroke();

    // Button text
    this._ctx.fillStyle = "white";
    this._ctx.font = "bold 48px Papyrus";
    this._ctx.textAlign = "center";
    this._ctx.textBaseline = "middle";
    this._ctx.fillText(
      "PLAY",
      this._width / 2,
      this._playBtnY + this._playBtnHeight / 2 + 7, // empiric adjustment for better vertical alignment
    );

    // Check if mouse is hovering over play button
    const isHoveringPlayBtn =
      this._mouseX >= this._playBtnX &&
      this._mouseX <= this._playBtnX + this._playBtnWidth &&
      this._mouseY >= this._playBtnY &&
      this._mouseY <= this._playBtnY + this._playBtnHeight;

    this._canvas.style.cursor = isHoveringPlayBtn ? "pointer" : "default";
  }

  private draw() {
    // Loading screen
    if (!(this._skyImage && this._beeSprite && this._groundImage)) {
      this._ctx.fillStyle = Game.SKY_BACKUP_COLOR;
      this._ctx.fillRect(0, 0, this._width, this._height);
      this._ctx.fillStyle = "black";
      this._ctx.font = "20px sans-serif";
      this._ctx.fillText("Loading...", this._width / 2 - 50, this._height / 2);
      return;
    }

    // Show menu if game hasn't started
    if (!this._gameStarted) {
      this.drawMenu();
      return;
    }

    // Reset cursor to default when game has started
    this._canvas.style.cursor = "default";

    // Background
    this._ctx.fillStyle = Game.SKY_BACKUP_COLOR;
    this._ctx.fillRect(0, 0, this._width, this._height);
 
    // Sky with parallax effect
    const skyW = this._skyImage.naturalWidth * Game.SKY_SCALE;
    for (let x = -(this._cameraX * 0.05) % skyW; x < this._width; x += skyW) {
      this._ctx.drawImage(
        this._skyImage,
        x,
        0,
        skyW,
        this._skyImage.naturalHeight * Game.SKY_SCALE,
      );
    }

    // Ground
    const groundW = this._groundImage.naturalWidth;
    for (
      let x = -(this._cameraX % groundW);
      x < this._width;
      x += groundW - 1
    ) {
      this._ctx.drawImage(
        this._groundImage,
        x,
        this._height - this._groundImage.naturalHeight,
      );
    }

    // NPCs
    for (const npc of this._npcs) {
      const npcImage = this._npcImages.get(npc.imageSrc);
      if (!npcImage) continue;

      this._ctx.save();
      this._ctx.translate(
        npc.x - this._cameraX + (npcImage.naturalWidth * npc.scale) / 2,
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

      if (
        !npc.isNearBee(
          this._bee,
          npcImage.naturalWidth * npc.scale,
          npcImage.naturalHeight * npc.scale,
        )
      )
        continue;

      this.drawTriangle(
        npc.x -
          this._cameraX +
          (npcImage.naturalWidth * npc.scale) / 2 +
          npc.triangleOffsetX,
        npc.y - 23 + Math.sin(this._tick * 0.1) * 4, // up and down movement
        "down",
        "orange",
      );
    }

    // Bee
    const screenX = this._bee.x - this._cameraX;
    const screenY = this._bee.y;
    const col = this._bee.frameIndex % Bee.SPRITE_COLS;
    const row = Math.floor(this._bee.frameIndex / Bee.SPRITE_COLS);

    this._ctx.save();
    if (this._bee.direction === -1) {
      this._ctx.translate(screenX + Bee.SIZE, screenY);
      this._ctx.scale(-1, 1);
      this._ctx.drawImage(
        this._beeSprite,
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
        this._beeSprite,
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
    if (this._dialogManager.activeDialogNPC && this._textboxImage) {
      // if (this._textboxImage) { // FOR DEBUG
      this._bee.isFrozen = true; // Freeze bee movement during dialog
      const textboxWidth = this._width * 0.6;
      const textboxHeight =
        textboxWidth *
        (this._textboxImage.naturalHeight / this._textboxImage.naturalWidth); // Auto-scale height to maintain aspect ratio
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
      const activeNPC = this._dialogManager.activeDialogNPC!;
      const npcFaceImage = this._npcFaceImages.get(activeNPC.imageSrc);
      if (npcFaceImage) {
        // Simple square image - just position and draw
        const faceSize = textboxHeight * 0.53; // 80% of textbox height
        const faceX = textboxX + textboxWidth * 0.081;
        const faceY = textboxY + textboxHeight * 0.227;
        const faceW = faceSize * 0.951; // reduce width to fit better in the face frame
        const faceH = faceSize;

        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.roundRect(faceX, faceY, faceW, faceH, 7); // little radius for better fit
        this._ctx.clip();

        this._ctx.drawImage(npcFaceImage, faceX, faceY, faceW, faceH);

        this._ctx.restore();
      }

      // Draw text
      this._ctx.fillStyle = "yellow";
      this._ctx.font = `bold ${Math.round(
        // Fit NPC name to available width
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
        activeNPC.message[this._dialogManager.messageIndex],
        textboxWidth * 0.65,
      ).entries())
        // Wrap dialog to max text width
        this._ctx.fillText(
          line,
          textboxX + textboxWidth * 0.29,
          textboxY + textboxHeight * 0.4 + index * 30, // * lineHeight
        );

      this.drawTriangle(
        textboxX + textboxWidth - 67,
        textboxY + textboxHeight - 45,
        "down",
      );
    } else this._bee.isFrozen = false; // Unfreeze bee when dialog closes
  }

  /**
   * Fits text to a max width by reducing font size if needed
   * Returns the final font size that fits
   */
  private fitNameToWidth(
    text: string,
    maxWidth: number,
    baseFontSize: number,
  ): number {
    let fontSize = baseFontSize;
    this._ctx.font = `${Game.FONT_WEIGHT} ${Math.round(fontSize)}px ${Game.FONT_FAMILY}`;
    let textWidth = this._ctx.measureText(text).width;

    // Reduce font size until text fits with 10px margin on each side
    while (textWidth > maxWidth - 20 && fontSize > 8) {
      fontSize -= 0.5;
      this._ctx.font = `${Game.FONT_WEIGHT} ${Math.round(fontSize)}px ${Game.FONT_FAMILY}`;
      textWidth = this._ctx.measureText(text).width;
    }

    return fontSize;
  }

  private wrapDialog(text: string, maxWidth: number): string[] {
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
}
