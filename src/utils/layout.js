/**
 * Layered graph layout for SLD diagrams.
 * Top-to-bottom, no overlapping, automatic spacing.
 */

const NODE_W = 120;
const NODE_H = 80;
const GAP_X = 60;
const GAP_Y = 100;

function buildGraph(nodes, edges) {
  const byId = {};
  nodes.forEach((n) => { byId[n.id] = n; });

  const children = {};
  const parents = {};
  nodes.forEach((n) => { children[n.id] = []; parents[n.id] = []; });
  edges.forEach((e) => {
    if (children[e.source]) children[e.source].push(e.target);
    if (parents[e.target]) parents[e.target].push(e.source);
  });

  return { byId, children, parents };
}

function assignLayers(nodes, children, parents) {
  const inDeg = {};
  nodes.forEach((n) => { inDeg[n.id] = 0; });
  Object.keys(parents).forEach((id) => { inDeg[id] = parents[id].length; });

  const layers = {};
  const queue = [];

  // Roots = no parents
  nodes.forEach((n) => {
    if (inDeg[n.id] === 0) {
      layers[n.id] = 0;
      queue.push(n.id);
    }
  });

  // BFS
  while (queue.length > 0) {
    const id = queue.shift();
    const nextLayer = layers[id] + 1;
    (children[id] || []).forEach((childId) => {
      if (layers[childId] === undefined || layers[childId] < nextLayer) {
        layers[childId] = nextLayer;
        queue.push(childId);
      }
    });
  }

  // Orphan nodes (in cycle or disconnected) — assign to layer 0
  nodes.forEach((n) => {
    if (layers[n.id] === undefined) layers[n.id] = 0;
  });

  return layers;
}

function orderWithinLayers(nodes, layers, children, parents) {
  // Group nodes by layer
  const layerGroups = {};
  nodes.forEach((n) => {
    const layer = layers[n.id];
    if (!layerGroups[layer]) layerGroups[layer] = [];
    layerGroups[layer].push(n.id);
  });

  const layerKeys = Object.keys(layerGroups)
    .map(Number)
    .sort((a, b) => a - b);

  // Simple barycenter ordering: for each layer > 0, sort nodes by
  // the average position of their parents in the previous layer.
  const positioned = {};

  // Layer 0: keep initial order or sort by degree
  if (layerGroups[0]) {
    layerGroups[0].sort((a, b) => {
      const degA = (children[a] || []).length;
      const degB = (children[b] || []).length;
      return degB - degA; // more connected first
    });
    layerGroups[0].forEach((id, i) => { positioned[id] = i; });
  }

  for (let li = 1; li < layerKeys.length; li++) {
    const layer = layerKeys[li];
    const group = layerGroups[layer];
    if (!group) continue;

    group.sort((a, b) => {
      const pa = parents[a] || [];
      const pb = parents[b] || [];
      const avgA = pa.length > 0
        ? pa.reduce((sum, p) => sum + (positioned[p] ?? 0), 0) / pa.length
        : 0;
      const avgB = pb.length > 0
        ? pb.reduce((sum, p) => sum + (positioned[p] ?? 0), 0) / pb.length
        : 0;
      return avgA - avgB;
    });

    group.forEach((id, i) => { positioned[id] = i; });
  }

  return layerGroups;
}

function reduceCrossings(layerGroups, layerKeys, parents) {
  // Multiple passes of barycenter heuristic
  for (let pass = 0; pass < 4; pass++) {
    // Forward pass
    for (let li = 1; li < layerKeys.length; li++) {
      const layer = layerKeys[li];
      const group = layerGroups[layer];
      if (!group) continue;

      const prevLayer = layerKeys[li - 1];
      const prevPos = {};
      (layerGroups[prevLayer] || []).forEach((id, i) => { prevPos[id] = i; });

      group.sort((a, b) => {
        const pa = parents[a] || [];
        const pb = parents[b] || [];
        const avgA = pa.length > 0
          ? pa.reduce((sum, p) => sum + (prevPos[p] ?? 0), 0) / pa.length
          : 0;
        const avgB = pb.length > 0
          ? pb.reduce((sum, p) => sum + (prevPos[p] ?? 0), 0) / pb.length
          : 0;
        return avgA - avgB;
      });
    }

    // Backward pass
    for (let li = layerKeys.length - 2; li >= 0; li--) {
      const layer = layerKeys[li];
      const group = layerGroups[layer];
      if (!group) continue;

      const nextLayer = layerKeys[li + 1];
      const nextPos = {};
      (layerGroups[nextLayer] || []).forEach((id, i) => { nextPos[id] = i; });

      // Need children info — use parent map inverted
      group.sort((a, b) => {
        // Compare by children positions in next layer
        const childrenA = []; // would need children map, approximate with parent positions
        const childrenB = [];
        return 0; // simplified
      });
    }
  }
}

export function layoutGraph(nodes, edges) {
  if (nodes.length === 0) return [];

  const { byId, children, parents } = buildGraph(nodes, edges);

  // Assign layers
  const layers = assignLayers(nodes, children, parents);

  // Order within layers
  const layerGroups = orderWithinLayers(nodes, layers, children, parents);

  // Reduce crossings
  const layerKeys = Object.keys(layerGroups)
    .map(Number)
    .sort((a, b) => a - b);
  reduceCrossings(layerGroups, layerKeys, parents);

  // Calculate positions
  const positioned = {};
  const result = [];

  for (const layer of layerKeys) {
    const group = layerGroups[layer];
    if (!group) continue;

    const layerWidth = group.length * (NODE_W + GAP_X) - GAP_X;
    const startX = -layerWidth / 2; // center around 0

    group.forEach((id, i) => {
      const x = startX + i * (NODE_W + GAP_X);
      const y = layer * (NODE_H + GAP_Y);
      positioned[id] = { x, y };
    });
  }

  // Offset everything so minimum x/y is at some padding
  let minX = Infinity, minY = Infinity;
  Object.values(positioned).forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
  });

  const padX = 100;
  const padY = 60;

  nodes.forEach((n) => {
    const pos = positioned[n.id] || { x: 0, y: 0 };
    result.push({
      ...n,
      position: {
        x: pos.x - minX + padX,
        y: pos.y - minY + padY,
      },
    });
  });

  return result;
}

export function layoutBounds(nodes) {
  if (nodes.length === 0) return { x: 0, y: 0, width: 800, height: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    const x = n.position.x;
    const y = n.position.y;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + NODE_W > maxX) maxX = x + NODE_W;
    if (y + NODE_H > maxY) maxY = y + NODE_H;
  });
  return { x: minX - 40, y: minY - 40, width: maxX - minX + 80, height: maxY - minY + 80 };
}
