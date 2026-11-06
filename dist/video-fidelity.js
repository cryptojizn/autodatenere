/* Fedeltà ai criteri del video: punti espliciti, dati mancanti mai promossi.
 * Non è una probabilità di guasto o una percentuale di affidabilità.
 * Totale 100 punti per ciascuna delle tre famiglie di alimentazione.
 */
function videoFidelity(x) {
  const rules=[];
  const rule=(label,weight,state,detail)=>rules.push({label,weight,state,detail});
  const yes='pass',no='fail',unknown='unknown';
  const cylinderOk=x.fuel==='Benzina'?x.cyl>=4:x.cyl===4;
  rule('Numero di cilindri',10,cylinderOk?yes:no,`${x.cyl} cilindri; almeno quattro nel profilo generale, quattro nei profili diesel e full hybrid descritti.`);
  const litres=x.cc;
  const nominalLitres=Math.round(litres*10)/10;
  const hybrid25=x.fuel==='Full hybrid'&&x.hybrid==='HSD'&&litres===2.5;
  const inBand=x.fuel==='Diesel'?(nominalLitres>=1.6&&nominalLitres<=2):(nominalLitres>=1.4&&nominalLitres<=2)||hybrid25;
  const ambiguousDisplacement=/\d[.,]\d\s*\/\s*\d[.,]\d/.test(x.engine);
  rule('Cilindrata',10,ambiguousDisplacement?unknown:inBand?yes:no,ambiguousDisplacement?'La riga comprende cilindrate differenti: identificare prima la variante esatta.':hybrid25?'2.5 L: eccezione nominata nel capitolo full hybrid.':x.fuel==='Diesel'?`${litres.toFixed(3)} L reali; fascia nominale arrotondata al decimo. Profilo diesel 1.6–2.0 L, con requisiti costruttivi da verificare.`:`${litres.toFixed(3)} L reali; fascia nominale arrotondata al decimo. Fascia generale 1.4–2.0 L.`);
  rule('Potenza specifica del termico',10,x.specificPower===null?unknown:x.specificPower<85?yes:no,x.specificPower===null?'Potenza del solo termico non confermata per questa versione.':`${x.specificPower.toFixed(1)} CV/L; soglia adottata <85 CV/L, non potenza totale del sistema ibrido.`);
  const gearboxPass=x.gearTypes.some(t=>['manual6','torque','ecvt','honda'].includes(t));
  const gearboxFail=x.gearTypes.some(t=>['manual5','drydct','wetdct','cvt'].includes(t));
  rule('Trasmissione',20,gearboxPass?yes:gearboxFail?no:unknown,x.hybrid==='Honda'?'e:HEV incluso perché citato dall’autore; rapporto fisso e frizione di collegamento, distinto da HSD.':x.trans);
  rule('Revisione meccanica matura',5,unknown,'VIN, codici componenti e modifiche del motore da riscontrare. Il solo restyling estetico non prova una revisione meccanica.');
  rule('Struttura del monoblocco',5,unknown,'Deck, materiali e margini di progetto non documentati per la specifica variante.');
  if(x.fuel==='Diesel') {
    rule('Distribuzione accessibile',15,['front_dry','front_chain'].includes(x.timingLayout)?yes:x.timingLayout==='rear_chain'?no:unknown,timingLabels[x.timingLayout]);
    rule('Pompa alta pressione',15,['cp3','denso','oil'].includes(x.pump)?yes:x.pump==='cp4'?no:unknown,pumpLabels[x.pump]);
    rule('DPF vicino alla turbina',10,x.dpf==='close'?yes:x.dpf==='underbody'?no:unknown,dpfLabels[x.dpf]);
  } else if(x.fuel==='Full hybrid') {
    const named=['HSD','Honda'].includes(x.hybrid);
    rule('Termico aspirato',10,x.asp==='Aspirato'?yes:no,x.asp);
    rule('Ciclo Atkinson',10,named?yes:unknown,named?'Architettura Atkinson della famiglia ibrida citata.':'Ciclo della specifica versione da verificare.');
    rule('Sistema ibrido citato',10,named?yes:no,x.hybrid==='Honda'?'Honda e:HEV è citata a 9:34–9:42, pur avendo una meccanica diversa dall’epicicloidale Toyota.':x.hybrid==='HSD'?'Toyota HSD / Lexus Hybrid Drive epicicloidale.':'Sistema diverso dai due esempi citati nel video.');
    rule('Distribuzione senza cinghia in olio',10,x.timing==='Catena'||x.timingLayout==='front_dry'?yes:unknown,x.timing==='Catena'?'Catena; dimensionamento e revisione restano controlli sull’esemplare.':'Tipo di distribuzione da documentare.');
  } else {
    rule('Motore aspirato',15,x.asp==='Aspirato'?yes:no,x.asp);
    rule('Iniezione MPI o doppia',15,['MPI','Doppia'].includes(x.inj)?yes:x.inj==='Diretta'?no:unknown,x.inj);
    rule('Distribuzione senza cinghia in olio',10,x.timing==='Catena'||x.timingLayout==='front_dry'?yes:unknown,x.timing==='Catena'?'Catena; revisione e manutenzione da verificare.':'La sola voce “cinghia” non documenta il funzionamento a secco.');
  }
  const score=rules.filter(r=>r.state===yes).reduce((n,r)=>n+r.weight,0);
  const missing=rules.filter(r=>r.state===unknown).reduce((n,r)=>n+r.weight,0);
  const failed=100-score-missing;
  return {score,missing,failed,coverage:100-missing,maximum:score+missing,rules};
}

