// Smoke test: simulate GENERATE_CASHFLOWS_FROM_ASSETS and UPDATE_CASHFLOW_ASSET
// This script intentionally re-implements the minimal logic used in FinanceContext reducer
// to verify generation + update sync behavior without running the full React app.

function deepClone(o){ return JSON.parse(JSON.stringify(o)); }

const initialState = {
  entrate: { stipendio: { netto:0, lordo:0 }, bonus: [], altreEntrate: [], cashflowAsset: [] },
  patrimonio: { tfr:0, contiDeposito: [], buoniTitoli: [], investimenti: { azioni: [], etf: [], crypto: [], oro: [] }, immobili: [] },
  liquidita: { contiCorrenti: [], cartePrepagate: [], contante: 0 },
  uscite: { fisse: [], variabili: [], cashflowAsset: [] },
  progettiExtra: [],
};

const calculateNextDate = (currentIso, frequency) => {
  if (!currentIso) return null;
  const d = new Date(currentIso);
  if (Number.isNaN(d.getTime())) return null;
  switch (frequency) {
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'semiannually': d.setMonth(d.getMonth() + 6); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    case 'once': return null;
    default: d.setMonth(d.getMonth() + 1); break;
  }
  return d.toISOString();
};

function generateFromAssets(state){
  const now = new Date();
  const s = deepClone(state);
  const generated = [];

  const processAsset = (asset, assetType) => {
    if (!asset || !Array.isArray(asset.cashflows)) return;
    asset.cashflows = asset.cashflows.map(cf => {
      try {
        if (cf.autoGenerate && cf.nextGeneration) {
          const next = new Date(cf.nextGeneration);
          if (!isNaN(next.getTime()) && next <= now) {
            const gen = {
              id: Math.random().toString(36).slice(2,9),
              sourceAssetId: asset.id,
              sourceAssetTipo: assetType,
              titolo: cf.titolo || (`${asset.titolo || asset.name} - ${cf.titolo || 'cashflow'}`),
              amount: Number(cf.amount || 0),
              date: cf.nextGeneration,
              type: cf.type || 'entrata'
            };
            generated.push(gen);
            cf.nextGeneration = calculateNextDate(cf.nextGeneration, cf.frequency);
          }
        }
      } catch(e){}
      return cf;
    });
  };

  (s.patrimonio.contiDeposito || []).forEach(a => processAsset(a, 'conti'));
  (s.patrimonio.immobili || []).forEach(a => processAsset(a, 'immobili'));
  (s.patrimonio.buoniTitoli || []).forEach(a => processAsset(a, 'buoni'));
  const inv = s.patrimonio.investimenti || {};
  (inv.azioni || []).forEach(a => processAsset(a, 'azioni'));
  (inv.etf || []).forEach(a => processAsset(a, 'etf'));
  (inv.crypto || []).forEach(a => processAsset(a, 'crypto'));
  (inv.oro || []).forEach(a => processAsset(a, 'oro'));

  generated.forEach(g => {
    if (g.type === 'entrata') s.entrate.cashflowAsset = [ ...(s.entrate.cashflowAsset || []), g ];
    else s.uscite.cashflowAsset = [ ...(s.uscite.cashflowAsset || []), g ];
  });

  return s;
}

