// Contagem regressiva
(function initCountdown() {
	const target = new Date('2025-11-22T16:30:00');
	const els = { d: document.getElementById('cd-days'), h: document.getElementById('cd-hours'), m: document.getElementById('cd-mins'), s: document.getElementById('cd-secs') };
	function pad(v) { return String(v).padStart(2, '0'); }
	function tick() {
		const now = new Date();
		let diff = Math.max(0, target - now);
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		diff -= days * 24 * 60 * 60 * 1000;
		const hours = Math.floor(diff / (1000 * 60 * 60));
		diff -= hours * 60 * 60 * 1000;
		const mins = Math.floor(diff / (1000 * 60));
		diff -= mins * 60 * 1000;
		const secs = Math.floor(diff / 1000);
		if (els.d) els.d.textContent = days;
		const big = document.getElementById('cd-days-big');
		if (big) big.textContent = days;
		if (els.h) els.h.textContent = pad(hours);
		if (els.m) els.m.textContent = pad(mins);
		if (els.s) els.s.textContent = pad(secs);
	}
	setInterval(tick, 1000);
	tick();
})();

// Presentes: soma inline
(function initPresentesInline(){
	const totalEl = document.getElementById('presente-total-inline');
	if (!totalEl) return;
	function atualizar(){
		let soma = 0;
		document.querySelectorAll('input[name="presente"]:checked').forEach(inp => {
			const v = +inp.getAttribute('data-valor') || 0; soma += v;
		});
		totalEl.textContent = `Valor total: R$ ${soma}`;
		atualizarPixComValor(soma);
	}
	document.querySelectorAll('input[name="presente"]').forEach(inp => {
		inp.addEventListener('change', atualizar);
		inp.addEventListener('click', atualizar);
		inp.addEventListener('touchstart', atualizar, { passive: true });
	});
	atualizar();
})();

// Atualiza Pix ao carregar
window.addEventListener('DOMContentLoaded', function(){ atualizarPixComValor(0); });

(function initAcompanhanteToggle(){
	const sel = document.getElementById('acompanha');
	const field = document.getElementById('convidado-field');
	if (!sel || !field) return;
	function sync(){ field.style.display = sel.value === 'sim' ? '' : 'none'; }
	sel.addEventListener('change', sync);
	window.addEventListener('DOMContentLoaded', sync);
	sync();
})();

// RSVP com presentes selecionados
(function initRSVP() {
	const form = document.querySelector('.rsvp-form');
	if (!form) return;
	const feedback = form.querySelector('.form-feedback');
	function setError(input, message) {
		const small = input.parentElement.querySelector('.error');
		if (small) small.textContent = message || '';
		input.setAttribute('aria-invalid', message ? 'true' : 'false');
	}
	function validate() {
		let ok = true;
		const nome = form.nome;
		const email = form.email;
		const acompanhaSel = form.acompanha;
		const convidado = document.getElementById('convidado_nome');
		setError(nome, ''); setError(email, ''); if (convidado) setError(convidado, '');
		if (!nome.value.trim()) { setError(nome, 'Informe seu nome completo.'); ok = false; }
		const em = email.value.trim();
		if (!em) { setError(email, 'Informe seu e-mail.'); ok = false; }
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError(email, 'E-mail inválido.'); ok = false; }
		if (acompanhaSel && acompanhaSel.value === 'sim') {
			if (convidado && !convidado.value.trim()) { setError(convidado, 'Informe o nome do convidado.'); ok = false; }
		}
		return ok;
	}
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!validate()) return;
		feedback.textContent = 'Enviando...';
		try {
			const checados = Array.from(document.querySelectorAll('input[name="presente"]:checked'));
			const presentes = checados.map(el=>el.value);
			const valorTotal = checados.reduce((acc,el)=>acc+(+el.getAttribute('data-valor')||0),0);
			const payload = {
				nome: form.nome.value.trim(),
				email: form.email.value.trim(),
				acompanha: form.acompanha.value,
				convidado_nome: (document.getElementById('convidado_nome')?.value || '').trim(),
				mensagem: form.mensagem.value.trim(),
				presentes: presentes && presentes.length ? presentes.join(', ') : '',
				valor_presentes: valorTotal
			};
			const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
			const data = await res.json().catch(() => ({ ok: false }));
			if (!res.ok || !data.ok) throw new Error(data.message || 'Erro ao enviar');
			feedback.textContent = data.message || 'Obrigado! Sua presença foi confirmada.';
			form.reset();
			// Atualiza total após reset
			document.querySelectorAll('input[name="presente"]:checked').forEach(el=>{ el.checked=false; });
			const totalEl = document.getElementById('presente-total-inline');
			if (totalEl) totalEl.textContent = 'Valor total: R$ 0';
		} catch (err) {
			feedback.textContent = 'Ops! Tente novamente em instantes.';
		}
	});
})();

