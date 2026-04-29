import { NPC } from "./NPC";
import { Bee } from "./Bee";

export class DialogManager {
	private _activeDialogNPC: NPC | null = null;

	get activeDialogNPC(): NPC | null {
		return this._activeDialogNPC;
	}

	handleInteraction(npcs: NPC[], bee: Bee): void {
		// Check if already in dialog
		if (this._activeDialogNPC) {
			this.closeDialog();
			return;
		}

		// Check which NPC is near the bee
		for (const npc of npcs) {
			if (npc.isNearBee(bee)) {
				this._activeDialogNPC = npc;
				return;
			}
		}
	}

	closeDialog(): void {
		this._activeDialogNPC = null;
	}

	isDialogActive(): boolean {
		return this._activeDialogNPC !== null;
	}
}