function updateCashflowAsset(state, updated){
  console.log('ENTER updateCashflowAsset');
  const s = deepClone(state);
  console.log('DBG1: cloned state');
  const id = updated.id;

  s.entrate = s.entrate || {};
  s.entrate.cashflowAsset = (s.entrate.cashflowAsset || []).map(cf => cf.id === id ? { ...cf, ...updated } : cf);
  console.log('DBG2: updated s.entrate.cashflowAsset length=', (s.entrate.cashflowAsset || []).length);
  s.uscite = s.uscite || {};
  s.uscite.cashflowAsset = (s.uscite.cashflowAsset || []).map(cf => cf.id === id ? { ...cf, ...updated } : cf);
  console.log('DBG3: updated s.uscite.cashflowAsset length=', (s.uscite.cashflowAsset || []).length);

  const meta = updated.meta || {};
  const assetId = meta.assetId || updated.sourceAssetId || null;
  const assetTipo = (meta.assetTipo || updated.sourceAssetTipo || '') .toString();
  console.log('DBG4: assetId=', assetId, ' assetTipo=', assetTipo);

  if (assetId && assetTipo) {
    const cfId = updated.cashflowId || id;
    const cfPatch = {
      titolo: updated.titolo || updated.title,
      amount: updated.amount !== undefined ? Number(updated.amount) : (updated.importo !== undefined ? Number(updated.importo) : undefined),
      frequency: updated.frequency,
      startDate: updated.startDate || updated.date,
      autoGenerate: updated.autoGenerate
    };

    const updateAssetCashflows = (asset) => {
      if (!asset) return asset;
      const patched = (asset.cashflows || []).map(cf => cf.id === cfId ? { ...cf, ...cfPatch } : cf);
      return { ...asset, cashflows: patched };
    };

    switch (assetTipo) {
      case 'conti':
      case 'contiDeposito':
      case 'conto':
        s.patrimonio.contiDeposito = (s.patrimonio.contiDeposito || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        break;
      case 'immobile':
      case 'immobili':
        s.patrimonio.immobili = (s.patrimonio.immobili || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        break;
      case 'buono':
      case 'buoni':
      case 'buoniTitoli':
        s.patrimonio.buoniTitoli = (s.patrimonio.buoniTitoli || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        break;
      case 'azioni':
      case 'azione':
        s.patrimonio.investimenti = s.patrimonio.investimenti || {};
        s.patrimonio.investimenti.azioni = (s.patrimonio.investimenti.azioni || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        break;
      case 'etf':
        s.patrimonio.investimenti = s.patrimonio.investimenti || {};
        s.patrimonio.investimenti.etf = (s.patrimonio.investimenti.etf || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        break;
      case 'crypto':
        s.patrimonio.investimenti = s.patrimonio.investimenti || {};
        s.patrimonio.investimenti.crypto = (s.patrimonio.investimenti.crypto || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        break;
      case 'oro':
        s.patrimonio.investimenti = s.patrimonio.investimenti || {};
        s.patrimonio.investimenti.oro = (s.patrimonio.investimenti.oro || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        break;
      default:
        s.patrimonio.contiDeposito = (s.patrimonio.contiDeposito || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        s.patrimonio.immobili = (s.patrimonio.immobili || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        s.patrimonio.buoniTitoli = (s.patrimonio.buoniTitoli || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        if (s.patrimonio.investimenti) {
          s.patrimonio.investimenti.azioni = (s.patrimonio.investimenti.azioni || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
          s.patrimonio.investimenti.etf = (s.patrimonio.investimenti.etf || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
          s.patrimonio.investimenti.crypto = (s.patrimonio.investimenti.crypto || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
          s.patrimonio.investimenti.oro = (s.patrimonio.investimenti.oro || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
        }
        break;
    }
  }

    // Note: original code mapped by cases; log the patrimonio slices for inspection
    console.log('DBG5: after switch, patrimonio.immobili[0]=', JSON.stringify((s.patrimonio.immobili || [])[0]));
    return s;
}

// --- Test scenario ---
(function run(){
  try {
    const errors = [];
    const state0 = deepClone(initialState);

    // create an immobile with a cron cashflow due now
    const todayIso = new Date().toISOString();
    const asset = {
      id: 'asset-1',
      titolo: 'Test Immobile',
      valore: 250000,
      cashflows: [{
        id: 'cf-1',
        type: 'entrata',
        titolo: 'Affitto',
        amount: 1200,
        frequency: 'monthly',
        startDate: todayIso,
        autoGenerate: true,
        nextGeneration: todayIso
      }]
    };

    state0.patrimonio.immobili.push(asset);

    const s1 = generateFromAssets(state0);

    const genList = s1.entrate.cashflowAsset || [];
    if (genList.length !== 1) {
      console.error('FAIL: expected 1 generated entry, got', genList.length);
      process.exit(1);
    }
    console.log('PASS: generation produced 1 entry');

  const gen = genList[0];
  console.log('DEBUG: generated entry ->', JSON.stringify(gen));
    console.log('DEBUG2: after debug');
      console.log('DEBUG3: about to verify generated fields');
    // verify generated fields
    console.log('DEBUG4: gen.sourceAssetId=', gen.sourceAssetId, ' gen.sourceAssetTipo=', gen.sourceAssetTipo);
    if (gen.sourceAssetId !== 'asset-1' || gen.sourceAssetTipo !== 'immobili') {
      errors.push('generated entry missing source asset info: ' + JSON.stringify(gen));
    }

    // now simulate editing the generated entry: change amount
  console.log('DEBUG5: about to build updated payload');
  const updated = { ...gen, amount: 1500, meta: { assetId: 'asset-1', assetTipo: 'immobili' }, cashflowId: 'cf-1' };
  console.log('DEBUG6: updated payload ->', JSON.stringify(updated));

  const s2 = updateCashflowAsset(s1, updated);
  console.log('DEBUG7: after updateCashflowAsset');
    const updatedGen = (s2.entrate.cashflowAsset || []).find(x => x.id === gen.id);
    console.log('DEBUG8: updatedGen=', JSON.stringify(updatedGen));
    console.log('DEBUG9: before checking updatedGen amount');
    if (!updatedGen || Number(updatedGen.amount) !== 1500) {
      console.log('DEBUG10: updatedGen failing check');
      errors.push('generated entry not updated in entrate: ' + JSON.stringify(updatedGen));
    } else {
      console.log('DEBUG11: updatedGen passed check');
    }

    // verify asset cashflow updated
    const updatedAsset = (s2.patrimonio.immobili || []).find(a => a.id === 'asset-1');
    const cf = (updatedAsset && updatedAsset.cashflows || []).find(c => c.id === 'cf-1');
    if (!cf || Number(cf.amount) !== 1500) {
      console.log('DEBUG12: asset cashflow failing check', JSON.stringify(cf));
      errors.push('asset cashflow not updated: ' + JSON.stringify(cf));
    } else {
      console.log('DEBUG13: asset cashflow passed check', JSON.stringify(cf));
    }

    console.log('DEBUG14: errors length =', errors.length);
    if (errors.length === 0) {
      console.log('PASS: update synchronized to asset cashflow');
      process.exit(0);
    } else {
      console.error('FAILURES:');
      errors.forEach(e => console.error('- ', e));
      process.exit(1);
    }
  } catch (e) {
    console.error('ERROR during smoke test', e);
    process.exit(2);
  }
})();
