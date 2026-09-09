import type { Scene } from 'phaser';

const TILESETS = [
    { mapName: 'floor_and_buildings-01', textureKey: 'floor_and_buildings' },
    { mapName: 'floor_and_walls-1', textureKey: 'floor_and_walls' },
    { mapName: 'objects_and_items-01', textureKey: 'objects' }
] as const;

const LAYER_NAMES = ['floor', 'wall', 'wall-stores', 'objects'] as const;
const FOREGROUND_DEPTH = 20;
const FLOOR_DEPTH = 0;
const LIGHT_DEPTH = 1;
const SCENERY_DEPTH = 2;
const LAMP_LIGHT_TEXTURE = 'lamp-light';
const LAMP_LIGHT_RADIUS = 44;
// Os postes usam três tiles verticais: somente os dois primeiros devem ocultar o jogador.
const POST_FOREGROUND_TILE_INDICES = new Set([758, 768]);

export interface Room {
    map: Phaser.Tilemaps.Tilemap;
    collisionLayers: Phaser.Tilemaps.TilemapLayer[];
}

/** Cria as layers do mapa e habilita colisão somente nos tiles marcados no Tiled. */
export function createRoom(scene: Scene, mapKey: string): Room | null {
    const map = scene.make.tilemap({ key: mapKey });
    const tilesets = TILESETS.map(({ mapName, textureKey }) =>
        map.addTilesetImage(mapName, textureKey)
    );

    if (tilesets.some((tileset) => tileset === null)) {
        console.error(`Não foi possível resolver todos os tilesets do ${mapKey}.`, tilesets);
        return null;
    }

    const resolvedTilesets = tilesets as Phaser.Tilemaps.Tileset[];
    const layers = LAYER_NAMES.map((name) =>
        map.createLayer(name, resolvedTilesets, 0, 0)
    );

    if (layers.some((layer) => layer === null)) {
        console.error(`Uma ou mais layers do mapa ${mapKey} não foram encontradas.`);
        return null;
    }

    const collisionLayers = layers as Phaser.Tilemaps.TilemapLayer[];

    collisionLayers[LAYER_NAMES.indexOf('floor')].setDepth(FLOOR_DEPTH);
    for (const name of ['wall', 'wall-stores', 'objects'] as const) {
        collisionLayers[LAYER_NAMES.indexOf(name)].setDepth(SCENERY_DEPTH);
    }

    for (const layer of collisionLayers) {
        layer.setCollisionByProperty({ collider: true });
    }

    const objectsLayer = collisionLayers[LAYER_NAMES.indexOf('objects')];
    createLampLights(scene, objectsLayer);
    const postForegroundLayer = map.createBlankLayer('post-foreground', resolvedTilesets, 0, 0);

    if (!postForegroundLayer) {
        console.error(`Não foi possível criar a camada de primeiro plano do ${mapKey}.`);
        return null;
    }

    objectsLayer.forEachTile((tile) => {
        if (POST_FOREGROUND_TILE_INDICES.has(tile.index)) {
            postForegroundLayer.putTileAt(tile.index, tile.x, tile.y);
        }
    });
    postForegroundLayer.setDepth(FOREGROUND_DEPTH);

    scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { map, collisionLayers };
}

/** Cria halos suaves sob cada poste de luz, sem precisar exportá-los como tiles no Tiled. */
function createLampLights(scene: Scene, objectsLayer: Phaser.Tilemaps.TilemapLayer) {
    if (!scene.textures.exists(LAMP_LIGHT_TEXTURE)) {
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

    objectsLayer.forEachTile((tile) => {
        if (tile.index !== 758) return;

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
