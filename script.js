// ==========================================
// 1. INISIALISASI SUPABASE
// ==========================================
const SUPABASE_URL = 'https://dtcbhkjdnriyctniucdq.supabase.co'; // Ref project kamu
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY_KAMU'; // Masukkan anon/public key dari project settings -> API
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. FUNGSI UI DASHBOARD / STATE LOGIN
// ==========================================
function renderDashboard(user) {
  const container = document.querySelector('.container');
  if (container) container.style.display = 'none';

  let dash = document.getElementById('dashboard-view');
  if (!dash) {
    dash = document.createElement('div');
    dash.id = 'dashboard-view';
    dash.className = 'dashboard-view';
    dash.innerHTML = `
      <div class="dashboard-card" style="text-align: center; color: #fff;">
        <h2 style="margin-bottom: 10px;">Login Berhasil! 🎉</h2>
        <p style="color: #00b4d8; margin-bottom: 15px;">Anda masuk sebagai:</p>
        <p id="user-email" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 25px; word-break: break-all;"></p>
        <button id="btn-logout" class="submit-btn" style="background-color: #ef4444; width: 100%; border: none; padding: 12px; border-radius: 8px; color: #fff; font-weight: 600; cursor: pointer;">Log out</button>
      </div>
    `;
    document.body.appendChild(dash);
  }

  // Styling dasar kalau container dashboard belum tercover CSS luar
  dash.style.display = 'flex';
  dash.style.justifyContent = 'center';
  dash.style.alignItems = 'center';
  dash.style.minHeight = '100vh';
  dash.style.backgroundColor = 'inherit';

  const userEmailEl = dash.querySelector('#user-email');
  if (userEmailEl) {
    userEmailEl.textContent = user.email || user.user_metadata?.full_name || 'User Transaku';
  }

  // Handler Logout
  const btnLogout = dash.querySelector('#btn-logout');
  if (btnLogout) {
    btnLogout.onclick = async () => {
      await _supabase.auth.signOut();
      hideDashboard();
    };
  }
}

function hideDashboard() {
  const dash = document.getElementById('dashboard-view');
  if (dash) dash.style.display = 'none';
  const container = document.querySelector('.container');
  if (container) container.style.display = 'flex';
}

// ==========================================
// 3. CEK SESI & AUTH STATE CHANGE
// ==========================================
async function checkUserSession() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    renderDashboard(session.user);
  } else {
    hideDashboard();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  checkUserSession();
});

_supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    renderDashboard(session.user);
  } else if (event === 'SIGNED_OUT') {
    hideDashboard();
  }
});

// ==========================================
// 4. EVENT LISTENER GOOGLE OAUTH
// ==========================================
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
  btnGoogle.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) {
      console.error('Google OAuth Error:', error.message);
      alert('Gagal login dengan Google: ' + error.message);
    }
  });
}
