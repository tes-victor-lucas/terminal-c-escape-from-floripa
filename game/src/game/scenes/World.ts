import { Scene } from 'phaser';
import { configureWorldCamera } from '../camera/configureWorldCamera';
import { WORLD_CONFIG } from '../config/world';
import { Player } from '../entities/Player';
import { createRoom } from '../map/createRoom';

export class World extends Scene {
    private player?: Player;

    constructor() {
        super('World');
    }

    create() {
        const room = createRoom(this, WORLD_CONFIG.mapKey);
        if (!room) return;

        this.player = new Player(this);

        for (const layer of room.collisionLayers) {
            this.physics.add.collider(this.player.sprite, layer);
        }

        configureWorldCamera(this, room.map, this.player.sprite);
    }

    update() {
        this.player?.update();
    }
}
