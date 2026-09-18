// --- KONFIGURASI SUPABASE ---
const { createClient } = supabase;

const supabaseUrl = 'https://dtcbhkjdnriyctniucdq.supabase.co';
const supabaseKey = 'sb_publishable_vWn46jJaAL3kUB-0039gPA_z2WlSFN5';
const _supabase = createClient(supabaseUrl, supabaseKey);

// --- LOGIKA UI (TOGGLE LOGIN/SIGNUP) ---
const toggleSignup = document.getElementById('toggle-signup');
const toggleSignin = document.getElementById('toggle-signin');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const nameGroup = document.getElementById('name-group');
const termsGroup = document.getElementById('terms-group');
const submitBtn = document.getElementById('submit-btn');
const linkLogin = document.getElementById('link-login');

let isLoginMode = false;

function switchToLogin() {
  isLoginMode = true;
  toggleSignin.classList.add('active');
  toggleSignup.classList.remove('active');

  formTitle.innerText = 'Log in to your account';
  formSubtitle.innerHTML = 'Don\'t have an account? <a href="#" onclick="switchToSignup()">Sign up</a>';

  nameGroup.style.display = 'none';
  termsGroup.style.display = 'none';
  submitBtn.innerText = 'Log in';
  document.querySelector('.divider span').innerText = 'Or log in with';
}

function switchToSignup() {
  isLoginMode = false;
  toggleSignup.classList.add('active');
  toggleSignin.classList.remove('active');

  formTitle.innerText = 'Create an account';
  formSubtitle.innerHTML = 'Already have an account? <a href="#" onclick="switchToLogin()">Log in</a>';

  nameGroup.style.display = 'flex';
  termsGroup.style.display = 'flex';
  submitBtn.innerText = 'Create account';
  document.querySelector('.divider span').innerText = 'Or register with';
}

toggleSignin.addEventListener('click', switchToLogin);
toggleSignup.addEventListener('click', switchToSignup);
linkLogin.addEventListener('click', switchToLogin);

// Toggle visibility password
document.getElementById('toggle-pwd').addEventListener('click', function() {
  const pwdInput = document.getElementById('password');
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    this.classList.remove('fa-eye-slash');
    this.classList.add('fa-eye');
  } else {
    pwdInput.type = 'password';
    this.classList.remove('fa-eye');
    this.classList.add('fa-eye-slash');
  }
});

// --- LOGIKA OTENTIKASI SUPABASE ---

// 1. Login menggunakan Google
document.getElementById('btn-google').addEventListener('click', async () => {
  const { data, error } = await _supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    alert("Gagal login dengan Google: " + error.message);
  }
});

// 2. Submit Form (Email & Password)
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (isLoginMode) {
    // Proses Log In
    const { data, error } = await _supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) alert("Error Login: " + error.message);
    else alert("Berhasil Login!");

  } else {
    // Proses Sign Up
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    const { data, error } = await _supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (error) alert("Error Sign Up: " + error.message);
    else alert("Pendaftaran berhasil! Cek email kamu.");
  }
});

const containerEl = document.querySelector('.container');
// Buat element dashboard di DOM atau buat fungsi toggle view:
function renderDashboard(user) {
  // Sembunyikan form auth, tampilkan dashboard
  document.querySelector('.container').style.display = 'none';

  // Cek apakah elemen dashboard sudah ada, kalau belum buat dinamis / tampilkan
  let dash = document.getElementById('dashboard-view');
  if (!dash) {
    dash = document.createElement('div');
    dash.id = 'dashboard-view';
    dash.className = 'dashboard-view';
    dash.innerHTML = `
      <div class="dashboard-card">
        <h2 style="margin-bottom: 10px;">Login Berhasil! 🎉</h2>
        <p style="color: #00b4d8; margin-bottom: 15px;">Anda masuk sebagai:</p>
        <p id="user-email" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 25px;"></p>
        <button id="btn-logout" class="submit-btn" style="background-color: #ef4444;">Log out</button>
      </div>
    `;
    document.body.appendChild(dash);
  }

  dash.style.display = 'flex';
  dash.querySelector('#user-email').textContent = user.email || user.user_metadata?.full_name;

  // Handler Logout
  dash.querySelector('#btn-logout').onclick = async () => {
    await _supabase.auth.signOut();
    dash.style.display = 'none';
    document.querySelector('.container').style.display = 'flex';
  };
}

// Cek session saat halaman dimuat
async function checkUserSession() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    renderDashboard(session.user);
  }
}

// Panggil saat load
checkUserSession();

// Tangani perubahan Auth (termasuk balik dari Google OAuth redirect)
_supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    renderDashboard(session.user);
  } else if (event === 'SIGNED_OUT') {
    const dash = document.getElementById('dashboard-view');
    if (dash) dash.style.display = 'none';
    document.querySelector('.container').style.display = 'flex';
  }
});