function purchaseReason(x) {
  const deviations=[];
  if(x.cyl<4) deviations.push('il termico ha tre cilindri');
  if(x.fuel==='Diesel'&&x.timingLayout==='rear_chain') deviations.push('la catena è sul lato cambio');
  if(x.fuel==='Diesel'&&(Math.round(x.cc*10)/10<1.6||Math.round(x.cc*10)/10>2)) deviations.push('la cilindrata è fuori dal profilo diesel 1.6–2.0 L');
  if(x.fuel==='Benzina'&&x.asp==='Turbo') deviations.push('il benzina è turbo');
  if(x.fuel==='Benzina'&&x.inj==='Diretta') deviations.push('l’iniezione è solo diretta');
  if(x.gearTypes.includes('manual5')) deviations.push('il manuale è a cinque marce');
  if(x.fuel==='Full hybrid'&&!['HSD','Honda'].includes(x.hybrid)) deviations.push('il sistema ibrido è diverso dai due esempi citati');
  if(x.fit==='Fuori profilo stretto') return {title:'Il limite rispetto al video',text:`${x.brand} ${x.model} è qui per confronto: ${deviations.join('; ')||x.criteriaNote}. Il video non offre quindi una motivazione per preferire questa combinazione nel suo profilo stretto.`};
  if(x.fuel==='Diesel') return {title:'Perché valutarla',text:`Il ${x.engine} di ${x.brand} ${x.model} è un candidato da approfondire se percorri molti chilometri soprattutto su strada veloce. Cilindrata e quattro cilindri rientrano nella base indicata dall’autore; prima dell’acquisto servono riscontri su pompa, DPF, distribuzione e versione del cambio.`};
  if(x.hybrid==='Honda') return {title:'Perché valutarla',text:`${x.brand} ${x.model} usa il full hybrid e:HEV, citato dall’autore per città e misto: termico aspirato Atkinson e trazione assistita da motori elettrici. La trasmissione è specifica Honda, con frizione di collegamento; la citazione non la rende identica all’HSD Toyota.`};
  if(x.hybrid==='HSD') return {title:'Perché valutarla',text:`${x.brand} ${x.model} con ${x.engine} riprende la combinazione valorizzata nel video per l’uso misto: quattro cilindri aspirato Atkinson e trasmissione ibrida epicicloidale. ${x.cc===2.5?'Il 2.5 è nominato esplicitamente nel capitolo ibridi. ':''}Batteria, raffreddamento, annata e manutenzione restano da verificare sull’esemplare.`};
  return {title:'Perché valutarla',text:`${x.brand} ${x.model} con ${x.engine} ${['MPI','Doppia'].includes(x.inj)?'unisce quattro cilindri aspirato e iniezione '+(x.inj==='MPI'?'multipoint':'doppia')+', la base semplice cercata dal video per città e misto':'ha un quattro cilindri aspirato, punto di partenza del profilo benzina del video'}. ${x.specificPower!==null?`Il termico indicato sviluppa circa ${x.specificPower.toFixed(1)} CV/L. `:''}${x.cc<1.4?'La cilindrata reale è inferiore a 1.4 L; il punteggio usa la fascia nominale arrotondata al decimo. ':''}Conferma codice motore, cambio e storia manutentiva prima di scegliere.`};
}

