/**
 * navigation.js
 * Handles mobile app-like bottom navigation view toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
  const body = document.body;

  if (navItems.length === 0) return;

  // Initialize view from current data attribute or default to home
  let currentView = body.getAttribute('data-mobile-view') || 'home';

  // Function to switch view
  const switchView = (targetView) => {
    // 1. Update body attribute
    body.setAttribute('data-mobile-view', targetView);
    currentView = targetView;

    // 2. Update active state on nav buttons
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === targetView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 3. Special handling for specific views
    if (targetView === 'history') {
      // Re-render expenses in case they were modified while off-screen
      if (typeof renderExpenses === 'function') {
        renderExpenses();
      }
    } else if (targetView === 'analytics') {
      // Trigger a resize on charts if needed when they become visible
      // This helps Chart.js re-evaluate its size when parent goes from display:none -> display:block
      window.dispatchEvent(new Event('resize'));
    }

    // Optional: smooth scroll to top when changing views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Expose globally for cross-script navigation
  window.switchMobileView = switchView;

  // Add click listeners to all nav items
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Prevent default in case it's inside a form or link
      e.preventDefault();
      
      const target = item.getAttribute('data-target');
      if (target && target !== currentView) {
        if (target === 'add' && typeof cancelEdit === 'function') {
          cancelEdit();
        }

        switchView(target);
      }
    });
  });
});
