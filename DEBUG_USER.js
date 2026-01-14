// Quick Debug Script - Check User Data
// Paste this in browser console (F12)

const userData = JSON.parse(localStorage.getItem('userData') || '{}');
console.log('=== USER DATA ===');
console.log('Role:', userData.role);
console.log('Is Recruiter:', userData.is_recruiter);
console.log('Is Paid:', userData.is_paid);
console.log('Subscription:', userData.subscription_plan);

// If you're a recruiter but not paid, manually mark as paid:
if (userData.role === 'RECRUITER' && !userData.is_paid) {
  console.log('⚠️ You are an UNPAID recruiter!');
  console.log('Run this to manually mark as paid:');
  console.log(`
    userData.is_paid = true;
    userData.subscription_plan = 'PRO';
    localStorage.setItem('userData', JSON.stringify(userData));
    window.location.reload();
  `);
}
