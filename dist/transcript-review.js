/* Revisione dalla trascrizione integrale ricevuta il 3 novembre 2026.
 * La compatibilità dell'architettura non certifica l'affidabilità dell'esemplare.
 * Un campo non documentato resta unknown: nessun filtro tecnico lo promuove.
 */
const reviewSources = {
  auris: ['Toyota Auris 2015 · cartella stampa europea', 'https://media.toyota.co.uk/new-toyota-auris/'],
  aurisManual: ['Toyota Auris · motori e trasmissioni', 'https://newsroom.toyota.eu/2019-new-toyota-auris/'],
  civic: ['Honda Civic 2015 · specifiche europee', 'https://hondanews.eu/eu/en/media/pressreleases/42662/2015-honda-civic'],
  civicIT: ['Honda Civic 2016 · brochure italiana', 'https://www.honda.it/content/dam/local/italy/cars/Brochures/Honda%20Civic%205%20porte%20brochure%202016.pdf'],
  tipo: ['Fiat Tipo · scheda tecnica italiana 2015', 'https://www.media.stellantis.com/uploads/it/2015/FIAT/Schede_Tecniche/151127_Fiat_Tipo_Scheda-Tecnica_ITA.pdf'],
  tipoMPI: ['Fiat Tipo · scheda 2019 con iniezione e rapporti', 'https://www.media.stellantis.com/de-de/download-model-document/72'],
  vitara: ['Suzuki Vitara · motori e cambi al lancio europeo', 'https://www.suzuki.hu/corporate/en/news/the-all-new-suzuki-vitara'],
  avensis: ['Toyota Avensis 2015 · specifiche europee', 'https://media.toyota.co.uk/new-toyota-avensis/'],
  yarisOld: ['Toyota Yaris 2014 · cartella stampa', 'https://media.toyota.co.uk/yaris-2014-future/'],
  prius: ['Toyota Prius III · specifiche del costruttore', 'https://media.toyota.co.uk/wp-content/uploads/sites/5/pdf/Prius-gen3-UK-launch-pack-2009.pdf'],
  priusPlus: ['Toyota Prius+ · cartella stampa e cronologia', 'https://media.toyota.co.uk/wp-content/uploads/sites/5/2021/03/1599224530200312MPriusfullreleaseWLTP.pdf'],
  ct: ['Lexus CT 200h 2014 · motore e sistema ibrido', 'https://newsroom.lexus.eu/2014-the-new-lexus-ct-200h/'],
  hondaHybrid: ['Honda · funzionamento e:HEV e frizione di collegamento', 'https://global.honda/en/tech/two_motor_hybrid_system_honda_eHEV/'],
  hondaRange: ['Honda · gamma europea e:HEV', 'https://hondanews.eu/it/it/cars/media/pressreleases/481436/cartella-stampa-25-anni-di-tecnologia-ibrida-honda'],
  civicHybrid: ['Honda Civic e:HEV 2022 · Atkinson a iniezione diretta', 'https://hondanews.eu/it/it/cars/media/pressreleases/372848/2022-honda-civic-ehev'],
  chr: ['Toyota C-HR 1.8 · applicazione 2ZR-FXE', 'https://global.toyota/en/newsroom/toyota/23348900.html']
};

