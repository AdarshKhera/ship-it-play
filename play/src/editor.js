export function createEditor() {
  const root = document.getElementById('editor');
  const form = document.getElementById('editor-form');
  const title = document.getElementById('editor-title');
  const fieldsBox = document.getElementById('editor-fields');
  const resetBtn = document.getElementById('editor-reset');
  const cancelBtn = document.getElementById('editor-cancel');
  let open = false;
  let handlers = null;
  let inputs = [];

  function close() {
    open = false;
    root.hidden = true;
    handlers = null;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!handlers) return;
    const values = Object.fromEntries(inputs.map(i => [i.name, i.value]));
    const save = handlers.onSave;
    close();
    save(values);
  });
  cancelBtn.addEventListener('click', close);
  resetBtn.addEventListener('click', () => {
    if (!handlers || !handlers.onReset) return;
    const reset = handlers.onReset;
    close();
    reset();
  });
  root.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
  root.addEventListener('pointerdown', e => { if (e.target === root) close(); });

  return {
    isOpen: () => open,
    close,
    open(config) {
      handlers = config;
      title.textContent = config.heading;
      fieldsBox.replaceChildren();
      inputs = config.fields.map(f => {
        const wrap = document.createElement('label');
        const cap = document.createElement('span');
        cap.textContent = f.label;
        const input = document.createElement('input');
        input.type = 'text';
        input.name = f.id;
        input.value = f.value;
        input.maxLength = f.max;
        input.placeholder = f.placeholder || '';
        input.autocomplete = 'off';
        input.spellcheck = false;
        wrap.append(cap, input);
        fieldsBox.append(wrap);
        return input;
      });
      resetBtn.hidden = !config.onReset;
      root.hidden = false;
      open = true;
      setTimeout(() => { inputs[0].focus(); inputs[0].select(); }, 30);
    },
  };
}
