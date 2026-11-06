const ENV_ACCOUNTS = {
  ADMINS: {
    "50162": "chenyichen1106",
    "teacher01": "chenyichen1106"
  },
  STUDENTS: {
    "s50159": "50159",
    "s50167": "50167"
  }
};

function getCurrentUser() {
  const userJson = localStorage.getItem('drone_user');
  return userJson ? JSON.parse(userJson) : null;
}

function checkAuth(requireAdmin = false) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (requireAdmin && user.role !== 'admin') {
    alert("權限不足：無法存取管理員頁面！");
    window.location.href = 'booking.html';
    return null;
  }
  return user;
}

function loginUser(username, password, role) {
  const targetUsers = (role === 'admin') ? ENV_ACCOUNTS.ADMINS : ENV_ACCOUNTS.STUDENTS;
  if (targetUsers && targetUsers[username] && targetUsers[username] === password) {
    const userObj = { username: username, role: role, name: username };
    localStorage.setItem('drone_user', JSON.stringify(userObj));
    return { success: true, user: userObj };
  }
  return { success: false, message: "帳號或密碼錯誤" };
}

function logout() {
  localStorage.removeItem('drone_user');
  window.location.href = 'login.html';
}

function renderNavbar(activeTab) {
  const user = getCurrentUser();
  if (!user) return;

  const header = document.createElement('header');
  header.className = "border-b border-slate-200 pb-4 mb-6 flex flex-row justify-between items-center gap-2";
  
  const roleBadgeClass = user.role === 'admin' 
    ? "bg-slate-900 text-white" 
    : "bg-slate-100 text-slate-700 border border-slate-200";

  header.innerHTML = `
    <div>
      <div class="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase">嘉華中學 無人機校隊</div>
      <h1 class="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">國一4 訓練登記</h1>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${roleBadgeClass}">
        ${user.role === 'admin' ? '管理者' : '學生'} (${user.username})
      </span>
      <button onclick="logout()" class="text-xs px-2.5 py-1.5 text-rose-600 font-medium active:opacity-70">登出</button>
    </div>
  `;

  const navTabs = document.createElement('div');
  navTabs.className = "flex border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar";
  navTabs.innerHTML = `
    <a href="booking.html" class="py-3 px-4 text-sm font-medium border-b-2 ${activeTab === 'booking' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'} whitespace-nowrap">登記訓練</a>
    <a href="calendar.html" class="py-3 px-4 text-sm font-medium border-b-2 ${activeTab === 'calendar' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'} whitespace-nowrap">當月月曆與名單</a>
    ${user.role === 'admin' ? `<a href="admin.html" class="py-3 px-4 text-sm font-medium border-b-2 ${activeTab === 'admin' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'} whitespace-nowrap">管理員控制台</a>` : ''}
  `;

  const appDiv = document.getElementById('app');
  appDiv.insertBefore(navTabs, appDiv.firstChild);
  appDiv.insertBefore(header, appDiv.firstChild);
}
