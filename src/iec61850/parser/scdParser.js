/**
 * IEC 61850 SCD (Substation Configuration Description) parser.
 * Runs in browser using DOMParser (no server needed).
 *
 * Handles: <Substation>, <IED>, <Communication>, <DataTypeTemplates>
 */

import { EquipmentTypes } from "../model/sclTypes.js";

// ─── Helpers ────────────────────────────────────────────────────────

function attr(el, name) {
  return el?.getAttribute(name) || undefined;
}

function children(el, tag) {
  if (!el) return [];
  return Array.from(el.children).filter((c) => c.tagName === tag);
}

function child(el, tag) {
  return children(el, tag)[0] || null;
}

function numAttr(el, name) {
  const v = attr(el, name);
  return v !== undefined ? Number(v) : undefined;
}

// ─── Parse Substation ───────────────────────────────────────────────

function parseConnectivityNodes(bay) {
  return children(bay, "ConnectivityNode").map((cn) => ({
    name: attr(cn, "name"),
    pathName: attr(cn, "pathName"),
    desc: attr(cn, "desc"),
  }));
}

function parseConductingEquipment(bay) {
  return children(bay, "ConductingEquipment").map((ce) => {
    const name = attr(ce, "name");
    const type = attr(ce, "type");
    const pathName = attr(ce, "pathName");
    const desc = attr(ce, "desc");
    const lnType = attr(ce, "lnType");

    // Parse child LNode references
    const lNodes = children(ce, "LNode").map((ln) => ({
      iedName: attr(ln, "iedName"),
      lnClass: attr(ln, "lnClass"),
      lnInst: attr(ln, "lnInst"),
      prefix: attr(ln, "prefix"),
      doName: attr(ln, "doName"),
    }));

    return { name, type, pathName, desc, lnType, lNodes, connectedNodes: [] };
  });
}

function parseBay(bay) {
  return {
    name: attr(bay, "name"),
    desc: attr(bay, "desc"),
    pathName: attr(bay, "pathName"),
    conductingEquipment: parseConductingEquipment(bay),
    connectivityNodes: parseConnectivityNodes(bay),
  };
}

function parseVoltageLevel(vl) {
  return {
    name: attr(vl, "name"),
    voltage: numAttr(vl, "voltage"),
    desc: attr(vl, "desc"),
    pathName: attr(vl, "pathName"),
    bays: children(vl, "Bay").map(parseBay),
  };
}

function parseSubstation(sub) {
  return {
    name: attr(sub, "name"),
    desc: attr(sub, "desc"),
    voltageLevels: children(sub, "VoltageLevel").map(parseVoltageLevel),
  };
}

// ─── Parse IED ──────────────────────────────────────────────────────

function parseDo(doEl) {
  return {
    name: attr(doEl, "name"),
    fc: attr(doEl, "fc"),
    value: attr(doEl, "val") || attr(doEl, "sAddr") || undefined,
  };
}

function parseLn(lnEl) {
  const prefix = attr(lnEl, "prefix");
  const lnClass = attr(lnEl, "lnClass");
  const inst = attr(lnEl, "inst");
  const desc = attr(lnEl, "desc");

  const dataObjects = [];

  // Parse DOI (data object instance)
  children(lnEl, "DOI").forEach((doi) => {
    const doName = attr(doi, "name");
    const fc = attr(doi, "fc");
    const val = attr(doi, "val") || attr(doi, "sAddr");
    dataObjects.push({ name: doName, fc, value: val });

    // Parse SDI (sub-data-instance) for structured DOs
    children(doi, "SDI").forEach((sdi) => {
      const subName = attr(sdi, "name");
      const subVal = attr(sdi, "val") || attr(sdi, "sAddr");
      if (subName) {
        dataObjects.push({ name: `${doName}.${subName}`, fc, value: subVal });
      }
    });
  });

  // Also check for DO (template reference)
  children(lnEl, "DO").forEach((d) => {
    dataObjects.push({
      name: attr(d, "name"),
      fc: undefined,
      value: undefined,
    });
  });

  return {
    prefix,
    lnClass,
    inst,
    desc,
    dataObjects,
    fullPath: `${prefix ? prefix + "/" : ""}${lnClass}${inst}`,
  };
}

function parseLDevice(ld) {
  return {
    inst: attr(ld, "inst"),
    desc: attr(ld, "desc"),
    logicalNodes: [
      ...children(ld, "LN0").map((ln0) => parseLn(ln0)),
      ...children(ld, "LN").map((ln) => parseLn(ln)),
    ],
  };
}

