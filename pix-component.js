// Componente Pix em JavaScript puro (sem React)
(function initPixComponent() {
	console.log('[Pix] Inicializando componente Pix...');
	const root = document.getElementById('pix-react-root');
	if (!root) {
		console.error('[Pix] ❌ Elemento pix-react-root não encontrado!');
		return;
	}
	console.log('[Pix] ✅ Elemento pix-react-root encontrado');

	// Aguardar funções do script.js estarem disponíveis
	function waitForFunctions() {
		if (typeof window.gerarPixBRCode === 'undefined' || typeof window.getTxidCustom === 'undefined') {
			console.warn('[Pix] ⚠️ Funções do Pix não estão disponíveis ainda, tentando novamente...');
			setTimeout(waitForFunctions, 100);
			return;
		}
		console.log('[Pix] ✅ Funções do Pix estão disponíveis');
		initializePix();
	}

	function renderPixArea(total) {
		const pixKey = window.PIX_KEY || '06418675142';
		const merchant = window.PIX_MERCHANT || 'WINICIUS SILVA ROSA';
		const city = window.PIX_CITY || 'CUIABA';

		// Garantir que total é sempre um número limpo (sem vírgulas, pontos de milhar, etc)
		const totalNumerico = typeof total === 'string' 
			? parseFloat(total.toString().replace(/[^\d.,]/g, '').replace(',', '.')) 
			: Number(total) || 0;

		console.log('[Pix] Total recebido:', total, '→ Convertido para:', totalNumerico);

		if (totalNumerico <= 0) {
			root.innerHTML = '';
			return;
		}

		try {
			console.log('[Pix] Gerando BR Code com valores:', { key: pixKey, merchant, city, amount: totalNumerico });
			const txid = window.getTxidCustom();
			console.log('[Pix] TXID gerado:', txid);
			const brCode = window.gerarPixBRCode({ key: pixKey, name: merchant, city: city, amount: totalNumerico, txid });
			console.log('[Pix] BR Code gerado, tamanho:', brCode ? brCode.length : 0);
			
			if (!brCode || brCode.length === 0) {
				console.error('[Pix] ❌ BR Code vazio ou inválido!');
				root.innerHTML = '<div class="pix-error">Erro ao gerar código Pix. Verifique o console.</div>';
				return;
			}
			
			console.log('[Pix] Gerando QR Code localmente...');
			
			// Gerar ID único para o container do QR code
			const qrId = 'qrcode-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

			root.innerHTML = `
				<div class="pix-react-container">
					<div class="pix-header">
						<h3 class="pix-title">💳 Pagamento via Pix</h3>
						<p class="pix-subtitle">Escaneie o QR ou copie o código</p>
					</div>
					<div class="pix-content">
						<div class="pix-qr-wrapper">
							<div id="${qrId}" style="display: inline-block;"></div>
						</div>
						<div class="pix-code-wrapper">
							<div class="pix-input-group">
								<label class="pix-label">Pix Copia e Cola</label>
								<textarea 
									readonly 
									class="pix-textarea"
									onclick="this.select()"
									rows="2"
								>${brCode}</textarea>
							</div>
							<button class="pix-copy-btn" data-brcode="${brCode.replace(/"/g, '&quot;')}">
								📋 Copiar código
							</button>
						</div>
					</div>
				</div>
			`;

			// Gerar QR Code localmente usando biblioteca JavaScript
			function tentarGerarQRCode(tentativas = 0) {
				try {
					const qrContainer = document.getElementById(qrId);
					if (!qrContainer) {
						console.warn('[Pix] ⚠️ Container do QR code não encontrado');
						return;
					}
					
					console.log('[Pix] Gerando QR Code localmente... (tentativa', tentativas + 1, ')');
					
					// Verificar se a biblioteca QRCode está disponível
					if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
						console.log('[Pix] ✅ Biblioteca QRCode encontrada, gerando QR code...');
						
						// Limpar container
						qrContainer.innerHTML = '';
						
						// Criar elemento canvas para o QR code
						const canvas = document.createElement('canvas');
						canvas.style.display = 'block';
						canvas.style.margin = '0 auto';
						qrContainer.appendChild(canvas);
						
						// Gerar QR code usando a biblioteca
						QRCode.toCanvas(canvas, brCode, {
							width: 200,
							margin: 2,
							color: {
								dark: '#000000',
								light: '#ffffff'
							},
							errorCorrectionLevel: 'M'
						}, function(error) {
							if (error) {
								console.error('[Pix] ❌ Erro ao gerar QR code:', error);
								qrContainer.innerHTML = '<p style="color: #ffaa00; padding: 20px; font-size: 14px; text-align: center;">Erro ao gerar QR Code.<br>Use o código "Pix Copia e Cola" acima.</p>';
							} else {
								console.log('[Pix] ✅ QR Code gerado com sucesso localmente');
							}
						});
					} else if (tentativas < 10) {
						// Se a biblioteca ainda não carregou, tentar novamente após um delay
						console.log('[Pix] ⏳ Aguardando biblioteca QRCode carregar... (tentativa', tentativas + 1, ')');
						setTimeout(function() {
							tentarGerarQRCode(tentativas + 1);
						}, 200);
						return;
					} else {
						console.warn('[Pix] ⚠️ Biblioteca QRCode não encontrada após múltiplas tentativas, usando fallback...');
						
						// Fallback: tentar APIs externas
						const img = document.createElement('img');
						img.alt = 'QR Code Pix';
						img.className = 'pix-qr';
						img.style.display = 'block';
						img.style.margin = '0 auto';
						
						let tentativa = 1;
						
						function tentarProxima() {
							let url;
							if (tentativa === 1) {
								url = '/api/qr?data=' + encodeURIComponent(brCode) + '&size=200';
								console.log('[Pix] Tentativa 1: Endpoint local');
							} else if (tentativa === 2) {
								url = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(brCode);
								console.log('[Pix] Tentativa 2: API externa 1');
							} else if (tentativa === 3) {
								url = 'https://quickchart.io/qr?text=' + encodeURIComponent(brCode) + '&size=200';
								console.log('[Pix] Tentativa 3: API externa 2');
							} else {
								console.error('[Pix] ❌ Todas as tentativas falharam');
								qrContainer.innerHTML = '<p style="color: #ffaa00; padding: 20px; font-size: 14px; text-align: center;">QR Code temporariamente indisponível.<br>Por favor, use o código "Pix Copia e Cola" acima.</p>';
								return;
							}
							
							img.src = url;
							tentativa++;
						}
						
						img.onerror = function() {
							console.warn('[Pix] ⚠️ Tentativa falhou, tentando próxima...');
							tentarProxima();
						};
						
						img.onload = function() {
							console.log('[Pix] ✅ QR Code carregado com sucesso (tentativa', tentativa - 1, ')');
						};
						
						qrContainer.innerHTML = '';
						qrContainer.appendChild(img);
						tentarProxima();
					}
					
				} catch (e) {
					console.error('[Pix] ❌ Erro ao processar QR code:', e);
					console.error('[Pix] Stack:', e.stack);
					const qrContainer = document.getElementById(qrId);
					if (qrContainer) {
						qrContainer.innerHTML = '<p style="color: #ffaa00; padding: 20px; font-size: 14px; text-align: center;">Erro ao gerar QR Code.<br>Use o código "Pix Copia e Cola" acima.</p>';
					}
				}
			}
			
			// Iniciar tentativa de geração após um pequeno delay
			setTimeout(function() {
				tentarGerarQRCode(0);
			}, 100);

			// Adicionar event listener para o botão de copiar
			const copyBtn = root.querySelector('.pix-copy-btn');
			if (copyBtn) {
				copyBtn.addEventListener('click', function() {
					const brCodeToCopy = this.getAttribute('data-brcode');
					navigator.clipboard.writeText(brCodeToCopy).then(() => {
						this.textContent = '✓ Copiado!';
						this.classList.add('copied');
						
						// Marcar globalmente que o Pix foi copiado
						if (typeof window !== 'undefined') {
							window.pixCopiado = true;
							
							// Verificar se é a primeira vez copiando o código e se total < R$ 500
							if (!window.primeiraCopiaCodigoPix && totalNumerico < 500) {
								window.primeiraCopiaCodigoPix = true;
								// Mostrar modal de escopião
								if (typeof window.mostrarModalEscopiao === 'function') {
									setTimeout(() => {
										window.mostrarModalEscopiao();
									}, 300);
								}
							}
						}
						
						setTimeout(() => {
							this.textContent = '📋 Copiar código';
							this.classList.remove('copied');
						}, 2000);
					}).catch(err => {
						console.error('[Pix] Erro ao copiar:', err);
					});
				});
			}

			console.log('[Pix] ✅ Área Pix renderizada com sucesso');
		} catch (err) {
			console.error('[Pix] ❌ Erro ao gerar código Pix:', err);
			console.error('[Pix] Detalhes do erro:', {
				message: err.message,
				stack: err.stack,
				total: total,
				totalNumerico: totalNumerico
			});
			root.innerHTML = `<div class="pix-error">Erro ao gerar código Pix: ${err.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.</div>`;
		}
	}

	function initializePix() {
		// Função para atualizar o componente
		window.updatePixTotal = function(total) {
			console.log('[Pix] updatePixTotal chamado com total:', total);
			renderPixArea(total);
		};

		// Inicializar com total 0
		console.log('[Pix] Inicializando com total 0');
		window.updatePixTotal(0);
		console.log('[Pix] ✅ Componente Pix inicializado com sucesso');
	}

	// Aguardar DOM e funções estarem prontas
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			setTimeout(waitForFunctions, 100);
		});
	} else {
		setTimeout(waitForFunctions, 100);
	}
})();