function speedometerMarkup(x,result) {
  const ticks=Array.from({length:11},(_,i)=>{
    const angle=Math.PI+i*Math.PI/10;
    const outer=[110+86*Math.cos(angle),102+86*Math.sin(angle)];
    const inner=[110+(i%5===0?73:79)*Math.cos(angle),102+(i%5===0?73:79)*Math.sin(angle)];
    return `<line x1="${inner[0].toFixed(2)}" y1="${inner[1].toFixed(2)}" x2="${outer[0].toFixed(2)}" y2="${outer[1].toFixed(2)}"/>`;
  }).join('');
  return `<svg class="speedometer" viewBox="0 0 220 151" role="img" aria-labelledby="dial-title-${x.id}"><title id="dial-title-${x.id}">Fedeltà documentata al video di ${safe(x.brand)} ${safe(x.model)}: ${result.score} per cento. Criteri ancora da verificare: ${result.missing} punti.</title><path class="dial-track" d="M 24 102 A 86 86 0 0 1 196 102" pathLength="100"/><path class="dial-fill" d="M 24 102 A 86 86 0 0 1 196 102" pathLength="100" stroke-dasharray="${result.score} 100"/><g class="dial-ticks">${ticks}</g><g class="dial-needle" style="--needle-angle:${result.score*1.8-90}deg"><path d="M107 103 L110 34 L113 103 Z"/></g><circle class="dial-pin" cx="110" cy="102" r="6"/><text class="dial-scale" x="24" y="119" text-anchor="middle">0</text><text class="dial-scale" x="110" y="13" text-anchor="middle">50</text><text class="dial-scale" x="196" y="119" text-anchor="middle">100</text><text class="dial-value" x="110" y="136" text-anchor="middle">${result.score}<tspan class="dial-percent">%</tspan></text><text class="dial-caption" x="110" y="150" text-anchor="middle">FEDELTÀ AL VIDEO</text></svg>`;
}

function fidelityCard(x) {
  const result=videoFidelity(x),reason=purchaseReason(x);
  const stateLabels={pass:'Riscontrato',fail:'Scostamento',unknown:'Da verificare'};
  return `<section class="fidelity-block" aria-label="Fedeltà al video e motivo di scelta"><div class="fidelity-overview"><div class="dial-box">${speedometerMarkup(x,result)}</div><div class="fidelity-copy"><span class="fidelity-label">ADERENZA DOCUMENTATA</span><strong>${result.score} punti su 100</strong><p>${result.missing?`${result.missing} punti ancora da verificare.`:'Tutti i criteri del calcolo hanno un esito.'}${result.failed?` ${result.failed} punti di scostamento.`:''}</p><small>La percentuale segue i criteri del video; non misura l’affidabilità.</small></div></div><div class="buy-reason"><h4>${safe(reason.title)}</h4><p>${safe(reason.text)}</p></div><details class="fidelity-details"><summary>Come si arriva a ${result.score}% <span>＋</span></summary><p>Il calcolo assegna punti ai requisiti riscontrati nella scheda. Un dato mancante vale zero punti documentati, senza essere considerato un difetto. La corrispondenza potrebbe arrivare al ${result.maximum}% se tutti i dati mancanti risultassero favorevoli.</p><ul>${result.rules.map(r=>`<li class="fidelity-${r.state}"><span class="rule-symbol">${r.state==='pass'?'✓':r.state==='fail'?'×':'?'}</span><div><b>${safe(r.label)}</b><small>${safe(r.detail)}</small><em>${stateLabels[r.state]}</em></div><strong>${r.state==='pass'?r.weight:0}/${r.weight}</strong></li>`).join('')}</ul><p>Somma dei pesi: 100. I pesi sono una scelta editoriale del sito. Per gli ibridi, Honda e:HEV e Toyota/Lexus 2.5 sono inclusi seguendo gli esempi espliciti dell’autore; il criterio MPI è applicato al ramo benzina non ibrido. Non è un voto espresso dall’autore né una verifica del singolo VIN.</p></details></section>`;
}