// Non ereditare automaticamente date, cambi o potenze da un altro modello.
for (const x of data) {
  x.gearTypes = x.trans === 'e-CVT' ? ['ecvt'] : ['unknown'];
  x.timingLayout = 'unknown';
  x.pump = 'unknown';
  x.dpf = 'unknown';
  x.maturity = 'Da verificare per anno, codice motore e VIN';
  x.sources = engineSources[x.id] ? [engineSources[x.id]] : [];
  x.videoRef = x.fuel === 'Diesel' ? '11:05–14:16' : x.fuel === 'Full hybrid' ? '9:11–10:50' : '6:03–9:03';
  if (x.id >= 31) {
    x.market = {...x.market, yearFrom:null, yearTo:null};
    x.specificPower = null;
  }
  if (x.fuel === 'Diesel') {
    x.usage = 'Autostrada';
    x.criteriaNote = 'Il video richiede cinghia esterna a secco o catena anteriore ben dimensionata, pompa CP3/Denso o lubrificata dall’olio motore e DPF vicino alla turbina. Questi componenti non sono certificati per questa variante: la sola denominazione commerciale non basta.';
    x.fit = x.cc < 1.6 || x.cyl !== 4 || x.cc > 2 ? 'Fuori profilo stretto' : 'Da verificare';
    if (x.fit === 'Fuori profilo stretto') x.criteriaNote += ' Questa riga è anche fuori dalla selezione diesel 1.6–2.0 a quattro cilindri.';
    x.trans = 'Configurazione da identificare per codice cambio';
    x.note = 'Per i B47/OM654 la posizione della catena è un controllo decisivo; per EA288 il tipo di pompa e di DSG va identificato. Nessun diesel qui è dichiarato conforme a tutti i requisiti.';
  }
  if (x.hybrid === 'Honda') {
    x.fit = 'Citato nel video · Honda';
    x.gearTypes = ['honda'];
    x.trans = 'Honda e:HEV · rapporto fisso e frizione di collegamento';
    x.criteriaNote = 'Honda è citata esplicitamente a 9:34–9:42. Il sistema e:HEV usa due motori elettrici e una frizione di collegamento del termico; non usa il ripartitore epicicloidale Toyota. Incluso seguendo l’esempio dell’autore, con questa distinzione meccanica.';
    x.inj = x.cc === 2 ? 'Diretta' : 'Non verificata';
    x.sources = [reviewSources.hondaHybrid, reviewSources.hondaRange];
    if (x.cc === 2) x.sources.push(reviewSources.civicHybrid);
  }
  if (x.hybrid === 'HSD' && x.cyl === 4) {
    x.gearTypes = ['ecvt'];
    x.trans = 'e-CVT epicicloidale · HSD / Lexus Hybrid Drive';
    x.criteriaNote = 'Quattro cilindri aspirato, ciclo Atkinson e sistema ibrido con ripartitore epicicloidale: architettura descritta a 9:11–10:50. Confermare codice, annata e potenza del solo termico.';
    if (x.cc === 2.5) x.criteriaNote += ' Il 2.5 è nominato esplicitamente nel capitolo ibridi, in deroga alla fascia generale 1.4–2.0.';
    // L'applicazione del motore dei modelli aggiunti richiede una fonte specifica.
    if (x.id >= 31) x.fit = 'Da verificare';
  }
}