function parseServer(server) {
  return {
    lDevices: children(server, "LDevice").map(parseLDevice),
  };
}

function parseAccessPoint(ap) {
  const server = child(ap, "Server");
  return {
    name: attr(ap, "name"),
    server: server ? parseServer(server) : { lDevices: [] },
  };
}

function parseIed(ied) {
  return {
    name: attr(ied, "name"),
    type: attr(ied, "type"),
    manufacturer: attr(ied, "manufacturer"),
    configVersion: attr(ied, "configVersion"),
    desc: attr(ied, "desc"),
    accessPoints: children(ied, "AccessPoint").map(parseAccessPoint),
  };
}

// ─── Parse Communication ────────────────────────────────────────────

function parseConnectedAP(cap) {
  const ipEl = child(cap, "Address") && children(child(cap, "Address"), "P")
    .find((p) => attr(p, "type") === "IP");

  const portEl = child(cap, "Address") && children(child(cap, "Address"), "P")
    .find((p) => attr(p, "type") === "OSI-TP");

  return {
    iedName: attr(cap, "iedName"),
    apName: attr(cap, "apName"),
    ip: ipEl?.textContent || undefined,
    port: portEl?.textContent ? Number(portEl.textContent) : undefined,
  };
}

function parseSubnetwork(sn) {
  return {
    name: attr(sn, "name"),
    type: attr(sn, "type"),
    desc: attr(sn, "desc"),
    connectedAps: children(sn, "ConnectedAP").map(parseConnectedAP),
  };
}

function parseCommunication(comm) {
  return children(comm, "Subnetwork").map(parseSubnetwork);
}

// ─── Main parser ────────────────────────────────────────────────────

/**
 * Parse an SCD/XML string into an ScdModel.
 * @param {string} xmlString - raw SCD file content
 * @returns {{ model: import("./sclTypes.js").ScdModel, errors: string[] }}
 */
export function parseScd(xmlString) {
  const errors = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  // Check for parse errors
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    errors.push(`XML Parse Error: ${parseError.textContent}`);
    return { model: null, errors };
  }

  const root = doc.documentElement;
  if (root.tagName !== "SCL") {
    errors.push(`Root element is "${root.tagName}", expected "SCL"`);
    return { model: null, errors };
  }

  // Parse each section
  const substations = children(root, "Substation").map(parseSubstation);
  const ieds = children(root, "IED").map(parseIed);
  const communication = child(root, "Communication");
  const subnetworks = communication ? parseCommunication(communication) : [];

  // Build IP lookup from communication section
  const ipLookup = {};
  subnetworks.forEach((sn) => {
    sn.connectedAps.forEach((cap) => {
      if (cap.ip) {
        ipLookup[`${cap.iedName}/${cap.apName}`] = cap.ip;
      }
    });
  });

  // Inject IPs into IEDs
  ieds.forEach((ied) => {
    ied.accessPoints.forEach((ap) => {
      const key = `${ied.name}/${ap.name}`;
      if (!ap.ip && ipLookup[key]) {
        ap.ip = ipLookup[key];
      }
    });
  });

  // Resolve connectivity: link ConductingEquipment to ConnectivityNodes
  substations.forEach((sub) => {
    sub.voltageLevels.forEach((vl) => {
      vl.bays.forEach((bay) => {
        // Build a map of connectivity nodes by pathName
        const cnMap = {};
        bay.connectivityNodes.forEach((cn) => { cnMap[cn.pathName] = cn; });

        // For each equipment, find what connectivity nodes it touches
        // This is derived from path naming convention:
        // Equipment path: "SUB/VL/BAY/EQ" connects to nodes at "SUB/VL/BAY/NODENAME"
        bay.conductingEquipment.forEach((eq) => {
          const eqPath = eq.pathName || `${bay.pathName}/${eq.name}`;
          // Equipment connects to nodes that share the bay prefix
          const bayPrefix = bay.pathName || "";
          bay.connectivityNodes.forEach((cn) => {
            if (cn.pathName && cn.pathName.startsWith(bayPrefix)) {
              eq.connectedNodes.push(cn.pathName);
            }
          });
        });
      });
    });
  });

  return {
    model: {
      substations,
      ieds,
      subnetworks,
      raw: doc,
    },
    errors,
  };
}

/**
 * Parse an SCD file (File object) → returns promise.
 * @param {File} file
 * @returns {Promise<{ model: import("./sclTypes.js").ScdModel, errors: string[] }>}
 */
export function parseScdFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseScd(e.target.result);
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
