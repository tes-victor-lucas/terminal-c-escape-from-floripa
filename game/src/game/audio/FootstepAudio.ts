import type { Scene } from 'phaser';
import { AUDIO_CONFIG } from '../config/audio';

/** Toca passos em uma cadência constante enquanto o personagem se movimenta. */
export class FootstepAudio {
    private readonly sound: Phaser.Sound.BaseSound;
    private elapsed: number = AUDIO_CONFIG.playerFootstep.interval;

    constructor(scene: Scene) {
        this.sound = scene.sound.add(AUDIO_CONFIG.playerFootstep.key, {
            volume: AUDIO_CONFIG.playerFootstep.volume
        });
    }

    get isPlaying() {
        return this.sound.isPlaying;
    }

    update(isMoving: boolean, delta: number) {
        if (!isMoving) {
            this.elapsed = AUDIO_CONFIG.playerFootstep.interval;
            return;
        }

        this.elapsed += delta;

        if (this.elapsed >= AUDIO_CONFIG.playerFootstep.interval && !this.sound.isPlaying) {
            this.sound.play();
            this.elapsed = 0;
        }
    }

    /** Interrompe o passo atual quando a movimentação é bloqueada fisicamente. */
    stop() {
        this.sound.stop();
        this.elapsed = AUDIO_CONFIG.playerFootstep.interval;
    }
}
