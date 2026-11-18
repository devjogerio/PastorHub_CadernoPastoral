/* Dados mockados das telas (dashboard, agenda, atendimentos, recursos, notificações, busca) */
(function () {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const cap = window.capitalize || ((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ''));
  const label = cap(fmt.format(now)); // "segunda-feira, 16 de novembro" -> "Segunda-feira, 16 de novembro"

  window.HOJE_LABEL = 'Hoje - ' + label;
  window.HOJE_CURTO = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);

  window.MOCK = {
    dashboard: {
      stats: [
        { label: 'Hoje', value: 3, icon: 'users', bg: 'bg-navy', toast: 'Visualizando Hoje: 3 itens' },
        { label: 'Semana', value: 12, icon: 'calendar', bg: 'bg-lime', toast: 'Visualizando Semana: 12 itens' },
        { label: 'Palestras', value: 5, icon: 'video', bg: 'bg-blue', toast: 'Visualizando Palestras: 5 itens' },
        { label: 'Alertas', value: 2, icon: 'bell', bg: 'bg-lime', toast: 'Visualizando Alertas: 2 itens' },
      ],
      quick: [
        { label: 'Novo Agendamento', icon: 'plus', action: 'novo-evento' },
        { label: 'Atendimento', icon: 'users', action: 'ir-para-atendimentos' },
        { label: 'Sermão IA', icon: 'sparkles', action: 'abrir-gerador-sermao' },
        { label: 'Biblioteca', icon: 'book-open', action: 'ir-para-recursos' },
      ],
      atendimentos: [
        { nome: 'Maria Silva', hora: '14:00', tipo: 'Aconselhamento', badge: 'Em 30min' },
        { nome: 'João Santos', hora: '16:00', tipo: 'Visitação', badge: 'Em 2h' },
        { nome: 'Ana Costa', hora: '18:00', tipo: 'Oração', badge: 'Hoje' },
      ],
    },

    agenda: {
      stats: [
        { label: 'Hoje', value: 3, icon: 'calendar', bg: 'bg-navy', toast: 'Hoje: 3 eventos' },
        { label: 'Semana', value: 12, icon: 'clock', bg: 'bg-lime', toast: 'Semana: 12 eventos' },
        { label: 'Online', value: 5, icon: 'video', bg: 'bg-blue', toast: 'Online: 5 eventos' },
        { label: 'Presencial', value: 7, icon: 'map-pin', bg: 'bg-lime', toast: 'Presencial: 7 eventos' },
      ],
      eventos: [
        { titulo: 'Maria Silva', quando: 'Hoje, 14:00', tipo: 'Aconselhamento', local: 'Presencial', cor: 'blue-border' },
        { titulo: 'João Santos', quando: 'Hoje, 16:00', tipo: 'Visitação', local: 'Casa', cor: 'green-border' },
        { titulo: 'Ana Costa', quando: 'Hoje, 18:00', tipo: 'Oração', local: 'Online', cor: 'purple-border' },
        { titulo: 'Palestra Juventude', quando: 'Amanhã, 10:00', tipo: 'Palestra', local: 'Igreja', cor: 'orange-border' },
        { titulo: 'Culto Principal', quando: 'Amanhã, 19:00', tipo: 'Culto', local: 'Igreja', cor: 'red-border' },
      ],
      integracoes: [
        { emoji: '🔵', nome: 'Google Calendar', status: 'Conectado', conectado: true },
        { emoji: '🔷', nome: 'Outlook', status: 'Desconectado', conectado: false },
        { emoji: '🍎', nome: 'Apple Calendar', status: 'Desconectado', conectado: false },
      ],
    },

    atendimentos: {
      stats: [
        { label: 'Hoje', value: 2, icon: 'clock', bg: 'bg-navy', toast: 'Hoje: 2 atendimentos' },
        { label: 'Semana', value: 8, icon: 'calendar', bg: 'bg-lime', toast: 'Semana: 8 atendimentos' },
        { label: 'Agendados', value: 4, icon: 'users', bg: 'bg-blue', toast: 'Agendados: 4 atendimentos' },
        { label: 'Concluídos', value: 15, icon: 'users', bg: 'bg-lime', toast: 'Concluídos: 15 atendimentos' },
      ],
      lista: [
        { nome: 'Maria Silva', quando: 'Hoje, 14:00', tipo: 'Aconselhamento', status: 'Agendado', modalidade: 'Presencial', motivo: 'Questões familiares' },
        { nome: 'João Santos', quando: 'Hoje, 16:00', tipo: 'Visitação', status: 'Agendado', modalidade: 'Visitação', motivo: 'Acompanhamento pós-cirurgia' },
        { nome: 'Ana Costa', quando: 'Amanhã, 10:00', tipo: 'Oração', status: 'Agendado', modalidade: 'Online', motivo: 'Intercessão familiar' },
        { nome: 'Pedro Oliveira', quando: 'Ontem', tipo: 'Aconselhamento', status: 'Concluído', modalidade: 'Telefone', motivo: 'Direção espiritual' },
        { nome: 'Carla Mendes', quando: '31 Out', tipo: 'Aconselhamento', status: 'Agendado', modalidade: 'Presencial', motivo: 'Conflitos conjugais' },
      ],
    },

    recursos: {
      stats: [
        { label: 'Palestras', value: 3, icon: 'sparkles', bg: 'bg-navy', toast: 'Palestras: 3' },
        { label: 'Vídeos', value: 3, icon: 'video', bg: 'bg-lime', toast: 'Vídeos: 3' },
        { label: 'Views', value: '4.2K', icon: 'users', bg: 'bg-blue', toast: 'Views: 4.2K' },
        { label: 'Salvos', value: 12, icon: 'book-open', bg: 'bg-lime', toast: 'Salvos: 12' },
      ],
      palestras: [
        { titulo: 'Fé em Tempos Difíceis', publico: 'Adultos', duracao: '30 min' },
        { titulo: 'O Poder da Oração', publico: 'Geral', duracao: '45 min' },
        { titulo: 'Juventude e Propósito', publico: 'Jovens', duracao: '40 min' },
      ],
      videos: [
        { titulo: 'Como Lidar com a Ansiedade', categoria: 'Aconselhamento', views: '1250 views' },
        { titulo: 'Casamento e Família', categoria: 'Família', views: '890 views' },
        { titulo: 'Juventude com Propósito', categoria: 'Jovens', views: '2100 views' },
      ],
    },

    notificacoes: {
      stats: (naoLidas, total) => [
        { label: 'Não Lidas', value: naoLidas, icon: 'bell', bg: 'bg-navy', toast: 'Não Lidas: ' + naoLidas + ' notificações' },
        { label: 'Hoje', value: 2, icon: 'clock', bg: 'bg-lime', toast: 'Hoje: 2 notificações' },
        { label: 'Alta', value: 1, icon: 'bell', bg: 'bg-red', toast: 'Alta: 1 notificações' },
        { label: 'Total', value: total, icon: 'check-circle', bg: 'bg-blue', toast: 'Total: ' + total + ' notificações' },
      ],
      lista: [
        { tipo: 'atendimento', titulo: 'Atendimento em 30 minutos', desc: 'Aconselhamento com Maria Silva às 14:00', hora: '13:30', lida: false, prioridade: 'alta' },
        { tipo: 'agenda', titulo: 'Novo agendamento', desc: 'João Santos solicitou atendimento', hora: '12:15', lida: false, prioridade: 'media' },
        { tipo: 'palestra', titulo: 'Lembrete: Palestra da Juventude', desc: 'Palestra amanhã às 19h', hora: 'Ontem', lida: true, prioridade: 'media' },
        { tipo: 'sistema', titulo: 'Sincronização realizada', desc: 'Google Calendar atualizado', hora: 'Ontem', lida: true, prioridade: 'baixa' },
      ],
      config: [
        { label: 'Atendimentos próximos', sub: '30 min antes', on: true },
        { label: 'Novos agendamentos', sub: 'Instantâneo', on: true },
        { label: 'Palestras agendadas', sub: '1 dia antes', on: true },
        { label: 'Sincronização', sub: 'Diariamente', on: false },
        { label: 'Resumo diário', sub: '8h da manhã', on: true },
      ],
      avancadas: [
        { label: 'Som das notificações', icon: 'settings', toast: 'Abrindo configurações de som...' },
        { label: 'Horário silencioso', icon: 'clock', toast: 'Configurando horário silencioso...' },
        { label: 'Notificações por e-mail', icon: 'bell', toast: 'Configurando notificações por e-mail...' },
      ],
    },

    busca: {
      sermoes: [
        { titulo: 'Fé que Move Montanhas', ref: 'Mateus 17:20', data: '15 Nov', pregado: true },
        { titulo: 'O Amor de Deus', ref: 'João 3:16', data: '22 Nov', pregado: false },
      ],
      atendimentos: [
        { nome: 'Maria Silva', tipo: 'Aconselhamento', quando: 'Hoje, 14:00' },
        { nome: 'João Santos', tipo: 'Visitação', quando: 'Amanhã, 10:00' },
      ],
      agenda: [
        { titulo: 'Palestra Juventude', quando: '25 Nov 19:00', tipo: 'Palestra' },
        { titulo: 'Culto Principal', quando: '26 Nov 19:00', tipo: 'Culto' },
      ],
    },

    /* =========================================================
       NOVO · Aconselhamento Digital com IA (Google Meet)
       ========================================================= */
    conselho: {
      stats: [
        { label: 'Sessões', value: 4, icon: 'video', bg: 'bg-navy', toast: 'Sessões: 4 no mês' },
        { label: 'Horas', value: '2h10', icon: 'clock', bg: 'bg-blue', toast: 'Horas de aconselhamento' },
        { label: 'Confiança', value: '72%', icon: 'activity', bg: 'bg-lime', toast: 'Sentimento médio: 72% confiança' },
        { label: 'Relatórios', value: 3, icon: 'file-text', bg: 'bg-red', toast: 'Relatórios confidenciais gerados' },
      ],
      sessoes: [
        { nome: 'Maria Silva', quando: 'Hoje, 14:00', duracao: '32 min', status: 'Agendada', meet: 'meet.google.com/pastorhub-maria', tipo: 'Aconselhamento', cor: '#002645' },
        { nome: 'João Santos', quando: 'Ontem, 16:00', duracao: '41 min', status: 'Concluída', meet: 'meet.google.com/pastorhub-joao', tipo: 'Visitação', cor: '#3261AB' },
        { nome: 'Ana Costa', quando: '12 Nov, 18:00', duracao: '27 min', status: 'Concluída', meet: 'meet.google.com/pastorhub-ana', tipo: 'Oração', cor: '#95C121' },
        { nome: 'Pedro Oliveira', quando: '10 Nov, 15:30', duracao: '35 min', status: 'Concluída', meet: 'meet.google.com/pastorhub-pedro', tipo: 'Aconselhamento', cor: '#a855f7' },
      ],
      /* roteiro de simulação da transcrição ao vivo */
      roteiro: [
        { speaker: 'Pastor', text: 'Maria, obrigado por estar aqui hoje. Como você está se sentindo?' },
        { speaker: 'Membro', text: 'Pastor, tem sido um tempo difícil. Sinto muita ansiedade com o trabalho e estou com medo de falhar com minha família.' },
        { speaker: 'Pastor', text: 'Entendo. Quando você diz que sente medo de falhar, o que aparece primeiro na sua mente?' },
        { speaker: 'Membro', text: 'A Solidão. Sinto solidão dentro de casa, mesmo com a minha família por perto. Acordo cansado e com dor no peito.' },
        { speaker: 'Pastor', text: 'Solidão dentro de casa é um peso real. Vamos lembrar que a Escritura diz que Deus não deixa o seu coração só.' },
        { speaker: 'Membro', text: 'É verdade, pastor. A minha fé me dá esperança, e quando rezo eu sinto paz e força para recomeçar.' },
        { speaker: 'Pastor', text: 'Perfeito. Vou propor um plano: oração diária, acompanhamento semanal e um versículo para a sua casa esta semana.' },
        { speaker: 'Membro', text: 'Aceito, pastor. Obrigado. Saio daqui com esperança e sem culpa.' },
      ],
      lexiconPos: ['paz', 'esperança', 'força', 'gratidão', 'amor', 'fé', 'curar', 'alívio', 'recomeçar', 'feliz', 'confiança'],
      lexiconNeg: ['medo', 'ansiedade', 'dor', 'tristeza', 'culpa', 'desespero', 'solidão', 'preocupação', 'sofrimento', 'cansado', 'falhar'],
    },

    /* =========================================================
       NOVO · Lembretes e integração WhatsApp
       ========================================================= */
    whatsapp: {
      status: {
        conectado: true,
        numero: '+55 86 98903-8050',
        provedor: 'WhatsApp Business API (Meta Cloud)',
        templates: 4,
        mensagensMes: 3240,
      },
      templates: [
        { nome: 'Lembrete de atendimento', texto: 'Olá {{nome}}! Passando para lembrar do seu atendimento pastoral hoje às {{hora}} no {{local}}. Responda 1 para confirmar. Deus abençoe!', ativo: true },
        { nome: 'Confirmação de presença', texto: 'Perfeito, {{nome}}! Seu atendimento está confirmado para {{data}} às {{hora}}. Se precisar remarcar, responda esta mensagem.', ativo: true },
        { nome: 'Visitação pastoral', texto: 'Olá {{nome}}, o pastor {{pastor}} estará em visita à sua casa {{data}} às {{hora}}. Posso confirmar?', ativo: true },
        { nome: 'Oração e palavra', texto: 'Olá {{nome}}! Palavra da {{data}}: "A paz que excede todo entendimento". Fique com Deus!', ativo: false },
      ],
      lembretes: [
        { nome: 'Maria Silva', quando: 'Hoje, 14:00', tipo: 'Aconselhamento', status: 'Confirmado', resposta: '1', hora: '13:05' },
        { nome: 'João Santos', quando: 'Hoje, 16:00', tipo: 'Visitação', status: 'Enviado', resposta: '', hora: '12:10' },
        { nome: 'Ana Costa', quando: 'Amanhã, 10:00', tipo: 'Oração', status: 'Enviado', resposta: '', hora: 'Ontem, 18:22' },
        { nome: 'Carla Mendes', quando: '31 Out, 09:00', tipo: 'Aconselhamento', status: 'Confirmado', resposta: '1', hora: '30 Out, 17:40' },
        { nome: 'Pedro Oliveira', quando: '29 Out, 15:30', tipo: 'Aconselhamento', status: 'Falhou', resposta: '', hora: '29 Out, 13:00' },
      ],
      metrics: [
        { label: 'Enviados', v: 128 },
        { label: 'Entregues', v: 124 },
        { label: 'Confirmados', v: 91 },
        { label: 'Falhas', v: 4 },
      ],
    },
  };
})();
