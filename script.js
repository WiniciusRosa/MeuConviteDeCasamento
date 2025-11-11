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
	console.log('[Presentes] Inicializando sistema de presentes...');
	const totalEl = document.getElementById('presente-total-inline');
	if (!totalEl) {
		console.error('[Presentes] ❌ Elemento presente-total-inline não encontrado!');
		return;
	}
	console.log('[Presentes] ✅ Elemento presente-total-inline encontrado');
	
	function atualizar(){
		let soma = 0;
		document.querySelectorAll('input[name="presente"]:checked').forEach(inp => {
			const valorStr = inp.getAttribute('data-valor') || '0';
			// Converter valor que pode ter vírgula ou ponto como separador decimal
			// Remove qualquer caractere não numérico exceto vírgula e ponto, depois converte
			const v = parseFloat(valorStr.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
			console.log('[Presentes] Valor encontrado:', valorStr, '→ Convertido para:', v);
			soma += v;
		});
		// Arredondar para 2 casas decimais para evitar problemas de ponto flutuante
		soma = Math.round(soma * 100) / 100;
		totalEl.textContent = `Valor total: R$ ${soma.toFixed(2).replace('.', ',')}`;
		console.log('[Presentes] Total atualizado:', soma, '(tipo:', typeof soma, ')');
		
		// Garantir que soma é sempre um número (sem vírgulas ou formatação)
		const somaNumerica = Number(soma) || 0;
		
		// Tentar atualizar o Pix, com retry se não estiver disponível
		if (typeof window.updatePixTotal === 'function') {
			console.log('[Presentes] Atualizando Pix com total:', somaNumerica);
			window.updatePixTotal(somaNumerica);
		} else {
			console.warn('[Presentes] ⚠️ Função updatePixTotal não está disponível ainda, tentando novamente...');
			// Tentar novamente após um curto delay
			setTimeout(() => {
				if (typeof window.updatePixTotal === 'function') {
					console.log('[Presentes] ✅ Função agora disponível, atualizando Pix com total:', somaNumerica);
					window.updatePixTotal(somaNumerica);
				} else {
					console.warn('[Presentes] ⚠️ Função ainda não disponível após retry');
					// Tentar mais uma vez após mais tempo
					setTimeout(() => {
						if (typeof window.updatePixTotal === 'function') {
							console.log('[Presentes] ✅ Função agora disponível (2ª tentativa), atualizando Pix:', somaNumerica);
							window.updatePixTotal(somaNumerica);
						}
					}, 500);
				}
			}, 100);
		}
	}
	document.querySelectorAll('input[name="presente"]').forEach(inp => {
		inp.addEventListener('change', atualizar);
		inp.addEventListener('click', atualizar);
		inp.addEventListener('touchstart', atualizar, { passive: true });
		// Adicionar/remover classe quando checkbox é marcado/desmarcado
		inp.addEventListener('change', function() {
			const card = this.closest('.presente-card');
			if (card) {
				if (this.checked) {
					card.classList.add('presente-selecionado');
				} else {
					card.classList.remove('presente-selecionado');
				}
			}
		});
		// Aplicar classe inicial se já estiver marcado
		if (inp.checked) {
			const card = inp.closest('.presente-card');
			if (card) {
				card.classList.add('presente-selecionado');
			}
		}
	});
	atualizar();
	
	// Verificar periodicamente se a função updatePixTotal ficou disponível e atualizar
	let tentativas = 0;
	const maxTentativas = 20; // 2 segundos total (20 * 100ms)
	const checkInterval = setInterval(() => {
		tentativas++;
		if (typeof window.updatePixTotal === 'function') {
			console.log('[Presentes] ✅ Função updatePixTotal agora está disponível! Atualizando...');
			atualizar(); // Re-calcular e atualizar
			clearInterval(checkInterval);
		} else if (tentativas >= maxTentativas) {
			console.warn('[Presentes] ⚠️ Função updatePixTotal não ficou disponível após', maxTentativas * 100, 'ms');
			clearInterval(checkInterval);
		}
	}, 100);
})();

// Atualiza Pix ao carregar
window.addEventListener('DOMContentLoaded', function(){ 
	if (typeof window.updatePixTotal === 'function') {
		window.updatePixTotal(0);
	}
});

(function initAcompanhanteToggle(){
	const sel = document.getElementById('acompanha');
	const field = document.getElementById('convidado-field');
	if (!sel || !field) {
		console.warn('[Acompanhante] Campos não encontrados');
		return;
	}
	function sync(){ 
		if (sel.value === 'sim') {
			console.log('[Acompanhante] Mostrando campo do convidado');
			// Adicionar classe para mostrar o campo
			field.classList.add('field-visible');
			field.classList.remove('field-hidden');
			// Remover o style inline para que o CSS funcione
			field.removeAttribute('style');
			// Forçar reflow para garantir que o CSS seja aplicado
			void field.offsetHeight;
			console.log('[Acompanhante] Campo exibido, display atual:', window.getComputedStyle(field).display);
		} else {
			console.log('[Acompanhante] Escondendo campo do convidado');
			field.classList.add('field-hidden');
			field.classList.remove('field-visible');
			field.style.display = 'none';
		}
	}
	sel.addEventListener('change', sync);
	// Inicializar campo com classe correta
	field.classList.add('field-hidden');
	// Garantir que rode após o DOM estar pronto
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', sync);
	} else {
		sync();
	}
})();

// Funções do modal de validação
function mostrarModalMaoVaca() {
	const modal = document.getElementById('modal-mao-vaca');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.primeiroModalMostrado = true; // Marcar que o primeiro modal foi mostrado
		window.fluxoAtivo = 'sem-presente'; // Marcar que iniciou o fluxo sem presente
	}
}
function fecharModalMaoVaca() {
	const modal = document.getElementById('modal-mao-vaca');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalMiseravel() {
	const modal = document.getElementById('modal-miseravel');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
	}
}
function fecharModalMiseravel() {
	const modal = document.getElementById('modal-miseravel');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
		window.segundoModalConfirmado = true; // Marcar que passou pelo segundo modal
	}
}
function mostrarModalVerificando() {
	const modal = document.getElementById('modal-verificando');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.terceiroModalVisto = true; // Marcar que viu o terceiro modal
	}
}
function mostrarModalObrigadoMiseravel() {
	const modal = document.getElementById('modal-obrigado-miseravel');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
	}
}
function fecharModalObrigadoMiseravel() {
	const modal = document.getElementById('modal-obrigado-miseravel');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
		window.quartoModalVisto = true; // Marcar que viu o quarto modal (último da sequência)
	}
}
function fecharModalVerificando() {
	const modal = document.getElementById('modal-verificando');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}

