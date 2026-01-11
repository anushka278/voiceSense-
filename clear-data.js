// Clear all Sage data from localStorage
// Run this in browser console: copy and paste the code below

console.log('Clearing Sage data...');

// Remove user accounts
localStorage.removeItem('sage-users');

// Remove Zustand storage
localStorage.removeItem('sage-storage');

console.log('✅ All Sage accounts and data have been deleted!');
console.log('Please refresh the page.');
