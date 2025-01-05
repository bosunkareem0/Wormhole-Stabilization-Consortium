import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let wormholeCount = 0;
const wormholes = new Map();
const stabilizationEfforts = new Map();

// Simulated contract functions
function reportWormhole(coordinates: string, discoverer: string) {
  const wormholeId = ++wormholeCount;
  wormholes.set(wormholeId, {
    discoverer,
    coordinates,
    status: 'unstable',
    stability: 0
  });
  return wormholeId;
}

function stabilizeWormhole(wormholeId: number, stabilityIncrease: number, researcher: string) {
  const wormhole = wormholes.get(wormholeId);
  if (!wormhole) throw new Error('Invalid wormhole');
  const newStability = wormhole.stability + stabilityIncrease;
  wormhole.stability = newStability;
  wormhole.status = newStability >= 1000 ? 'stable' : 'unstable';
  wormholes.set(wormholeId, wormhole);
  stabilizationEfforts.set(wormholeCount, {
    researcher,
    wormholeId,
    stabilityIncrease,
    status: 'completed'
  });
  return newStability;
}

describe('Wormhole Management Contract', () => {
  beforeEach(() => {
    wormholeCount = 0;
    wormholes.clear();
    stabilizationEfforts.clear();
  });
  
  it('should report a new wormhole', () => {
    const id = reportWormhole('10.5,20.3,30.1', 'discoverer1');
    expect(id).toBe(1);
    const wormhole = wormholes.get(id);
    expect(wormhole.coordinates).toBe('10.5,20.3,30.1');
    expect(wormhole.status).toBe('unstable');
  });
  
  it('should stabilize a wormhole', () => {
    const id = reportWormhole('10.5,20.3,30.1', 'discoverer1');
    const newStability = stabilizeWormhole(id, 500, 'researcher1');
    expect(newStability).toBe(500);
    const wormhole = wormholes.get(id);
    expect(wormhole.status).toBe('unstable');
    const finalStability = stabilizeWormhole(id, 500, 'researcher2');
    expect(finalStability).toBe(1000);
    expect(wormholes.get(id).status).toBe('stable');
  });
  
  it('should allow over-stabilization', () => {
    const id = reportWormhole('15.2,25.7,35.9', 'discoverer2');
    const stability = stabilizeWormhole(id, 1500, 'researcher3');
    expect(stability).toBe(1500);
    expect(wormholes.get(id).status).toBe('stable');
  });
});