// Funções para modais de 1 presente abaixo de R$ 500
function mostrarModalPresenteUm1() {
	const modal = document.getElementById('modal-presente-um-1');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteUmModal1Visto = true;
		window.fluxoAtivo = 'um-presente-baixo-500'; // Marcar que iniciou o fluxo de 1 presente abaixo de R$ 500
	}
}
function fecharModalPresenteUm1() {
	const modal = document.getElementById('modal-presente-um-1');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteUm2() {
	const modal = document.getElementById('modal-presente-um-2');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteUmModal2Visto = true;
	}
}
function fecharModalPresenteUm2() {
	const modal = document.getElementById('modal-presente-um-2');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteUm3() {
	const modal = document.getElementById('modal-presente-um-3');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteUmModal3Visto = true;
	}
}
function fecharModalPresenteUm3() {
	const modal = document.getElementById('modal-presente-um-3');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteUm4() {
	const modal = document.getElementById('modal-presente-um-4');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteUmModal4Visto = true;
	}
}
function fecharModalPresenteUm4() {
	const modal = document.getElementById('modal-presente-um-4');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
		window.presenteUmModal4Visto = true;
	}
}

// Funções para modais de 2 presentes (Fluxo 3)
function mostrarModalPresenteDois1() {
	const modal = document.getElementById('modal-presente-dois-1');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteDoisModal1Visto = true;
		window.fluxoAtivo = 'dois-presentes'; // Marcar que iniciou o fluxo de 2 presentes
	}
}
function fecharModalPresenteDois1() {
	const modal = document.getElementById('modal-presente-dois-1');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteDois2() {
	const modal = document.getElementById('modal-presente-dois-2');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteDoisModal2Visto = true;
	}
}
function fecharModalPresenteDois2() {
	const modal = document.getElementById('modal-presente-dois-2');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteDois3() {
	const modal = document.getElementById('modal-presente-dois-3');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteDoisModal3Visto = true;
	}
}
function fecharModalPresenteDois3() {
	const modal = document.getElementById('modal-presente-dois-3');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteDois4() {
	const modal = document.getElementById('modal-presente-dois-4');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteDoisModal4Visto = true;
	}
}
function fecharModalPresenteDois4() {
	const modal = document.getElementById('modal-presente-dois-4');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
		window.presenteDoisModal4Visto = true;
	}
}

// Funções para modais de 3 presentes (Fluxo 4)
function mostrarModalPresenteTres1() {
	const modal = document.getElementById('modal-presente-tres-1');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteTresModal1Visto = true;
		window.fluxoAtivo = 'tres-presentes'; // Marcar que iniciou o fluxo de 3 presentes
	}
}
function fecharModalPresenteTres1() {
	const modal = document.getElementById('modal-presente-tres-1');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteTres2() {
	const modal = document.getElementById('modal-presente-tres-2');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteTresModal2Visto = true;
	}
}
function fecharModalPresenteTres2() {
	const modal = document.getElementById('modal-presente-tres-2');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteTres3() {
	const modal = document.getElementById('modal-presente-tres-3');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteTresModal3Visto = true;
	}
}
function fecharModalPresenteTres3() {
	const modal = document.getElementById('modal-presente-tres-3');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalPresenteTres4() {
	const modal = document.getElementById('modal-presente-tres-4');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.presenteTresModal4Visto = true;
	}
}
function fecharModalPresenteTres4() {
	const modal = document.getElementById('modal-presente-tres-4');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
		window.presenteTresModal4Visto = true;
	}
}

