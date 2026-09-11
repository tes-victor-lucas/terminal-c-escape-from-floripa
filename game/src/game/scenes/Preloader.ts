import { Scene } from 'phaser';
import { AUDIO_CONFIG } from '../config/audio';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.tilemapTiledJSON(
            'room1',
            'assets/maps/room01.json'
        );

        this.load.tilemapTiledJSON(
            'room2',
            'assets/maps/room02.json'
        );

        this.load.image(
            'floor_and_buildings',
            'assets/tilesets/floor_and_buildings-01.png'
        );

        this.load.image(
            'floor_and_walls',
            'assets/tilesets/floor_and_walls-1.png'
        );

        this.load.image(
            'objects',
            'assets/tilesets/objects_and_items-01.png'
        );

        this.load.spritesheet(
            'player-walk',
            'assets/protagonist/lpc-protagonist-walk.png',
            { frameWidth: 64, frameHeight: 64 }
        );

        this.load.audio(
            AUDIO_CONFIG.playerFootstep.key,
            AUDIO_CONFIG.playerFootstep.path
        );
    }

    create() {
        this.scene.start('World');
    }
}
