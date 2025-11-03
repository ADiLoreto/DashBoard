/**
 * Helper to generate item-level diffs from array sections
 * @param {Object} existingState Current state object
 * @param {Object} proposedState State object with changes to apply
 * @returns {Array} Array of expanded diffs with item-level granularity
 */
export const expandDiffs = (existingState = {}, proposedState = {}) => {
  const diffs = [];
  // Diagnostic: log keys and section counts at entry
  try {
    const existingKeys = Object.keys(existingState || {});
    const proposedKeys = Object.keys(proposedState || {});
    const sectionsCount = new Set([...existingKeys, ...proposedKeys]).size;
    console.log('📦 expandDiffs INPUT:', { existingKeys, proposedKeys, sectionsCount });
  } catch (e) {
    // ignore logging errors
  }

  // Helper to process array sections and generate item-level diffs
  const processArraySection = (section, field, currentArray = [], proposedArray = []) => {
    const now = Date.now();
    const currentItemsById = new Map((currentArray || []).map(item => [item && item.id ? String(item.id) : null, item]));
    const proposedItemsById = new Map((proposedArray || []).map(item => [item && item.id ? String(item.id) : null, item]));

    // collect ids (including nulls for items without id)
    const allIds = new Set();
    (currentArray || []).forEach((it, idx) => allIds.add(it && it.id ? String(it.id) : `__cur_${idx}`));
    (proposedArray || []).forEach((it, idx) => allIds.add(it && it.id ? String(it.id) : `__prop_${idx}`));

    let tmpCounter = 0;
    allIds.forEach(key => {
      // resolve current/proposed items by matching ids when possible
      let currentItem = null;
      let proposedItem = null;

      if (key.startsWith('__cur_')) {
        const idx = Number(key.split('_')[2]);
        currentItem = (currentArray || [])[idx];
        // try to find matching proposed by same id if available
        if (currentItem && currentItem.id && proposedItemsById.has(String(currentItem.id))) {
          proposedItem = proposedItemsById.get(String(currentItem.id));
        }
      } else if (key.startsWith('__prop_')) {
        const idx = Number(key.split('_')[2]);
        proposedItem = (proposedArray || [])[idx];
        if (proposedItem && proposedItem.id && currentItemsById.has(String(proposedItem.id))) {
          currentItem = currentItemsById.get(String(proposedItem.id));
        }
      } else {
        // normal id string
        currentItem = currentItemsById.get(key) || null;
        proposedItem = proposedItemsById.get(key) || null;
      }

      // Determine an itemId to use in diffs
      let itemId = null;
      if (currentItem && currentItem.id) itemId = String(currentItem.id);
      else if (proposedItem && proposedItem.id) itemId = String(proposedItem.id);
      else {
        // generate stable-ish temporary id
        itemId = `__tmp_${now}_${tmpCounter++}`;
      }

      // Determine action
      let action = 'modify';
      if (!currentItem && proposedItem) action = 'add';
      else if (currentItem && !proposedItem) action = 'remove';
      else {
        // both present: compare shallow stringified for change
        try {
          action = (JSON.stringify(currentItem) === JSON.stringify(proposedItem)) ? 'noop' : 'modify';
        } catch (e) {
          action = 'modify';
        }
      }

      if (action === 'noop') return; // no change

      diffs.push({
        section,
        field,
        itemId,
        current: currentItem || null,
        proposed: proposedItem || null,
        action,
        path: [section, field, itemId],
        metadata: { original: { current: currentItem, proposed: proposedItem } }
      });
    });
  };

  // iterate over sections present in either state
  const sections = new Set([...
    Object.keys(existingState || {}),
    Object.keys(proposedState || {})
  ]);

  sections.forEach(section => {
    const curSection = existingState && existingState[section] ? existingState[section] : {};
    const propSection = proposedState && proposedState[section] ? proposedState[section] : {};

    // Detect "all-new" mode: section exists in proposedState but not in existingState
    const existsInExisting = Object.prototype.hasOwnProperty.call(existingState || {}, section) && existingState[section] !== undefined && existingState[section] !== null;
    const existsInProposed = Object.prototype.hasOwnProperty.call(proposedState || {}, section) && proposedState[section] !== undefined && proposedState[section] !== null;
    if (existsInProposed && !existsInExisting) {
      try { console.log('📣 expandDiffs MODE: ALL_NEW for section:', section); } catch (e) {}
      // For each field in the proposed section, treat arrays as collections of new items
      const propFields = Object.keys(propSection || {});
      let addsCount = 0;
      const now = Date.now();
      propFields.forEach(field => {
        const proposed = propSection[field];
        if (Array.isArray(proposed)) {
          (proposed || []).forEach((item, idx) => {
            const itemId = item && item.id ? String(item.id) : `tmp_${now}_${section}_${field}_${idx}`;
            diffs.push({
              section,
              field,
              itemId,
              current: null,
              proposed: item || null,
              action: 'add',
              path: [section, field, itemId],
              metadata: { source: 'expandDiffs:all-new' }
            });
            addsCount++;
          });
        } else {
          // non-array field: emit scalar/object add diff
          diffs.push({ section, field, current: null, proposed: proposed === undefined ? null : proposed, action: 'add', path: [section, field], metadata: { source: 'expandDiffs:all-new' } });
          addsCount++;
        }
      });
      try { console.log('📣 expandDiffs MODE: ALL_NEW - generated adds:', addsCount, 'for', section); } catch (e) {}
      // we've handled this section as all-new; skip normal processing
      return;
    }

    // If either is not an object, treat whole section as a field
    if (!curSection || typeof curSection !== 'object' || Array.isArray(curSection)) {
      // treat section as a single field
      if (JSON.stringify(curSection) !== JSON.stringify(propSection)) {
        diffs.push({ section, field: section, current: curSection || null, proposed: propSection || null });
      }
      return;
    }

    // collect fields from both
    const fields = new Set([...
      Object.keys(curSection || {}),
      Object.keys(propSection || {})
    ]);

    fields.forEach(field => {
      const current = curSection ? curSection[field] : undefined;
      const proposed = propSection ? propSection[field] : undefined;

      // If either side is array -> expand item-level diffs
      if (Array.isArray(current) || Array.isArray(proposed)) {
        processArraySection(section, field, Array.isArray(current) ? current : [], Array.isArray(proposed) ? proposed : []);
      } else {
        // scalar/object diff
        if (JSON.stringify(current) !== JSON.stringify(proposed)) {
          diffs.push({ section, field, current: current === undefined ? null : current, proposed: proposed === undefined ? null : proposed });
        }
      }
    });
  });

  try {
    console.log('📦 expandDiffs OUTPUT:', { sections: Array.from(sections), expandedCount: diffs.length, firstExpanded: diffs[0] || null });
  } catch (e) {
    // ignore
  }
  return diffs;
};