// Funções para modais de valor >= R$ 500 (Fluxo 5)
function mostrarModalValorAlto1() {
	const modal = document.getElementById('modal-valor-alto-1');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.valorAltoModal1Visto = true;
		window.fluxoAtivo = 'valor-alto'; // Marcar que iniciou o fluxo de valor alto
	}
}
function fecharModalValorAlto1() {
	const modal = document.getElementById('modal-valor-alto-1');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalValorAlto2() {
	const modal = document.getElementById('modal-valor-alto-2');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.valorAltoModal2Visto = true;
	}
}
function fecharModalValorAlto2() {
	const modal = document.getElementById('modal-valor-alto-2');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalValorAlto3() {
	const modal = document.getElementById('modal-valor-alto-3');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.valorAltoModal3Visto = true;
	}
}
function fecharModalValorAlto3() {
	const modal = document.getElementById('modal-valor-alto-3');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
function mostrarModalValorAlto4() {
	const modal = document.getElementById('modal-valor-alto-4');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		window.valorAltoModal4Visto = true;
	}
}
function fecharModalValorAlto4() {
	const modal = document.getElementById('modal-valor-alto-4');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
		window.valorAltoModal4Visto = true;
	}
}
function mostrarModalEscopiao() {
	const modal = document.getElementById('modal-escopiao');
	if (modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
	}
}
window.mostrarModalEscopiao = mostrarModalEscopiao; // Tornar global para React
function fecharModalEscopiao() {
	const modal = document.getElementById('modal-escopiao');
	if (modal) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}
}
// Event listeners do modal
document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('modal-mao-vaca');
	if (!modal) return;
	
	const btnClose = modal.querySelector('.modal-close');
	const btnEntendi = modal.querySelector('.modal-btn');
	
	if (btnClose) {
		btnClose.addEventListener('click', fecharModalMaoVaca);
	}
	if (btnEntendi) {
		btnEntendi.addEventListener('click', () => {
			fecharModalMaoVaca();
			// Scroll suave para a seção de presentes
			const presentesSection = document.getElementById('presentes');
			if (presentesSection) {
				presentesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	}
	// Fechar ao clicar no overlay (fora do modal)
	modal.addEventListener('click', function(e) {
		if (e.target === modal) {
			fecharModalMaoVaca();
		}
	});
	// Fechar com ESC
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape' && modal.style.display === 'flex') {
			fecharModalMaoVaca();
		}
	});
	
	// Event listeners do segundo modal
	const modalMiseravel = document.getElementById('modal-miseravel');
	if (modalMiseravel) {
		const btnClose2 = modalMiseravel.querySelector('.modal-close');
		const btnPaguei = modalMiseravel.querySelector('.modal-btn');
		
		if (btnClose2) {
			btnClose2.addEventListener('click', fecharModalMiseravel);
		}
		if (btnPaguei) {
			btnPaguei.addEventListener('click', () => {
				fecharModalMiseravel();
				// Resetar pixCopiado para forçar terceiro modal na próxima tentativa
				window.pixCopiado = false; // Resetar para forçar que copie Pix novamente
			});
		}
		// Fechar ao clicar no overlay
		modalMiseravel.addEventListener('click', function(e) {
			if (e.target === modalMiseravel) {
				fecharModalMiseravel();
			}
		});
	}
	
	// Event listeners do terceiro modal
	const modalVerificando = document.getElementById('modal-verificando');
	if (modalVerificando) {
		const btnClose3 = modalVerificando.querySelector('.modal-close');
		const btnTentarNovamente = modalVerificando.querySelector('.modal-btn');
		
		if (btnClose3) {
			btnClose3.addEventListener('click', fecharModalVerificando);
		}
		if (btnTentarNovamente) {
			btnTentarNovamente.addEventListener('click', () => {
				fecharModalVerificando();
				// Não marcar pixCopiado aqui, para permitir que apareça o modal de aprovação na próxima tentativa
				window.segundoModalConfirmado = false;
				// Não fazer scroll, deixa no mesmo lugar
			});
		}
		// Fechar ao clicar no overlay
		modalVerificando.addEventListener('click', function(e) {
			if (e.target === modalVerificando) {
				fecharModalVerificando();
			}
		});
	}
	
	// Event listeners do modal escopião
	const modalEscopiao = document.getElementById('modal-escopiao');
	if (modalEscopiao) {
		const btnClose4 = modalEscopiao.querySelector('.modal-close');
		const btnTenhoMais = modalEscopiao.querySelector('.modal-btn');
		
		if (btnClose4) {
			btnClose4.addEventListener('click', fecharModalEscopiao);
		}
		if (btnTenhoMais) {
			btnTenhoMais.addEventListener('click', () => {
				fecharModalEscopiao();
				// Scroll suave para a seção de presentes
				const presentesSection = document.getElementById('presentes');
				if (presentesSection) {
					presentesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			});
		}
		// Fechar ao clicar no overlay
		modalEscopiao.addEventListener('click', function(e) {
			if (e.target === modalEscopiao) {
				fecharModalEscopiao();
			}
		});
	}
	
	// Event listeners do modal obrigado miserável
	const modalObrigado = document.getElementById('modal-obrigado-miseravel');
	if (modalObrigado) {
		const btnClose5 = modalObrigado.querySelector('.modal-close');
		const btnConfirmar = modalObrigado.querySelector('.modal-btn');
		
		if (btnClose5) {
			btnClose5.addEventListener('click', fecharModalObrigadoMiseravel);
		}
		if (btnConfirmar) {
			btnConfirmar.addEventListener('click', () => {
				fecharModalObrigadoMiseravel();
				// Permitir envio após confirmação
				window.pixCopiado = true;
				// Enviar formulário automaticamente após 300ms
				setTimeout(() => {
					const form = document.querySelector('.rsvp-form');
					if (form) {
						form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
					}
				}, 300);
			});
		}
		// Fechar ao clicar no overlay
		modalObrigado.addEventListener('click', function(e) {
			if (e.target === modalObrigado) {
				fecharModalObrigadoMiseravel();
			}
		});
	}
	
	// Event listeners dos modais de 1 presente abaixo de R$ 500
	// Modal 1
	const modalPresenteUm1 = document.getElementById('modal-presente-um-1');
	if (modalPresenteUm1) {
		const btnClose1 = modalPresenteUm1.querySelector('.modal-close');
		const btnEntendi1 = modalPresenteUm1.querySelector('.modal-btn');
		
		if (btnClose1) btnClose1.addEventListener('click', fecharModalPresenteUm1);
		if (btnEntendi1) btnEntendi1.addEventListener('click', fecharModalPresenteUm1);
		modalPresenteUm1.addEventListener('click', function(e) {
			if (e.target === modalPresenteUm1) fecharModalPresenteUm1();
		});
	}
	
	// Modal 2
	const modalPresenteUm2 = document.getElementById('modal-presente-um-2');
	if (modalPresenteUm2) {
		const btnClose2 = modalPresenteUm2.querySelector('.modal-close');
		const btnVouVer = modalPresenteUm2.querySelector('.modal-btn');
		
		if (btnClose2) btnClose2.addEventListener('click', fecharModalPresenteUm2);
		if (btnVouVer) btnVouVer.addEventListener('click', fecharModalPresenteUm2);
		modalPresenteUm2.addEventListener('click', function(e) {
			if (e.target === modalPresenteUm2) fecharModalPresenteUm2();
		});
	}
	
	// Modal 3
	const modalPresenteUm3 = document.getElementById('modal-presente-um-3');
	if (modalPresenteUm3) {
		const btnClose3 = modalPresenteUm3.querySelector('.modal-close');
		const btnOkEntendi = modalPresenteUm3.querySelector('.modal-btn');
		
		if (btnClose3) btnClose3.addEventListener('click', fecharModalPresenteUm3);
		if (btnOkEntendi) btnOkEntendi.addEventListener('click', fecharModalPresenteUm3);
		modalPresenteUm3.addEventListener('click', function(e) {
			if (e.target === modalPresenteUm3) fecharModalPresenteUm3();
		});
	}
	
	// Modal 4 - Envia o formulário automaticamente
	const modalPresenteUm4 = document.getElementById('modal-presente-um-4');
	if (modalPresenteUm4) {
		const btnClose4 = modalPresenteUm4.querySelector('.modal-close');
		const btnConfirmar4 = modalPresenteUm4.querySelector('.modal-btn');
		
		if (btnClose4) btnClose4.addEventListener('click', fecharModalPresenteUm4);
		if (btnConfirmar4) {
			btnConfirmar4.addEventListener('click', () => {
				fecharModalPresenteUm4();
				// Permitir envio e enviar formulário automaticamente
				window.pixCopiado = true;
				setTimeout(() => {
					const form = document.querySelector('.rsvp-form');
					if (form) {
						form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
					}
				}, 300);
			});
		}
		modalPresenteUm4.addEventListener('click', function(e) {
			if (e.target === modalPresenteUm4) fecharModalPresenteUm4();
		});
	}
	
	// Event listeners dos modais de 2 presentes (Fluxo 3)
	// Modal 1
	const modalPresenteDois1 = document.getElementById('modal-presente-dois-1');
	if (modalPresenteDois1) {
		const btnClose1 = modalPresenteDois1.querySelector('.modal-close');
		const btnEntendi1 = modalPresenteDois1.querySelector('.modal-btn');
		
		if (btnClose1) btnClose1.addEventListener('click', fecharModalPresenteDois1);
		if (btnEntendi1) btnEntendi1.addEventListener('click', fecharModalPresenteDois1);
		modalPresenteDois1.addEventListener('click', function(e) {
			if (e.target === modalPresenteDois1) fecharModalPresenteDois1();
		});
	}
	
	// Modal 2
	const modalPresenteDois2 = document.getElementById('modal-presente-dois-2');
	if (modalPresenteDois2) {
		const btnClose2 = modalPresenteDois2.querySelector('.modal-close');
		const btnVouVer = modalPresenteDois2.querySelector('.modal-btn');
		
		if (btnClose2) btnClose2.addEventListener('click', fecharModalPresenteDois2);
		if (btnVouVer) btnVouVer.addEventListener('click', fecharModalPresenteDois2);
		modalPresenteDois2.addEventListener('click', function(e) {
			if (e.target === modalPresenteDois2) fecharModalPresenteDois2();
		});
	}
	
	// Modal 3
	const modalPresenteDois3 = document.getElementById('modal-presente-dois-3');
	if (modalPresenteDois3) {
		const btnClose3 = modalPresenteDois3.querySelector('.modal-close');
		const btnOkEntendi = modalPresenteDois3.querySelector('.modal-btn');
		
		if (btnClose3) btnClose3.addEventListener('click', fecharModalPresenteDois3);
		if (btnOkEntendi) btnOkEntendi.addEventListener('click', fecharModalPresenteDois3);
		modalPresenteDois3.addEventListener('click', function(e) {
			if (e.target === modalPresenteDois3) fecharModalPresenteDois3();
		});
	}
	
	// Modal 4 - Envia o formulário automaticamente
	const modalPresenteDois4 = document.getElementById('modal-presente-dois-4');
	if (modalPresenteDois4) {
		const btnClose4 = modalPresenteDois4.querySelector('.modal-close');
		const btnConfirmar4 = modalPresenteDois4.querySelector('.modal-btn');
		
		if (btnClose4) btnClose4.addEventListener('click', fecharModalPresenteDois4);
		if (btnConfirmar4) {
			btnConfirmar4.addEventListener('click', () => {
				fecharModalPresenteDois4();
				// Permitir envio e enviar formulário automaticamente
				window.pixCopiado = true;
				setTimeout(() => {
					const form = document.querySelector('.rsvp-form');
					if (form) {
						form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
					}
				}, 300);
			});
		}
		modalPresenteDois4.addEventListener('click', function(e) {
			if (e.target === modalPresenteDois4) fecharModalPresenteDois4();
		});
	}
	
	// Event listeners dos modais de 3 presentes (Fluxo 4)
	// Modal 1
	const modalPresenteTres1 = document.getElementById('modal-presente-tres-1');
	if (modalPresenteTres1) {
		const btnClose1 = modalPresenteTres1.querySelector('.modal-close');
		const btnEntendi1 = modalPresenteTres1.querySelector('.modal-btn');
		
		if (btnClose1) btnClose1.addEventListener('click', fecharModalPresenteTres1);
		if (btnEntendi1) btnEntendi1.addEventListener('click', fecharModalPresenteTres1);
		modalPresenteTres1.addEventListener('click', function(e) {
			if (e.target === modalPresenteTres1) fecharModalPresenteTres1();
		});
	}
	
	// Modal 2
	const modalPresenteTres2 = document.getElementById('modal-presente-tres-2');
	if (modalPresenteTres2) {
		const btnClose2 = modalPresenteTres2.querySelector('.modal-close');
		const btnVouTentar = modalPresenteTres2.querySelector('.modal-btn');
		
		if (btnClose2) btnClose2.addEventListener('click', fecharModalPresenteTres2);
		if (btnVouTentar) btnVouTentar.addEventListener('click', fecharModalPresenteTres2);
		modalPresenteTres2.addEventListener('click', function(e) {
			if (e.target === modalPresenteTres2) fecharModalPresenteTres2();
		});
	}
	
	// Modal 3
	const modalPresenteTres3 = document.getElementById('modal-presente-tres-3');
	if (modalPresenteTres3) {
		const btnClose3 = modalPresenteTres3.querySelector('.modal-close');
		const btnOkEntendi = modalPresenteTres3.querySelector('.modal-btn');
		
		if (btnClose3) btnClose3.addEventListener('click', fecharModalPresenteTres3);
		if (btnOkEntendi) btnOkEntendi.addEventListener('click', fecharModalPresenteTres3);
		modalPresenteTres3.addEventListener('click', function(e) {
			if (e.target === modalPresenteTres3) fecharModalPresenteTres3();
		});
	}
	
	// Modal 4 - Envia o formulário automaticamente
	const modalPresenteTres4 = document.getElementById('modal-presente-tres-4');
	if (modalPresenteTres4) {
		const btnClose4 = modalPresenteTres4.querySelector('.modal-close');
		const btnConfirmar4 = modalPresenteTres4.querySelector('.modal-btn');
		
		if (btnClose4) btnClose4.addEventListener('click', fecharModalPresenteTres4);
		if (btnConfirmar4) {
			btnConfirmar4.addEventListener('click', () => {
				fecharModalPresenteTres4();
				// Permitir envio e enviar formulário automaticamente
				window.pixCopiado = true;
				setTimeout(() => {
					const form = document.querySelector('.rsvp-form');
					if (form) {
						form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
					}
				}, 300);
			});
		}
		modalPresenteTres4.addEventListener('click', function(e) {
			if (e.target === modalPresenteTres4) fecharModalPresenteTres4();
		});
	}
	
	// Event listeners dos modais de valor >= R$ 500 (Fluxo 5)
	// Modal 1
	const modalValorAlto1 = document.getElementById('modal-valor-alto-1');
	if (modalValorAlto1) {
		const btnClose1 = modalValorAlto1.querySelector('.modal-close');
		const btnEntendi1 = modalValorAlto1.querySelector('.modal-btn');
		
		if (btnClose1) btnClose1.addEventListener('click', fecharModalValorAlto1);
		if (btnEntendi1) btnEntendi1.addEventListener('click', fecharModalValorAlto1);
		modalValorAlto1.addEventListener('click', function(e) {
			if (e.target === modalValorAlto1) fecharModalValorAlto1();
		});
	}
	
	// Modal 2
	const modalValorAlto2 = document.getElementById('modal-valor-alto-2');
	if (modalValorAlto2) {
		const btnClose2 = modalValorAlto2.querySelector('.modal-close');
		const btnVouTentar = modalValorAlto2.querySelector('.modal-btn');
		
		if (btnClose2) btnClose2.addEventListener('click', fecharModalValorAlto2);
		if (btnVouTentar) btnVouTentar.addEventListener('click', fecharModalValorAlto2);
		modalValorAlto2.addEventListener('click', function(e) {
			if (e.target === modalValorAlto2) fecharModalValorAlto2();
		});
	}
	
	// Modal 3
	const modalValorAlto3 = document.getElementById('modal-valor-alto-3');
	if (modalValorAlto3) {
		const btnClose3 = modalValorAlto3.querySelector('.modal-close');
		const btnOkEntendi = modalValorAlto3.querySelector('.modal-btn');
		
		if (btnClose3) btnClose3.addEventListener('click', fecharModalValorAlto3);
		if (btnOkEntendi) btnOkEntendi.addEventListener('click', fecharModalValorAlto3);
		modalValorAlto3.addEventListener('click', function(e) {
			if (e.target === modalValorAlto3) fecharModalValorAlto3();
		});
	}
	
	// Modal 4 - Envia o formulário automaticamente
	const modalValorAlto4 = document.getElementById('modal-valor-alto-4');
	if (modalValorAlto4) {
		const btnClose4 = modalValorAlto4.querySelector('.modal-close');
		const btnConfirmar4 = modalValorAlto4.querySelector('.modal-btn');
		
		if (btnClose4) btnClose4.addEventListener('click', fecharModalValorAlto4);
		if (btnConfirmar4) {
			btnConfirmar4.addEventListener('click', () => {
				fecharModalValorAlto4();
				// Permitir envio e enviar formulário automaticamente
				window.pixCopiado = true;
				setTimeout(() => {
					const form = document.querySelector('.rsvp-form');
					if (form) {
						form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
					}
				}, 300);
			});
		}
		modalValorAlto4.addEventListener('click', function(e) {
			if (e.target === modalValorAlto4) fecharModalValorAlto4();
		});
	}
	
	// Fechar qualquer modal com ESC
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape') {
			const modal1 = document.getElementById('modal-mao-vaca');
			const modal2 = document.getElementById('modal-miseravel');
			const modal3 = document.getElementById('modal-verificando');
			const modal4 = document.getElementById('modal-escopiao');
			const modal5 = document.getElementById('modal-obrigado-miseravel');
			const modalPresenteUm1 = document.getElementById('modal-presente-um-1');
			const modalPresenteUm2 = document.getElementById('modal-presente-um-2');
			const modalPresenteUm3 = document.getElementById('modal-presente-um-3');
			const modalPresenteUm4 = document.getElementById('modal-presente-um-4');
			const modalPresenteDois1 = document.getElementById('modal-presente-dois-1');
			const modalPresenteDois2 = document.getElementById('modal-presente-dois-2');
			const modalPresenteDois3 = document.getElementById('modal-presente-dois-3');
			const modalPresenteDois4 = document.getElementById('modal-presente-dois-4');
			const modalPresenteTres1 = document.getElementById('modal-presente-tres-1');
			const modalPresenteTres2 = document.getElementById('modal-presente-tres-2');
			const modalPresenteTres3 = document.getElementById('modal-presente-tres-3');
			const modalPresenteTres4 = document.getElementById('modal-presente-tres-4');
			const modalValorAlto1 = document.getElementById('modal-valor-alto-1');
			const modalValorAlto2 = document.getElementById('modal-valor-alto-2');
			const modalValorAlto3 = document.getElementById('modal-valor-alto-3');
			const modalValorAlto4 = document.getElementById('modal-valor-alto-4');
			if (modal1 && modal1.style.display === 'flex') {
				fecharModalMaoVaca();
			}
			if (modal2 && modal2.style.display === 'flex') {
				fecharModalMiseravel();
			}
			if (modal3 && modal3.style.display === 'flex') {
				fecharModalVerificando();
			}
			if (modal4 && modal4.style.display === 'flex') {
				fecharModalEscopiao();
			}
			if (modal5 && modal5.style.display === 'flex') {
				fecharModalObrigadoMiseravel();
			}
			if (modalPresenteUm1 && modalPresenteUm1.style.display === 'flex') {
				fecharModalPresenteUm1();
			}
			if (modalPresenteUm2 && modalPresenteUm2.style.display === 'flex') {
				fecharModalPresenteUm2();
			}
			if (modalPresenteUm3 && modalPresenteUm3.style.display === 'flex') {
				fecharModalPresenteUm3();
			}
			if (modalPresenteUm4 && modalPresenteUm4.style.display === 'flex') {
				fecharModalPresenteUm4();
			}
			if (modalPresenteDois1 && modalPresenteDois1.style.display === 'flex') {
				fecharModalPresenteDois1();
			}
			if (modalPresenteDois2 && modalPresenteDois2.style.display === 'flex') {
				fecharModalPresenteDois2();
			}
			if (modalPresenteDois3 && modalPresenteDois3.style.display === 'flex') {
				fecharModalPresenteDois3();
			}
			if (modalPresenteDois4 && modalPresenteDois4.style.display === 'flex') {
				fecharModalPresenteDois4();
			}
			if (modalPresenteTres1 && modalPresenteTres1.style.display === 'flex') {
				fecharModalPresenteTres1();
			}
			if (modalPresenteTres2 && modalPresenteTres2.style.display === 'flex') {
				fecharModalPresenteTres2();
			}
			if (modalPresenteTres3 && modalPresenteTres3.style.display === 'flex') {
				fecharModalPresenteTres3();
			}
			if (modalPresenteTres4 && modalPresenteTres4.style.display === 'flex') {
				fecharModalPresenteTres4();
			}
			if (modalValorAlto1 && modalValorAlto1.style.display === 'flex') {
				fecharModalValorAlto1();
			}
			if (modalValorAlto2 && modalValorAlto2.style.display === 'flex') {
				fecharModalValorAlto2();
			}
			if (modalValorAlto3 && modalValorAlto3.style.display === 'flex') {
				fecharModalValorAlto3();
			}
			if (modalValorAlto4 && modalValorAlto4.style.display === 'flex') {
				fecharModalValorAlto4();
			}
		}
	});
});

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
	form.addEventListener('submit', async function(e) {
		console.log('[RSVP] Submit detectado, prevenindo comportamento padrão...');
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		
		try {
			if (!validate()) {
				return false;
			}
			
			// Verificar se selecionou presentes ou copiou o Pix
		const checados = Array.from(document.querySelectorAll('input[name="presente"]:checked'));
		const temPresentes = checados.length > 0;
		const quantidadePresentes = checados.length;
		const valorTotal = checados.reduce((acc,el)=>{
			const valorStr = el.getAttribute('data-valor') || '0';
			// Remove qualquer caractere não numérico exceto vírgula e ponto, depois converte
			const v = parseFloat(valorStr.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
			return acc + v;
		}, 0);
		const pixFoiCopiado = window.pixCopiado === true;
		const primeiroModalFoiMostrado = window.primeiroModalMostrado === true;
		const segundoModalConfirmado = window.segundoModalConfirmado === true;
		const terceiroModalFoiVisto = window.terceiroModalVisto === true;
		const quartoModalFoiVisto = window.quartoModalVisto === true;
		
		// Variáveis do fluxo de 1 presente abaixo de R$ 500
		const presenteUmModal1Visto = window.presenteUmModal1Visto === true;
		const presenteUmModal2Visto = window.presenteUmModal2Visto === true;
		const presenteUmModal3Visto = window.presenteUmModal3Visto === true;
		const presenteUmModal4Visto = window.presenteUmModal4Visto === true;
		
		// Variáveis do fluxo de 2 presentes (Fluxo 3)
		const presenteDoisModal1Visto = window.presenteDoisModal1Visto === true;
		const presenteDoisModal2Visto = window.presenteDoisModal2Visto === true;
		const presenteDoisModal3Visto = window.presenteDoisModal3Visto === true;
		const presenteDoisModal4Visto = window.presenteDoisModal4Visto === true;
		
		// Variáveis do fluxo de 3 presentes (Fluxo 4)
		const presenteTresModal1Visto = window.presenteTresModal1Visto === true;
		const presenteTresModal2Visto = window.presenteTresModal2Visto === true;
		const presenteTresModal3Visto = window.presenteTresModal3Visto === true;
		const presenteTresModal4Visto = window.presenteTresModal4Visto === true;
		
		// Variáveis do fluxo de valor >= R$ 500 (Fluxo 5)
		const valorAltoModal1Visto = window.valorAltoModal1Visto === true;
		const valorAltoModal2Visto = window.valorAltoModal2Visto === true;
		const valorAltoModal3Visto = window.valorAltoModal3Visto === true;
		const valorAltoModal4Visto = window.valorAltoModal4Visto === true;
		
		// Verificar qual fluxo está ativo
		const fluxoAtivo = window.fluxoAtivo;
		
		// FLUXO 5: PARA VALOR TOTAL >= R$ 500
		// Prioridade: valor alto tem precedência sobre quantidade
		// Só entra neste fluxo se: (não tem fluxo ativo E valor >= 500) OU (já está no fluxo de valor alto)
		if (valorTotal >= 500 && (fluxoAtivo === null || fluxoAtivo === 'valor-alto')) {
			// Se já passou pela mensagem 4, permite confirmar
			if (valorAltoModal4Visto) {
				// Permite continuar com o envio normalmente
			} else if (valorAltoModal3Visto) {
				// Mensagem 4: Depois da mensagem 3, mostra a mensagem 4 (agradecimento)
				mostrarModalValorAlto4();
				return;
			} else if (valorAltoModal2Visto) {
				// Mensagem 3: Depois da mensagem 2, mostra a mensagem 3 (ummmmmm, calma aí)
				mostrarModalValorAlto3();
				return;
			} else if (valorAltoModal1Visto) {
				// Mensagem 2: Depois da mensagem 1, mostra a mensagem 2 (obrigado viu, isso que é amigo)
				mostrarModalValorAlto2();
				return;
			} else {
				// Mensagem 1: Primeira vez tentando confirmar com valor >= R$ 500
				mostrarModalValorAlto1();
				return;
			}
		}
		
		// FLUXO 4: PARA 3 PRESENTES
		// Só entra neste fluxo se: (não tem fluxo ativo E é 3 presentes) OU (já está no fluxo de 3 presentes)
		if (quantidadePresentes === 3 && (fluxoAtivo === null || fluxoAtivo === 'tres-presentes')) {
			// Se já passou pela mensagem 4, permite confirmar
			if (presenteTresModal4Visto) {
				// Permite continuar com o envio normalmente
			} else if (presenteTresModal3Visto) {
				// Mensagem 4: Depois da mensagem 3, mostra a mensagem 4 (agradecimento)
				mostrarModalPresenteTres4();
				return;
			} else if (presenteTresModal2Visto) {
				// Mensagem 3: Depois da mensagem 2, mostra a mensagem 3 (ummmmmm, calma aí)
				mostrarModalPresenteTres3();
				return;
			} else if (presenteTresModal1Visto) {
				// Mensagem 2: Depois da mensagem 1, mostra a mensagem 2 (obrigado viu, tenta agora aí)
				mostrarModalPresenteTres2();
				return;
			} else {
				// Mensagem 1: Primeira vez tentando confirmar com 3 presentes
				mostrarModalPresenteTres1();
				return;
			}
		}
		
		// FLUXO 3: PARA 2 PRESENTES
		// Só entra neste fluxo se: (não tem fluxo ativo E é 2 presentes) OU (já está no fluxo de 2 presentes)
		if (quantidadePresentes === 2 && (fluxoAtivo === null || fluxoAtivo === 'dois-presentes')) {
			// Se já passou pela mensagem 4, permite confirmar
			if (presenteDoisModal4Visto) {
				// Permite continuar com o envio normalmente
			} else if (presenteDoisModal3Visto) {
				// Mensagem 4: Depois da mensagem 3, mostra a mensagem 4 (agradecimento)
				mostrarModalPresenteDois4();
				return;
			} else if (presenteDoisModal2Visto) {
				// Mensagem 3: Depois da mensagem 2, mostra a mensagem 3 (ummmmmm, fazer o que né)
				mostrarModalPresenteDois3();
				return;
			} else if (presenteDoisModal1Visto) {
				// Mensagem 2: Depois da mensagem 1, mostra a mensagem 2 (mais ainda acho que pode melhorar)
				mostrarModalPresenteDois2();
				return;
			} else {
				// Mensagem 1: Primeira vez tentando confirmar com 2 presentes
				mostrarModalPresenteDois1();
				return;
			}
		}
		
		// FLUXO PARA 1 PRESENTE ABAIXO DE R$ 500
		// Só entra neste fluxo se: (não tem fluxo ativo E é 1 presente < 500) OU (já está no fluxo de 1 presente)
		if (quantidadePresentes === 1 && valorTotal < 500 && (fluxoAtivo === null || fluxoAtivo === 'um-presente-baixo-500')) {
			// Se já passou pela mensagem 4, permite confirmar
			if (presenteUmModal4Visto) {
				// Permite continuar com o envio normalmente
			} else if (presenteUmModal3Visto) {
				// Mensagem 4: Depois da mensagem 3, mostra a mensagem 4 (agradecimento)
				mostrarModalPresenteUm4();
				return;
			} else if (presenteUmModal2Visto) {
				// Mensagem 3: Depois da mensagem 2, mostra a mensagem 3 (vou ver se caiu)
				mostrarModalPresenteUm3();
				return;
			} else if (presenteUmModal1Visto) {
				// Mensagem 2: Depois da mensagem 1, mostra a mensagem 2 (sério mesmo só isso)
				mostrarModalPresenteUm2();
				return;
			} else {
				// Mensagem 1: Primeira vez tentando confirmar com 1 presente abaixo de R$ 500
				mostrarModalPresenteUm1();
				return;
			}
		}
		
		// FLUXO SEM PRESENTE
		// Só entra neste fluxo se: (não tem fluxo ativo E não tem presente) OU (já está no fluxo sem presente)
		if ((fluxoAtivo === null || fluxoAtivo === 'sem-presente') && !temPresentes) {
			// Se já passou pela mensagem 4, não mostra mais nenhuma mensagem, permite confirmar
			if (quartoModalFoiVisto) {
				// Permite continuar com o envio normalmente
			} else if (terceiroModalFoiVisto) {
				// Mensagem 4: Depois da mensagem 3, mostra a mensagem 4 (agradecimento)
				mostrarModalObrigadoMiseravel();
				return;
			} else if (segundoModalConfirmado) {
				// Mensagem 3: Depois da mensagem 2, mostra a mensagem 3 (calma aí)
				mostrarModalVerificando();
				return;
			} else if (primeiroModalFoiMostrado) {
				// Mensagem 2: Depois da mensagem 1, mostra a mensagem 2 (tu tem certeza)
				mostrarModalMiseravel();
				return;
			} else {
				// Mensagem 1: Se não tem presente selecionado, mostra a primeira mensagem (mão de vaca)
				mostrarModalMaoVaca();
				return;
			}
		}
		
		// Se está em um fluxo diferente do que está tentando agora, não permite mudar
		if (fluxoAtivo === 'sem-presente' && (quantidadePresentes === 1 && valorTotal < 500)) {
			// Está no fluxo sem presente mas tentou confirmar com 1 presente, continua no fluxo sem presente
			if (quartoModalFoiVisto) {
				// Permite continuar
			} else if (terceiroModalFoiVisto) {
				mostrarModalObrigadoMiseravel();
				return;
			} else if (segundoModalConfirmado) {
				mostrarModalVerificando();
				return;
			} else if (primeiroModalFoiMostrado) {
				mostrarModalMiseravel();
				return;
			}
		}
		
		if (fluxoAtivo === 'um-presente-baixo-500' && !temPresentes) {
			// Está no fluxo de 1 presente mas tentou confirmar sem presente, continua no fluxo de 1 presente
			if (presenteUmModal4Visto) {
				// Permite continuar
			} else if (presenteUmModal3Visto) {
				mostrarModalPresenteUm4();
				return;
			} else if (presenteUmModal2Visto) {
				mostrarModalPresenteUm3();
				return;
			} else if (presenteUmModal1Visto) {
				mostrarModalPresenteUm2();
				return;
			}
		}
		
		// Proteção: Se está no fluxo de 2 presentes mas tentou mudar, continua no fluxo de 2 presentes
		if (fluxoAtivo === 'dois-presentes' && quantidadePresentes !== 2) {
			if (presenteDoisModal4Visto) {
				// Permite continuar
			} else if (presenteDoisModal3Visto) {
				mostrarModalPresenteDois4();
				return;
			} else if (presenteDoisModal2Visto) {
				mostrarModalPresenteDois3();
				return;
			} else if (presenteDoisModal1Visto) {
				mostrarModalPresenteDois2();
				return;
			}
		}
		
		// Proteção: Se está em outro fluxo mas tentou entrar no fluxo de 2 presentes, mantém o fluxo original
		if (fluxoAtivo !== null && fluxoAtivo !== 'dois-presentes' && quantidadePresentes === 2) {
			// Mantém no fluxo original
			if (fluxoAtivo === 'sem-presente') {
				if (quartoModalFoiVisto) {
					// Permite continuar
				} else if (terceiroModalFoiVisto) {
					mostrarModalObrigadoMiseravel();
					return;
				} else if (segundoModalConfirmado) {
					mostrarModalVerificando();
					return;
				} else if (primeiroModalFoiMostrado) {
					mostrarModalMiseravel();
					return;
				}
			} else if (fluxoAtivo === 'um-presente-baixo-500') {
				if (presenteUmModal4Visto) {
					// Permite continuar
				} else if (presenteUmModal3Visto) {
					mostrarModalPresenteUm4();
					return;
				} else if (presenteUmModal2Visto) {
					mostrarModalPresenteUm3();
					return;
				} else if (presenteUmModal1Visto) {
					mostrarModalPresenteUm2();
					return;
				}
			} else if (fluxoAtivo === 'tres-presentes') {
				if (presenteTresModal4Visto) {
					// Permite continuar
				} else if (presenteTresModal3Visto) {
					mostrarModalPresenteTres4();
					return;
				} else if (presenteTresModal2Visto) {
					mostrarModalPresenteTres3();
					return;
				} else if (presenteTresModal1Visto) {
					mostrarModalPresenteTres2();
					return;
				}
			}
		}
		
		// Proteção: Se está no fluxo de 3 presentes mas tentou mudar, continua no fluxo de 3 presentes
		if (fluxoAtivo === 'tres-presentes' && quantidadePresentes !== 3) {
			if (presenteTresModal4Visto) {
				// Permite continuar
			} else if (presenteTresModal3Visto) {
				mostrarModalPresenteTres4();
				return;
			} else if (presenteTresModal2Visto) {
				mostrarModalPresenteTres3();
				return;
			} else if (presenteTresModal1Visto) {
				mostrarModalPresenteTres2();
				return;
			}
		}
		
		// Proteção: Se está no fluxo de valor alto mas tentou mudar, continua no fluxo de valor alto
		if (fluxoAtivo === 'valor-alto' && valorTotal < 500) {
			if (valorAltoModal4Visto) {
				// Permite continuar
			} else if (valorAltoModal3Visto) {
				mostrarModalValorAlto4();
				return;
			} else if (valorAltoModal2Visto) {
				mostrarModalValorAlto3();
				return;
			} else if (valorAltoModal1Visto) {
				mostrarModalValorAlto2();
				return;
			}
		}
		
		// Proteção: Se está em outro fluxo mas valor subiu para >= 500, mantém o fluxo original (exceto se já está no Fluxo 5)
		if (fluxoAtivo !== null && fluxoAtivo !== 'valor-alto' && valorTotal >= 500) {
			// Mantém no fluxo original
			if (fluxoAtivo === 'sem-presente') {
				if (quartoModalFoiVisto) {
					// Permite continuar
				} else if (terceiroModalFoiVisto) {
					mostrarModalObrigadoMiseravel();
					return;
				} else if (segundoModalConfirmado) {
					mostrarModalVerificando();
					return;
				} else if (primeiroModalFoiMostrado) {
					mostrarModalMiseravel();
					return;
				}
			} else if (fluxoAtivo === 'um-presente-baixo-500') {
				if (presenteUmModal4Visto) {
					// Permite continuar
				} else if (presenteUmModal3Visto) {
					mostrarModalPresenteUm4();
					return;
				} else if (presenteUmModal2Visto) {
					mostrarModalPresenteUm3();
					return;
				} else if (presenteUmModal1Visto) {
					mostrarModalPresenteUm2();
					return;
				}
			} else if (fluxoAtivo === 'dois-presentes') {
				if (presenteDoisModal4Visto) {
					// Permite continuar
				} else if (presenteDoisModal3Visto) {
					mostrarModalPresenteDois4();
					return;
				} else if (presenteDoisModal2Visto) {
					mostrarModalPresenteDois3();
					return;
				} else if (presenteDoisModal1Visto) {
					mostrarModalPresenteDois2();
					return;
				}
			} else if (fluxoAtivo === 'tres-presentes') {
				if (presenteTresModal4Visto) {
					// Permite continuar
				} else if (presenteTresModal3Visto) {
					mostrarModalPresenteTres4();
					return;
				} else if (presenteTresModal2Visto) {
					mostrarModalPresenteTres3();
					return;
				} else if (presenteTresModal1Visto) {
					mostrarModalPresenteTres2();
					return;
				}
			}
		}
		
		feedback.textContent = 'Enviando...';
		feedback.style.color = '';
		try {
			const presentes = checados.map(el=>el.value);
			const valorTotal = checados.reduce((acc,el)=>{
				const valorStr = el.getAttribute('data-valor') || '0';
				const v = parseFloat(valorStr.toString().replace(',', '.')) || 0;
				return acc + v;
			}, 0);
			// Formatar valor total como string (R$ XXX,XX)
			const valorTotalFormatado = valorTotal.toFixed(2).replace('.', ',');
			const payload = {
				nome: form.nome.value.trim(),
				email: form.email.value.trim(),
				acompanha: form.acompanha.value,
				convidado_nome: (document.getElementById('convidado_nome')?.value || '').trim(),
				mensagem: form.mensagem.value.trim(),
				presentes: presentes && presentes.length ? presentes.join(', ') : '',
				valor_presentes: valorTotalFormatado // Enviar como string formatada
			};
			console.log('[RSVP] Enviando confirmação...', payload);
			const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
			console.log('[RSVP] Resposta recebida:', res.status, res.statusText);
			
			let data;
			try {
				data = await res.json();
				console.log('[RSVP] Dados da resposta:', data);
			} catch (e) {
				console.error('[RSVP] Erro ao parsear JSON:', e);
				throw new Error('Resposta inválida do servidor');
			}
			
			if (!res.ok || !data.ok) {
				console.error('[RSVP] Erro na resposta:', data.message || 'Erro desconhecido');
				throw new Error(data.message || 'Erro ao enviar');
			}
			
			console.log('[RSVP] ✅ Confirmação enviada com sucesso!');
			feedback.textContent = data.message || 'Obrigado! Sua presença foi confirmada.';
			form.reset();
			// Resetar variáveis
			window.pixCopiado = false;
			window.primeiroModalMostrado = false;
			window.segundoModalConfirmado = false;
			window.primeiraCopiaCodigoPix = false;
			window.terceiroModalVisto = false;
			window.quartoModalVisto = false;
			// Resetar variáveis do fluxo de 1 presente abaixo de R$ 500
			window.presenteUmModal1Visto = false;
			window.presenteUmModal2Visto = false;
			window.presenteUmModal3Visto = false;
			window.presenteUmModal4Visto = false;
			// Resetar variáveis do fluxo de 2 presentes (Fluxo 3)
			window.presenteDoisModal1Visto = false;
			window.presenteDoisModal2Visto = false;
			window.presenteDoisModal3Visto = false;
			window.presenteDoisModal4Visto = false;
			// Resetar variáveis do fluxo de 3 presentes (Fluxo 4)
			window.presenteTresModal1Visto = false;
			window.presenteTresModal2Visto = false;
			window.presenteTresModal3Visto = false;
			window.presenteTresModal4Visto = false;
			// Resetar variáveis do fluxo de valor >= R$ 500 (Fluxo 5)
			window.valorAltoModal1Visto = false;
			window.valorAltoModal2Visto = false;
			window.valorAltoModal3Visto = false;
			window.valorAltoModal4Visto = false;
			// Resetar fluxo ativo
			window.fluxoAtivo = null;
			// Atualiza total após reset
			document.querySelectorAll('input[name="presente"]').forEach(el=>{ 
				el.checked=false; 
				const card = el.closest('.presente-card');
				if (card) {
					card.classList.remove('presente-selecionado');
				}
			});
			const totalEl = document.getElementById('presente-total-inline');
			if (totalEl) totalEl.textContent = 'Valor total: R$ 0';
		} catch (err) {
			console.error('[RSVP] ❌ Erro ao enviar confirmação:', err);
			const errorMessage = err.message || 'Erro desconhecido';
			feedback.textContent = errorMessage || 'Ops! Tente novamente em instantes.';
			feedback.style.color = 'var(--error, #ff4444)';
		}
		
		} catch (outerErr) {
			console.error('[RSVP] ❌ Erro geral:', outerErr);
			feedback.textContent = 'Ops! Tente novamente em instantes.';
			feedback.style.color = 'var(--error, #ff4444)';
		}
		
		return false; // Garantir que não recarrega
	});
})();

