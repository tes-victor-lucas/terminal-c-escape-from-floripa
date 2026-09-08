import type { Scene } from 'phaser';

const TILESETS = [
    { mapName: 'floor_and_buildings-01', textureKey: 'floor_and_buildings' },
    { mapName: 'floor_and_walls-1', textureKey: 'floor_and_walls' },
    { mapName: 'objects_and_items-01', textureKey: 'objects' }
] as const;

const LAYER_NAMES = ['floor', 'wall', 'wall-stores', 'objects'] as const;

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

    for (const layer of collisionLayers) {
        layer.setCollisionByProperty({ collider: true });
    }

    scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { map, collisionLayers };
}