const setReview = (brand,model,engine,patch) => {
  for (const x of data.filter(x=>x.brand===brand && x.model===model && x.engine.includes(engine))) Object.assign(x, patch);
};
for(const x of data.filter(x=>x.fuel==='Diesel'&&(x.engine.includes('B47')||x.engine.includes('OM654')))) {
  x.timingLayout='rear_chain';
  x.fit='Fuori profilo stretto';
  x.criteriaNote='La distribuzione lato cambio si discosta dal requisito di catena anteriore espresso a 12:46–13:04. Il confronto riguarda l’accessibilità richiesta dal video, non una previsione di guasto.';
  x.sources=x.engine.includes('B47')
    ? [['Sealey VSE6121A · istruzioni del costruttore dell’attrezzo, sezione 2 (copia PDF)', 'https://www.ccw-tools.com/uploads/Media/16600.pdf']]
    : [['Daimler · introduzione OM654, distribuzione a pagina 18 (copia del manuale)', 'https://www.sprinter-rv.com/wp-content/uploads/2010/09/Introduction-of-the-Mercedes-OM654-Engine.pdf']];
}
setReview('Honda','Civic','1.8',{
  engine:'1.8 i-VTEC · R18 · 142 CV', inj:'MPI', specificPower:142/1.798,
  gearTypes:['manual6'], trans:'Manuale a 6 marce · versione selezionata',
  fit:'Coerente per architettura', sources:[reviewSources.civic,reviewSources.civicIT],
  market:{...data.find(x=>x.brand==='Honda'&&x.model==='Civic'&&x.cc===1.8).market,yearFrom:2015,yearTo:2016},
  maturity:'Restyling del modello documentato nel 2015',
  criteriaNote:'Aspirato quattro cilindri con iniezione PGM-FI, circa 79 CV/L termici. Qui è selezionato il manuale europeo a sei marce; non estendere la scheda ai CVT di altri mercati.'
});
setReview('Toyota','Corolla','1.6',{
  inj:'MPI', gearTypes:['manual6'], trans:'Manuale 6 marce · disponibilità italiana da verificare',
  criteriaNote:'Famiglia 1ZR-FAE aspirata MPI, circa 82,6 CV/L. La presenza di questa versione sul mercato italiano e l’esatto anno/cambio restano da riscontrare.',
  specificPower:132/1.598
});
// Eliminata l'associazione errata Prius 2.0 full hybrid 2019: in Europa la V generazione è plug-in.
for(let i=data.length-1;i>=0;i--) if(data[i].model==='Prius' && data[i].engine.includes('M20A')) data.splice(i,1);
const chr18=data.find(x=>x.model==='C-HR'&&x.cc===1.8);
Object.assign(chr18,{fit:'Coerente per architettura',sources:[reviewSources.chr],specificPower:null});
chr18.market={...chr18.market,yearFrom:2016,yearTo:2023};
chr18.criteriaNote='C-HR di prima generazione 1.8 2ZR-FXE: quattro cilindri aspirato Atkinson con HSD. Potenza e iniezione vanno riscontrate nella scheda dell’annata; non trasferire i 98 CV termici della Corolla a questa versione.';
// UX 250h e 300h sono due versioni distinte, non un unico motore indistinto.
setReview('Lexus','UX','2.0',{model:'UX 300h',engine:'2.0 Hybrid · UX 300h',criteriaNote:'Versione 300h con sistema full hybrid epicicloidale. Non coincide con la precedente 250h; controllare il motore esatto e il dato termico dell’annata.'});
for(const x of data.filter(x=>x.brand==='Lexus'&&x.model==='UX 300h')) usedNames[x.id]=x.model;
for(const model of ['CR-V','ZR-V']) {
  const x=data.find(x=>x.brand==='Honda'&&x.model===model);
  x.engine='2.0 e:HEV · generazione 2023';
  x.market={...x.market,yearFrom:2023,yearTo:2026};
  x.sources=[reviewSources.hondaHybrid,model==='CR-V'
    ? ['Honda CR-V 2023 · e:HEV a iniezione diretta','https://hondanews.eu/it/it/cars/media/pressreleases/447049/2023-honda-cr-v-press-kit']
    : ['Honda ZR-V 2023 · Atkinson a iniezione diretta','https://hondanews.eu/it/it/cars/media/pressreleases/441413/honda-zr-v-2023-1']];
}
// Soglia sulla potenza termica; il dato non viene copiato su C-HR o altri modelli.
data.find(x=>x.id===21).specificPower=98/1.798;
data.find(x=>x.id===22).specificPower=152/1.987;

function addReviewed(spec) {
  const id=Math.max(...data.map(x=>x.id))+1;
  const x={id,status:'Da verificare',fit:'Da verificare',fuel:'Benzina',cyl:4,asp:'Aspirato',timing:'Catena',usage:'Misto',inj:'Non verificata',hybrid:'',specificPower:null,gearTypes:['unknown'],timingLayout:'unknown',pump:'unknown',dpf:'unknown',sources:[],maturity:'Da verificare per anno/VIN',videoRef:'6:03–9:03',note:'Controllare consumi d’olio, raffreddamento, richiami e storico manutenzione.',...spec};
  x.market={yearFrom:spec.years[0],yearTo:spec.years[1],usedFrom:null,usedTo:null,usedSource:null,new:null};
  x.cc=spec.displacement/1000;
  if(spec.hp) x.specificPower=spec.hp/x.cc;
  data.push(x);usedNames[id]=x.model;usedSlugs[id]=spec.slug;photoKeys[id]=spec.photo||'';
}

