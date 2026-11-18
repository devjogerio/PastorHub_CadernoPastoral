/* Persistência offline-first (localStorage) – equivalente a OfflineStorage + useSermoes */
(function () {
  const KEYS = {
    sermoes: 'pastorhub_sermoes',
    queue: 'pastorhub_sync_queue',
    lastSync: 'pastorhub_last_sync',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  /* ---------- Sermões de exemplo (seed inicial) ---------- */
  const SERMON_EXEMPLO_1 = `
<h2>A Fé Que Transforma Montanhas</h2>
<h3>Introdução</h3>
<p>Vivemos em tempos de incertezas, mas a Palavra de Deus nos convida a uma fé que não recua diante dos obstáculos. Jesus disse que se tivermos fé do tamanho de um grão de mostarda, diremos a esta montanha: <strong>muda-se daqui para acolá</strong>, e ela se mudará.</p>
<h3>I. O Que É Fé?</h3>
<p>Fé é a certeza de coisas que se esperam e a convicção de coisas que não se veem (Hebreus 11:1). Não é otimismo ingênuo, é confiança fundamentada no caráter de Deus.</p>
<h3>II. Fé Que Move Montanhas</h3>
<p>As montanhas representam os desafios impossíveis: doenças, dívidas, relacionamentos quebrados. A fé não nega a existência da montanha; ela fala com a montanha.</p>
<ul>
  <li>A fé fala — declarar a Palavra sobre a situação</li>
  <li>A fé age — obedecer mesmo sem ver o resultado</li>
  <li>A fé espera — permanecer firme até a colheita</li>
</ul>
<h3>III. Aplicação Prática</h3>
<blockquote>"Tudo é possível ao que crê." (Marcos 9:23)</blockquote>
<p>Identifique hoje a sua "montanha". Leve-a em oração, declare as promessas e dê o primeiro passo de obediência.</p>
<h3>Conclusão</h3>
<p>Deus não pede uma fé gigante, pede uma fé viva e conectada a Ele. O grão de mostarda, pequeno, cresce e se torna árvore.</p>
<h3>Apelo Prático</h3>
<ul>
  <li>Escreva a montanha que você enfrenta em um papel</li>
  <li>Escolha uma promessa bíblica para declarar por 7 dias</li>
  <li>Compartilhe sua necessidade com alguém de confiança para orar com você</li>
</ul>
<h3>Referências Bíblicas Adicionais</h3>
<ul>
  <li>Hebreus 11:1-6</li>
  <li>Romanos 10:17</li>
  <li>Tiago 1:6-8</li>
</ul>`;

  const SERMON_EXEMPLO_2 = `
<h2>O Amor de Deus</h2>
<h3>Introdução</h3>
<p>O amor de Deus é a base da nossa fé. "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito" (João 3:16).</p>
<h3>I. Um Amor Incondicional</h3>
<p>Deus nos amou antes de merecermos. O amor divino não depende do nosso desempenho, mas da natureza de Deus.</p>
<h3>II. Um Amor Que Se Doa</h3>
<p>A cruz é a maior demonstração de amor da história: Jesus entregou a própria vida por nós.</p>
<h3>Conclusão</h3>
<p>Quem experimenta o amor de Deus é transformado e passa a amar: a Deus, ao próximo e a si mesmo.</p>
<h3>Apelo Prático</h3>
<ul><li>Medite em João 3:16 esta semana</li><li>Faça um gesto concreto de amor por alguém</li></ul>`;

  function diasAtras(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  function seed() {
    const sermoes = [
      {
        id: uid(),
        titulo: 'A Fé Que Transforma Montanhas',
        texto_biblico: 'Mateus 17:20',
        tema: 'Fé',
        publico_alvo: 'Geral',
        tipo_sermao: 'Expositivo',
        conteudo_html: SERMON_EXEMPLO_1,
        conteudo_plain: SERMON_EXEMPLO_1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500),
        tags: ['fé', 'mateus'],
        data_criacao: diasAtras(7),
        data_pregado: diasAtras(2),
        status_pregado: true,
        local_pregado: 'Igreja Sede',
      },
      {
        id: uid(),
        titulo: 'O Amor de Deus',
        texto_biblico: 'João 3:16',
        tema: 'Amor',
        publico_alvo: 'Geral',
        tipo_sermao: 'Temático',
        conteudo_html: SERMON_EXEMPLO_2,
        conteudo_plain: SERMON_EXEMPLO_2.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500),
        tags: ['amor', 'joão'],
        data_criacao: diasAtras(1),
        data_pregado: null,
        status_pregado: false,
        local_pregado: '',
      },
    ];
    write(KEYS.sermoes, sermoes);
  }

  // Primeira visita: popula com dados de exemplo
  if (localStorage.getItem(KEYS.sermoes) === null) seed();

  /* ---------- API pública ---------- */
  window.Storage = {
    KEYS,

    getSermoes() {
      return read(KEYS.sermoes, []);
    },

    saveSermoes(list) {
      write(KEYS.sermoes, list);
    },

    addSermao(sermon) {
      const list = this.getSermoes();
      list.unshift(sermon);
      this.saveSermoes(list);
      this.addToSyncQueue('create', sermon);
      return sermon;
    },

    updateSermao(id, updates) {
      const list = this.getSermoes();
      const i = list.findIndex((s) => s.id === id);
      if (i === -1) return null;
      list[i] = Object.assign({}, list[i], updates);
      this.saveSermoes(list);
      this.addToSyncQueue('update', { id, ...updates });
      return list[i];
    },

    deleteSermao(id) {
      const list = this.getSermoes();
      const sermao = list.find((s) => s.id === id);
      const nova = list.filter((s) => s.id !== id);
      this.saveSermoes(nova);
      if (sermao) this.addToSyncQueue('delete', { id });
      return sermao;
    },

    togglePregado(id, status) {
      const updates = {
        status_pregado: status,
        data_pregado: status ? new Date().toISOString() : null,
      };
      if (!status) updates.local_pregado = '';
      return this.updateSermao(id, updates);
    },

    /* ---------- Fila de sincronização ---------- */
    addToSyncQueue(type, data) {
      const q = read(KEYS.queue, []);
      q.push({ id: uid(), type, data, timestamp: new Date().toISOString() });
      write(KEYS.queue, q);
    },

    getSyncQueue() {
      return read(KEYS.queue, []);
    },

    clearSyncQueue() {
      write(KEYS.queue, []);
    },

    setLastSync() {
      localStorage.setItem(KEYS.lastSync, new Date().toISOString());
    },

    getLastSync() {
      return localStorage.getItem(KEYS.lastSync);
    },

    clearAll() {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('pastorhub_'))
        .forEach((k) => localStorage.removeItem(k));
      seed();
    },

    isOnline() {
      return navigator.onLine;
    },

    addOnlineListener(cb) {
      const on = () => cb(true);
      const off = () => cb(false);
      window.addEventListener('online', on);
      window.addEventListener('offline', off);
      return () => {
        window.removeEventListener('online', on);
        window.removeEventListener('offline', off);
      };
    },
  };
})();
