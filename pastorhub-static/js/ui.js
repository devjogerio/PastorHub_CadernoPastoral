/* Utilitários de interface: toasts, sheets, dialog de confirmação, formatação */
(function () {
  const $ = (sel) => document.querySelector(sel);

  window.escapeHtml = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  window.uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  };

  window.capitalize = function (s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  };

  // "22 de nov. de 2026"
  window.fmtDateBR = function (iso) {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
    } catch (e) { return iso; }
  };

  // "22/11/2026"
  window.fmtDateShort = function (iso) {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
    } catch (e) { return iso; }
  };

  window.initialsOf = function (name) {
    return String(name || 'P')
      .split(' ').filter(Boolean).map((n) => n[0]).join('')
      .toUpperCase().substring(0, 2);
  };

  /* ---------- Toasts ---------- */
  window.toast = function (msg, type) {
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 2600);
  };

  /* ---------- Sheet inferior ---------- */
  window.openSheet = function ({ title, desc, body, footer, icon: ic }) {
    $('#sheet-title').innerHTML = (ic ? icon(ic) : '') + escapeHtml(title || '');
    $('#sheet-desc').textContent = desc || '';
    $('#sheet-body').innerHTML = body || '';
    const foot = $('#sheet-footer');
    if (footer) {
      foot.hidden = false;
      foot.innerHTML = footer;
    } else {
      foot.hidden = true;
      foot.innerHTML = '';
    }
    $('#sheet').hidden = false;
    document.body.style.overflow = 'hidden';
  };

  window.closeSheet = function () {
    $('#sheet').hidden = true;
    $('#sheet-body').innerHTML = '';
    $('#sheet-footer').innerHTML = '';
    document.body.style.overflow = '';
  };

  /* ---------- Dialog de confirmação ---------- */
  let confirmCb = null;

  window.confirmDialog = function ({ title, message, confirmLabel, onConfirm }) {
    $('#confirm-title').textContent = title || 'Confirmar';
    $('#confirm-message').innerHTML = message || '';
    $('#confirm-ok').textContent = confirmLabel || 'Excluir';
    confirmCb = onConfirm || null;
    $('#confirm').hidden = false;
  };

  window.closeConfirm = function () {
    $('#confirm').hidden = true;
    confirmCb = null;
  };

  window.runConfirm = function () {
    const cb = confirmCb;
    closeConfirm();
    if (cb) cb();
  };

  /* ---------- Peças reutilizáveis ---------- */
  window.avatarHTML = function (name, cls, extra) {
    return '<div class="avatar ' + (cls || 'avatar-48') + (extra ? ' ' + extra : '') + '">' + escapeHtml(initialsOf(name)) + '</div>';
  };

  window.switchHTML = function (checked, name) {
    return '<span class="switch"><input type="checkbox" data-switch="' + (name || '') + '"' + (checked ? ' checked' : '') + '><span class="track"></span><span class="thumb"></span></span>';
  };

  window.statBtnHTML = function (s) {
    const desc = s.desc || (s.toast || (s.label + ': ' + s.value));
    return '<button class="stat-btn" data-toast="' + escapeHtml(s.toast) + '" data-desc="' + escapeHtml(desc) + '" aria-label="' + escapeHtml(s.label + ': ' + s.value) + '" type="button">' +
      '<span class="stat-icon ' + s.bg + '">' + icon(s.icon) + '</span>' +
      '<span class="stat-value">' + s.value + '</span>' +
      '<span class="stat-label">' + escapeHtml(s.label) + '</span>' +
      '</button>';
  };

  window.StatModal = function (el) {
    const $stat = (sel) => el ? el.querySelector(sel) : null;
    const iconEl = $stat('.stat-icon') ? '<span class="stat-modal-icon ' + el.querySelector('.stat-icon').className.split(' ')[1] + '">' + icon(el.querySelector('.stat-icon').getAttribute('data-icon') || 'info') + '</span>' : '';
    const label = el.querySelector('.stat-label').textContent.trim();
    const value = el.querySelector('.stat-value').textContent.trim();
    const desc = el.getAttribute('data-desc') || (label + ': ' + value);
    const iconName = (el.querySelector('.stat-icon').className.includes('bg-navy') ? 'users' :
      el.querySelector('.stat-icon').className.includes('bg-lime') ? 'calendar' :
      el.querySelector('.stat-icon').className.includes('bg-blue') ? 'video' : 'bell');

    const body = '<div class="stat-modal-content">' +
      '<span class="stat-modal-icon ' + (el.querySelector('.stat-icon') ? el.querySelector('.stat-icon').className.split(' ')[1] : 'bg-navy') + '">' +
      (icon(el.querySelector('.stat-icon').getAttribute('data-icon') || iconName)) +
      '</span>' +
      '<div class="stat-modal-value">' + value + '</div>' +
      '<div class="stat-modal-desc">' + desc + '</div>' +
      '</div>';

    const footer = '<div class="stat-modal-actions">' +
      '<button class="btn btn-sm btn-outline-stats" data-stat-edit type="button"><span class="action-icon">' + icon('edit', 'icon-sm') + '</span><span>Editar</span></button>' +
      '<button class="btn btn-sm btn-outline-stats" data-stat-save type="button" style="display:none"><span class="action-icon">' + icon('check', 'icon-sm') + '</span><span>Salvar</span></button>' +
      '<button class="btn btn-sm btn-outline-stats" data-stat-add type="button" style="display:none"><span class="action-icon">' + icon('plus', 'icon-sm') + '</span><span>Adicionar</span></button>' +
      '<button class="btn btn-sm btn-outline-stats danger" data-stat-delete type="button"><span class="action-icon">' + icon('trash-2', 'icon-sm') + '</span><span>Excluir</span></button>' +
      '</div>';

    openSheet({
      title: label,
      body: body,
      icon: iconName,
      footer: footer,
    });

    // Click handlers
    $('#sheet .stat-modal-actions [data-stat-edit]').addEventListener('click', () => {
      toast('Funcionalidade de edição sendo desenvolvida');
      closeSheet();
    });
    $('#sheet .stat-modal-actions [data-stat-save]').addEventListener('click', () => {
      toast('Salvando ' + label + '...');
      closeSheet();
    });
    $('#sheet .stat-modal-actions [data-stat-add]').addEventListener('click', () => {
      toast('Novo item adicionado');
      closeSheet();
    });
    $('#sheet .stat-modal-actions [data-stat-delete]').addEventListener('click', () => {
      confirmDialog({
        title: 'Excluir ' + label.toLowerCase(),
        message: 'Tem certeza que deseja excluir ' + value + ' ' + label.toLowerCase() + '?',
        confirmLabel: 'Excluir',
        onConfirm: () => {
          toast(label + ' excluído com sucesso');
          closeSheet();
        }
      });
    });
  };

  window.tabsHTML = function (tabs, group) {
    // tabs: [{id,label}]; grupo de estado controlado em views.js
    return '<div class="tabs cols-' + tabs.length + '">' +
      tabs.map((t) => '<button class="tab" data-tab="' + group + '" data-tab-id="' + t.id + '" type="button">' + escapeHtml(t.label) + '</button>').join('') +
      '</div>';
  };

  window.itemMenuHTML = function (items) {
    return '<div class="menu-pop" hidden>' +
      items.map((it) => it.sep ? '<hr>' :
        '<button data-action="' + it.action + '" data-id="' + it.id + '" class="' + (it.danger ? 'danger' : '') + '">' + icon(it.icon, 'icon-sm') + escapeHtml(it.label) + '</button>'
      ).join('') + '</div>';
  };
})();
