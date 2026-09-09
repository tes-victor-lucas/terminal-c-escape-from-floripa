export const WORLD_CONFIG = {
    initialRoomKey: 'room1',
    rooms: {
        room1: {
            mapKey: 'room1',
            transitions: [
                {
                    edge: 'top',
                    to: 'room2',
                    // O jogador chega dois tiles antes da borda para não acionar o retorno no mesmo frame.
                    spawn: { x: 184, y: 576 },
                    xMin: 144,
                    xMax: 224
                }
            ]
        },
        room2: {
            mapKey: 'room2',
            transitions: [
                {
                    edge: 'bottom',
                    to: 'room1',
                    // Mesmo afastamento ao voltar para a room01.
                    spawn: { x: 184, y: 64 },
                    xMin: 144,
                    xMax: 224
                }
            ]
        }
    },
    player: {
        x: 104,
        y: 88,
        texture: 'player-walk',
        initialFrame: 120,
        scale: 0.7,
        speed: 120,
        hitbox: {
            width: 8,
            height: 5,
            offsetX: 15,
            offsetY: 32
        }
    },
    camera: {
        zoom: 2.25,
        lerpX: 0.15,
        lerpY: 0.15
    }
} as const;

export type RoomKey = keyof typeof WORLD_CONFIG.rooms;
