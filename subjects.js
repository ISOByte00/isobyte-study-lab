/* First-run course selection and switching */
(function () {
  'use strict';
  const KEY = 'isobyte_selected_course_v1';
  const gate = document.getElementById('course-gate');
  const english = document.querySelector('.app-shell');
  if (!gate || !english) return;
  const german = () => document.getElementById('german-root');

  function hideApps() {
    english.style.display = 'none';
    if (german()) german().style.display = 'none';
  }
  function choose() {
    hideApps();
    gate.hidden = false;
    gate.querySelector('button')?.focus();
  }
  function select(course) {
    if (!['english', 'german'].includes(course)) return;
    try { localStorage.setItem(KEY, course); } catch (_) {}
    gate.hidden = true;
    if (course === 'english') {
      if (german()) german().style.display = 'none';
      english.style.display = '';
    } else {
      english.style.display = 'none';
      if (!german() && window.GermanStudy) window.GermanStudy.mount();
      if (german()) german().style.display = '';
      window.GermanStudy?.render();
    }
  }

  gate.addEventListener('click', event => {
    const button = event.target.closest('[data-course]');
    if (button) select(button.dataset.course);
  });
  window.addEventListener('isobyte:choose-course', choose);

  const actions = document.querySelector('.top-actions');
  if (actions && !document.getElementById('course-switcher')) {
    const button = document.createElement('button');
    button.id = 'course-switcher';
    button.className = 'course-switcher';
    button.type = 'button';
    button.textContent = 'Dersi değiştir';
    button.addEventListener('click', choose);
    actions.insertBefore(button, actions.firstChild);
  }

  let selected = '';
  try { selected = localStorage.getItem(KEY) || ''; } catch (_) {}
  if (selected) select(selected);
  else choose();
})();