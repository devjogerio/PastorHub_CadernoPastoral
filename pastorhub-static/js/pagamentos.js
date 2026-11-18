/* ============================================================
   Pagamentos — estado de cobrança para o app
   Lê assinaturas, bloqueio por pendência, gateways, Pix
   recorrente e gera o QR Code (BR Code / EMV) de cobrança.
   Compartilhado entre as 3 versões do app (mobile/tablet/desktop).
   ============================================================ */
(function () {
  function ler(chave, padrao) {
    try {
      const v = JSON.parse(localStorage.getItem(chave));
      if (v && typeof v === 'object') return v;
    } catch (e) {}
    return padrao || {};
  }

  const FAT_PADRAO = {
    ativo: true, diaVencimento: 5, toleranciaDias: 7, lembreteDias: 3,
    lembreteWhats: true, lembreteEmail: true, autoBloqueio: true,
    gatewayPadrao: 'Mercado Pago', pixRecorrente: true,
  };
  const PIX_PADRAO = {
    chave: '', nome: 'PastorHub', cidade: 'SAO PAULO', valor: 0,
    tipo: 'estatica', gateway: 'mercadopago', recorrente: true, cobrancaAuto: true,
  };

  /* ---------- BR Code / EMV (Pix copia e cola) ---------- */
  function emv(id, val) { return id + String(val.length).padStart(2, '0') + val; }
  function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  function pixPayload(p) {
    let s = emv('00', '01') + emv('26', emv('00', 'BR.GOV.BCB.PIX') + emv('01', p.chave));
    if (p.valor > 0) s += emv('52', '0000') + emv('53', '986') + emv('54', Number(p.valor).toFixed(2));
    s += emv('58', 'BR') + emv('59', String(p.nome || 'PASTORHUB').toUpperCase().slice(0, 25)) + emv('60', String(p.cidade || 'SAO PAULO').toUpperCase().slice(0, 15)) + emv('62', emv('05', '***'));
    s += '6304';
    return s + crc16(s);
  }

  let qrCarregado = false;
  function renderQR(canvas, texto, fallbackEl) {
    const falha = () => {
      if (canvas) canvas.style.display = 'none';
      if (fallbackEl) { fallbackEl.hidden = false; fallbackEl.textContent = texto; }
    };
    const aplicar = () => {
      /* API "qrcode" (toCanvas) */
      if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
        try { window.QRCode.toCanvas(canvas, texto, { width: 168, margin: 1 }); return true; } catch (e) {}
      }
      /* API qrcodejs (new QRCode(el, opts)) */
      if (typeof window.QRCode === 'function' && canvas && canvas.parentElement) {
        try {
          canvas.style.display = 'none';
          new window.QRCode(canvas.parentElement, { text: texto, width: 168, height: 168, colorDark: '#000000', colorLight: '#ffffff' });
          return true;
        } catch (e) {}
      }
      return false;
    };
    if (aplicar()) return;
    if (qrCarregado) { setTimeout(() => { aplicar() || falha(); }, 600); return; }
    qrCarregado = true;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = () => { aplicar() || falha(); };
    s.onerror = falha;
    document.head.appendChild(s);
  }

  const Pag = {
    lerPix() { return Object.assign({}, PIX_PADRAO, ler('pastorhub_pix', {})); },
    lerGateways() { const g = ler('pastorhub_gateways', []); return Array.isArray(g) ? g : []; },
    lerFat() { return Object.assign({}, FAT_PADRAO, ler('pastorhub_faturamento', {})); },
    lerAssinaturas() { return ler('pastorhub_admin_assinaturas', {}); },
    assinaturaDe(email) {
      if (!email) return null;
      const a = this.lerAssinaturas()[email];
      return a && typeof a === 'object' ? a : null;
    },
    bloqueada(a) { return !!a && a.statusCobranca === 'Bloqueada'; },
    pendente(a) { return !!a && a.statusCobranca === 'Pendente'; },
    gatewayAtivo() {
      const gws = this.lerGateways();
      return gws.find((g) => g.ativo) || gws[0] || null;
    },
    pixPronto() {
      const p = this.lerPix();
      const g = this.lerGateways().find((x) => x.id === p.gateway);
      return !!(p.chave && g && g.ativo);
    },
    emv, crc16, pixPayload, renderQR,
  };

  window.PastorPag = Pag;
})();