// Variáveis globais para rastrear ações do usuário
window.pixCopiado = false;
window.primeiroModalMostrado = false;
window.segundoModalConfirmado = false;
window.primeiraCopiaCodigoPix = false; // Rastreia se já copiou o código Pix pela primeira vez
window.terceiroModalVisto = false; // Rastreia se viu o terceiro modal (verificação)
window.quartoModalVisto = false; // Rastreia se viu o quarto modal (agradecimento)

// Variáveis para fluxo de 1 presente abaixo de R$ 500
window.presenteUmModal1Visto = false;
window.presenteUmModal2Visto = false;
window.presenteUmModal3Visto = false;
window.presenteUmModal4Visto = false;

// Variáveis para fluxo de 2 presentes (Fluxo 3)
window.presenteDoisModal1Visto = false;
window.presenteDoisModal2Visto = false;
window.presenteDoisModal3Visto = false;
window.presenteDoisModal4Visto = false;

// Variáveis para fluxo de 3 presentes (Fluxo 4)
window.presenteTresModal1Visto = false;
window.presenteTresModal2Visto = false;
window.presenteTresModal3Visto = false;
window.presenteTresModal4Visto = false;

// Variáveis para fluxo de valor >= R$ 500 (Fluxo 5)
window.valorAltoModal1Visto = false;
window.valorAltoModal2Visto = false;
window.valorAltoModal3Visto = false;
window.valorAltoModal4Visto = false;

