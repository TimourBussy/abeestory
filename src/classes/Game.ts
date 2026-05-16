import { Bee } from "./Bee";
import { NPC } from "./NPC";
import { DialogManager } from "./DialogManager";
import { MenuManager } from "./MenuManager";
import { AudioManager } from "./AudioManager";
import { InputManager } from "./InputManager";
import { CameraManager } from "./CameraManager";
import { RenderManager } from "./RenderManager";

export class Game {
  static readonly WORLD_WIDTH = 5500;
  static readonly GAME_WIDTH = 1280;
  static readonly GAME_HEIGHT = 720;
  static readonly KEY_CODES = {
    up: ["ArrowUp", "KeyW"],
    left: ["ArrowLeft", "KeyA"],
    right: ["ArrowRight", "KeyD"],
    down: ["ArrowDown", "KeyS"],
  };

  // Canvas
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _rootElement: HTMLElement;

  // Managers
  private _menuManager: MenuManager;
  private _audioManager: AudioManager;
  private _inputManager: InputManager;
  private _cameraManager: CameraManager;
  private _renderManager: RenderManager;

  // Game world
  private _bee: Bee;
  private _npcs: NPC[] = [];

  // Systems
  private _dialogManager: DialogManager;

  // Timing
  private _tick: number = 0;
  private _lastTime: number = 0;

  // Input tracking
  private _mouseX: number = 0;
  private _mouseY: number = 0;

  // WordPress integration
  private _reductionCode: string = "";
  private _couponFetched: boolean = false;

  constructor(rootElement: HTMLElement) {
    this._rootElement = rootElement;

    // Canvas setup
    this._canvas = document.createElement("canvas");
    this._canvas.width = Game.GAME_WIDTH;
    this._canvas.height = Game.GAME_HEIGHT;
    this._rootElement.appendChild(this._canvas);

    this._ctx = this._canvas.getContext("2d")!;

    window.addEventListener("resize", () => {
      const scale = Math.min(
        window.innerWidth / Game.GAME_WIDTH,
        window.innerHeight / Game.GAME_HEIGHT,
      );
      this._canvas.style.width = `${Game.GAME_WIDTH * scale}px`;
      this._canvas.style.height = `${Game.GAME_HEIGHT * scale}px`;
    });
    window.dispatchEvent(new Event("resize"));

    // Initialize managers
    this._menuManager = new MenuManager();
    this._audioManager = new AudioManager();
    this._inputManager = new InputManager();
    this._cameraManager = new CameraManager(Game.WORLD_WIDTH, Game.GAME_WIDTH);
    this._renderManager = new RenderManager(
      this._ctx,
      Game.GAME_WIDTH,
      Game.GAME_HEIGHT,
    );

    // Create NPCs
    this.createNPCs();

    // Create bee
    this._bee = new Bee(
      100,
      Game.GAME_HEIGHT - Bee.SIZE - this._renderManager.groundHeight,
    );

    // Initialize dialog manager
    this._dialogManager = new DialogManager();

    // Load images
    this.loadAssets();
  }

  private showLoginRequired(): void {
    const container = document.createElement("div");
    container.style.cssText =
      "display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 24px; text-align: center;";

    const box = document.createElement("div");
    box.style.cssText =
      "background: lightblue; padding: 40px; border-radius: 10px; min-width: 400px;";

    const title = document.createElement("h1");
    title.textContent = "Connectez-vous pour jouer";

    const description = document.createElement("p");
    description.textContent =
      "Vous devez avoir un compte et être connecté pour accéder à ce jeu.";

    box.appendChild(title);
    box.appendChild(description);
    container.appendChild(box);
    this._rootElement.innerHTML = "";
    this._rootElement.appendChild(container);
  }

  private createNPCs(): void {
    this._npcs.push(
      new NPC(
        1000,
        "Apiculteur Connecté",
        [
          "Salut petite abeille ! Moi, je surveille les ruches grâce à des capteurs connectés.",
          "Ils me donnent des infos comme la température, l’humidité… et même l’activité des abeilles !",
          "Grâce à ça, je peux m’assurer que la ruche est en bonne santé sans la déranger.",
        ],
        `${import.meta.env.BASE_URL}/sprites/npc1.png`,
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
        `${import.meta.env.BASE_URL}/sprites/npc2.png`,
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
        `${import.meta.env.BASE_URL}/sprites/npc3.png`,
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
        `${import.meta.env.BASE_URL}/sprites/npc4.png`,
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
        `${import.meta.env.BASE_URL}/sprites/npc5.png`,
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
        `${import.meta.env.BASE_URL}/sprites/npc6.png`,
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
        `${import.meta.env.BASE_URL}/sprites/npc7.png`,
        -57,
      ),
    );
    this._npcs.push(
      new NPC(
        5000,
        "Professeur Mellis",
        [
          "Félicitations petite abeille ! Tu es arrivée au bout de ton voyage.",
          "Tu as découvert comment les abeilles pollinisent les fleurs, fabriquent le miel et aident la nature à rester en bonne santé.",
          "Tu as aussi appris que les ruches connectées permettent de mieux protéger les colonies grâce aux données et aux capteurs.",
          "Chaque abeille joue un rôle précieux… et chaque personne peut aussi aider en protégeant les pollinisateurs autour d’elle !",
          "Merci d’avoir joué à A Bee Story. J’espère que cette aventure t’aura appris plein de choses !",
          "Et pour te remercier… voici un code t'offrant une réduction de 20% sur ton prochain achat ! Note le bien !",
          this._reductionCode,
        ],
        `${import.meta.env.BASE_URL}/sprites/npc8.png`,
        20,
      ),
    );
  }

