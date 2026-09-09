import type { Scene } from 'phaser';

const LAMP_TILE_INDEX = 758;
const LIGHT_DEPTH = 1;
const LAMP_LIGHT_TEXTURE = 'lamp-light';
const LAMP_LIGHT_RADIUS = 44;

/** Cria halos suaves sob os postes de luz presentes na layer de objetos. */
export function createLampLights(scene: Scene, objectsLayer: Phaser.Tilemaps.TilemapLayer) {
    createLampLightTexture(scene);

    objectsLayer.forEachTile((tile) => {
        if (tile.index !== LAMP_TILE_INDEX) return;

        scene.add.image(
            tile.getCenterX(),
            tile.getCenterY() + 11,
            LAMP_LIGHT_TEXTURE
        )
            .setDepth(LIGHT_DEPTH)
            .setAlpha(0.55)
            .setBlendMode(Phaser.BlendModes.ADD);
    });
}

function createLampLightTexture(scene: Scene) {
    if (scene.textures.exists(LAMP_LIGHT_TEXTURE)) return;

    const diameter = LAMP_LIGHT_RADIUS * 2;
    const texture = scene.textures.createCanvas(LAMP_LIGHT_TEXTURE, diameter, diameter);
    if (!texture) return;

    const context = texture.context;
    const gradient = context.createRadialGradient(
        LAMP_LIGHT_RADIUS,
        LAMP_LIGHT_RADIUS,
        2,
        LAMP_LIGHT_RADIUS,
        LAMP_LIGHT_RADIUS,
        LAMP_LIGHT_RADIUS
    );

    gradient.addColorStop(0, 'rgba(255, 221, 134, 0.62)');
    gradient.addColorStop(0.28, 'rgba(255, 183, 71, 0.30)');
    gradient.addColorStop(1, 'rgba(255, 142, 45, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, diameter, diameter);
    texture.refresh();
}
