import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastWormholeId = 0;
const wormholeNftData = new Map();
const wormholeNftOwners = new Map();

// Simulated contract functions
function mintWormholeNft(coordinates: string, stability: number, discoverer: string) {
  const wormholeId = ++lastWormholeId;
  wormholeNftData.set(wormholeId, {
    discoverer,
    coordinates,
    discoveryDate: Date.now(),
    stability,
    traversable: false
  });
  wormholeNftOwners.set(wormholeId, discoverer);
  return wormholeId;
}

function transferWormholeNft(wormholeId: number, sender: string, recipient: string) {
  if (wormholeNftOwners.get(wormholeId) !== sender) throw new Error('Not authorized');
  wormholeNftOwners.set(wormholeId, recipient);
  return true;
}

function updateWormholeNftStatus(wormholeId: number, newStability: number, isTraversable: boolean, sender: string) {
  if (sender !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  const wormholeData = wormholeNftData.get(wormholeId);
  if (!wormholeData) throw new Error('Invalid wormhole');
  wormholeData.stability = newStability;
  wormholeData.traversable = isTraversable;
  wormholeNftData.set(wormholeId, wormholeData);
  return true;
}

describe('Wormhole NFT Contract', () => {
  beforeEach(() => {
    lastWormholeId = 0;
    wormholeNftData.clear();
    wormholeNftOwners.clear();
  });
  
  it('should mint a new wormhole NFT', () => {
    const id = mintWormholeNft('20.1,30.2,40.3', 500, 'discoverer1');
    expect(id).toBe(1);
    const wormhole = wormholeNftData.get(id);
    expect(wormhole.coordinates).toBe('20.1,30.2,40.3');
    expect(wormhole.stability).toBe(500);
    expect(wormholeNftOwners.get(id)).toBe('discoverer1');
  });
  
  it('should transfer wormhole NFT ownership', () => {
    const id = mintWormholeNft('25.5,35.5,45.5', 750, 'discoverer2');
    expect(transferWormholeNft(id, 'discoverer2', 'newowner1')).toBe(true);
    expect(wormholeNftOwners.get(id)).toBe('newowner1');
  });
  
  it('should update wormhole NFT status', () => {
    const id = mintWormholeNft('30.3,40.4,50.5', 1000, 'discoverer3');
    expect(updateWormholeNftStatus(id, 2000, true, 'CONTRACT_OWNER')).toBe(true);
    const wormhole = wormholeNftData.get(id);
    expect(wormhole.stability).toBe(2000);
    expect(wormhole.traversable).toBe(true);
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintWormholeNft('35.7,45.8,55.9', 1250, 'discoverer4');
    expect(() => transferWormholeNft(id, 'unauthorized_user', 'newowner2')).toThrow('Not authorized');
  });
  
  it('should not allow unauthorized status updates', () => {
    const id = mintWormholeNft('40.1,50.2,60.3', 1500, 'discoverer5');
    expect(() => updateWormholeNftStatus(id, 3000, true, 'unauthorized_user')).toThrow('Not authorized');
  });
});

