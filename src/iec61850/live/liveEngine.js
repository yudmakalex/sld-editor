/**
 * Simulated IEC 61850 MMS live data engine.
 *
 * In production, this would use libiec61850 (C via P/Invoke) or
 * openmuc-stacks (Java). For demo, we simulate report callbacks.
 *
 * Data flow:
 *   IED → ReportControl → DataSet → {FCDA values} → callback
 */

class SimulatedLiveEngine {
  constructor() {
    this.running = false;
    this.interval = null;
    this.subscribers = new Map(); // nodeId → callback
    this.nodeStates = new Map(); // nodeId → { stVal, q, t }
    this.speed = 2000; // ms between updates
  }

  /**
   * Initialize simulated states for all nodes on canvas.
   * @param {Array} nodes - React Flow nodes
   */
  init(nodes) {
    this.nodeStates.clear();
    nodes.forEach((n) => {
      if (n.data.status !== undefined) {
        this.nodeStates.set(n.id, {
          stVal: n.data.status === "closed" || n.data.status === "running" ? 1 : 0,
          q: "Good",
          t: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Subscribe to live updates for a node.
   * @param {string} nodeId
   * @param {(data: {stVal: number, q: string, t: string, displayStatus: string}) => void} callback
   */
  subscribe(nodeId, callback) {
    this.subscribers.set(nodeId, callback);
  }

  /**
   * Unsubscribe from a node.
   */
  unsubscribe(nodeId) {
    this.subscribers.delete(nodeId);
  }

  /**
   * Start simulating IEC 61850 reports.
   * Simulates: data-change triggers, quality changes, occasional trips.
   */
  start() {
    if (this.running) return;
    this.running = true;

    this.interval = setInterval(() => {
      this.nodeStates.forEach((state, nodeId) => {
        const subscriber = this.subscribers.get(nodeId);
        if (!subscriber) return;

        // Simulate occasional state changes
        const rand = Math.random();

        // 5% chance of quality degradation
        if (rand < 0.05) {
          state.q = state.q === "Good" ? "Questionable" : "Good";
        }

        // 2% chance of status toggle (breaker trip/close)
        if (rand < 0.02) {
          state.stVal = state.stVal === 1 ? 0 : 1;
          state.q = "Good";
        }

        // 0.5% chance of trip event
        if (rand < 0.005) {
          state.stVal = 0; // trip = open
          state.q = "Good";
        }

        state.t = new Date().toISOString();

        // Map stVal to display status
        const displayStatus = state.stVal === 1 ? "closed" : "open";

        subscriber({
          stVal: state.stVal,
          q: state.q,
          t: state.t,
          displayStatus,
        });
      });
    }, this.speed);
  }

  /**
   * Stop simulation.
   */
  stop() {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Send a control command (simulate MMS Operate).
   * @param {string} nodeId
   * @param {string} value - "open" or "close"
   */
  control(nodeId, value) {
    const state = this.nodeStates.get(nodeId);
    if (!state) return;

    // Select-before-operate simulation
    state.stVal = value === "close" ? 1 : 0;
    state.q = "Good";
    state.t = new Date().toISOString();

    // Notify subscriber
    const subscriber = this.subscribers.get(nodeId);
    if (subscriber) {
      subscriber({
        stVal: state.stVal,
        q: state.q,
        t: state.t,
        displayStatus: state.stVal === 1 ? "closed" : "open",
      });
    }
  }

  /**
   * Get current quality indicator for a node.
   */
  getQuality(nodeId) {
    return this.nodeStates.get(nodeId)?.q || "Unknown";
  }

  /**
   * Get all current states.
   */
  getStates() {
    const result = {};
    this.nodeStates.forEach((state, nodeId) => {
      result[nodeId] = { ...state };
    });
    return result;
  }

  destroy() {
    this.stop();
    this.subscribers.clear();
    this.nodeStates.clear();
  }
}

// Singleton
export const liveEngine = new SimulatedLiveEngine();
