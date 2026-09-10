import type { Scene } from 'phaser';
import { WORLD_CONFIG } from '../config/world';

export type Direction = 'up' | 'down' | 'left' | 'right';

// LPC: 9 quadros de 64px por linha, organizados em quatro direções.
const WALK_FRAMES: Record<Direction, number[]> = {
    up: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    left: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    down: [18, 19, 20, 21, 22, 23, 24, 25, 26],
    right: [27, 28, 29, 30, 31, 32, 33, 34, 35]
};

type MovementKeys = Record<Direction, Phaser.Input.Keyboard.Key>;

/** Reúne o estado e o comportamento controlável do personagem. */
export class Player {
    readonly sprite: Phaser.Physics.Arcade.Sprite;

    private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private readonly wasd: MovementKeys;
    private facing: Direction = 'down';

    constructor(private readonly scene: Scene) {
        const keyboard = scene.input.keyboard;

        if (!keyboard) {
            throw new Error('O teclado precisa estar habilitado para criar o jogador.');
        }

        const { player } = WORLD_CONFIG;
        this.sprite = scene.physics.add.sprite(player.x, player.y, player.texture, player.initialFrame);
        this.sprite.setScale(player.scale);
        this.sprite.setDepth(10);
        this.sprite.setCollideWorldBounds(true);
        this.configureBody();

        this.createAnimations();
        this.setIdleFrame();

        this.cursors = keyboard.createCursorKeys();
        this.wasd = {
            up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
    }

    update() {
        const direction = this.getMovementDirection();
        const { x, y } = direction;

        this.sprite.setVelocity(x * WORLD_CONFIG.player.speed, y * WORLD_CONFIG.player.speed);

        if (x === 0 && y === 0) {
            this.sprite.anims.stop();
            this.setIdleFrame();
            return;
        }

        this.facing = Math.abs(x) > Math.abs(y)
            ? (x < 0 ? 'left' : 'right')
            : (y < 0 ? 'up' : 'down');

        const animationKey = `player-walk-${this.facing}`;
        if (this.sprite.anims.currentAnim?.key !== animationKey || !this.sprite.anims.isPlaying) {
            this.sprite.anims.play(animationKey, true);
        }
    }

    private configureBody() {
        const body = this.sprite.body;

        if (body) {
            const { hitbox } = WORLD_CONFIG.player;

            // A área física acompanha apenas os pés, não o espaço transparente do sprite.
            body.setSize(hitbox.width, hitbox.height);
            body.setOffset(hitbox.offsetX, hitbox.offsetY);
        }
    }

    private getMovementDirection() {
        let x = Number(this.cursors.right.isDown || this.wasd.right.isDown)
            - Number(this.cursors.left.isDown || this.wasd.left.isDown);
        let y = Number(this.cursors.down.isDown || this.wasd.down.isDown)
            - Number(this.cursors.up.isDown || this.wasd.up.isDown);

        const length = Math.hypot(x, y);
        if (length > 0) {
            x /= length;
            y /= length;
        }

        return { x, y };
    }

    private createAnimations() {
        for (const [direction, frames] of Object.entries(WALK_FRAMES) as [Direction, number[]][]) {
            const key = `player-walk-${direction}`;

            if (!this.scene.anims.exists(key)) {
                this.scene.anims.create({
                    key,
                    frames: this.scene.anims.generateFrameNumbers(WORLD_CONFIG.player.texture, { frames }),
                    frameRate: 9,
                    repeat: -1
                });
            }
        }
    }

    private setIdleFrame() {
        this.sprite.setTexture(WORLD_CONFIG.player.texture, WALK_FRAMES[this.facing][0]);
    }
}
