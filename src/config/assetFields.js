/**
 * Asset Fields Configuration
 * Configurazione centralizzata per tutti i 10 tipi di strumenti finanziari
 * Definisce: campi, validazioni, sezioni, calcoli per ogni tipo
 */

export const ASSET_TYPES = {
  immobili: 'immobili',
  obbligazioni: 'obbligazioni',
  azioni: 'azioni',
  etf: 'etf',
  contiDeposito: 'conti',
  crypto: 'crypto',
  metalli: 'metalli',
  fondi: 'fondi',
  polizze: 'polizze',
  alternativi: 'alternativi'
};

export const ASSET_FIELD_CONFIG = {
  // ==================== 1. IMMOBILI ====================
  immobili: {
    label: 'Immobile',
    icon: '🏢',
    sections: ['base', 'entrate', 'spese', 'tasse', 'performance'],
    fields: {
      // Dati base
      titolo: { type: 'text', label: 'Nome immobile', required: true, section: 'base' },
      indirizzo: { type: 'text', label: 'Indirizzo', section: 'base' },
      metratura: { type: 'number', label: 'Metratura (mq)', min: 0, section: 'base' },
      tipologia: { type: 'select', label: 'Tipologia', options: ['residenziale', 'commerciale', 'terreno'], section: 'base' },
      
      // Valutazione
      valore: { type: 'number', label: 'Valore acquisto (€)', min: 0, required: true, section: 'base' },
      valoreAttuale: { type: 'number', label: 'Valore attuale (€)', min: 0, section: 'base' },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'base' },
      
      // Cashflow entrate
      affittoMensile: { type: 'number', label: 'Affitto mensile (€)', min: 0, section: 'entrate' },
      frequenzaAffitto: { type: 'select', label: 'Frequenza affitto', options: ['mensile', 'trimestrale', 'annuale'], section: 'entrate' },
      
      // Costi ricorrenti
      imu: { type: 'number', label: 'IMU annuale (€)', min: 0, section: 'spese' },
      tasi: { type: 'number', label: 'TASI annuale (€)', min: 0, section: 'spese' },
      condominioMensile: { type: 'number', label: 'Condominio mensile (€)', min: 0, section: 'spese' },
      manutenzioneAnnua: { type: 'number', label: 'Manutenzione annua (€)', min: 0, section: 'spese' },
      assicurazione: { type: 'number', label: 'Assicurazione annua (€)', min: 0, section: 'spese' },
      
      // Tassazione
      tassazioneAffitto: { type: 'number', label: 'Tassazione affitto (%)', min: 0, max: 100, section: 'tasse', default: 21 },
      
      // Note
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      totalSpese: (data) => {
        const imu = Number(data.imu) || 0;
        const tasi = Number(data.tasi) || 0;
        const cond = (Number(data.condominioMensile) || 0) * 12;
        const maint = Number(data.manutenzioneAnnua) || 0;
        const assic = Number(data.assicurazione) || 0;
        return imu + tasi + cond + maint + assic;
      },
      renditaLorda: (data) => {
        const affitto = Number(data.affittoMensile) || 0;
        const freq = data.frequenzaAffitto || 'mensile';
        const multiplier = { mensile: 12, trimestrale: 4, annuale: 1 };
        return affitto * (multiplier[freq] || 12);
      },
      renditaNetta: (data, calculations) => {
        const renditaLorda = calculations.renditaLorda || 0;
        const totalSpese = calculations.totalSpese || 0;
        const tasse = (renditaLorda * (Number(data.tassazioneAffitto) || 0)) / 100;
        return renditaLorda - totalSpese - tasse;
      },
      roiLordo: (data, calculations) => {
        const renditaLorda = calculations.renditaLorda || 0;
        const valore = Number(data.valoreAttuale) || Number(data.valore) || 1;
        return (renditaLorda / valore) * 100;
      },
      roiNetto: (data, calculations) => {
        const renditaNetta = calculations.renditaNetta || 0;
        const valore = Number(data.valoreAttuale) || Number(data.valore) || 1;
        return (renditaNetta / valore) * 100;
      },
      capitalGain: (data) => {
        const valoreAttuale = Number(data.valoreAttuale) || Number(data.valore) || 0;
        const valoreAcquisto = Number(data.valore) || 0;
        return valoreAttuale - valoreAcquisto;
      },
      capitalGainPercent: (data, calculations) => {
        const capitalGain = calculations.capitalGain || 0;
        const valoreAcquisto = Number(data.valore) || 1;
        return (capitalGain / valoreAcquisto) * 100;
      }
    }
  },

  // ==================== 2. OBBLIGAZIONI ====================
  obbligazioni: {
    label: 'Obbligazione',
    icon: '📜',
    sections: ['identificazione', 'valori', 'cedola', 'costi', 'tasse', 'performance'],
    fields: {
      // Identificazione
      titolo: { type: 'text', label: 'Nome', required: true, section: 'identificazione' },
      isin: { type: 'text', label: 'ISIN', required: true, section: 'identificazione' },
      tipologia: { type: 'select', label: 'Tipologia', options: ['BTP', 'BOT', 'CCT', 'Corporate', 'Esteri'], section: 'identificazione' },
      emittente: { type: 'text', label: 'Emittente', section: 'identificazione' },
      
      // Valori
      valoreNominale: { type: 'number', label: 'Valore nominale (€)', min: 0, required: true, section: 'valori' },
      prezzoAcquisto: { type: 'number', label: 'Prezzo acquisto (€)', min: 0, required: true, section: 'valori' },
      valore: { type: 'number', label: 'Valore attuale (€)', min: 0, required: true, section: 'valori' },
      quantita: { type: 'number', label: 'Quantità', min: 0, default: 1, section: 'valori' },
      scadenza: { type: 'date', label: 'Data scadenza', required: true, section: 'valori' },
      
      // Cedola
      tipoCedola: { type: 'select', label: 'Tipo cedola', options: ['fissa', 'variabile', 'zero-coupon'], section: 'cedola' },
      tassoInteresse: { type: 'number', label: 'Tasso cedola (%)', min: 0, max: 100, section: 'cedola' },
      frequenzaCedola: { type: 'select', label: 'Frequenza cedola', options: ['mensile', 'trimestrale', 'semestrale', 'annuale'], section: 'cedola', default: 'semestrale' },
      prossimaCedola: { type: 'date', label: 'Prossima cedola', section: 'cedola' },
      generaCashflow: { type: 'checkbox', label: 'Genera entrata automatica', section: 'cedola' },
      
      // Costi
      commissioniAcquisto: { type: 'number', label: 'Commissioni acquisto (€)', min: 0, section: 'costi' },
      bolloAnnuo: { type: 'number', label: 'Bollo annuo (€)', min: 0, section: 'costi' },
      
      // Tassazione
      tassazioneCedole: { type: 'number', label: 'Tassazione cedole (%)', min: 0, max: 100, section: 'tasse', default: 12.5 },
      tassazioneCapitalGain: { type: 'number', label: 'Tassazione capital gain (%)', min: 0, max: 100, section: 'tasse', default: 12.5 },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      importoCedola: (data) => {
        const nominale = Number(data.valoreNominale) || 0;
        const tasso = Number(data.tassoInteresse) || 0;
        const freq = data.frequenzaCedola || 'semestrale';
        const freqMap = { mensile: 12, trimestrale: 4, semestrale: 2, annuale: 1 };
        return (nominale * tasso / 100) / (freqMap[freq] || 2);
      },
      cedoleAnnueLorde: (data, calculations) => {
        const nominale = Number(data.valoreNominale) || 0;
        const quantita = Number(data.quantita) || 1;
        const tasso = Number(data.tassoInteresse) || 0;
        return (nominale * quantita * tasso) / 100;
      },
      cedoleAnnueNette: (data, calculations) => {
        const cedoleAnnueLorde = calculations.cedoleAnnueLorde || 0;
        const tassazione = Number(data.tassazioneCedole) || 0;
        const bolloAnnuo = Number(data.bolloAnnuo) || 0;
        return cedoleAnnueLorde * (1 - tassazione / 100) - bolloAnnuo;
      },
      rendimentoNetto: (data, calculations) => {
        const cedoleAnnueNette = calculations.cedoleAnnueNette || 0;
        const prezzoAcquisto = Number(data.prezzoAcquisto) || 1;
        return (cedoleAnnueNette / prezzoAcquisto) * 100;
      },
      capitalGain: (data) => {
        const valoreAttuale = Number(data.valore) || 0;
        const quantita = Number(data.quantita) || 1;
        const prezzoAcquisto = Number(data.prezzoAcquisto) || 0;
        return (valoreAttuale - prezzoAcquisto) * quantita;
      },
      capitalGainPercent: (data, calculations) => {
        const capitalGain = calculations.capitalGain || 0;
        const prezzoAcquisto = Number(data.prezzoAcquisto) || 1;
        const quantita = Number(data.quantita) || 1;
        return (capitalGain / (prezzoAcquisto * quantita)) * 100;
      }
    }
  },

  // ==================== 3. AZIONI ====================
  azioni: {
    label: 'Azione',
    icon: '📈',
    sections: ['identificazione', 'posizione', 'dividendi', 'costi', 'tasse', 'performance'],
    fields: {
      // Identificazione
      titolo: { type: 'text', label: 'Nome/Ticker', required: true, section: 'identificazione' },
      ticker: { type: 'text', label: 'Ticker', required: true, section: 'identificazione' },
      isin: { type: 'text', label: 'ISIN', section: 'identificazione' },
      azienda: { type: 'text', label: 'Azienda', section: 'identificazione' },
      mercato: { type: 'text', label: 'Mercato (NASDAQ, MTA...)', section: 'identificazione' },
      
      // Posizione
      quantita: { type: 'number', label: 'Quantità', min: 0, required: true, section: 'posizione' },
      prezzoMedioAcquisto: { type: 'number', label: 'Prezzo medio acquisto (€)', min: 0, required: true, section: 'posizione' },
      valore: { type: 'number', label: 'Prezzo attuale (€)', min: 0, required: true, section: 'posizione' },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'posizione' },
      
      // Dividendi
      dividendoPerAzione: { type: 'number', label: 'Dividendo per azione (€)', min: 0, section: 'dividendi' },
      frequenzaDividendi: { type: 'select', label: 'Frequenza dividendi', options: ['mensile', 'trimestrale', 'semestrale', 'annuale'], section: 'dividendi', default: 'annuale' },
      dataStaccoDividendo: { type: 'date', label: 'Data stacco dividendo', section: 'dividendi' },
      generaCashflow: { type: 'checkbox', label: 'Genera entrata automatica', section: 'dividendi' },
      
      // Costi
      commissioniAcquisto: { type: 'number', label: 'Commissioni acquisto (€)', min: 0, section: 'costi' },
      commissioniVendita: { type: 'number', label: 'Commissioni vendita (€)', min: 0, section: 'costi' },
      bolloAnnuo: { type: 'number', label: 'Bollo annuo (€)', min: 0, section: 'costi' },
      
      // Tassazione
      tassazioneDividendi: { type: 'number', label: 'Tassazione dividendi (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      tassazioneCapitalGain: { type: 'number', label: 'Tassazione capital gain (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      dividendiAnnuiLordi: (data) => {
        const quantita = Number(data.quantita) || 0;
        const dividendo = Number(data.dividendoPerAzione) || 0;
        const freq = data.frequenzaDividendi || 'annuale';
        const freqMap = { mensile: 12, trimestrale: 4, semestrale: 2, annuale: 1 };
        return quantita * dividendo * (freqMap[freq] || 1);
      },
      dividendiAnnuiNetti: (data, calculations) => {
        const dividendiLordi = calculations.dividendiAnnuiLordi || 0;
        const tassazione = Number(data.tassazioneDividendi) || 0;
        return dividendiLordi * (1 - tassazione / 100);
      },
      dividendYield: (data) => {
        const dividendo = Number(data.dividendoPerAzione) || 0;
        const prezzo = Number(data.valore) || 1;
        return (dividendo / prezzo) * 100;
      },
      plusvalenzaNonRealizzata: (data) => {
        const quantita = Number(data.quantita) || 0;
        const valoreAttuale = Number(data.valore) || 0;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 0;
        return (valoreAttuale - prezzoAcquisto) * quantita;
      },
      plusvalenzaPercent: (data, calculations) => {
        const plusvalenza = calculations.plusvalenzaNonRealizzata || 0;
        const quantita = Number(data.quantita) || 1;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 1;
        return (plusvalenza / (prezzoAcquisto * quantita)) * 100;
      },
      roiTotale: (data, calculations) => {
        const plusvalenza = calculations.plusvalenzaNonRealizzata || 0;
        const dividendi = calculations.dividendiAnnuiNetti || 0;
        const quantita = Number(data.quantita) || 1;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 1;
        const investimentoIniziale = prezzoAcquisto * quantita;
        return ((plusvalenza + dividendi) / investimentoIniziale) * 100;
      }
    }
  },

  // ==================== 4. ETF ====================
  etf: {
    label: 'ETF',
    icon: '🌐',
    sections: ['identificazione', 'posizione', 'caratteristiche', 'costi', 'tasse', 'performance'],
    fields: {
      titolo: { type: 'text', label: 'Nome ETF', required: true, section: 'identificazione' },
      ticker: { type: 'text', label: 'Ticker', required: true, section: 'identificazione' },
      isin: { type: 'text', label: 'ISIN', section: 'identificazione' },
      indiceReplicato: { type: 'text', label: 'Indice replicato', section: 'identificazione' },
      tipologia: { type: 'select', label: 'Tipologia', options: ['azionario', 'obbligazionario', 'bilanciato', 'commodities'], section: 'identificazione' },
      
      quantita: { type: 'number', label: 'Quantità quote', min: 0, required: true, section: 'posizione' },
      prezzoMedioAcquisto: { type: 'number', label: 'Prezzo medio acquisto (€)', min: 0, required: true, section: 'posizione' },
      valore: { type: 'number', label: 'NAV attuale (€)', min: 0, required: true, section: 'posizione' },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'posizione' },

      ter: { type: 'number', label: 'TER (%)', min: 0, max: 5, section: 'caratteristiche' },
      metodologiaReplica: { type: 'select', label: 'Replica', options: ['fisica', 'sintetica'], section: 'caratteristiche' },
      distribuzioneDividendi: { type: 'select', label: 'Distribuzione', options: ['accumulazione', 'distribuzione'], section: 'caratteristiche' },
      
      commissioniAcquisto: { type: 'number', label: 'Commissioni acquisto (€)', min: 0, section: 'costi' },
      bolloAnnuo: { type: 'number', label: 'Bollo annuo (€)', min: 0, section: 'costi' },
      
      tassazioneDividendi: { type: 'number', label: 'Tassazione dividendi (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      tassazioneCapitalGain: { type: 'number', label: 'Tassazione capital gain (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      costoGestioneAnnuo: (data) => {
        const valore = Number(data.valore) || 0;
        const ter = Number(data.ter) || 0;
        return (valore * ter) / 100;
      },
      costiGestioneTotali: (data, calculations) => {
        const costoGestione = calculations.costoGestioneAnnuo || 0;
        const bolloAnnuo = Number(data.bolloAnnuo) || 0;
        return costoGestione + bolloAnnuo;
      },
      plusvalenzaNonRealizzata: (data) => {
        const quantita = Number(data.quantita) || 0;
        const valoreAttuale = Number(data.valore) || 0;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 0;
        return (valoreAttuale - prezzoAcquisto) * quantita;
      },
      plusvalenzaPercent: (data, calculations) => {
        const plusvalenza = calculations.plusvalenzaNonRealizzata || 0;
        const quantita = Number(data.quantita) || 1;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 1;
        return (plusvalenza / (prezzoAcquisto * quantita)) * 100;
      }
    }
  },

  // ==================== 5. CONTI DEPOSITO ====================
  conti: {
    label: 'Conto Deposito',
    icon: '💰',
    sections: ['base', 'deposito', 'interessi', 'costi', 'tasse', 'rendimento'],
    fields: {
      titolo: { type: 'text', label: 'Nome banca', required: true, section: 'base' },
      nomeBanca: { type: 'text', label: 'Banca', required: true, section: 'base' },
      tipoConto: { type: 'select', label: 'Tipo conto', options: ['vincolato', 'libero', 'svincolabile'], section: 'base' },
      
      valore: { type: 'number', label: 'Capitale (€)', min: 0, required: true, section: 'deposito' },
      tassoInteresse: { type: 'number', label: 'Tasso interesse lordo (%)', min: 0, max: 100, section: 'deposito', default: 3.5 },
      durataVincolo: { type: 'number', label: 'Durata vincolo (mesi)', min: 0, section: 'deposito' },
      dataApertura: { type: 'date', label: 'Data apertura', section: 'deposito' },
      dataScadenza: { type: 'date', label: 'Data scadenza', section: 'deposito' },
      
      frequenzaLiquidazione: { type: 'select', label: 'Frequenza liquidazione', options: ['mensile', 'trimestrale', 'semestrale', 'annuale', 'a scadenza'], section: 'interessi', default: 'annuale' },
      interessiMaturati: { type: 'number', label: 'Interessi maturati (€)', min: 0, section: 'interessi' },
      generaCashflow: { type: 'checkbox', label: 'Genera entrata automatica', section: 'interessi' },
      
      speseGestione: { type: 'number', label: 'Spese gestione annue (€)', min: 0, section: 'costi', default: 0 },
      impostaBollo: { type: 'number', label: 'Imposta bollo annua (€)', min: 0, section: 'costi', default: 34.20 },
      
      tassazioneInteressi: { type: 'number', label: 'Tassazione interessi (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      
      note: { type: 'textarea', label: 'Note' }
    },
    calculations: {
      interessiAnnuiLordi: (data) => {
        const capitale = Number(data.valore) || 0;
        const tasso = Number(data.tassoInteresse) || 0;
        return (capitale * tasso) / 100;
      },
      interessiAnnuiNetti: (data, calculations) => {
        const interessiLordi = calculations.interessiAnnuiLordi || 0;
        const tassazione = Number(data.tassazioneInteressi) || 0;
        const bollo = Number(data.impostaBollo) || 0;
        const spese = Number(data.speseGestione) || 0;
        return interessiLordi * (1 - tassazione / 100) - bollo - spese;
      },
      rendimentoEffettivo: (data, calculations) => {
        const interessiNetti = calculations.interessiAnnuiNetti || 0;
        const capitale = Number(data.valore) || 1;
        return (interessiNetti / capitale) * 100;
      },
      capitaleAScadenza: (data, calculations) => {
        const capitale = Number(data.valore) || 0;
        const interessiNetti = calculations.interessiAnnuiNetti || 0;
        return capitale + interessiNetti;
      }
    }
  },

  // ==================== 6. CRYPTO ====================
  crypto: {
    label: 'Cryptocurrency',
    icon: '₿',
    sections: ['identificazione', 'posizione', 'staking', 'costi', 'tasse', 'performance'],
    fields: {
      titolo: { type: 'text', label: 'Nome Crypto', required: true, section: 'identificazione' },
      simbolo: { type: 'text', label: 'Simbolo', required: true, section: 'identificazione' },
      nome: { type: 'text', label: 'Nome completo', section: 'identificazione' },
      blockchain: { type: 'text', label: 'Blockchain', section: 'identificazione' },
      
      quantita: { type: 'number', label: 'Quantità', min: 0, required: true, section: 'posizione', step: 0.00000001 },
      prezzoMedioAcquisto: { type: 'number', label: 'Prezzo medio acquisto (€)', min: 0, required: true, section: 'posizione' },
      valore: { type: 'number', label: 'Prezzo attuale (€)', min: 0, required: true, section: 'posizione' },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'posizione' },
      
      inStaking: { type: 'checkbox', label: 'In staking', section: 'staking' },
      quantitaStakingata: { type: 'number', label: 'Quantità stakingata', min: 0, section: 'staking', step: 0.00000001 },
      apyStaking: { type: 'number', label: 'APY Staking (%)', min: 0, max: 1000, section: 'staking' },
      ricompendeStaking: { type: 'number', label: 'Ricompense accumulate', min: 0, section: 'staking' },
      
      commissioniAcquisto: { type: 'number', label: 'Commissioni acquisto (€)', min: 0, section: 'costi' },
      commissioniNetwork: { type: 'number', label: 'Network fees (€)', min: 0, section: 'costi' },
      custodiaExchange: { type: 'number', label: 'Custodia annua (€)', min: 0, section: 'costi' },
      
      tassazioneCapitalGain: { type: 'number', label: 'Tassazione capital gain (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      tassazioneStaking: { type: 'number', label: 'Tassazione staking (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      sogliaEsenzione: { type: 'number', label: 'Soglia esenzione (€)', min: 0, section: 'tasse', default: 2000 },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      plusvalenzaNonRealizzata: (data) => {
        const quantita = Number(data.quantita) || 0;
        const valoreAttuale = Number(data.valore) || 0;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 0;
        return (valoreAttuale - prezzoAcquisto) * quantita;
      },
      plusvalenzaPercent: (data, calculations) => {
        const plusvalenza = calculations.plusvalenzaNonRealizzata || 0;
        const quantita = Number(data.quantita) || 1;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 1;
        return (plusvalenza / (prezzoAcquisto * quantita)) * 100;
      },
      ricompendeAnnueStaking: (data) => {
        const quantita = Number(data.quantitaStakingata) || 0;
        const apy = Number(data.apyStaking) || 0;
        return (quantita * apy) / 100;
      },
      roiTotale: (data, calculations) => {
        const plusvalenza = calculations.plusvalenzaNonRealizzata || 0;
        const ricompense = calculations.ricompendeAnnueStaking || 0;
        const quantita = Number(data.quantita) || 1;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 1;
        const investimentoIniziale = prezzoAcquisto * quantita;
        return ((plusvalenza + ricompense) / investimentoIniziale) * 100;
      }
    }
  },

  // ==================== 7. METALLI PREZIOSI ====================
  metalli: {
    label: 'Metallo Prezioso',
    icon: '🥇',
    sections: ['identificazione', 'posizione', 'custodia', 'costi', 'tasse', 'performance'],
    fields: {
      titolo: { type: 'text', label: 'Nome', required: true, section: 'identificazione' },
      metallo: { type: 'select', label: 'Metallo', options: ['oro', 'argento', 'platino', 'palladio'], required: true, section: 'identificazione', default: 'oro' },
      forma: { type: 'select', label: 'Forma', options: ['lingotti', 'monete', 'gioielli', 'ETF/ETC'], section: 'identificazione' },
      purezza: { type: 'text', label: 'Purezza (es. 999.9)', section: 'identificazione' },
      
      quantita: { type: 'number', label: 'Quantità', min: 0, required: true, section: 'posizione', default: 0 },
      unitaMisura: { type: 'select', label: 'Unità', options: ['grammi', 'kg', 'once_troy'], section: 'posizione', default: 'grammi' },
      prezzoMedioAcquisto: { type: 'number', label: 'Prezzo medio (€)', min: 0, required: true, section: 'posizione', default: 0 },
      valore: { type: 'number', label: 'Valore attuale (€)', min: 0, required: true, section: 'posizione', default: 0 },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'posizione' },
      
      luogoCustodia: { type: 'select', label: 'Luogo custodia', options: ['casa', 'cassetta_sicurezza', 'caveau', 'digitale'], section: 'custodia' },
      certificatoAutenticita: { type: 'checkbox', label: 'Certificato autenticità', section: 'custodia' },
      
      commissioniAcquisto: { type: 'number', label: 'Commissioni acquisto (€)', min: 0, section: 'costi' },
      costoCustodiaAnnuo: { type: 'number', label: 'Custodia annua (€)', min: 0, section: 'costi' },
      assicurazione: { type: 'number', label: 'Assicurazione annua (€)', min: 0, section: 'costi' },
      
      tassazioneCapitalGain: { type: 'number', label: 'Tassazione capital gain (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      valoreInvestimento: (data) => {
        const quantita = Number(data.quantita) || 0;
        const prezzo = Number(data.prezzoMedioAcquisto) || 0;
        return quantita * prezzo;
      },
      plusvalenza: (data) => {
        const quantita = Number(data.quantita) || 0;
        const valoreAttuale = Number(data.valore) || 0;
        const prezzoAcquisto = Number(data.prezzoMedioAcquisto) || 0;
        return (valoreAttuale - prezzoAcquisto) * quantita;
      },
      plusvalenzaPercent: (data, calculations) => {
        const plusvalenza = calculations.plusvalenza || 0;
        const investimento = calculations.valoreInvestimento || 1;
        return (plusvalenza / investimento) * 100;
      },
      costiGestioneAnnui: (data) => {
        const custodia = Number(data.costoCustodiaAnnuo) || 0;
        const assicurazione = Number(data.assicurazione) || 0;
        return custodia + assicurazione;
      },
      roiNetto: (data, calculations) => {
        const plusvalenza = calculations.plusvalenza || 0;
        const costiAnnui = calculations.costiGestioneAnnui || 0;
        const investimento = calculations.valoreInvestimento || 1;
        return ((plusvalenza - costiAnnui) / investimento) * 100;
      }
    }
  },

  // ==================== 8. FONDI COMUNI ====================
  fondi: {
    label: 'Fondo Comune',
    icon: '🏦',
    sections: ['identificazione', 'posizione', 'costi', 'tasse', 'performance'],
    fields: {
      titolo: { type: 'text', label: 'Nome fondo', required: true, section: 'identificazione' },
      isin: { type: 'text', label: 'ISIN', required: true, section: 'identificazione' },
      nomeFondo: { type: 'text', label: 'Nome completo', section: 'identificazione' },
      societaGestione: { type: 'text', label: 'Società gestione', section: 'identificazione' },
      categoria: { type: 'select', label: 'Categoria', options: ['azionario', 'obbligazionario', 'bilanciato', 'flessibile'], section: 'identificazione' },
      
      quantitaQuote: { type: 'number', label: 'Quantità quote', min: 0, required: true, section: 'posizione' },
      valore: { type: 'number', label: 'NAV attuale (€)', min: 0, required: true, section: 'posizione' },
      prezzoMedioAcquisto: { type: 'number', label: 'Prezzo medio acquisto (€)', min: 0, required: true, section: 'posizione' },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'posizione' },
      
      commissioniIngresso: { type: 'number', label: 'Commissione ingresso (%)', min: 0, max: 5, section: 'costi', default: 0 },
      commissioniUscita: { type: 'number', label: 'Commissione uscita (%)', min: 0, max: 5, section: 'costi', default: 0 },
      commissioniGestione: { type: 'number', label: 'Commissione gestione (%)', min: 0, max: 3, section: 'costi' },
      commissioniPerformance: { type: 'number', label: 'Commissione performance (%)', min: 0, max: 30, section: 'costi', default: 0 },
      
      tassazioneCapitalGain: { type: 'number', label: 'Tassazione capital gain (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      tassazioneDividendi: { type: 'number', label: 'Tassazione dividendi (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      costiTotaliAnnui: (data) => {
        const valorePositone = (Number(data.valore) || 0) * (Number(data.quantitaQuote) || 0);
        const commissione = Number(data.commissioniGestione) || 0;
        return (valorePositone * commissione) / 100;
      },
      plusvalenzaNonRealizzata: (data) => {
        const quantita = Number(data.quantitaQuote) || 0;
        const navAttuale = Number(data.valore) || 0;
        const navAcquisto = Number(data.prezzoMedioAcquisto) || 0;
        return (navAttuale - navAcquisto) * quantita;
      },
      plusvalenzaPercent: (data, calculations) => {
        const plusvalenza = calculations.plusvalenzaNonRealizzata || 0;
        const quantita = Number(data.quantitaQuote) || 1;
        const navAcquisto = Number(data.prezzoMedioAcquisto) || 1;
        return (plusvalenza / (navAcquisto * quantita)) * 100;
      }
    }
  },

  // ==================== 9. POLIZZE ASSICURATIVE ====================
  polizze: {
    label: 'Polizza Assicurativa',
    icon: '🛡️',
    sections: ['identificazione', 'condizioni', 'versamenti', 'costi', 'tasse', 'performance'],
    fields: {
      titolo: { type: 'text', label: 'Descrizione', required: true, section: 'identificazione' },
      tipoPolizza: { type: 'select', label: 'Tipo', options: ['vita', 'unit_linked', 'rivalutabile', 'caso_morte'], required: true, section: 'identificazione' },
      compagnia: { type: 'text', label: 'Compagnia', required: true, section: 'identificazione' },
      numeroPolizza: { type: 'text', label: 'Numero polizza', section: 'identificazione' },
      
      capitaleAssicurato: { type: 'number', label: 'Capitale assicurato (€)', min: 0, section: 'condizioni' },
      valore: { type: 'number', label: 'Totale versato (€)', min: 0, required: true, section: 'condizioni' },
      valoreRiscatto: { type: 'number', label: 'Valore riscatto (€)', min: 0, section: 'condizioni' },
      scadenza: { type: 'date', label: 'Scadenza', section: 'condizioni' },
      
      tipoPremio: { type: 'select', label: 'Tipo premio', options: ['unico', 'ricorrente'], section: 'versamenti' },
      importoPremio: { type: 'number', label: 'Importo premio (€)', min: 0, section: 'versamenti' },
      frequenzaPremio: { type: 'select', label: 'Frequenza', options: ['mensile', 'trimestrale', 'annuale'], section: 'versamenti' },
      
      costiCaricamento: { type: 'number', label: 'Caricamento (%)', min: 0, max: 20, section: 'costi' },
      costiGestione: { type: 'number', label: 'Gestione annua (%)', min: 0, max: 10, section: 'costi' },
      penaleRiscatto: { type: 'number', label: 'Penale riscatto (%)', min: 0, max: 100, section: 'costi' },
      
      rendimentoStimato: { type: 'number', label: 'Rendimento stimato (%)', min: 0, max: 50, section: 'tasse' },
      tassazioneRendimenti: { type: 'number', label: 'Tassazione (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      roiEffettivo: (data) => {
        const valoreRiscatto = Number(data.valoreRiscatto) || 0;
        const premioPagato = Number(data.valore) || 1;
        return ((valoreRiscatto - premioPagato) / premioPagato) * 100;
      },
      rendimentoNetto: (data) => {
        const rendimento = Number(data.rendimentoStimato) || 0;
        const costi = Number(data.costiGestione) || 0;
        const tassazione = Number(data.tassazioneRendimenti) || 0;
        const rendLordo = rendimento - costi;
        return rendLordo * (1 - tassazione / 100);
      }
    }
  },

  // ==================== 10. INVESTIMENTI ALTERNATIVI ====================
  alternativi: {
    label: 'Investimento Alternativo',
    icon: '🚀',
    sections: ['identificazione', 'posizione', 'caratteristiche', 'costi', 'tasse', 'performance'],
    fields: {
      titolo: { type: 'text', label: 'Nome investimento', required: true, section: 'identificazione' },
      tipoInvestimento: { type: 'select', label: 'Tipo', options: ['startup', 'crowdfunding', 'P2P_lending', 'arte', 'vini', 'altro'], required: true, section: 'identificazione' },
      piattaforma: { type: 'text', label: 'Piattaforma', section: 'identificazione' },
      
      valore: { type: 'number', label: 'Importo investito (€)', min: 0, required: true, section: 'posizione' },
      valoreAttuale: { type: 'number', label: 'Valore stimato (€)', min: 0, section: 'posizione' },
      dataInvestimento: { type: 'date', label: 'Data investimento', section: 'posizione' },
      quota: { type: 'number', label: 'Quota posseduta (%)', min: 0, max: 100, section: 'posizione' },
      
      livelloRischio: { type: 'select', label: 'Livello rischio', options: ['basso', 'medio', 'alto', 'molto_alto'], section: 'caratteristiche' },
      liquidita: { type: 'select', label: 'Liquidità', options: ['alta', 'media', 'bassa', 'nulla'], section: 'caratteristiche' },
      orizzonteTemporale: { type: 'text', label: 'Orizzonte temporale', section: 'caratteristiche' },
      
      cashflowRicorrente: { type: 'number', label: 'Cashflow ricorrente (€)', min: 0, section: 'costi' },
      frequenzaCashflow: { type: 'select', label: 'Frequenza', options: ['mensile', 'trimestrale', 'annuale', 'una tantum'], section: 'costi' },
      commissioniPiattaforma: { type: 'number', label: 'Commissioni piattaforma (€)', min: 0, section: 'costi' },
      costiGestione: { type: 'number', label: 'Costi gestione (€)', min: 0, section: 'costi' },
      
      tassazione: { type: 'number', label: 'Tassazione (%)', min: 0, max: 100, section: 'tasse', default: 26 },
      deducibilita: { type: 'number', label: 'Deducibilità (%)', min: 0, max: 100, section: 'tasse' },
      
      note: { type: 'textarea', label: 'Note', section: 'performance' }
    },
    calculations: {
      roiAttuale: (data) => {
        const valoreAttuale = Number(data.valoreAttuale) || 0;
        const investito = Number(data.valore) || 1;
        return ((valoreAttuale - investito) / investito) * 100;
      },
      profittoNettoStimato: (data, calculations) => {
        const roiAttuale = calculations.roiAttuale || 0;
        const investito = Number(data.valore) || 0;
        return (investito * roiAttuale) / 100;
      }
    }
  },

  // ==================== 11. BUONI FRUTTIFERI ====================
  buoni: {
    label: 'Buono Fruttifero',
    icon: '🎟️',
    sections: ['base', 'performance'],
    fields: {
      // Dati base
      titolo: { type: 'text', label: 'Descrizione buono', required: true, section: 'base' },
      importo: { type: 'number', label: 'Importo (€)', min: 0, required: true, section: 'base' },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'base' },
      dataScadenza: { type: 'date', label: 'Data scadenza', required: true, section: 'base' },
      tassoInteresse: { type: 'number', label: 'Tasso interesse (%)', min: 0, max: 100, section: 'base' },
      generaCashflow: { type: 'checkbox', label: 'Genera entrata automatica', section: 'base' },
      note: { type: 'textarea', label: 'Note', section: 'base' }
    },
    calculations: {
      renditaAnnua: (data) => {
        const importo = Number(data.importo) || 0;
        const tasso = Number(data.tassoInteresse) || 0;
        return (importo * tasso) / 100;
      },
      roiAnnuo: (data, calculations) => {
        const renditaAnnua = calculations.renditaAnnua || 0;
        const importo = Number(data.importo) || 1;
        return (renditaAnnua / importo) * 100;
      }
    }
  },

  // ==================== 12. INVESTIMENTI A BASSO RISCHIO ====================
  bassoRischio: {
    label: 'Investimento Basso Rischio',
    icon: '🛡️',
    sections: ['base', 'performance'],
    fields: {
      // Dati base
      titolo: { type: 'text', label: 'Nome investimento', required: true, section: 'base' },
      valore: { type: 'number', label: 'Valore investito (€)', min: 0, required: true, section: 'base' },
      valoreAttuale: { type: 'number', label: 'Valore attuale (€)', min: 0, section: 'base' },
      dataAcquisto: { type: 'date', label: 'Data acquisto', section: 'base' },
      tipologia: { type: 'select', label: 'Tipologia', options: ['bot', 'cct', 'conto deposito', 'fondi monetari', 'altro'], section: 'base' },
      tassoAnnuale: { type: 'number', label: 'Tasso annuale (%)', min: 0, max: 100, section: 'base' },
      generaCashflow: { type: 'checkbox', label: 'Genera entrata automatica', section: 'base' },
      note: { type: 'textarea', label: 'Note', section: 'base' }
    },
    calculations: {
      renditaAnnua: (data) => {
        const investito = Number(data.valore) || 0;
        const tasso = Number(data.tassoAnnuale) || 0;
        return (investito * tasso) / 100;
      },
      roiAttuale: (data) => {
        const valoreAttuale = Number(data.valoreAttuale) || Number(data.valore) || 0;
        const investito = Number(data.valore) || 1;
        return ((valoreAttuale - investito) / investito) * 100;
      }
    }
  }
};

/**
 * Get section configuration
 */
export const getSectionConfig = (assetType, sectionName) => {
  const config = ASSET_FIELD_CONFIG[assetType];
  if (!config) return null;
  return {
    label: sectionName,
    fields: config.fields
  };
};

/**
 * Get all fields for an asset type
 */
export const getFieldsByAssetType = (assetType) => {
  const config = ASSET_FIELD_CONFIG[assetType];
  return config ? config.fields : {};
};

/**
 * Validate field value
 */
export const validateField = (fieldConfig, value) => {
  if (fieldConfig.required && !value) {
    return `${fieldConfig.label} è obbligatorio`;
  }
  
  if (fieldConfig.type === 'number') {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return `${fieldConfig.label} deve essere un numero`;
    }
    if (fieldConfig.min !== undefined && num < fieldConfig.min) {
      return `${fieldConfig.label} deve essere >= ${fieldConfig.min}`;
    }
    if (fieldConfig.max !== undefined && num > fieldConfig.max) {
      return `${fieldConfig.label} deve essere <= ${fieldConfig.max}`;
    }
  }
  
  return null;
};

export default ASSET_FIELD_CONFIG;