// Variável para rastrear qual fluxo foi iniciado ('sem-presente', 'um-presente-baixo-500', 'dois-presentes', 'tres-presentes', 'valor-alto', ou null)
window.fluxoAtivo = null;

// Fallback para imagens dos presentes (mostra emoji se imagem não carregar)
(function initImageFallback() {
	document.addEventListener('DOMContentLoaded', function() {
		document.querySelectorAll('.presente-img img').forEach(img => {
			img.addEventListener('error', function() {
				this.style.display = 'none';
				const emojiSpan = this.nextElementSibling;
				if (emojiSpan && emojiSpan.tagName === 'SPAN') {
					emojiSpan.style.display = 'inline';
					emojiSpan.style.fontSize = '1.8em';
				}
			});
			img.addEventListener('load', function() {
				const emojiSpan = this.nextElementSibling;
				if (emojiSpan && emojiSpan.tagName === 'SPAN') {
					emojiSpan.style.display = 'none';
				}
			});
		});
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

// Tornar globais para o componente React
window.PIX_KEY = PIX_KEY;
window.PIX_MERCHANT = PIX_MERCHANT;
window.PIX_CITY = PIX_CITY;

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

// Tornar funções globais para o componente React
window.gerarPixBRCode = gerarPixBRCode;
window.getTxidCustom = getTxidCustom;

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

// Lightbox para galeria
(function initLightbox() {
	const lightbox = document.getElementById('lightbox');
	const lightboxImage = document.getElementById('lightbox-image');
	const lightboxClose = document.querySelector('.lightbox-close');
	const lightboxPrev = document.querySelector('.lightbox-prev');
	const lightboxNext = document.querySelector('.lightbox-next');
	const galleryImages = document.querySelectorAll('.gallery-image');
	
	if (!lightbox || !lightboxImage || !galleryImages.length) {
		return;
	}
	
	let currentImageIndex = 0;
	const images = Array.from(galleryImages);
	
	function openLightbox(index) {
		currentImageIndex = index;
		lightboxImage.src = images[index].src;
		lightbox.style.display = 'flex';
		setTimeout(() => {
			lightbox.classList.add('show');
		}, 10);
		document.body.style.overflow = 'hidden';
	}
	
	function closeLightbox() {
		lightbox.classList.remove('show');
		setTimeout(() => {
			lightbox.style.display = 'none';
			document.body.style.overflow = '';
		}, 300);
	}
	
	function showNext() {
		currentImageIndex = (currentImageIndex + 1) % images.length;
		lightboxImage.src = images[currentImageIndex].src;
	}
	
	function showPrev() {
		currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
		lightboxImage.src = images[currentImageIndex].src;
	}
	
	// Adicionar event listeners às imagens
	galleryImages.forEach((img, index) => {
		img.addEventListener('click', () => openLightbox(index));
	});
	
	// Fechar lightbox
	if (lightboxClose) {
		lightboxClose.addEventListener('click', closeLightbox);
	}
	
	// Navegação
	if (lightboxNext) {
		lightboxNext.addEventListener('click', (e) => {
			e.stopPropagation();
			showNext();
		});
	}
	
	if (lightboxPrev) {
		lightboxPrev.addEventListener('click', (e) => {
			e.stopPropagation();
			showPrev();
		});
	}
	
	// Fechar ao clicar no fundo
	lightbox.addEventListener('click', (e) => {
		if (e.target === lightbox) {
			closeLightbox();
		}
	});
	
	// Fechar com tecla ESC
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && lightbox.classList.contains('show')) {
			closeLightbox();
		} else if (e.key === 'ArrowRight' && lightbox.classList.contains('show')) {
			showNext();
		} else if (e.key === 'ArrowLeft' && lightbox.classList.contains('show')) {
			showPrev();
		}
	});
})();

