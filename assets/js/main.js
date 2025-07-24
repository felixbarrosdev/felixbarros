document.addEventListener('DOMContentLoaded', () => {
  const typedEl = document.getElementById('typed-dev');

  if (!typedEl) {
    return;
  }

  if (typeof Typed !== 'undefined' && !localStorage.getItem('typedShown')) {
    new Typed('#typed-dev', {
      strings: [
        'DEV'
      ],
      typeSpeed: 100,
      backSpeed: 60,
      backDelay: 1500,
      loop: false,
      onComplete: () => {
        localStorage.setItem('typedShown', 'true');
      }
    });
  } else {
    typedEl.textContent = 'DEV';
  }
});