addReviewed({brand:'Toyota',model:'Auris',slug:'auris',engine:'1.6 Valvematic · 1ZR-FAE · 132 CV',displacement:1598,hp:132,years:[2013,2018],inj:'MPI',gearTypes:['manual6'],trans:'Manuale a 6 marce · non Multidrive S',fit:'Coerente per architettura',sources:[reviewSources.auris,reviewSources.aurisManual],criteriaNote:'Aspirato MPI con circa 82,6 CV/L. Selezionare il manuale 6 marce; il Multidrive S è un CVT tradizionale e non un e-CVT HSD.'});
addReviewed({brand:'Toyota',model:'Avensis',slug:'avensis',engine:'1.8 Valvematic · 2ZR-FAE · 147 CV',displacement:1798,hp:147,years:[2015,2018],inj:'MPI',gearTypes:['manual6'],trans:'Manuale a 6 marce · non Multidrive S',fit:'Coerente per architettura',sources:[reviewSources.avensis],maturity:'Restyling del modello 2015',criteriaNote:'Aspirato quattro cilindri MPI, circa 81,8 CV/L. Selezionare il manuale sei marce europeo e verificare la disponibilità italiana; il CVT non è l’e-CVT HSD.'});
addReviewed({brand:'Fiat',model:'Tipo',slug:'tipo',engine:'1.4 FIRE 16V · 95 CV',displacement:1368,hp:95,years:[2015,2020],timing:'Cinghia',inj:'MPI',gearTypes:['manual6'],trans:'Manuale a 6 marce',sources:[reviewSources.tipo],criteriaNote:'Candidato economico: quattro cilindri aspirato, denominazione 1.4, 95 CV e sei marce documentati. La cilindrata reale è 1.368 cm³: leggermente sotto 1,4 L letterali. Verificare alimentazione MPI e distribuzione nel manuale specifico prima di confermare tutti i criteri.'});
brandLinks.Fiat=['https://www.fiat.it/','fiat'];
const tipoPetrol=data.find(x=>x.brand==='Fiat'&&x.fuel==='Benzina');
tipoPetrol.sources.push(reviewSources.tipoMPI);
tipoPetrol.criteriaNote='Quattro cilindri aspirato MPI e manuale sei marce documentati. Il 1.4 commerciale ha cilindrata reale di 1.368 cm³: è leggermente sotto il limite letterale di 1,4 L del video, quindi resta tra i candidati da verificare. Confermare distribuzione e codice della versione italiana.';
addReviewed({brand:'Fiat',model:'Tipo',slug:'tipo',engine:'1.6 MultiJet II · 120 CV · 6MT',displacement:1598,hp:120,years:[2015,2020],fuel:'Diesel',asp:'Turbo',timing:'Cinghia',inj:'Diretta',usage:'Autostrada',gearTypes:['manual6'],trans:'Manuale a 6 marce',sources:[reviewSources.tipo,reviewSources.tipoMPI],videoRef:'11:05–14:16',criteriaNote:'Esempio di diesel 1.6 quattro cilindri con manuale sei marce. L’apertura ai 1.6 del video è condizionata a progetto collaudato, pompa, distribuzione e DPF: questi requisiti non sono tutti riscontrati qui, quindi non è dichiarato conforme.'});
addReviewed({brand:'Suzuki',model:'Vitara',slug:'vitara',photo:'vitara',engine:'1.6 VVT · M16A · 120 CV · 6AT',displacement:1586,hp:120,years:[2015,2018],inj:'MPI',gearTypes:['torque'],trans:'Automatico 6 rapporti con convertitore',sources:[reviewSources.vitara],criteriaNote:'Aspirato quattro cilindri, circa 75,7 CV/L. La fonte Suzuki descrive il sei rapporti con lock-up. Confermare MPI e codice cambio sull’esemplare; il manuale benzina ha cinque marce e non soddisfa la preferenza per sei.'});
addReviewed({brand:'Suzuki',model:'Vitara',slug:'vitara',photo:'vitara',engine:'1.6 VVT · M16A · 120 CV · 5MT',displacement:1586,hp:120,years:[2015,2018],inj:'MPI',gearTypes:['manual5'],trans:'Manuale a 5 marce',fit:'Fuori profilo stretto',sources:[reviewSources.vitara],criteriaNote:'Motore aspirato interessante per il profilo, ma il cambio benzina manuale è a cinque marce: non soddisfa la preferenza esplicita per sei. Non significa che sia inaffidabile.'});
function addOldHybrid(brand,model,slug,engine,displacement,hp,years,sources,note,photo='') {
  addReviewed({brand,model,slug,engine,displacement,hp,years,sources,photo,fuel:'Full hybrid',hybrid:'HSD',inj:'MPI',gearTypes:['ecvt'],trans:'e-CVT epicicloidale · HSD / Lexus Hybrid Drive',fit:'Coerente per architettura',videoRef:'9:11–10:50',criteriaNote:note+' Architettura coerente; verificare batteria, EGR, raffreddamento e manutenzione del singolo esemplare.'});
}
addOldHybrid('Toyota','Auris Hybrid','auris','1.8 Hybrid · 2ZR-FXE · 99 CV termici',1798,99,[2013,2018],[reviewSources.auris],'Auris Hybrid 1.8 quattro cilindri, distinta dai benzina turbo e dal 1.6 diesel.');
addOldHybrid('Toyota','Prius III','prius','1.8 Hybrid · 2ZR-FXE · 99 CV termici',1798,99,[2009,2015],[reviewSources.prius],'Prius III 1.8 full hybrid, non plug-in; la potenza termica non coincide con i 136 CV del sistema.');
addOldHybrid('Toyota','Prius+','prius+','1.8 Hybrid · 2ZR-FXE · 99 CV termici',1798,99,[2012,2020],[reviewSources.priusPlus],'Monovolume sette posti con 1.8 HSD; verificare eventuale uso taxi e stato batteria.');
addOldHybrid('Lexus','CT 200h','ct','1.8 Hybrid · 2ZR-FXE · 99 CV termici',1798,99,[2014,2017],[reviewSources.ct],'Lexus CT 200h restyling 2014: 1.8 Atkinson e trasmissione ibrida epicicloidale.');
addOldHybrid('Toyota','Yaris Hybrid III','yaris','1.5 Hybrid · 1NZ-FXE · 75 CV termici',1497,75,[2014,2020],[reviewSources.yarisOld],'Generazione precedente a quattro cilindri: distinta dalla Yaris 2020+ a tre cilindri.','yaris');
// La foto della Yaris IV non rappresenta la III: mostrare un segnaposto, non la generazione errata.
photoKeys[data.find(x=>x.model==='Yaris Hybrid III').id]='';

