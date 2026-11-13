/* Lightweight scroll reveals and staggered card entrances. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const revealTargets = [
    '.homepage-section', '.class-section', '.learning-section', '.series-section',
    '.community-section', '.events-section', '.class-card', '.schedule-card',
    '.series-card', '.featured-series-card', '.guide-card', '.my-learning-card',
    '.class-detail-card', '.medicaid-resource-card', '.helen-feature-card'
  ].join(',');

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  const prepare = root => {
    const candidates = [];
    if (root instanceof Element && root.matches(revealTargets)) candidates.push(root);
    if (root.querySelectorAll) candidates.push(...root.querySelectorAll(revealTargets));
    candidates.forEach((element, index) => {
      if (element.classList.contains('dn-reveal')) return;
      element.classList.add('dn-reveal');
      if (element.matches('.class-card, .schedule-card, .series-card, .featured-series-card, .guide-card')) {
        element.style.setProperty('--dn-reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
      }
      observer.observe(element);
    });
  };

  const start = () => {
    prepare(document);
    const mutationObserver = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) prepare(node);
      }));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
