from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # PC 端视角 (1280x800)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    
    # 捕获 console 错误
    console_errors = []
    page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
    
    page.goto("http://localhost:4322/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    # PC 端截图
    page.screenshot(path="/workspace/pc-homepage.png", full_page=True)
    
    # 查找音乐相关元素
    print("=== PC 端 (1280x800) 元素检查 ===")
    
    # 找音乐播放器
    music_player = page.locator(".music-player")
    if music_player.count() > 0:
        print(f"✅ 找到 .music-player 元素: {music_player.count()} 个")
        for i in range(music_player.count()):
            el = music_player.nth(i)
            print(f"   - 元素 {i} visible={el.is_visible()}, classes={el.get_attribute('class')}")
    else:
        print("❌ 未找到 .music-player 元素")
    
    # 找 FAB 按钮
    fab = page.locator(".music-player-fab-shell")
    if fab.count() > 0:
        print(f"✅ 找到 .music-player-fab-shell 元素: {fab.count()} 个")
        for i in range(fab.count()):
            el = fab.nth(i)
            print(f"   - 元素 {i} visible={el.is_visible()}, bounding_box={el.bounding_box()}")
    else:
        print("❌ 未找到 .music-player-fab-shell 元素")
    
    # 找 sidebar 音乐组件
    sidebar = page.locator(".music-sidebar-widget")
    if sidebar.count() > 0:
        print(f"✅ 找到 .music-sidebar-widget 元素: {sidebar.count()} 个")
        print(f"   - visible={sidebar.nth(0).is_visible()}")
    else:
        print("ℹ️  未找到 .music-sidebar-widget (可能在 sidebar 折叠状态)")
    
    # 找 floating-control 中 music 项
    float_ctrl = page.locator('[data-control-key="music"]')
    if float_ctrl.count() > 0:
        print(f"✅ 找到 [data-control-key=music] 元素: {float_ctrl.count()} 个")
        print(f"   - visible={float_ctrl.nth(0).is_visible()}")
        try:
            print(f"   - html 前200字符: {float_ctrl.nth(0).inner_html()[:200]}")
        except Exception as e:
            print(f"   - 获取 inner_html 失败: {e}")
    else:
        print("❌ 未找到 [data-control-key=music] 浮动控件")
    
    # astro-island for MusicFabButton
    islands = page.locator("astro-island")
    print(f"\n✅ 找到 astro-island 共: {islands.count()} 个")
    for i in range(min(islands.count(), 12)):
        island = islands.nth(i)
        component = island.get_attribute("component-url") or island.get_attribute("component-path") or ""
        client_attr = island.get_attribute("client") or ""
        if "Music" in component or "music" in str(component).lower():
            print(f"   - 音乐组件 island {i}: {component} client={client_attr}")
    
    # 打印错误
    if console_errors:
        print("\n=== Console 错误/警告 (前20条) ===")
        for err in console_errors[:20]:
            print(f"  {err}")
    
    # 移动端视角 (390x844)
    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto("http://localhost:4322/")
    mobile.wait_for_load_state("networkidle")
    mobile.wait_for_timeout(3000)
    mobile.screenshot(path="/workspace/mobile-homepage.png", full_page=True)
    print("\n=== 移动端 (390x844) 元素检查 ===")
    mb = mobile.locator(".music-player")
    print(f".music-player count={mb.count()}, visible={mb.first.is_visible() if mb.count() else 'N/A'}")
    mfab = mobile.locator(".music-player-fab-shell")
    print(f".music-player-fab-shell count={mfab.count()}, visible={mfab.first.is_visible() if mfab.count() else 'N/A'}")
    
    browser.close()
    print("\n✅ 截图已保存：/workspace/pc-homepage.png, /workspace/mobile-homepage.png")