// Rolagem suave para âncoras
document.addEventListener('click', (e) => {
	const a = e.target.closest('a[href^="#"]');
	if (!a) return;
	const id = a.getAttribute('href');
	const el = document.querySelector(id);
	if (el) {
		e.preventDefault();
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
});

// Configurações do Pix (substitua pela sua chave/nome/cidade)
const PIX_KEY = '06418675142';
const PIX_MERCHANT = 'WINICIUS SILVA ROSA';
const PIX_CITY = 'CUIABA';
const PIX_TXID_PREFIX = 'CASAMENTO';

function stripDiacritics(s){
	return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function crc16(payload) {
	let polinomio = 0x1021, resultado = 0xFFFF;
	for (let i = 0; i < payload.length; i++) {
		resultado ^= payload.charCodeAt(i) << 8;
		for (let j = 0; j < 8; j++) {
			if ((resultado & 0x8000) !== 0) resultado = (resultado << 1) ^ polinomio; else resultado <<= 1;
			resultado &= 0xFFFF;
		}
	}
	return (resultado >>> 0).toString(16).toUpperCase().padStart(4, '0');
}
function emv(id, valor) {
	const v = String(valor);
	return id + String(v.length).padStart(2, '0') + v;
}
function gerarPixBRCode({ key, name, city, amount, txid }) {
	const nm = stripDiacritics(String(name||'').toUpperCase()).slice(0,25) || 'RECEBEDOR';
	const ct = stripDiacritics(String(city||'').toUpperCase()).slice(0,15) || 'CIDADE';
	const amRaw = Number(amount)||0;
	const am = amRaw < 1 ? 1 : amRaw; // valor mínimo 1.00 para compatibilidade
	const tx = (String(txid||'CASAMENTO').toUpperCase().replace(/[^A-Z0-9]/g,'')).slice(0,25) || 'CASAMENTO';
	const payloadFormat = emv('00', '01');
	const metodo = emv('01','11'); // estático
	const merchantAccount = (function(){
		const gui = emv('00', 'br.gov.bcb.pix');
		const chave = emv('01', key);
		const conteudo = gui + chave;
		return emv('26', conteudo);
	})();
	const mcc = emv('52', '0000');
	const moeda = emv('53', '986');
	const valor = emv('54', am.toFixed(2));
	const pais = emv('58', 'BR');
	const nome = emv('59', nm);
	const cidade = emv('60', ct);
	const adicional = (function(){
		const txi = emv('05', tx);
		return emv('62', txi);
	})();
	let semCRC = payloadFormat + metodo + merchantAccount + mcc + moeda + valor + pais + nome + cidade + adicional + '6304';
	const crc = crc16(semCRC);
	return semCRC + crc;
}
function getTxidCustom() {
	// Usa nome do formulário, data e um sufixo curto
	const form = document.querySelector('.rsvp-form');
	const nome = stripDiacritics((form?.nome?.value || '').toUpperCase()).replace(/[^A-Z0-9]/g,'');
	const nomePart = (nome || 'CONVIDADO').slice(0,6);
	const d = new Date();
	const y = String(d.getFullYear());
	const m = String(d.getMonth()+1).padStart(2,'0');
	const day = String(d.getDate()).padStart(2,'0');
	const seq = String(Date.now()).slice(-3);
	let tx = `PRESENTE-${nomePart}-${y}${m}${day}-${seq}`;
	return tx.slice(0,25);
}

function atualizarPixComValor(total) {
	try{
		const chaveEl = document.getElementById('pix-chave-inline');
		const brEl = document.getElementById('pix-brcode-inline');
		const qrEl = document.getElementById('pix-qr-inline');
		if (!chaveEl || !brEl || !qrEl) return;
		const txid = getTxidCustom();
		const brcode = gerarPixBRCode({ key: PIX_KEY, name: PIX_MERCHANT, city: PIX_CITY, amount: Number(total)||0, txid });
		chaveEl.value = PIX_KEY;
		brEl.value = brcode;
		qrEl.src = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(brcode);
	} catch(err){
		console.error('Falha ao atualizar Pix:', err);
	}
}
// Botões de copiar
document.addEventListener('click', (e)=>{
	const btn1 = e.target.closest('#btn-copiar-pix-inline');
	if (btn1) {
		const chave = document.getElementById('pix-chave-inline')?.value || '';
		navigator.clipboard.writeText(chave);
		btn1.textContent = 'Copiado!';
		setTimeout(()=> btn1.textContent = 'Copiar chave', 1200);
	}
	const btn2 = e.target.closest('#btn-copiar-brcode-inline');
	if (btn2) {
		const code = document.getElementById('pix-brcode-inline')?.value || '';
		navigator.clipboard.writeText(code);
		btn2.textContent = 'Copiado!';
		setTimeout(()=> btn2.textContent = 'Copiar código Pix', 1200);
	}
});

