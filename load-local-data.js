// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 读取个人信息JSON
    const response = await fetch('profile.json');
    if (!response.ok) throw new Error('无法加载个人信息');
    const profile = await response.json();

    // 填充个人信息
    document.getElementById('userName').textContent = profile.name || '未知姓名';
    document.getElementById('userTitle').textContent = profile.title || '未知职位';
    document.getElementById('userIntro').textContent = profile.introduction || '暂无介绍';

    // 生成联系方式
    const contactsContainer = document.getElementById('contactsContainer');
    contactsContainer.innerHTML = ''; // 清空占位符

    (profile.contacts || []).forEach(contact => {
      const link = document.createElement('a');
      link.href = contact.url || '#';
      link.className = 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors';
      link.innerHTML = `<i class="fa ${contact.icon || 'fa-link'}"></i>`;
      contactsContainer.appendChild(link);
    });

  } catch (error) {
    console.error('加载本地数据失败:', error);
    // 显示错误提示
    document.getElementById('userIntro').textContent = '个人信息加载失败，请检查本地文件';
  }

  // 处理头像加载失败（如果head.jpg不存在）
  const avatarImg = document.getElementById('userAvatar');
  avatarImg.addEventListener('error', () => {
    avatarImg.src = 'https://picsum.photos/200/200'; // 加载失败时显示默认图
  });
});