  private async fetchOrCreateReductionCode(): Promise<string> {
    try {
      const response = await fetch(
        `${import.meta.env.BASE_URL.replace("/game/", "/")}wp-json/api/v1/coupons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce":
              (window as any).wpRestNonce ||
              (window.parent as any).wpRestNonce ||
              "",
          },
          credentials: "include",
        },
      );

      const data = await response.json();

      if (response.ok) return data.code;
      else return "ERREUR LORS DE LA GÉNÉRATION DU CODE";
    } catch (error) {
      console.error("Fetch error:", error);
      return "ERREUR LORS DE LA GÉNÉRATION DU CODE";
    }
  }

  // FOR DEVELOPMENT
  private async loadAssets(): Promise<void> {
    const npcSrcs = [...new Set(this._npcs.map((npc) => npc.imageSrc))];

    const [sky, bee, ground, textbox, soundBtn, ...npcImgs] = await Promise.all(
      [
        this.loadImage(`${import.meta.env.BASE_URL}/sprites/sky.png`),
        this.loadImage(`${import.meta.env.BASE_URL}/sprites/bee.png`),
        this.loadImage(`${import.meta.env.BASE_URL}/sprites/ground.png`),
        this.loadImage(`${import.meta.env.BASE_URL}/sprites/textbox.png`),
        this.loadImage(`${import.meta.env.BASE_URL}/sprites/sound_btn.png`),
        ...npcSrcs.map((src) => this.loadImage(src)),
      ],
    );

    this._renderManager.skyImage = sky;
    this._renderManager.beeSprite = bee;
    this._renderManager.groundImage = ground;
    this._renderManager.textboxImage = textbox;
    this._renderManager.soundBtnSprite = soundBtn;

    for (const [i, src] of npcSrcs.entries())
      this._renderManager.setNpcImage(src, npcImgs[i]);

    // Load NPC face images
    for (const [i, result] of (
      await Promise.allSettled(
        npcSrcs
          .map((src) => {
            const name = src.split("/").pop()?.split(".")[0];
            return `${import.meta.env.BASE_URL}/sprites/${name}_face.png`;
          })
          .map((src) => this.loadImage(src)),
      )
    ).entries())
      if (result.status === "fulfilled")
        this._renderManager.setNpcFaceImage(npcSrcs[i], result.value);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = `${import.meta.env.BASE_URL}${src}`;
    });
  }

  start(): void {
    // Verify is the user is connected
    if (
      !((window as any).currentUserID || (window.parent as any).currentUserID)
    ) {
      this.showLoginRequired();
      return;
    }

    // Setup event listeners
    window.addEventListener("keydown", (e) => {
      if (Game.KEY_CODES.up.includes(e.code)) {
        e.preventDefault();
        this._inputManager.registerKeyDown("up");
      }
      if (Game.KEY_CODES.left.includes(e.code)) {
        e.preventDefault();
        this._inputManager.registerKeyDown("left");
      }
      if (Game.KEY_CODES.right.includes(e.code)) {
        e.preventDefault();
        this._inputManager.registerKeyDown("right");
      }
      if (Game.KEY_CODES.down.includes(e.code)) {
        e.preventDefault();
      }

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
      if (Game.KEY_CODES.up.includes(e.code)) {
        e.preventDefault();
        this._inputManager.registerKeyUp("up");
      }
      if (Game.KEY_CODES.left.includes(e.code)) {
        e.preventDefault();
        this._inputManager.registerKeyUp("left");
      }
      if (Game.KEY_CODES.right.includes(e.code)) {
        e.preventDefault();
        this._inputManager.registerKeyUp("right");
      }
      if (Game.KEY_CODES.down.includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener("mousemove", (e) => {
      const rect = this._canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) * Game.GAME_WIDTH) / rect.width;
      const mouseY = ((e.clientY - rect.top) * Game.GAME_HEIGHT) / rect.height;
      this._mouseX = mouseX;
      this._mouseY = mouseY;
      this._inputManager.setMousePosition(mouseX, mouseY);
      this._menuManager.setMousePosition(mouseX, mouseY);
    });

    window.addEventListener("click", (e) => {
      const rect = this._canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) * Game.GAME_WIDTH) / rect.width;
      const clickY = ((e.clientY - rect.top) * Game.GAME_HEIGHT) / rect.height;

      if (!this._menuManager.gameStarted) {
        if (this._menuManager.isClickOnPlayButton(clickX, clickY)) {
          this._menuManager.gameStarted = true;
          this._audioManager.playBackgroundMusic();
        }
        return;
      }

      // Handle sound button click
      if (this._renderManager.isClickOnSoundButton(clickX, clickY)) {
        this._audioManager.toggleMute();
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
        if (
          this._bee.y + Bee.SIZE >=
          Game.GAME_HEIGHT - this._renderManager.groundHeight
        ) {
          this._bee.frameIndex = 2;
        } else {
          this._bee.frameIndex = (this._bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
        }
      } else if (
        this._inputManager.isKeyPressed("up") ||
        this._inputManager.isKeyPressed("left") ||
        this._inputManager.isKeyPressed("right")
      ) {
        this._bee.frameIndex = (this._bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
      } else {
        this._bee.frameIndex = 2;
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
      const npcImage = this._renderManager.npcImages.get(npc.imageSrc);
      if (npcImage) {
        dimensions.set(npc, {
          width: npcImage.naturalWidth * npc.scale,
          height: npcImage.naturalHeight * npc.scale,
        });
      }
    }
    return dimensions;
  }

  private update(dt: number): void {
    // Update bee
    if (!this._bee.isFrozen) {
      this._bee.update(
        this._inputManager.keys,
        Game.WORLD_WIDTH,
        Game.GAME_HEIGHT,
        this._renderManager.groundHeight,
        dt,
      );
    }

    // Update NPCs
    for (const npc of this._npcs) {
      const npcImage = this._renderManager.npcImages.get(npc.imageSrc);
      if (npcImage) {
        npc.y =
          Game.GAME_HEIGHT -
          npcImage.naturalHeight * npc.scale -
          this._renderManager.groundHeight -
          npc.randomYOffset;
      }
      npc.update();
    }

    // Update camera
    this._cameraManager.update(this._bee, dt);

    // Update tick
    this._tick += dt * 60;

    // Fetch the coupon if the last NPC dialogue starts
    if (
      !this._couponFetched &&
      this._npcs.length > 0 &&
      this._dialogManager.activeDialogNPC === this._npcs[this._npcs.length - 1]
    ) {
      this._couponFetched = true;
      this.fetchAndUpdateCoupon();
    }
  }

  private async fetchAndUpdateCoupon(): Promise<void> {
    if (this._npcs.length > 0) {
      const lastNPC = this._npcs[this._npcs.length - 1];
      lastNPC.message[lastNPC.message.length - 1] =
        "Génération de ton code en cours...";
    }

    this._reductionCode = await this.fetchOrCreateReductionCode();

    if (this._npcs.length > 0) {
      const lastNPC = this._npcs[this._npcs.length - 1];
      lastNPC.message[lastNPC.message.length - 1] =
        this._reductionCode || "Erreur lors de la génération du code";
      lastNPC.message = [...lastNPC.message];
    }
  }

  private draw(): void {
    // Loading screen
    if (!this._renderManager.isLoadingComplete()) {
      this._renderManager.drawLoadingScreen();
      return;
    }

    // Show menu if game hasn't started
    if (!this._menuManager.gameStarted) {
      this._menuManager.drawMenu(
        this._ctx,
        Game.GAME_WIDTH,
        Game.GAME_HEIGHT,
        this._renderManager.beeSprite,
      );

      // Update cursor for menu hover
      this._canvas.style.cursor = this._menuManager.isMouseOverPlayButton()
        ? "pointer"
        : "default";
      return;
    }

    // Reset cursor to default when game has started
    this._canvas.style.cursor = this._renderManager.isMouseOverSoundButton(
      this._mouseX,
      this._mouseY,
    )
      ? "pointer"
      : "default";

    // Draw game
    this._renderManager.drawGame(
      this._bee,
      this._npcs,
      this._cameraManager.cameraX,
      this._dialogManager,
      this._tick,
    );

    // Draw sound button
    this._renderManager.drawSoundButtonOnScreen(this._audioManager.isMuted);

    // Freeze/unfreeze bee based on dialog state
    this._bee.isFrozen = !!this._dialogManager.activeDialogNPC;
  }
}