const timingLabels={unknown:'Posizione / circuito non verificati',front_dry:'Cinghia esterna a secco',front_chain:'Catena anteriore',rear_chain:'Catena lato cambio'};
const pumpLabels={unknown:'Pompa non verificata',cp3:'Bosch CP3',denso:'Denso',oil:'Lubrificata da olio motore',cp4:'Bosch CP4'};
const dpfLabels={unknown:'Collocazione DPF non verificata',close:'DPF vicino alla turbina',underbody:'DPF sotto pianale'};
function reviewChecks(x) {
  const checks=[['Cilindri',x.cyl>=4?'ok':'no',`${x.cyl} cilindri`],['Potenza termica specifica',x.specificPower===null?'unknown':x.specificPower<85?'ok':'no',x.specificPower===null?'Dato da acquisire':`${x.specificPower.toFixed(1)} CV/L`]];
  checks.push(['Monoblocco / margini strutturali','unknown','Materiale, deck e margini di carico non documentati per la variante']);
  if(x.fuel==='Diesel') checks.push(['Distribuzione',x.timingLayout==='unknown'?'unknown':x.timingLayout==='rear_chain'?'no':'ok',timingLabels[x.timingLayout]],['Pompa alta pressione',x.pump==='unknown'?'unknown':x.pump==='cp4'?'no':'ok',pumpLabels[x.pump]],['DPF',x.dpf==='unknown'?'unknown':x.dpf==='close'?'ok':'no',dpfLabels[x.dpf]]);
  else checks.push(['Aspirazione',x.asp==='Aspirato'?'ok':'no',x.asp],['Iniezione',x.inj==='Non verificata'?'unknown':x.inj==='Diretta'?'no':'ok',x.inj+(x.hybrid==='Honda'?' · Honda citata separatamente':'' )]);
  checks.push(['Cambio',x.gearTypes.includes('unknown')?'unknown':x.gearTypes.includes('manual5')||x.gearTypes.includes('cvt')?'no':x.hybrid==='Honda'?'unknown':'ok',x.trans]);
  return checks;
}

