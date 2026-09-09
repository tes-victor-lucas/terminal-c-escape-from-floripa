import { Scene } from 'phaser';
import { configureWorldCamera } from '../camera/configureWorldCamera';
import { RoomKey, WORLD_CONFIG } from '../config/world';
import { Player } from '../entities/Player';
import { Room, createRoom } from '../map/createRoom';

interface WorldSceneData {
    roomKey?: RoomKey;
    spawn?: {
        x: number;
        y: number;
    };
}

export class World extends Scene {
    private player?: Player;
    private room?: Room;
    private roomKey: RoomKey = WORLD_CONFIG.initialRoomKey;
    private spawn?: WorldSceneData['spawn'];

    constructor() {
        super('World');
    }

    init(data: WorldSceneData = {}) {
        this.roomKey = data.roomKey ?? WORLD_CONFIG.initialRoomKey;
        this.spawn = data.spawn;
    }

    create() {
        const roomConfig = WORLD_CONFIG.rooms[this.roomKey];
        const room = createRoom(this, roomConfig.mapKey);
        if (!room) return;

        this.room = room;
        this.player = new Player(this);
        if (this.spawn) {
            this.player.sprite.setPosition(this.spawn.x, this.spawn.y);
        }

        for (const layer of room.collisionLayers) {
            this.physics.add.collider(this.player.sprite, layer);
        }

        configureWorldCamera(this, room.map, this.player.sprite);
    }

    update() {
        this.player?.update();
        this.handleRoomTransitions();
    }

    private handleRoomTransitions() {
        if (!this.player || !this.room) return;

        const sprite = this.player.sprite;
        const roomConfig = WORLD_CONFIG.rooms[this.roomKey];
        const edgeMargin = 32;

        for (const transition of roomConfig.transitions) {
            const isInsidePassage = sprite.x >= transition.xMin && sprite.x <= transition.xMax;
            if (!isInsidePassage) continue;

            const reachedEdge = transition.edge === 'top'
                ? sprite.y <= edgeMargin
                : sprite.y >= this.room.map.heightInPixels - edgeMargin;

            if (reachedEdge) {
                this.scene.restart({
                    roomKey: transition.to,
                    spawn: transition.spawn
                });
                return;
            }
        }
    }
}
