import { NPC } from "./NPC";
import { Bee } from "./Bee";

export class DialogManager {
	private _activeDialogNPC: NPC | null = null;
	private _messageIndex: number = 0;

	get activeDialogNPC(): NPC | null {
		return this._activeDialogNPC;
	}

	get messageIndex(): number {
		return this._messageIndex;
	}

	handleInteraction(npcs: NPC[], bee: Bee): void {
		// If already in dialog, progress to next message
		if (this._activeDialogNPC) {
			this.progressDialog();
			return;
		}

		// Check which NPC is near the bee to open dialog
		for (const npc of npcs) {
			if (npc.isNearBee(bee)) {
				this._activeDialogNPC = npc;
				this._messageIndex = 0;
				return;
			}
		}
	}

	progressDialog(): void {
		if (!this._activeDialogNPC) return;

		// If not at last message, go to next
		if (this._messageIndex < this._activeDialogNPC.message.length - 1)
			this._messageIndex++;
		else 
			// If at last message, close dialog
			this.closeDialog();
	}

	closeDialog(): void {
		this._activeDialogNPC = null;
		this._messageIndex = 0;
	}

	isDialogActive(): boolean {
		return this._activeDialogNPC !== null;
	}
}