function matchesReviewFilters(x,v) {
  if(v('scope')==='candidates' && x.fit==='Fuori profilo stretto') return false;
  if(v('scope')==='architecture' && !['Coerente per architettura','Citato nel video · Honda'].includes(x.fit)) return false;
  if(v('timingLayout') && x.timingLayout!==v('timingLayout')) return false;
  if(v('pump') && (x.fuel!=='Diesel'||x.pump!==v('pump'))) return false;
  if(v('dpf') && (x.fuel!=='Diesel'||x.dpf!==v('dpf'))) return false;
  if(v('maturity') && !x.maturity.startsWith('Restyling')) return false;
  return true;
}
function cardReason(x) {
  if(x.fuel==='Diesel') return x.timingLayout==='rear_chain'?'Catena lato cambio: scostamento dalla distribuzione anteriore richiesta dal video.':x.fit==='Fuori profilo stretto'?'Scostamento da cilindrata/cilindri richiesti; nessuna conformità diesel completa.':'Verifiche aperte su pompa, DPF, posizione distribuzione e cambio.';
  if(x.hybrid==='Honda') return 'Inclusa perché citata dall’autore. e:HEV e HSD hanno una meccanica diversa.';
  if(x.fit==='Coerente per architettura') return 'Architettura coerente con il passaggio del video. Restano i controlli su anno, revisione e singolo esemplare.';
  if(x.fit==='Fuori profilo stretto') return x.criteriaNote;
  return 'Candidato da approfondire: alcuni requisiti non sono ancora documentati per questa versione.';
}
function resultContext(list,v) {
  const diesel=list.filter(x=>x.fuel==='Diesel').length;
  const unknownYears=list.filter(x=>x.market.yearFrom===null).length;
  let text=v('scope')==='all'?'Sono incluse anche le architetture che si discostano dal video.':'Gli scostamenti espliciti sono nascosti. “Da verificare” non equivale a conforme.';
  if(diesel) text+=' Nessun diesel è verificato su tutti i requisiti costruttivi.';
  if(unknownYears) text+=` ${unknownYears} schede hanno annate da verificare e non superano un filtro anno.`;
  if(v('status')==='Fuori profilo stretto'&&v('scope')!=='all') text='Per mostrare gli scostamenti, scegli “Tutto, inclusi gli scostamenti” nel filtro Selezione.';
  return text;
}
function reviewedEngineSheet(x) {
  const checks=reviewChecks(x);
  return `<details class="enginesheet"><summary>Scheda motore e requisiti · ${safe(x.engine)}</summary><p class="sheetintro">${safe(x.criteriaNote)}</p><dl class="enginegrid"><div><dt>Motore / famiglia</dt><dd>${safe(x.engine)}</dd></div><div><dt>Configurazione</dt><dd>${x.cc.toFixed(3)} L · ${x.cyl} cilindri · ${safe(x.asp)}</dd></div><div><dt>Distribuzione</dt><dd>${safe(x.timing)} · ${safe(timingLabels[x.timingLayout])}</dd></div><div><dt>Fase evolutiva</dt><dd>${safe(x.maturity)}</dd></div></dl><ul class="mechanicalchecks">${checks.map(([label,state,value])=>`<li class="check-${state}"><span>${state==='ok'?'✓':state==='no'?'×':'?'}</span><div><b>${safe(label)}</b><small>${safe(value)}</small></div></li>`).join('')}</ul><p class="checklegend">✓ requisito riscontrato per l’architettura indicata · × scostamento · ? informazione da verificare. Per Honda, iniezione diretta e frizione di collegamento sono esplicitate senza cancellare la citazione dell’autore.</p><div class="engineblock"><b>Controlli sull’esemplare</b><p>${safe(x.note)} Chiedi codice P.5, VIN, codice cambio, fatture e richiami. P.5 da solo non identifica tutte le revisioni dei componenti.</p></div><div class="engineblock"><b>Fonti tecniche</b><p>${x.sources.length?x.sources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${safe(label)} ↗</a>`).join('<br>'):'Documentazione del costruttore per questa variante ancora da acquisire.'}</p><p><a href="https://youtu.be/OqmrfJRCkGc?t=${x.fuel==='Diesel'?665:x.fuel==='Full hybrid'?551:363}" target="_blank" rel="noopener noreferrer">Passaggio del video · ${safe(x.videoRef)} ↗</a></p><p>Le fonti europee possono descrivere allestimenti non venduti in Italia. Gli anni sono intervalli indicativi della variante, da confermare per mercato. Un restyling della carrozzeria non dimostra da solo una revisione del motore.</p></div></details>`;
}
