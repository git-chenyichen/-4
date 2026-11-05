export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password, role } = req.body;
  const envVar = role === 'admin' ? process.env.ADMINS : process.env.STUDENTS;

  let accounts = {};
  try {
    accounts = envVar ? JSON.parse(envVar) : {};
  } catch (e) {
    return res.status(500).json({ message: '環境變數 JSON 解析錯誤' });
  }

  if (accounts[username] && accounts[username] === password) {
    return res.status(200).json({ success: true, username, role });
  } else {
    return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
  }
}
