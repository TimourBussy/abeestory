interface CropPosition {
	x: number;
	y: number;
}

class FaceCropper {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private previewCanvas: HTMLCanvasElement;
	private previewCtx: CanvasRenderingContext2D;
	private image: HTMLImageElement | null = null;
	private cropSize: number = 200;
	private cropPos: CropPosition = { x: 0, y: 0 };
	private isDragging: boolean = false;
	private dragOffset: CropPosition = { x: 0, y: 0 };
	private currentFilename: string = "";
	private imageScale: number = 1;
	private padding: number = 100;

	constructor() {
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d")!;
		this.previewCanvas = document.getElementById(
			"previewCanvas",
		) as HTMLCanvasElement;
		this.previewCtx = this.previewCanvas.getContext("2d")!;

		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		// File input
		const imageInput = document.getElementById(
			"imageInput",
		) as HTMLInputElement;
		imageInput.addEventListener("change", (e) => this.handleImageSelect(e));

		// Crop size slider
		const cropSizeSlider = document.getElementById(
			"cropSizeSlider",
		) as HTMLInputElement;
		cropSizeSlider.addEventListener("input", (e) => {
			this.cropSize = parseInt((e.target as HTMLInputElement).value);
			document.getElementById("cropSizeValue")!.textContent =
				`${this.cropSize}px`;
			this.redraw();
		});

		// Buttons
		document.getElementById("saveBtn")!.addEventListener("click", () => {
			this.saveCrop();
		});
		document.getElementById("newImageBtn")!.addEventListener("click", () => {
			imageInput.click();
		});

		// Crop box interactions
		const cropBox = document.getElementById("cropBox") as HTMLElement;
		cropBox.addEventListener("mousedown", (e) =>
			this.handleCropBoxMouseDown(e),
		);
		cropBox.addEventListener("touchstart", (e) =>
			this.handleCropBoxMouseDown(e),
		);

		document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
		document.addEventListener("touchmove", (e) => this.handleMouseMove(e));
		document.addEventListener("mouseup", () => this.handleMouseUp());
		document.addEventListener("touchend", () => this.handleMouseUp());
	}

	private handleImageSelect(e: Event): void {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		this.currentFilename = file.name;
		document.getElementById("filenameDisplay")!.textContent =
			`Selected: ${file.name}`;

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				this.image = img;
				this.setupCanvas();
				this.showCanvasSection();
			};
			img.src = event.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	private setupCanvas(): void {
		if (!this.image) return;

		const maxWidth = 700;
		const maxHeight = 500;
		let width = this.image.width;
		let height = this.image.height;

		if (width > maxWidth || height > maxHeight) {
			const scaleX = maxWidth / width;
			const scaleY = maxHeight / height;
			this.imageScale = Math.min(scaleX, scaleY);
			width = this.image.width * this.imageScale;
			height = this.image.height * this.imageScale;
		} else {
			this.imageScale = 1;
		}

		const totalWidth = width + this.padding * 2;
		const totalHeight = height + this.padding * 2;

		// Set canvas internal resolution
		this.canvas.width = totalWidth;
		this.canvas.height = totalHeight;

		this.canvas.style.width = totalWidth + "px";
		this.canvas.style.height = totalHeight + "px";

		const wrapper = this.canvas.parentElement!;
		wrapper.style.width = totalWidth + "px";
		wrapper.style.height = totalHeight + "px";

		this.previewCanvas.width = 200;
		this.previewCanvas.height = 200;

		this.redraw();
	}

	private constrainCropBox(): void {
		if (!this.image) return;

		const paddingInImageCoords = this.padding / this.imageScale;

		this.cropPos.x = Math.max(
			-paddingInImageCoords,
			Math.min(
				this.cropPos.x,
				this.image.width - this.cropSize + paddingInImageCoords,
			),
		);
		this.cropPos.y = Math.max(
			-paddingInImageCoords,
			Math.min(
				this.cropPos.y,
				this.image.height - this.cropSize + paddingInImageCoords,
			),
		);
	}

	private redraw(): void {
		if (!this.image) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = "#e0e0e0";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.drawImage(
			this.image,
			0,
			0,
			this.image.width,
			this.image.height,
			this.padding,
			this.padding,
			this.canvas.width - this.padding * 2,
			this.canvas.height - this.padding * 2,
		);

		// Crop box
		const cropBox = document.getElementById("cropBox") as HTMLElement;
		cropBox.style.left = `${this.cropPos.x * this.imageScale + this.padding}px`;
		cropBox.style.top = `${this.cropPos.y * this.imageScale + this.padding}px`;
		cropBox.style.width = `${this.cropSize * this.imageScale}px`;
		cropBox.style.height = `${this.cropSize * this.imageScale}px`;

		this.previewCtx.clearRect(0, 0, 200, 200);
		this.previewCtx.drawImage(
			this.image,
			this.cropPos.x,
			this.cropPos.y,
			this.cropSize,
			this.cropSize,
			0,
			0,
			200,
			200,
		);
	}

	private handleCropBoxMouseDown(e: MouseEvent | TouchEvent): void {
		e.preventDefault();
		this.isDragging = true;

		const cropBox = document.getElementById("cropBox") as HTMLElement;
		cropBox.classList.add("dragging");

		const rect = this.canvas.getBoundingClientRect();
		const clientX =
			(e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX;
		const clientY =
			(e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY;

		const offsetXCanvas =
			clientX - rect.left - this.padding - this.cropPos.x * this.imageScale;
		const offsetYCanvas =
			clientY - rect.top - this.padding - this.cropPos.y * this.imageScale;

		this.dragOffset = {
			x: offsetXCanvas / this.imageScale,
			y: offsetYCanvas / this.imageScale,
		};
	}

	private handleMouseMove(e: MouseEvent | TouchEvent): void {
		if (!this.isDragging || !this.image) return;

		const rect = this.canvas.getBoundingClientRect();
		const clientX =
			(e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX;
		const clientY =
			(e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY;

		let newX =
			(clientX - rect.left - this.padding) / this.imageScale -
			this.dragOffset.x;
		let newY =
			(clientY - rect.top - this.padding) / this.imageScale - this.dragOffset.y;

		this.cropPos = { x: newX, y: newY };
		this.constrainCropBox();
		this.redraw();
	}

	private handleMouseUp(): void {
		this.isDragging = false;
		const cropBox = document.getElementById("cropBox") as HTMLElement;
		cropBox.classList.remove("dragging");
	}

	private async saveCrop(): Promise<void> {
		if (!this.image) return;

		const status = document.getElementById("status")!;

		const fullCanvas = document.createElement("canvas");
		fullCanvas.width = this.cropSize;
		fullCanvas.height = this.cropSize;

		fullCanvas
			.getContext("2d")!
			.drawImage(
				this.image,
				this.cropPos.x,
				this.cropPos.y,
				this.cropSize,
				this.cropSize,
				0,
				0,
				fullCanvas.width,
				fullCanvas.height,
			);

		const outputFilename = `${this.currentFilename.replace(/\.[^/.]+$/, "")}_face.png`;
		const link = document.createElement("a");
		link.download = outputFilename;
		link.href = fullCanvas.toDataURL("image/png");
		link.click();

		status.textContent = `✅ Downloaded: ${outputFilename}`;
		status.className = "success";
		setTimeout(() => {
			status.textContent = "";
		}, 3000);
	}

	private showCanvasSection(): void {
		document.getElementById("initialState")!.style.display = "none";
		document.getElementById("canvasSection")!.style.display = "grid";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new FaceCropper();
});
